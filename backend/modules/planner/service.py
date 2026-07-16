from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.activity import FarmingActivity, ActivityPlan, ActivityDetail
from models.project import Project
from models.account import FarmerProfile
from .schemas import CompleteRequest, SkipRequest, ActivityCreate, ActivityUpdate
import uuid
from datetime import date, datetime, timezone


async def _get_farmer_id(db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
    """Resolve the authenticated account to its farmer profile id.

    Project ownership is keyed on FarmerProfile.id, not Account.id (see
    dependencies.get_current_user), so ownership checks must resolve through here.
    """
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return profile.id


async def get_activity(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
    farmer_id = await _get_farmer_id(db, account_id)
    # Fetch activity and join with plan and project to verify ownership
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

async def get_active_plan(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> ActivityPlan:
    # Verify project ownership first
    farmer_id = await _get_farmer_id(db, account_id)
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != farmer_id:
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
    """List all activities for a project. Returns [] when no active plan exists
    (instead of raising 404) so the UI can render an empty state gracefully."""
    farmer_id = await _get_farmer_id(db, account_id)
    # Verify project ownership
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != farmer_id:
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(
        select(ActivityPlan)
        .where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = result.scalars().first()
    if not plan:
        return []

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
    activity.completed_at = datetime.now(timezone.utc)
    
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
    
    from core.cache import invalidate_dashboard_cache
    plan = await db.get(ActivityPlan, activity.plan_id)
    if plan:
        await invalidate_dashboard_cache(plan.project_id)
        
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
    
    from core.cache import invalidate_dashboard_cache
    plan = await db.get(ActivityPlan, activity.plan_id)
    if plan:
        await invalidate_dashboard_cache(plan.project_id)
        
    return activity


async def _ensure_active_plan(db: AsyncSession, project_id: uuid.UUID) -> ActivityPlan:
    """Get or create the active activity plan for a project.

    Used when adding manual tasks to a project that may not yet have an
    AI-generated plan (or whose plan is inactive).
    """
    result = await db.execute(
        select(ActivityPlan)
        .where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = result.scalars().first()
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


async def create_activity(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: ActivityCreate):
    """Allow a farmer to manually add a task to their project's activity plan.

    When `activity_type == 'other'`, the optional `name` (custom label) is
    used as the activity title if provided; otherwise `title` is used as-is.
    `activity_type` is already normalized to the canonical enum by the schema.
    """
    farmer_id = await _get_farmer_id(db, account_id)
    # Verify project ownership
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != farmer_id:
        raise HTTPException(status_code=404, detail="Project not found")

    plan = await _ensure_active_plan(db, project_id)

    # 'other' tasks carry a free-text name; prefer it over a generic title.
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
        await invalidate_dashboard_cache(project_id)
    except Exception:
        pass

    return activity


async def update_activity(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID, data: ActivityUpdate):
    """Update a manual activity's title, description, or due date."""
    activity = await get_activity(db, activity_id, account_id)
    if activity.status not in ("pending",):
        raise HTTPException(status_code=400, detail="Can only edit pending activities")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, key, value)

    await db.commit()
    await db.refresh(activity)
    return activity


async def delete_activity(db: AsyncSession, activity_id: uuid.UUID, account_id: uuid.UUID):
    """Delete a manual (non-AI) activity."""
    activity = await get_activity(db, activity_id, account_id)

    await db.delete(activity)
    await db.commit()

    try:
        from core.cache import invalidate_dashboard_cache
        plan = await db.get(ActivityPlan, activity.plan_id)
        if plan:
            await invalidate_dashboard_cache(plan.project_id)
    except Exception:
        pass
