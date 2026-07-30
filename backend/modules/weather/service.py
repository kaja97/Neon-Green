from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid
from datetime import datetime, timedelta, date, timezone
from geoalchemy2.shape import to_shape

from models.project import Project
from models.account import FarmerProfile
from models.farmer import FarmerLocation
from models.weather import WeatherCache
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import WeatherCacheRepository, WeatherAlertRepository
from .client import WeatherClient
from .schemas import WeatherResponse, WeatherCondition, ForecastDay

class WeatherService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        cache_repo: WeatherCacheRepository,
        alert_repo: WeatherAlertRepository,
        weather_client: WeatherClient
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.cache_repo = cache_repo
        self.alert_repo = alert_repo
        self.weather_client = weather_client

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    def _centroid_lat_lon(self, location: FarmerLocation) -> tuple[float, float]:
        point = to_shape(location.centroid)
        return float(point.y), float(point.x)

    async def get_weather_for_project(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> WeatherResponse:
        farmer_id = await self._get_farmer_id(db, account_id)
        
        result = await db.execute(
            select(Project, FarmerLocation)
            .join(FarmerLocation, Project.location_id == FarmerLocation.id)
            .where(Project.id == project_id, Project.farmer_id == farmer_id)
        )
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Project or location not found")

        project, location = row
        lat, lon = self._centroid_lat_lon(location)
        location_meta = {
            "location_name": location.name,
            "district": location.district,
            "project_name": project.name,
            "latitude": lat,
            "longitude": lon,
        }
        today = date.today()
        
        cache = await self.cache_repo.get_by_location_and_date(db, location.id, today)

        if cache and cache.expires_at > datetime.now(timezone.utc):
            return self._process_raw_data(location.id, cache.data, **location_meta)

        raw_data = await self.weather_client.fetch_weather_data(lat, lon)
        
        if cache:
            cache.data = raw_data
            cache.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        else:
            new_cache = WeatherCache(
                location_id=location.id,
                forecast_date=today,
                data=raw_data,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
            )
            db.add(new_cache)
            
        await db.commit()
        
        return self._process_raw_data(location.id, raw_data, **location_meta)

    def _process_raw_data(self, location_id: uuid.UUID, raw_data: dict, **kwargs) -> WeatherResponse:
        daily_summaries = {}
        
        for item in raw_data.get("list", []):
            dt = datetime.fromtimestamp(item["dt"])
            d = dt.date()
            
            if d not in daily_summaries:
                daily_summaries[d] = {
                    "temps": [],
                    "humidity": [],
                    "rain": 0.0,
                    "wind": [],
                    "conditions": [],
                    "icons": []
                }
                
            daily_summaries[d]["temps"].append(item["main"]["temp"])
            daily_summaries[d]["humidity"].append(item["main"]["humidity"])
            
            if "rain" in item and "3h" in item["rain"]:
                daily_summaries[d]["rain"] += item["rain"]["3h"]
                
            daily_summaries[d]["wind"].append(item["wind"]["speed"])
            daily_summaries[d]["conditions"].append(item["weather"][0]["main"])
            daily_summaries[d]["icons"].append(item["weather"][0]["icon"])
            
        forecasts = []
        sorted_dates = sorted(list(daily_summaries.keys()))
        
        for d in sorted_dates:
            s = daily_summaries[d]
            
            avg_temp = sum(s["temps"]) / len(s["temps"])
            avg_hum = sum(s["humidity"]) / len(s["humidity"])
            avg_wind = (sum(s["wind"]) / len(s["wind"])) * 3.6
            
            most_common_cond = max(set(s["conditions"]), key=s["conditions"].count)
            most_common_icon = max(set(s["icons"]), key=s["icons"].count)
            
            cond = WeatherCondition(
                temp_celsius=round(avg_temp, 1),
                humidity=round(avg_hum, 1),
                rain_mm=round(s["rain"], 1),
                wind_kph=round(avg_wind, 1),
                description=most_common_cond,
                icon_code=most_common_icon
            )
            
            forecasts.append(ForecastDay(forecast_date=d, condition=cond))
            
        meta = {
            "location_name": kwargs.get("location_name"),
            "district": kwargs.get("district"),
            "project_name": kwargs.get("project_name"),
            "latitude": kwargs.get("latitude"),
            "longitude": kwargs.get("longitude"),
        }

        if not forecasts:
            cond = WeatherCondition(temp_celsius=0, humidity=0, rain_mm=0, wind_kph=0, description="Unknown", icon_code="01d")
            return WeatherResponse(location_id=str(location_id), current=cond, forecast=[], **meta)

        return WeatherResponse(
            location_id=str(location_id),
            current=forecasts[0].condition,
            forecast=forecasts,
            **meta,
        )

    async def get_alerts_for_project(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")
            
        return await self.alert_repo.get_unresolved_by_project(db, project_id)
