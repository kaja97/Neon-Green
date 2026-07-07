from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid
from datetime import datetime, timedelta, date, timezone

from models.farmer import FarmerLocation
from models.weather import WeatherCache, WeatherAlert
from core.farmer import get_owned_project
from .client import fetch_weather_data
from .schemas import WeatherResponse, WeatherCondition, ForecastDay

async def get_weather_for_project(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> WeatherResponse:
    project, _ = await get_owned_project(db, project_id, account_id)
    location = await db.get(FarmerLocation, project.location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Project location not found")
        
    today = date.today()
    cache_result = await db.execute(
        select(WeatherCache)
        .where(WeatherCache.location_id == location.id, WeatherCache.forecast_date == today)
    )
    cache = cache_result.scalars().first()
    
    if cache and cache.expires_at > datetime.now(timezone.utc):
        return _process_raw_data(location.id, cache.data)
        
    raw_data = await fetch_weather_data(float(location.latitude), float(location.longitude))
    
    if cache:
        cache.data = raw_data
        cache.expires_at = datetime.now(timezone.utc) + timedelta(hours=3)
    else:
        new_cache = WeatherCache(
            location_id=location.id,
            forecast_date=today,
            data=raw_data,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=3)
        )
        db.add(new_cache)
        
    await db.commit()
    
    return _process_raw_data(location.id, raw_data)


def _process_raw_data(location_id: uuid.UUID, raw_data: dict) -> WeatherResponse:
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
        
    if not forecasts:
        cond = WeatherCondition(temp_celsius=0, humidity=0, rain_mm=0, wind_kph=0, description="Unknown", icon_code="01d")
        return WeatherResponse(location_id=str(location_id), current=cond, forecast=[])

    return WeatherResponse(
        location_id=str(location_id),
        current=forecasts[0].condition,
        forecast=forecasts
    )

async def get_alerts_for_project(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    await get_owned_project(db, project_id, account_id)
        
    result = await db.execute(
        select(WeatherAlert)
        .where(WeatherAlert.project_id == project_id, WeatherAlert.is_resolved == False)
        .order_by(WeatherAlert.target_date)
    )
    
    return result.scalars().all()
