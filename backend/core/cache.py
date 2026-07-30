import uuid
import logging
from .redis import get_redis_client

logger = logging.getLogger(__name__)

DASHBOARD_CACHE_TTL = 180  # 3 minutes

def get_dashboard_cache_key(project_id: str | uuid.UUID) -> str:
    return f"dashboard:{project_id}"

async def invalidate_dashboard_cache(project_id: str | uuid.UUID):
    """
    Invalidates the Redis cache for a specific project dashboard.
    Must be called after any mutation that affects dashboard data
    (e.g., completing an activity, updating weather, reporting an issue).
    """
    redis = await get_redis_client()
    if redis:
        key = get_dashboard_cache_key(project_id)
        try:
            await redis.delete(key)
            logger.info(f"Invalidated dashboard cache for project {project_id}")
        except Exception as e:
            logger.error(f"Failed to invalidate dashboard cache for {project_id}: {e}")
