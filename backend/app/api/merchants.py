import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.schemas.merchant import MerchantRead, MerchantWithStats
from app.schemas.coupon import CouponRead
from app.models.merchant import Merchant, MerchantStatistics
from app.models.coupon import Coupon
from app.models.transaction import Transaction
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/merchants", tags=["merchants"])

@router.get("", response_model=list[MerchantRead])
async def list_merchants(
    category: Optional[str] = None,
    owner_id: Optional[uuid.UUID] = None,
    active: bool = True,
    db: AsyncSession = Depends(get_db)
):
    query = select(Merchant).where(Merchant.active == active)
    if category:
        query = query.where(Merchant.category == category)
    if owner_id:
        query = query.where(Merchant.owner_id == owner_id)

    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/{merchant_id}", response_model=MerchantWithStats)
async def get_merchant_detail(merchant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Merchant).where(Merchant.id == merchant_id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
        
    stats_query = select(MerchantStatistics).where(MerchantStatistics.merchant_id == merchant_id)
    stats_res = await db.execute(stats_query)
    stats = stats_res.scalars().first()
    
    merch_dict = MerchantRead.model_validate(merchant).model_dump()
    if stats:
        merch_dict['statistics'] = stats
        
    return MerchantWithStats(**merch_dict)

@router.get("/{merchant_id}/analytics")
async def get_merchant_analytics(merchant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stats_query = select(MerchantStatistics).where(MerchantStatistics.merchant_id == merchant_id)
    stats_res = await db.execute(stats_query)
    return stats_res.scalars().first()

@router.get("/{merchant_id}/coupons", response_model=list[CouponRead])
async def get_merchant_coupons(merchant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Coupon).where(Coupon.merchant_id == merchant_id)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/{merchant_id}/revenue-chart")
async def get_merchant_revenue_chart(merchant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=7)
    
    # In SQLite/Postgres func.date might differ, but CAST to DATE works across mostly
    from sqlalchemy import cast, Date, func
    query = (
        select(
            cast(Transaction.created_at, Date).label("date"),
            func.sum(Transaction.amount).label("amount")
        )
        .where(Transaction.merchant_id == merchant_id)
        .where(Transaction.payment_status == 'completed')
        .where(Transaction.created_at >= start_date)
        .group_by(cast(Transaction.created_at, Date))
        .order_by(cast(Transaction.created_at, Date))
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    data = [{"date": str(row.date), "amount": float(row.amount)} for row in rows]
    return data
