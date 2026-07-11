from celery import Celery
from config import settings

celery_app = Celery(
    "agrifarm_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["tasks.planner_tasks", "tasks.weather_tasks", "tasks.ai_tasks", "tasks.market_tasks", "tasks.notification_tasks"]
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

if hasattr(settings, "CELERY_EAGER_MODE") and settings.CELERY_EAGER_MODE:
    celery_app.conf.update(
        task_always_eager=True,
        task_eager_propagates=True,
    )
