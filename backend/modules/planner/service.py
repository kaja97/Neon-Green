from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.activity import FarmingActivity, ActivityPlan, ActivityDetail
from models.project import Project
from .schemas import CompleteRequest, SkipRequest
import uuid
from datetime import date, datetime

async def get_activity(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
    # Fetch activity and join with plan and project to verify ownership
    result = await db.execute(
        select(FarmingActivity)
        .join(ActivityPlan, FarmingActivity.plan_id == ActivityPlan.id)
        .join(Project, ActivityPlan.project_id == Project.id)
        .where(FarmingActivity.id == activity_id, Project.farmer_id == account_id)
    )
    activity = result.scalars().first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

async def get_active_plan(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> ActivityPlan:
    # Verify project ownership first
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != account_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Get active plan
    result = await db.execute(
        select(ActivityPlan)
        .where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found for this project")
    return plan

async def list_activities(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    plan = await get_active_plan(db, project_id, account_id)
        
    result = await db.execute(
        select(FarmingActivity)
        .where(FarmingActivity.plan_id == plan.id)
        .order_by(FarmingActivity.due_date)
    )
    return result.scalars().all()

async def get_today_activities(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    plan = await get_active_plan(db, project_id, account_id)
        
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

async def mark_complete(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: CompleteRequest):
    activity = await get_activity(db, activity_id, account_id)
    
    if activity.status != "pending":
        raise HTTPException(status_code=400, detail=f"Activity is already {activity.status}")
        
    activity.status = "completed"
    activity.completed_at = datetime.utcnow()
    
    # Check if there is an ActivityDetail to update, or create one
    result = await db.execute(select(ActivityDetail).where(ActivityDetail.activity_id == activity.id))
    detail = result.scalars().first()
    
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
    return activity

async def mark_skip(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: SkipRequest):
    activity = await get_activity(db, activity_id, account_id)
    
    if activity.status != "pending":
        raise HTTPException(status_code=400, detail=f"Activity is already {activity.status}")
        
    activity.status = "skipped"
    
    result = await db.execute(select(ActivityDetail).where(ActivityDetail.activity_id == activity.id))
    detail = result.scalars().first()
    
    if not detail:
        detail = ActivityDetail(activity_id=activity.id)
        db.add(detail)
        
    detail.notes = f"SKIPPED REASON: {data.skipped_reason}"
        
    await db.commit()
    await db.refresh(activity)
    return activity
