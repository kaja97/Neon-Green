from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.farmer import FarmerLocation, FarmerLandDetail, FarmerLivestock
from .schemas import (
    LocationCreate, LocationUpdate,
    LandDetailCreate, LandDetailUpdate,
    LivestockCreate, LivestockUpdate
)
import uuid

class FarmerLocationRepository(BaseRepository[FarmerLocation, LocationCreate, LocationUpdate]):
    def __init__(self):
        super().__init__(FarmerLocation)

    async def get_by_farmer(self, db: AsyncSession, farmer_id: uuid.UUID):
        result = await db.execute(select(self.model).where(self.model.farmer_id == farmer_id))
        return result.scalars().all()

class FarmerLandDetailRepository(BaseRepository[FarmerLandDetail, LandDetailCreate, LandDetailUpdate]):
    def __init__(self):
        super().__init__(FarmerLandDetail)

    async def get_by_farmer(self, db: AsyncSession, farmer_id: uuid.UUID):
        result = await db.execute(select(self.model).where(self.model.farmer_id == farmer_id))
        return result.scalars().all()

class FarmerLivestockRepository(BaseRepository[FarmerLivestock, LivestockCreate, LivestockUpdate]):
    def __init__(self):
        super().__init__(FarmerLivestock)

    async def get_by_farmer(self, db: AsyncSession, farmer_id: uuid.UUID):
        result = await db.execute(select(self.model).where(self.model.farmer_id == farmer_id))
        return result.scalars().all()
