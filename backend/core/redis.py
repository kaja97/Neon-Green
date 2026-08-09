import logging
from config import settings

logger = logging.getLogger(__name__)

_redis_client = None
_redis_attempted = False

async def get_redis_client():
    """Return a Redis client if available, or None if Redis is not running."""
    global _redis_client, _redis_attempted
    
    if _redis_client is not None:
        return _redis_client
    
    if _redis_attempted:
        return None
    
    _redis_attempted = True
    
    try:
        import redis.asyncio as redis
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await client.ping()
        _redis_client = client
        logger.info("Redis connected successfully.")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis not available ({e}). Running without Redis — refresh tokens will not be persisted.")
        return None
