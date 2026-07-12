"""
Redis sliding-window rate limiter.
"""
import logging
from core.redis import get_redis_client
from core.errors.exceptions import RateLimitException
from core.errors.error_codes import ErrorCode

logger = logging.getLogger("agrifarm.rate_limiter")


async def check_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int,
    error_code: ErrorCode = ErrorCode.RATE_LIMITED,
) -> int:
    """
    Sliding window rate limiter using Redis INCR + EXPIRE.

    Args:
        key: Redis key (e.g., "ratelimit:auth:192.168.1.1")
        max_requests: Maximum allowed requests in the window
        window_seconds: Window size in seconds
        error_code: ErrorCode to raise if limit exceeded

    Returns:
        Current request count (useful for X-RateLimit-Remaining header)

    Raises:
        RateLimitException if limit exceeded, skips if Redis unavailable.
    """
    redis = await get_redis_client()
    if not redis:
        # Redis unavailable — skip rate limiting rather than blocking users
        return 0

    try:
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, window_seconds)

        if current > max_requests:
            ttl = await redis.ttl(key)
            raise RateLimitException(
                error_code,
                detail=f"Rate limit exceeded. Try again in {ttl} seconds.",
            )

        return current
    except RateLimitException:
        raise
    except Exception as e:
        logger.warning("Rate limiter error: %s", e)
        return 0  # Fail open — don't block users if Redis has issues
