from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.market import MarketPrice
from datetime import date
import uuid

class MarketPriceRepository(BaseRepository[MarketPrice, None, None]):
    def __init__(self):
        super().__init__(MarketPrice)

    async def get_prices(self, db: AsyncSession, plant_id: uuid.UUID, start_date: date, region: str | None = None):
        query = select(self.model).where(
            self.model.plant_id == plant_id,
            self.model.date >= start_date
        )
        if region:
            query = query.where(self.model.region == region)
        query = query.order_by(self.model.date.desc())
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_trend_prices(self, db: AsyncSession, plant_id: uuid.UUID, start_date: date, region: str):
        query = select(self.model).where(
            self.model.plant_id == plant_id,
            self.model.region == region,
            self.model.date >= start_date
        ).order_by(self.model.date)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_latest_price(self, db: AsyncSession, plant_id: uuid.UUID, region: str):
        query = select(self.model).where(
            self.model.plant_id == plant_id,
            self.model.region == region
        ).order_by(self.model.date.desc()).limit(1)
        
        result = await db.execute(query)
        return result.scalars().first()
