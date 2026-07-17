from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.activity import ActivityPlan, FarmingActivity, ActivityDetail
import uuid

class ActivityPlanRepository(BaseRepository[ActivityPlan, None, None]):
    def __init__(self):
        super().__init__(ActivityPlan)

    async def get_active_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.project_id == project_id, self.model.is_active == True)
        )
        return result.scalars().first()

class FarmingActivityRepository(BaseRepository[FarmingActivity, None, None]):
    def __init__(self):
        super().__init__(FarmingActivity)

    async def get_by_plan(self, db: AsyncSession, plan_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.plan_id == plan_id)
            .order_by(self.model.due_date)
        )
        return result.scalars().all()

class ActivityDetailRepository(BaseRepository[ActivityDetail, None, None]):
    def __init__(self):
        super().__init__(ActivityDetail)

    async def get_by_activity(self, db: AsyncSession, activity_id: uuid.UUID):
        result = await db.execute(
            select(self.model).where(self.model.activity_id == activity_id)
        )
        return result.scalars().first()
