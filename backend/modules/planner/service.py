from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid
from datetime import date, datetime, timezone

from models.activity import FarmingActivity, ActivityPlan, ActivityDetail
from models.project import Project
from models.account import FarmerProfile
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import ActivityPlanRepository, FarmingActivityRepository, ActivityDetailRepository
from .schemas import CompleteRequest, SkipRequest, ActivityCreate, ActivityUpdate

class PlannerService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        plan_repo: ActivityPlanRepository,
        activity_repo: FarmingActivityRepository,
        detail_repo: ActivityDetailRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.plan_repo = plan_repo
        self.activity_repo = activity_repo
        self.detail_repo = detail_repo

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    async def get_activity(self, db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        result = await db.execute(
            select(FarmingActivity)
            .join(ActivityPlan, FarmingActivity.plan_id == ActivityPlan.id)
            .join(Project, ActivityPlan.project_id == Project.id)
            .where(FarmingActivity.id == activity_id, Project.farmer_id == farmer_id)
        )
        activity = result.scalars().first()
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        return activity

    async def get_active_plan(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> ActivityPlan:
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")
            
        plan = await self.plan_repo.get_active_by_project(db, project_id)
        if not plan:
            raise HTTPException(status_code=404, detail="No active plan found for this project")
        return plan

    async def list_activities(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        plan = await self.plan_repo.get_active_by_project(db, project_id)
        if not plan:
            return []

        return await self.activity_repo.get_by_plan(db, plan.id)

    async def get_today_activities(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        plan = await self.get_active_plan(db, project_id, account_id)
            
        today = date.today()
        result = await db.execute(
            select(FarmingActivity)
            .where(
                FarmingActivity.plan_id == plan.id,
                FarmingActivity.planned_date <= today,
                FarmingActivity.status == "pending"
            )
            .order_by(FarmingActivity.due_date)
        )
        return result.scalars().all()

    async def mark_complete(self, db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: CompleteRequest):
        activity = await self.get_activity(db, activity_id, account_id)
        
        if activity.status != "pending":
            raise HTTPException(status_code=400, detail=f"Activity is already {activity.status}")
            
        activity.status = "completed"
        activity.completed_at = datetime.now(timezone.utc)
        
        detail = await self.detail_repo.get_by_activity(db, activity.id)
        
        if not detail:
            detail = ActivityDetail(activity_id=activity.id)
            db.add(detail)
            
        if data.notes:
            detail.notes = data.notes
        if data.actual_water_liters is not None:
            detail.actual_water_liters = data.actual_water_liters
        if data.actual_fertilizer_kg is not None:
            detail.actual_fertilizer_kg = data.actual_fertilizer_kg
        if data.attachments is not None:
            detail.attachments = data.attachments
            
        await db.commit()
        await db.refresh(activity)
        
        try:
            from core.cache import invalidate_dashboard_cache
            plan = await self.plan_repo.get(db, activity.plan_id)
            if plan:
                await invalidate_dashboard_cache(str(plan.project_id))
        except Exception:
            pass
            
        return activity

    async def mark_skip(self, db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: SkipRequest):
        activity = await self.get_activity(db, activity_id, account_id)
        
        if activity.status != "pending":
            raise HTTPException(status_code=400, detail=f"Activity is already {activity.status}")
            
        activity.status = "skipped"
        
        detail = await self.detail_repo.get_by_activity(db, activity.id)
        
        if not detail:
            detail = ActivityDetail(activity_id=activity.id)
            db.add(detail)
            
        detail.notes = f"SKIPPED REASON: {data.skipped_reason}"
            
        await db.commit()
        await db.refresh(activity)
        
        try:
            from core.cache import invalidate_dashboard_cache
            plan = await self.plan_repo.get(db, activity.plan_id)
            if plan:
                await invalidate_dashboard_cache(str(plan.project_id))
        except Exception:
            pass
            
        return activity

    async def _ensure_active_plan(self, db: AsyncSession, project_id: uuid.UUID) -> ActivityPlan:
        plan = await self.plan_repo.get_active_by_project(db, project_id)
        if not plan:
            plan = ActivityPlan(
                project_id=project_id,
                generated_at=datetime.now(timezone.utc),
                version=0,
                is_active=True,
            )
            db.add(plan)
            await db.flush()
        return plan

    async def create_activity(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: ActivityCreate):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        plan = await self._ensure_active_plan(db, project_id)

        title = data.name if data.activity_type == "other" and data.name else data.title

        activity = FarmingActivity(
            plan_id=plan.id,
            activity_type=data.activity_type,
            title=title,
            description=data.description,
            planned_date=date.today(),
            due_date=data.due_date,
            status="pending",
            is_ai_recommended=False,
        )
        db.add(activity)
        await db.commit()
        await db.refresh(activity)

        try:
            from core.cache import invalidate_dashboard_cache
            await invalidate_dashboard_cache(str(project_id))
        except Exception:
            pass

        return activity

    async def update_activity(self, db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: ActivityUpdate):
        activity = await self.get_activity(db, activity_id, account_id)
        if activity.status not in ("pending",):
            raise HTTPException(status_code=400, detail="Can only edit pending activities")

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(activity, key, value)

        await db.commit()
        await db.refresh(activity)
        return activity

    async def delete_activity(self, db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
        activity = await self.get_activity(db, activity_id, account_id)

        await db.delete(activity)
        await db.commit()

        try:
            from core.cache import invalidate_dashboard_cache
            plan = await self.plan_repo.get(db, activity.plan_id)
            if plan:
                await invalidate_dashboard_cache(str(plan.project_id))
        except Exception:
            pass

    async def reset_activity(self, db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
        activity = await self.get_activity(db, activity_id, account_id)
        
        activity.status = "pending"
        activity.completed_at = None
        
        detail = await self.detail_repo.get_by_activity(db, activity.id)
        if detail:
            detail.actual_water_liters = None
            detail.actual_fertilizer_kg = None
            detail.notes = None
            detail.attachments = None
            
        await db.commit()
        await db.refresh(activity)
        
        try:
            from core.cache import invalidate_dashboard_cache
            plan = await self.plan_repo.get(db, activity.plan_id)
            if plan:
                await invalidate_dashboard_cache(str(plan.project_id))
        except Exception:
            pass
            
        return activity
