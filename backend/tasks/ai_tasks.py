import asyncio
from datetime import datetime, timezone
from celery.utils.log import get_task_logger
from sqlalchemy.future import select

from .celery_app import celery_app
from database import async_session
from models.project import Project
from models.ai import AIProjectSummary
from modules.ai.context_builder import build_project_context
from modules.ai.gemini_client import call_gemini

logger = get_task_logger(__name__)

async def _generate_weekly_ai_summary():
    async with async_session() as db:
        # Get all active projects
        result = await db.execute(select(Project).where(Project.status == "active"))
        projects = result.scalars().all()
        
        for project in projects:
            context = await build_project_context(db, project.id)
            
            # Use gemini to write a nice paragraph
            ai_resp, _ = await call_gemini(
                context, 
                "Write a brief 3-sentence weekly summary for this farm based on its current context.", 
                "general"
            )
            
            # Check for existing summary
            res = await db.execute(select(AIProjectSummary).where(AIProjectSummary.project_id == project.id))
            summary = res.scalars().first()
            
            import json
            context_json = json.loads(context)
            context_json["weekly_insight"] = ai_resp
            
            if not summary:
                summary = AIProjectSummary(
                    project_id=project.id,
                    summary_json=context_json,
                    last_updated_at=datetime.now(timezone.utc)
                )
                db.add(summary)
            else:
                summary.summary_json = context_json
                summary.last_updated_at = datetime.now(timezone.utc)
                
            logger.info(f"Generated weekly AI summary for project {project.id}")
            
        await db.commit()

@celery_app.task(name="tasks.ai_tasks.generate_weekly_ai_summary")
def generate_weekly_ai_summary():
    asyncio.run(_generate_weekly_ai_summary())
