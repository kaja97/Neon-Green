import logging
import ssl
from config import settings

logger = logging.getLogger(__name__)

_redis_client = None
_redis_attempted = False


def _get_ssl_kwargs(url: str) -> dict:
    """Return extra kwargs for redis.from_url when using rediss:// (TLS)."""
    if url.startswith("rediss://"):
        return {"ssl_cert_reqs": ssl.CERT_NONE}
    return {}


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
        ssl_kwargs = _get_ssl_kwargs(settings.REDIS_URL)
        client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            **ssl_kwargs,
        )
        await client.ping()
        _redis_client = client
        logger.info("Redis connected successfully.")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis not available ({e}). Running without Redis — refresh tokens will not be persisted.")
        return None

