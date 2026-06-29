from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.activity import FarmingActivity
from models.project import Project
from .schemas import CompleteRequest, SkipRequest
import uuid
from datetime import date

async def get_activity(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
    # Fetch activity and join with project to verify ownership
    result = await db.execute(
        select(FarmingActivity, Project)
        .join(Project, FarmingActivity.project_id == Project.id)
        .where(FarmingActivity.id == activity_id, Project.farmer_id == account_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Activity not found")
    return row[0] # Return just the FarmingActivity

async def list_activities(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    # Verify project ownership first
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != account_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    result = await db.execute(
        select(FarmingActivity)
        .where(FarmingActivity.project_id == project_id)
        .order_by(FarmingActivity.scheduled_date, FarmingActivity.scheduled_time)
    )
    return result.scalars().all()

async def get_today_activities(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != account_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    today = date.today()
    result = await db.execute(
        select(FarmingActivity)
        .where(
            FarmingActivity.project_id == project_id,
            FarmingActivity.scheduled_date == today,
            FarmingActivity.status == "pending"
        )
        .order_by(FarmingActivity.priority, FarmingActivity.scheduled_time)
    )
    return result.scalars().all()

async def mark_complete(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: CompleteRequest):
    activity = await get_activity(db, activity_id, account_id)
    
    if activity.status != "pending":
        raise HTTPException(status_code=400, detail=f"Activity is already {activity.status}")
        
    activity.status = "completed"
    activity.completed_date = date.today()
    if data.notes:
        activity.notes = data.notes
        
    await db.commit()
    await db.refresh(activity)
    return activity

async def mark_skip(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: SkipRequest):
    activity = await get_activity(db, activity_id, account_id)
    
    if activity.status != "pending":
        raise HTTPException(status_code=400, detail=f"Activity is already {activity.status}")
        
    activity.status = "skipped"
    activity.skipped_reason = data.skipped_reason
        
    await db.commit()
    await db.refresh(activity)
    return activity
