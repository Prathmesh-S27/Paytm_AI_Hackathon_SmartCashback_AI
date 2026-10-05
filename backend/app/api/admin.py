import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_db
from app.models.user import User
from app.models.merchant import Merchant
from app.models.transaction import Transaction
from app.models.recommendation import RecommendationLog
from app.models.campaign import Campaign
from app.models.coupon import Coupon

from app.schemas.user import UserRead
from app.schemas.merchant import MerchantRead

from app.schemas.recommendation import RecommendationLogRead

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/analytics")
async def get_platform_analytics(db: AsyncSession = Depends(get_db)):
    users_count = await db.scalar(select(func.count(User.id)))
    merchants_count = await db.scalar(select(func.count(Merchant.id)))
    transactions_count = await db.scalar(select(func.count(Transaction.id)))
    
    gmv = await db.scalar(select(func.sum(Transaction.amount)).where(Transaction.payment_status == 'completed')) or 0.0
    total_cashback = await db.scalar(select(func.sum(Transaction.cashback_amount)).where(Transaction.payment_status == 'completed')) or 0.0
    
    active_campaigns = await db.scalar(select(func.count(Campaign.id)).where(Campaign.active == True)) or 0
    active_coupons = await db.scalar(select(func.count(Coupon.id)).where(Coupon.active == True)) or 0

    return {
        "total_users": users_count,
        "total_merchants": merchants_count,
        "total_transactions": transactions_count,
        "total_gmv": gmv,
        "total_cashback": total_cashback,
        "active_campaigns": active_campaigns,
        "active_coupons": active_coupons
    }

@router.get("/recommendation-logs", response_model=list[RecommendationLogRead])
async def list_recommendation_logs(
    category: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
    score_min: Optional[float] = None,
    score_max: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = select(RecommendationLog)
    if category:
        query = query.where(RecommendationLog.current_category == category)
    if user_id:
        query = query.where(RecommendationLog.user_id == user_id)
    if score_min is not None:
        query = query.where(RecommendationLog.final_score >= score_min)
    if score_max is not None:
        query = query.where(RecommendationLog.final_score <= score_max)
        
    query = query.order_by(RecommendationLog.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/recommendation-logs/{log_id}", response_model=RecommendationLogRead)
async def get_recommendation_log(log_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(RecommendationLog).where(RecommendationLog.id == log_id)
    res = await db.execute(query)
    log = res.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log



@router.get("/merchants", response_model=list[MerchantRead])
async def admin_get_merchants(db: AsyncSession = Depends(get_db)):
    query = select(Merchant)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/users", response_model=list[UserRead])
async def admin_get_users(db: AsyncSession = Depends(get_db)):
    query = select(User)
    result = await db.execute(query)
    return list(result.scalars().all())
