import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.schemas.recommendation import RecommendationDetail
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("/{rec_id}", response_model=RecommendationDetail)
async def get_recommendation(rec_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Recommendation).where(Recommendation.id == rec_id)
    result = await db.execute(query)
    rec = result.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return rec
