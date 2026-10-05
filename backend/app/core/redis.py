import redis.asyncio as redis
import json
from typing import Optional, Any
from app.core.config import settings

redis_client: Optional[redis.Redis] = None

async def init_redis():
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL)
        await redis_client.ping()
    except Exception:
        redis_client = None

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

def get_redis() -> Optional[redis.Redis]:
    return redis_client

async def cache_get(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        val = await redis_client.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None

async def cache_set(key: str, value: Any, ex: int = 3600):
    if not redis_client:
        return
    try:
        await redis_client.set(key, json.dumps(value), ex=ex)
    except Exception:
        pass

async def cache_delete(key: str):
    if not redis_client:
        return
    try:
        await redis_client.delete(key)
    except Exception:
        pass
