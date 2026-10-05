import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.schemas.user import UserRead, UserCategoryProfileRead
from app.schemas.transaction import TransactionRead
from app.schemas.recommendation import RecommendationRead
from app.models.user import User
from app.models.transaction import Transaction
from app.models.recommendation import Recommendation
from app.services.spending_profile_service import get_all_user_profiles
from sqlalchemy import cast, Date, func
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/spending", response_model=list[UserCategoryProfileRead])
async def get_user_spending(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    profiles = await get_all_user_profiles(user_id, db)
    return profiles

@router.get("/{user_id}/transactions", response_model=list[TransactionRead])
async def get_user_transactions(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.created_at.desc()).limit(50)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/{user_id}/recommendations", response_model=list[RecommendationRead])
async def get_user_recommendations(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Recommendation).where(Recommendation.user_id == user_id).order_by(Recommendation.created_at.desc()).limit(50)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/{user_id}/spending-chart")
async def get_user_spending_chart(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=14)
    
    query = (
        select(
            cast(Transaction.created_at, Date).label("date"),
            func.sum(Transaction.amount).label("amount")
        )
        .where(Transaction.user_id == user_id)
        .where(Transaction.payment_status == 'completed')
        .where(Transaction.created_at >= start_date)
        .group_by(cast(Transaction.created_at, Date))
        .order_by(cast(Transaction.created_at, Date))
    )
    result = await db.execute(query)
    rows = result.all()
    
    data = [{"date": str(row.date), "amount": float(row.amount)} for row in rows]
    return data
