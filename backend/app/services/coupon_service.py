import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.coupon import Coupon, CouponRedemption

async def get_active_coupons_for_merchant(merchant_id: uuid.UUID, db: AsyncSession) -> list[Coupon]:
    now = datetime.now(timezone.utc)
    query = select(Coupon).where(
        Coupon.merchant_id == merchant_id,
        Coupon.active == True,
        Coupon.valid_from <= now,
        Coupon.valid_until >= now,
        Coupon.used_count < Coupon.usage_limit
    )
    result = await db.execute(query)
    return list(result.scalars().all())



async def get_best_coupon_for_recommendation(merchant_id: uuid.UUID, user_id: uuid.UUID, amount: float, db: AsyncSession) -> Coupon | None:
    coupons = await get_active_coupons_for_merchant(merchant_id, db)
    best_coupon = None
    best_discount = 0.0
    
    for c in coupons:
        if amount < c.minimum_transaction_amount:
            continue
            
        discount = 0.0
        if c.discount_type == 'percentage':
            discount = amount * (c.discount_value / 100.0)
            if c.maximum_discount:
                discount = min(discount, c.maximum_discount)
        elif c.discount_type == 'flat':
            discount = c.discount_value
            
        if discount > best_discount:
            best_discount = discount
            best_coupon = c
            
    return best_coupon

async def redeem_coupon(coupon_id: uuid.UUID, user_id: uuid.UUID, transaction_id: uuid.UUID, discount_amount: float, db: AsyncSession):
    query = select(Coupon).where(Coupon.id == coupon_id)
    res = await db.execute(query)
    coupon = res.scalars().first()
    if coupon:
        coupon.used_count += 1
        redemption = CouponRedemption(
            coupon_id=coupon_id,
            user_id=user_id,
            transaction_id=transaction_id,
            discount_amount=discount_amount
        )
        db.add(redemption)
        await db.commit()
