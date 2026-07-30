"""
Project service — project CRUD with status machine enforcement.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models.project import Project
from models.plant import Plant, PlantStage, PlantVariety
from models.farmer import FarmerLocation
from models.account import FarmerProfile
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.enums import ProjectStatus, PROJECT_STATUS_TRANSITIONS
from core.cache import invalidate_dashboard_cache
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.admin.repository import PlantRepository
from .repository import ProjectRepository, PlantStageRepository
from .schemas import ProjectCreate, ProjectStatusUpdate, ProjectUpdate
import uuid
from datetime import date, timedelta
import logging

import json
from models.activity import FarmingActivity, ActivityPlan
from models.weather import WeatherAlert
from models.issue import ProjectIssue
from models.ai import AIProjectSummary
from .schemas import DashboardResponse, FarmingCircleResponse, StageProgress
from core.cache import get_dashboard_cache_key, get_redis_client

logger = logging.getLogger(__name__)

class ProjectService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        plant_repo: PlantRepository,
        stage_repo: PlantStageRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.plant_repo = plant_repo
        self.stage_repo = stage_repo

    async def _get_farmer_profile(self, db: AsyncSession, account_id: uuid.UUID) -> FarmerProfile:
        """Resolve account ID to farmer profile."""
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise AppException(ErrorCode.FARMER_PROFILE_NOT_FOUND)
        return profile

    async def get_plants(self, db: AsyncSession):
        return await self.plant_repo.get_active_plants(db)

    async def get_plant_detail(self, db: AsyncSession, plant_id: uuid.UUID):
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise AppException(ErrorCode.PLANT_NOT_FOUND)
        return plant

    async def get_plant_stages(self, db: AsyncSession, plant_id: uuid.UUID):
        return await self.stage_repo.get_by_plant(db, plant_id)

    async def get_plant_varieties(self, db: AsyncSession, plant_id: uuid.UUID):
        result = await db.execute(select(PlantVariety).where(PlantVariety.plant_id == plant_id).order_by(PlantVariety.variety_name))
        return result.scalars().all()

    async def get_farming_methods(self):
        return [
            {"id": "organic", "name": "Organic", "description": "Farming system that relies on fertilizers of organic origin."},
            {"id": "inorganic", "name": "Conventional", "description": "Farming system that uses synthetic chemicals and fertilizers."},
            {"id": "integrated", "name": "Integrated", "description": "Combines organic and conventional methods."}
        ]

    async def create_project(self, db: AsyncSession, account_id: uuid.UUID, data: ProjectCreate):
        profile = await self._get_farmer_profile(db, account_id)

        # Validate plant
        plant = await self.plant_repo.get(db, data.plant_id)
        if not plant:
            raise AppException(ErrorCode.PROJECT_INVALID_PLANT)

        # Validate variety
        variety = await db.get(PlantVariety, data.variety_id)
        if not variety or variety.plant_id != data.plant_id:
            raise AppException(ErrorCode.PROJECT_INVALID_PLANT)

        # Validate location belongs to farmer
        location = await db.get(FarmerLocation, data.location_id)
        if not location or location.farmer_id != profile.id:
            raise AppException(ErrorCode.PROJECT_INVALID_LOCATION)

        # Validate land_detail if provided
        if data.land_detail_id:
            from models.farmer import FarmerLandDetail
            land = await db.get(FarmerLandDetail, data.land_detail_id)
            if not land or land.farmer_id != profile.id:
                raise AppException(ErrorCode.PROJECT_INVALID_LAND_DETAIL)

        # Find first stage
        result = await db.execute(
            select(PlantStage).where(PlantStage.plant_id == data.plant_id)
            .order_by(PlantStage.stage_order).limit(1)
        )
        first_stage = result.scalars().first()

        expected_harvest_date = data.planting_date + timedelta(days=variety.growth_duration_days)

        project = Project(
            farmer_id=profile.id,
            plant_id=data.plant_id,
            variety_id=data.variety_id,
            location_id=data.location_id,
            land_detail_id=data.land_detail_id,
            name=data.name,
            area=data.area,
            area_unit=data.area_unit,
            farming_method=data.farming_method.value,
            planting_date=data.planting_date,
            status="active",
            current_stage_id=first_stage.id if first_stage else None,
            expected_harvest_date=expected_harvest_date,
            plan_generation_status="generating",
        )

        db.add(project)
        await db.flush()

        # Generate activity plan via Celery
        try:
            from tasks.planner_tasks import generate_season_plan_task
            generate_season_plan_task.delay(str(project.id))
            logger.info("Dispatched plan generation for project %s", project.id)
        except Exception as e:
            logger.error("Failed to dispatch plan generation task: %s", e)
            project.plan_generation_status = "failed"

        await db.commit()
        
        # Eager load the plant relation when returning the created project
        res = await db.execute(
            select(Project)
            .where(Project.id == project.id)
            .options(selectinload(Project.plant))
        )
        project = res.scalars().first()
        return project

    async def list_projects(self, db: AsyncSession, account_id: uuid.UUID):
        profile = await self._get_farmer_profile(db, account_id)
        return await self.project_repo.get_by_farmer(db, profile.id)

    async def get_project(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        profile = await self._get_farmer_profile(db, account_id)
        result = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.plant))
        )
        project = result.scalars().first()
        if not project or project.farmer_id != profile.id:
            raise AppException(ErrorCode.PROJECT_NOT_FOUND)
        return project

    async def update_project_status(
        self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID,
        update_data: ProjectStatusUpdate
    ):
        """Update project status with state machine enforcement."""
        project = await self.get_project(db, project_id, account_id)

        current_status = ProjectStatus(project.status)
        new_status = update_data.status

        # Validate state machine transition
        allowed = PROJECT_STATUS_TRANSITIONS.get(current_status, [])
        if new_status not in allowed:
            raise AppException(
                ErrorCode.PROJECT_INVALID_STATUS_TRANSITION,
                detail=f"Cannot transition from '{current_status.value}' to '{new_status.value}'. "
                       f"Allowed: {[s.value for s in allowed]}",
            )

        # Harvest requires a date
        if new_status == ProjectStatus.HARVESTED:
            project.actual_harvest_date = update_data.harvest_date or date.today()

        project.status = new_status.value
        await db.commit()
        await db.refresh(project)

        # Invalidate dashboard cache
        try:
            await invalidate_dashboard_cache(str(project_id))
        except Exception:
            pass

        return project

    async def update_project(
        self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID,
        update_data: ProjectUpdate
    ):
        """Update project fields. Cannot change plant/location after plan generation."""
        project = await self.get_project(db, project_id, account_id)

        # Prevent editing terminal projects
        if project.status in ("harvested", "failed"):
            raise AppException(ErrorCode.PROJECT_ALREADY_HARVESTED)

        for key, value in update_data.model_dump(exclude_unset=True).items():
            if key == "farming_method" and value is not None:
                setattr(project, key, value.value)
            else:
                setattr(project, key, value)

        await db.commit()
        await db.refresh(project)

        try:
            await invalidate_dashboard_cache(str(project_id))
        except Exception:
            pass

        return project

    async def delete_project(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        project = await self.get_project(db, project_id, account_id)
        await db.delete(project)
        await db.commit()

        try:
            await invalidate_dashboard_cache(str(project_id))
        except Exception:
            pass

    async def _get_farming_circle_and_stage(self, db: AsyncSession, project: Project):
        stages = await self.get_plant_stages(db, project.plant_id)
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
            from dependencies import get_soil_service
            tests = await get_soil_service().get_soil_tests(db, project_id, account_id)
            if not tests:
                return None
            latest = tests[0]
            if not latest.results:
                return None
                
            def get_level(val, min_opt, max_opt):
                if val is None: return "Unknown"
                v = float(val)
                if v < min_opt: return "Low"
                if v > max_opt: return "High"
                return "Optimal"

            return {
                "ph": float(latest.results.ph_level) if latest.results.ph_level else None,
                "nitrogen_status": get_level(latest.results.nitrogen_n, 250, 400),
                "phosphorus_status": get_level(latest.results.phosphorus_p, 20, 40),
                "potassium_status": get_level(latest.results.potassium_k, 150, 250),
                "last_test": latest.test_date.isoformat(),
            }
        except Exception as e:
            logger.warning("Failed to load soil_status for project %s: %s", project_id, e, exc_info=True)
            return None


    async def _get_market_price(self, db: AsyncSession, plant_id: uuid.UUID):
        try:
            from dependencies import get_market_service
            trend = await get_market_service().get_trend(db, plant_id)
            return {
                "price_per_kg": trend["current_price"],
                "trend": trend["direction"],
                "change_pct": trend["change_percentage"],
            }
        except Exception as e:
            logger.warning("Failed to load market_price for plant %s: %s", plant_id, e, exc_info=True)
            return None


    async def _get_weather(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        try:
            from dependencies import get_weather_service
            weather = await get_weather_service().get_weather_for_project(db, project_id, account_id)
            return weather.model_dump(mode="json")
        except Exception as e:
            logger.warning("Failed to load weather for project %s: %s", project_id, e, exc_info=True)
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
        project = await self.get_project(db, project_id, account_id)

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
