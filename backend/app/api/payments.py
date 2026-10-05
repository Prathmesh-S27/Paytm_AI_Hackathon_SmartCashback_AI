from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_redis
from app.schemas.transaction import PaymentRequest, PaymentResponse, TransactionRead
from app.models.transaction import Transaction
from app.services.merchant_service import get_merchant, update_merchant_statistics
from app.services.spending_profile_service import update_user_category_profile
from app.recommendation.engine import RecommendationEngine

router = APIRouter(prefix="/api/payments", tags=["payments"])
engine = RecommendationEngine()

from sqlalchemy import select
from app.models.coupon import Coupon
from app.services.coupon_service import redeem_coupon

@router.post("", response_model=PaymentResponse)
async def create_payment(req: PaymentRequest, db: AsyncSession = Depends(get_db), redis=Depends(get_redis)):
    merchant = await get_merchant(req.merchant_id, db)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
        
    discount = 0.0
    if req.coupon_id:
        query = select(Coupon).where(Coupon.id == req.coupon_id, Coupon.active == True)
        res = await db.execute(query)
        coupon = res.scalars().first()
        if coupon and req.amount >= coupon.minimum_transaction_amount:
            if coupon.discount_type == 'percentage':
                discount = req.amount * (coupon.discount_value / 100.0)
                if coupon.maximum_discount:
                    discount = min(discount, coupon.maximum_discount)
            else:
                discount = coupon.discount_value

    transaction = Transaction(
        user_id=req.user_id,
        merchant_id=req.merchant_id,
        merchant_category=merchant.category,
        amount=req.amount,
        payment_status='completed',
        cashback_amount=discount,
        coupon_id=req.coupon_id
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    if req.coupon_id and discount > 0:
        await redeem_coupon(req.coupon_id, req.user_id, transaction.id, discount, db)
    
    await update_user_category_profile(req.user_id, merchant.category, req.amount, db)
    await update_merchant_statistics(merchant.id, db)
    
    recommendations = await engine.generate_recommendations(
        transaction_id=transaction.id,
        user_id=req.user_id,
        merchant_id=merchant.id,
        amount=req.amount,
        db=db,
        redis_client=redis
    )
    
    return PaymentResponse(
        transaction=TransactionRead.model_validate(transaction),
        recommendations=recommendations
    )
