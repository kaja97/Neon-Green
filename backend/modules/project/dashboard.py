import uuid
import json
import logging
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.project import Project
from models.plant import PlantStage
from models.activity import FarmingActivity, ActivityPlan
from models.weather import WeatherAlert
from models.issue import ProjectIssue
from models.ai import AIProjectSummary
from .schemas import DashboardResponse, FarmingCircleResponse, StageProgress
from .service import ProjectService
from core.cache import get_dashboard_cache_key, get_redis_client

logger = logging.getLogger(__name__)

class DashboardService:
    def __init__(self, project_service: ProjectService):
        self.project_service = project_service

    async def _get_farming_circle_and_stage(self, db: AsyncSession, project: Project):
        stages = await self.project_service.get_plant_stages(db, project.plant_id)
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

    async def _get_activities(self, db: AsyncSession, project_id: uuid.UUID):
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

    async def _get_alerts_and_issues(self, db: AsyncSession, project_id: uuid.UUID):
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


    async def _get_soil_status(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        try:
            from modules.soil.service import get_soil_tests
            tests = await get_soil_tests(db, project_id, account_id)
            if not tests:
                return None
            latest = tests[0]
            if not latest.results:
                return None
            return {
                "ph": latest.results.ph_level,
                "nitrogen_status": latest.results.nitrogen_level,
                "phosphorus_status": latest.results.phosphorus_level,
                "potassium_status": latest.results.potassium_level,
                "last_test": latest.test_date.isoformat(),
            }
        except Exception:
            logger.warning("Failed to load soil_status for project %s", project_id, exc_info=True)
            return None


    async def _get_market_price(self, db: AsyncSession, plant_id: uuid.UUID):
        try:
            from modules.market.service import get_trend
            trend = await get_trend(db, plant_id)
            return {
                "price_per_kg": trend["current_price"],
                "trend": trend["direction"],
                "change_pct": trend["change_percentage"],
            }
        except Exception:
            logger.warning("Failed to load market_price for plant %s", plant_id, exc_info=True)
            return None


    async def _get_weather(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        try:
            from modules.weather.service import get_weather_for_project
            weather = await get_weather_for_project(db, project_id, account_id)
            return weather.model_dump(mode="json")
        except Exception:
            logger.warning("Failed to load weather for project %s", project_id, exc_info=True)
            return None


    async def _get_ai_summary(self, db: AsyncSession, project_id: uuid.UUID):
        try:
            result = await db.execute(
                select(AIProjectSummary).where(AIProjectSummary.project_id == project_id)
            )
            summary = result.scalars().first()
            if not summary:
                return None

            sj = summary.summary_json or {}
            lines = []
            if sj.get("crop"):
                lines.append(f"Crop: {sj['crop']}")
            if sj.get("days_since_planting") is not None:
                lines.append(f"Day {sj['days_since_planting']}")
            if sj.get("current_stage"):
                lines.append(f"Stage: {sj['current_stage']}")
            if sj.get("weather"):
                lines.append(f"Weather: {sj['weather']}")
            if sj.get("active_issues"):
                lines.append(f"Issues: {sj['active_issues']}")

            return {
                "text": " | ".join(lines) if lines else "AI analysis available.",
                "generated_at": summary.last_updated_at.isoformat() if summary.last_updated_at else None,
                "source": "auto",
            }
        except Exception:
            logger.warning("Failed to load ai_summary for project %s", project_id, exc_info=True)
            return None


    async def get_dashboard(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> DashboardResponse:
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
        project = await self.project_service.get_project(db, project_id, account_id)

        import asyncio
        (
            (current_stage, farming_circle),
            (todays_activities, upcoming_activities),
            (weather_alerts, active_issues),
            soil_status,
            market_price,
            weather,
            ai_summary,
        ) = await asyncio.gather(
            self._get_farming_circle_and_stage(db, project),
            self._get_activities(db, project_id),
            self._get_alerts_and_issues(db, project_id),
            self._get_soil_status(db, project_id, account_id),
            self._get_market_price(db, project.plant_id),
            self._get_weather(db, project_id, account_id),
            self._get_ai_summary(db, project_id),
        )

        response = DashboardResponse(
            project=project,
            current_stage=current_stage,
            farming_circle=farming_circle,
            todays_activities=todays_activities,
            upcoming_activities=upcoming_activities,
            weather_alerts=weather_alerts,
            active_issues=active_issues,
            soil_status=soil_status,
            market_price=market_price,
            weather=weather,
            ai_summary=ai_summary,
        )
        
        # 3. Store in cache
        if redis:
            data = response.model_dump(mode='json')
            from core.cache import DASHBOARD_CACHE_TTL
            await redis.setex(cache_key, DASHBOARD_CACHE_TTL, json.dumps(data))
            
        return response
