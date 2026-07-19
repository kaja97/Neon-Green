from celery import Celery
from celery.schedules import crontab
from config import settings

celery_app = Celery(
    "agrifarm_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["tasks.planner_tasks", "tasks.weather_tasks", "tasks.ai_tasks", "tasks.market_tasks", "tasks.notification_tasks", "tasks.otp_tasks"]
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# ── Periodic task schedule ──────────────────────────────────
# Weather data is refreshed every hour so dashboards stay current
# without relying solely on lazy cache refreshes on page load.
celery_app.conf.beat_schedule = {
    "refresh-weather-hourly": {
        "task": "tasks.weather_tasks.refresh_weather_cache",
        "schedule": crontab(minute=0),  # top of every hour
    },
    "check-weather-alerts-hourly": {
        "task": "tasks.weather_tasks.check_weather_alerts",
        "schedule": crontab(minute=5),  # 5 past the hour
    },
    "adjust-plan-for-weather-hourly": {
        "task": "tasks.weather_tasks.adjust_plan_for_weather",
        "schedule": crontab(minute=10),  # 10 past the hour
    },
}

if hasattr(settings, "CELERY_EAGER_MODE") and settings.CELERY_EAGER_MODE:
    celery_app.conf.update(
        task_always_eager=True,
        task_eager_propagates=True,
    )
