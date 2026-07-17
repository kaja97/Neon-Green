from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.issue import ProjectIssue
from models.plant_health import DiseaseSolution
import uuid

class ProjectIssueRepository(BaseRepository[ProjectIssue, None, None]):
    def __init__(self):
        super().__init__(ProjectIssue)

    async def get_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.project_id == project_id)
            .order_by(self.model.reported_date.desc())
        )
        return result.scalars().all()

class DiseaseSolutionRepository(BaseRepository[DiseaseSolution, None, None]):
    def __init__(self):
        super().__init__(DiseaseSolution)

    async def get_by_disease_and_methods(self, db: AsyncSession, disease_id: uuid.UUID, methods: list[str]):
        result = await db.execute(
            select(self.model).where(
                self.model.disease_id == disease_id,
                self.model.farming_method.in_(methods)
            )
        )
        return result.scalars().all()
