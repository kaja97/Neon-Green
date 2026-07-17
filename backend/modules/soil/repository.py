from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation
import uuid

class SoilTestRepository(BaseRepository[SoilTest, None, None]):
    def __init__(self):
        super().__init__(SoilTest)

    async def get_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model).where(self.model.project_id == project_id).order_by(self.model.test_date.desc())
        )
        return result.scalars().all()

class SoilNutrientResultRepository(BaseRepository[SoilNutrientResult, None, None]):
    def __init__(self):
        super().__init__(SoilNutrientResult)

    async def get_by_test(self, db: AsyncSession, test_id: uuid.UUID):
        result = await db.execute(select(self.model).where(self.model.soil_test_id == test_id))
        return result.scalars().first()

class SoilRecommendationRepository(BaseRepository[SoilRecommendation, None, None]):
    def __init__(self):
        super().__init__(SoilRecommendation)

    async def get_by_test(self, db: AsyncSession, test_id: uuid.UUID):
        result = await db.execute(select(self.model).where(self.model.soil_test_id == test_id))
        return result.scalars().all()
