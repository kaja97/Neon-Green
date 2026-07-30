"""Async Redis client for presence tracking, typing indicators, and pub/sub.

Key patterns:
  presence:online:{account_id}         → SET with TTL 60s (heartbeat refresh)
  typing:{conversation_id}:{user_id}   → SET with TTL 5s
  unread:{user_id}                     → HASH { conversation_id: count }
  chat:messages:{account_id}           → Pub/sub channel for cross-instance delivery
"""

import redis.asyncio as aioredis
from config import settings

redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Get or create the shared async Redis client."""
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL, decode_responses=True
        )
    return redis_client


# ── Presence helpers ──


async def set_online(account_id: str) -> None:
    r = await get_redis()
    await r.set(f"presence:online:{account_id}", "1", ex=60)


async def set_offline(account_id: str) -> None:
    r = await get_redis()
    await r.delete(f"presence:online:{account_id}")


async def is_online(account_id: str) -> bool:
    r = await get_redis()
    return await r.exists(f"presence:online:{account_id}") > 0


async def refresh_presence(account_id: str) -> None:
    """Extend presence TTL on heartbeat."""
    r = await get_redis()
    await r.expire(f"presence:online:{account_id}", 60)


async def bulk_online_status(account_ids: list[str]) -> dict[str, bool]:
    """Check online status for multiple users at once."""
    if not account_ids:
        return {}
    r = await get_redis()
    pipe = r.pipeline()
    for aid in account_ids:
        pipe.exists(f"presence:online:{aid}")
    results = await pipe.execute()
    return {aid: bool(r) for aid, r in zip(account_ids, results)}


# ── Typing helpers ──


async def set_typing(conversation_id: str, user_id: str) -> None:
    r = await get_redis()
    await r.set(f"typing:{conversation_id}:{user_id}", "1", ex=5)


async def is_typing(conversation_id: str, user_id: str) -> bool:
    r = await get_redis()
    return await r.exists(f"typing:{conversation_id}:{user_id}") > 0
