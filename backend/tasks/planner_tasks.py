import asyncio
from celery.utils.log import get_task_logger
from .celery_app import celery_app
from database import async_session
from modules.planner.engine import generate_season_plan

logger = get_task_logger(__name__)

async def _run_engine(project_id_str: str):
    async with async_session() as db:
        await generate_season_plan(project_id_str, db)
        await db.commit()

@celery_app.task(bind=True, max_retries=3, name="tasks.planner_tasks.generate_season_plan_task")
def generate_season_plan_task(self, project_id_str: str):
    try:
        asyncio.run(_run_engine(project_id_str))
    except Exception as exc:
        logger.error(f"Task generate_season_plan failed for {project_id_str}: {exc}")
        raise self.retry(exc=exc, countdown=60)
