from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.project import Project
from models.plant import Plant, PlantStage
from .schemas import ProjectCreate, ProjectUpdate
import uuid

class ProjectRepository(BaseRepository[Project, ProjectCreate, ProjectUpdate]):
    def __init__(self):
        super().__init__(Project)

    async def get_by_farmer(self, db: AsyncSession, farmer_id: uuid.UUID):
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(self.model)
            .where(self.model.farmer_id == farmer_id)
            .options(selectinload(self.model.plant))
            .order_by(self.model.created_at.desc())
        )
        return result.scalars().all()

class PlantStageRepository(BaseRepository[PlantStage, None, None]):
    def __init__(self):
        super().__init__(PlantStage)

    async def get_by_plant(self, db: AsyncSession, plant_id: uuid.UUID):
        result = await db.execute(
            select(self.model).where(self.model.plant_id == plant_id).order_by(self.model.stage_order)
        )
        return result.scalars().all()
