from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid
from datetime import date, timedelta

from models.project import Project
from models.plant import Plant
from models.account import FarmerProfile
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import MarketPriceRepository

class MarketService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        price_repo: MarketPriceRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.price_repo = price_repo

    async def get_prices(self, db: AsyncSession, plant_id: uuid.UUID, region: str | None = None, days: int = 30):
        start_date = date.today() - timedelta(days=days)
        return await self.price_repo.get_prices(db, plant_id, start_date, region)

    async def get_trend(self, db: AsyncSession, plant_id: uuid.UUID, region: str = "Jaffna"):
        plant = await db.get(Plant, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        today = date.today()
        start_date = today - timedelta(days=30)
        
        prices = await self.price_repo.get_trend_prices(db, plant_id, start_date, region)
        
        if not prices:
            raise HTTPException(status_code=404, detail="No price data found for this crop and region")
        
        price_values = [float(p.price_per_kg) for p in prices]
        current_price = price_values[-1]
        oldest_price = price_values[0]
        
        change = current_price - oldest_price
        change_pct = (change / oldest_price * 100) if oldest_price > 0 else 0
        
        if change_pct > 2:
            direction = "up"
        elif change_pct < -2:
            direction = "down"
        else:
            direction = "stable"
        
        return {
            "plant_id": plant_id,
            "plant_name": plant.common_name,
            "region": region,
            "current_price": current_price,
            "price_30d_ago": oldest_price,
            "change_percentage": round(change_pct, 1),
            "direction": direction,
            "min_price_30d": min(price_values),
            "max_price_30d": max(price_values),
            "avg_price_30d": round(sum(price_values) / len(price_values), 1)
        }

    async def estimate_revenue(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, region: str = "Jaffna"):
        from models.plant import Plant, PlantVariety
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != profile.id:
            raise HTTPException(status_code=404, detail="Project not found")
        
        plant = await db.get(Plant, project.plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Crop not found")
            
        variety = await db.get(PlantVariety, project.variety_id)
        
        latest_price = await self.price_repo.get_latest_price(db, plant.id, region)
        
        current_price = float(latest_price.price_per_kg) if latest_price else 0
        yield_per_acre = float(variety.expected_yield_per_acre_kg) if variety and variety.expected_yield_per_acre_kg else 0
        expected_yield = yield_per_acre * float(project.area)
        estimated_revenue = expected_yield * current_price
        
        return {
            "project_id": project_id,
            "crop_name": plant.common_name,
            "area": float(project.area),
            "area_unit": project.area_unit,
            "expected_yield_kg": round(expected_yield, 1),
            "current_price_per_kg": current_price,
            "estimated_revenue": round(estimated_revenue, 2),
            "currency": "LKR",
            "region": region
        }
