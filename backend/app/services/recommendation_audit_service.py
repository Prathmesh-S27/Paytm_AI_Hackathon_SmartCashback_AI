from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.recommendation import RecommendationLog

async def store_recommendation_log(log_data: dict, db: AsyncSession) -> RecommendationLog:
    log = RecommendationLog(**log_data)
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log

async def get_recommendation_logs(filters: dict, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[RecommendationLog]:
    query = select(RecommendationLog)
    
    if filters.get('category'):
        query = query.where(RecommendationLog.current_category == filters['category'])
    if filters.get('user_id'):
        query = query.where(RecommendationLog.user_id == filters['user_id'])
    if filters.get('score_min') is not None:
        query = query.where(RecommendationLog.final_score >= filters['score_min'])
    if filters.get('score_max') is not None:
        query = query.where(RecommendationLog.final_score <= filters['score_max'])
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())
