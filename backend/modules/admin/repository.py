from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.plant import Plant
from models.plant_health import PlantDisease
from modules.admin.schemas import PlantCreate, PlantUpdate, DiseaseCreate, DiseaseUpdate
import uuid

class PlantRepository(BaseRepository[Plant, PlantCreate, PlantUpdate]):
    def __init__(self):
        super().__init__(Plant)

    async def get_active_plants(self, db: AsyncSession):
        result = await db.execute(select(self.model).where(self.model.is_active == True).order_by(self.model.common_name))
        return result.scalars().all()


class DiseaseRepository(BaseRepository[PlantDisease, DiseaseCreate, DiseaseUpdate]):
    def __init__(self):
        super().__init__(PlantDisease)

    async def get_all_ordered(self, db: AsyncSession):
        result = await db.execute(select(self.model).order_by(self.model.name))
        return result.scalars().all()
