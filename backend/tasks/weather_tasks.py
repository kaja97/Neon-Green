import asyncio
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy.future import select
from celery.utils.log import get_task_logger

from .celery_app import celery_app
from database import async_session
from models.project import Project
from models.farmer import FarmerLocation
from models.weather import WeatherCache, WeatherAlert
from models.activity import FarmingActivity, ActivityPlan
from modules.weather.client import fetch_weather_data

logger = get_task_logger(__name__)

async def _refresh_weather_cache():
    async with async_session() as db:
        # Get all active projects
        result = await db.execute(select(Project).where(Project.status == "active"))
        projects = result.scalars().all()
        
        location_ids = set([p.location_id for p in projects])
        
        for loc_id in location_ids:
            loc = await db.get(FarmerLocation, loc_id)
            if not loc:
                continue
                
            raw_data = await fetch_weather_data(float(loc.latitude), float(loc.longitude))
            
            # Check cache
            today = date.today()
            cache_result = await db.execute(
                select(WeatherCache).where(WeatherCache.location_id == loc_id, WeatherCache.forecast_date == today)
            )
            cache = cache_result.scalars().first()
            
            if cache:
                cache.data = raw_data
                cache.expires_at = datetime.utcnow() + timedelta(hours=3)
            else:
                new_cache = WeatherCache(
                    location_id=loc_id,
                    forecast_date=today,
                    data=raw_data,
                    expires_at=datetime.utcnow() + timedelta(hours=3)
                )
                db.add(new_cache)
                
        await db.commit()
        logger.info(f"Refreshed weather for {len(location_ids)} locations.")

from modules.weather.rules import should_skip_watering, should_postpone_fertilizing, should_postpone_spraying
from core.cache import invalidate_dashboard_cache

async def _adjust_plan_for_weather():
    async with async_session() as db:
        today = date.today()
        
        result = await db.execute(select(Project).where(Project.status == "active"))
        projects = result.scalars().all()
        
        for project in projects:
            # Get weather
            cache_result = await db.execute(
                select(WeatherCache).where(WeatherCache.location_id == project.location_id, WeatherCache.forecast_date == today)
            )
            cache = cache_result.scalars().first()
            if not cache:
                continue
                
            # Compute today's rain from cache
            rain_today = sum([item.get("rain", {}).get("3h", 0) for item in cache.data.get("list", []) if datetime.fromtimestamp(item["dt"]).date() == today])
            wind_today = sum([item.get("wind", {}).get("speed", 0) for item in cache.data.get("list", []) if datetime.fromtimestamp(item["dt"]).date() == today])
            if cache.data.get("list"):
                wind_today = (wind_today / len([item for item in cache.data.get("list", []) if datetime.fromtimestamp(item["dt"]).date() == today])) * 3.6
            else:
                wind_today = 0
            
            # Get today's activities
            plan_res = await db.execute(select(ActivityPlan).where(ActivityPlan.project_id == project.id, ActivityPlan.is_active == True))
            plan = plan_res.scalars().first()
            if not plan:
                continue
                
            act_res = await db.execute(
                select(FarmingActivity).where(FarmingActivity.plan_id == plan.id, FarmingActivity.due_date == today, FarmingActivity.status == "pending")
            )
            activities = act_res.scalars().all()
            
            project_updated = False
            for act in activities:
                if act.activity_type == "watering":
                    skip, msg = should_skip_watering(rain_today)
                    if skip:
                        act.status = "skipped"
                        act.ai_reasoning = msg
                        logger.info(f"Skipped watering for project {project.id}")
                        project_updated = True
                        
                elif act.activity_type == "fertilizing":
                    postpone, msg = should_postpone_fertilizing(rain_today)
                    if postpone:
                        act.due_date = today + timedelta(days=1)
                        act.ai_reasoning = msg
                        logger.info(f"Postponed fertilizing for project {project.id}")
                        project_updated = True
                        
                elif act.activity_type == "spraying":
                    postpone, msg = should_postpone_spraying(wind_today)
                    if postpone:
                        act.due_date = today + timedelta(days=1)
                        act.ai_reasoning = msg
                        project_updated = True
                        
            if project_updated:
                await invalidate_dashboard_cache(project.id)
                
        await db.commit()

async def _check_weather_alerts():
    from modules.weather.rules import evaluate_weather_alerts
    from core.cache import invalidate_dashboard_cache
    
    async with async_session() as db:
        today = date.today()
        
        result = await db.execute(select(Project).where(Project.status == "active"))
        projects = result.scalars().all()
        
        for project in projects:
            cache_result = await db.execute(
                select(WeatherCache).where(WeatherCache.location_id == project.location_id, WeatherCache.forecast_date == today)
            )
            cache = cache_result.scalars().first()
            if not cache:
                continue
                
            rain_tomorrow = sum([item.get("rain", {}).get("3h", 0) for item in cache.data.get("list", []) if datetime.fromtimestamp(item["dt"]).date() == today + timedelta(days=1)])
            temps_tomorrow = [item.get("main", {}).get("temp", 25) for item in cache.data.get("list", []) if datetime.fromtimestamp(item["dt"]).date() == today + timedelta(days=1)]
            min_temp = min(temps_tomorrow) if temps_tomorrow else 25
            hum_tomorrow = [item.get("main", {}).get("humidity", 50) for item in cache.data.get("list", []) if datetime.fromtimestamp(item["dt"]).date() == today + timedelta(days=1)]
            avg_hum = (sum(hum_tomorrow) / len(hum_tomorrow)) if hum_tomorrow else 50
            
            alerts = evaluate_weather_alerts(rain_tomorrow, min_temp, avg_hum)
            
            project_updated = False
            for a_type, severity, msg in alerts:
                # Check if alert already exists for tomorrow
                existing_res = await db.execute(
                    select(WeatherAlert).where(
                        WeatherAlert.project_id == project.id, 
                        WeatherAlert.alert_type == a_type,
                        WeatherAlert.target_date == today + timedelta(days=1)
                    )
                )
                if not existing_res.scalars().first():
                    new_alert = WeatherAlert(
                        project_id=project.id,
                        alert_type=a_type,
                        severity=severity,
                        message=msg,
                        target_date=today + timedelta(days=1)
                    )
                    db.add(new_alert)
                    project_updated = True
                    
            if project_updated:
                await invalidate_dashboard_cache(project.id)
                    
        await db.commit()


@celery_app.task(name="tasks.weather_tasks.refresh_weather_cache")
def refresh_weather_cache():
    asyncio.run(_refresh_weather_cache())

@celery_app.task(name="tasks.weather_tasks.adjust_plan_for_weather")
def adjust_plan_for_weather():
    asyncio.run(_adjust_plan_for_weather())

@celery_app.task(name="tasks.weather_tasks.check_weather_alerts")
def check_weather_alerts():
    asyncio.run(_check_weather_alerts())
