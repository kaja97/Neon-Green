import uuid
import json
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.project import Project
from models.plant import PlantStage
from models.activity import FarmingActivity, ActivityPlan
from models.weather import WeatherAlert
from models.issue import ProjectIssue
from .schemas import DashboardResponse, FarmingCircleResponse, StageProgress
from .service import get_project, get_plant_stages
from core.cache import get_dashboard_cache_key, get_redis_client

async def _get_farming_circle_and_stage(db: AsyncSession, project: Project):
    stages = await get_plant_stages(db, project.plant_id)
    days_since_planting = (date.today() - project.planting_date).days
    total_duration = sum([(s.end_day - s.start_day + 1) for s in stages]) if stages else 0
    
    stage_progress_list = []
    current_stage = None
    
    for s in stages:
        is_completed = days_since_planting > s.end_day
        is_current = s.start_day <= days_since_planting <= s.end_day
        
        if is_completed:
            progress = 100
        elif is_current:
            stage_duration = s.end_day - s.start_day + 1
            days_in_stage = days_since_planting - s.start_day
            progress = int((days_in_stage / stage_duration) * 100)
            current_stage = s
        else:
            progress = 0
            
        stage_progress_list.append(
            StageProgress(
                stage=s,
                progress_percentage=progress,
                is_current=is_current,
                is_completed=is_completed
            )
        )
        
    farming_circle = FarmingCircleResponse(
        stages=stage_progress_list,
        current_day=days_since_planting,
        total_days=total_duration
    )
    return current_stage, farming_circle

async def _get_activities(db: AsyncSession, project_id: uuid.UUID):
    today = date.today()
    todays_activities = []
    upcoming_activities = []
    
    plan_res = await db.execute(
        select(ActivityPlan).where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = plan_res.scalars().first()
    
    if plan:
        act_res = await db.execute(
            select(FarmingActivity)
            .where(FarmingActivity.plan_id == plan.id, FarmingActivity.planned_date <= today, FarmingActivity.status == "pending")
            .order_by(FarmingActivity.due_date)
            .limit(10)
        )
        for a in act_res.scalars().all():
            todays_activities.append({
                "id": str(a.id), "type": a.activity_type, "title": a.title,
                "description": a.description, "due_date": a.due_date.isoformat(), "status": a.status
            })
        
        upcoming_res = await db.execute(
            select(FarmingActivity)
            .where(FarmingActivity.plan_id == plan.id, FarmingActivity.planned_date > today,
                   FarmingActivity.planned_date <= today + timedelta(days=7), FarmingActivity.status == "pending")
            .order_by(FarmingActivity.planned_date)
            .limit(10)
        )
        for a in upcoming_res.scalars().all():
            upcoming_activities.append({
                "id": str(a.id), "type": a.activity_type, "title": a.title,
                "due_date": a.due_date.isoformat(), "status": a.status
            })
            
    return todays_activities, upcoming_activities

async def _get_alerts_and_issues(db: AsyncSession, project_id: uuid.UUID):
    weather_alerts = []
    alert_res = await db.execute(
        select(WeatherAlert).where(WeatherAlert.project_id == project_id, WeatherAlert.is_resolved == False)
    )
    for alert in alert_res.scalars().all():
        weather_alerts.append({
            "type": alert.alert_type, "severity": alert.severity, "message": alert.message,
            "target_date": alert.target_date.isoformat()
        })
    
    active_issues = []
    issue_res = await db.execute(
        select(ProjectIssue).where(ProjectIssue.project_id == project_id, ProjectIssue.status != "resolved")
    )
    for issue in issue_res.scalars().all():
        active_issues.append({
            "id": str(issue.id), "type": issue.issue_type, "title": issue.title,
            "severity": issue.severity, "status": issue.status
        })
        
    return weather_alerts, active_issues

async def get_dashboard(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> DashboardResponse:
    # 1. Check Redis Cache
    redis = await get_redis_client()
    cache_key = get_dashboard_cache_key(project_id)
    if redis:
        cached = await redis.get(cache_key)
        if cached:
            try:
                data = json.loads(cached)
                return DashboardResponse(**data)
            except Exception:
                pass
                
    # 2. Gather data sequentially for Project, then parallel for the rest
    project = await get_project(db, project_id, account_id)
    
    import asyncio
    (
        (current_stage, farming_circle),
        (todays_activities, upcoming_activities),
        (weather_alerts, active_issues)
    ) = await asyncio.gather(
        _get_farming_circle_and_stage(db, project),
        _get_activities(db, project_id),
        _get_alerts_and_issues(db, project_id)
    )
    
    response = DashboardResponse(
        project=project,
        current_stage=current_stage,
        farming_circle=farming_circle,
        todays_activities=todays_activities,
        upcoming_activities=upcoming_activities,
        weather_alerts=weather_alerts,
        active_issues=active_issues
    )
    
    # 3. Store in cache
    if redis:
        # Pydantic v2 dump
        data = response.model_dump(mode='json')
        from core.cache import DASHBOARD_CACHE_TTL
        await redis.setex(cache_key, DASHBOARD_CACHE_TTL, json.dumps(data))
        
    return response
