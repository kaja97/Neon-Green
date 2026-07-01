import redis.asyncio as redis
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_redis_client():
    return redis_client
