import uuid
from datetime import datetime, timezone
import logging
from core.cache import get_redis_client

logger = logging.getLogger(__name__)

# Quotas per day
QUOTAS = {
    "chat": 5,
    "refresh": 3,
    "diagnosis": 2
}

async def check_rate_limit(farmer_id: uuid.UUID, action: str) -> bool:
    """
    Check if the user has exceeded the rate limit for a specific action (chat, refresh, diagnosis).
    Uses Redis to track usage per day.
    """
    if action not in QUOTAS:
        logger.error(f"Unknown rate limit action: {action}")
        return False
        
    redis = await get_redis_client()
    if not redis:
        logger.warning("Redis not available, rate limit defaults to allowed.")
        return True
        
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    key = f"ratelimit:{farmer_id}:{action}:{today}"
    
    try:
        current_usage = await redis.get(key)
        if current_usage and int(current_usage) >= QUOTAS[action]:
            return False
            
        # Increment usage
        await redis.incr(key)
        # Set expiration to 24 hours (86400 seconds) if it's a new key
        if current_usage is None:
            await redis.expire(key, 86400)
            
        return True
    except Exception as e:
        logger.error(f"Rate limiting failed: {e}")
        return True
