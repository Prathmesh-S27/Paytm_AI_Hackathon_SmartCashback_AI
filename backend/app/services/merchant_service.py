import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.merchant import Merchant, MerchantStatistics
from app.models.transaction import Transaction

async def get_merchant(merchant_id: uuid.UUID, db: AsyncSession) -> Merchant | None:
    query = select(Merchant).where(Merchant.id == merchant_id)
    result = await db.execute(query)
    return result.scalars().first()



async def get_nearby_merchants(lat: float, lng: float, radius_km: float, db: AsyncSession, categories: list[str] = None) -> list[Merchant]:
    from app.services.geo_service import calculate_bucket_bounds
    sw_lat, sw_lng, ne_lat, ne_lng = calculate_bucket_bounds(lat, lng, radius_km * 2)
    query = select(Merchant).where(
        Merchant.latitude >= sw_lat,
        Merchant.latitude <= ne_lat,
        Merchant.longitude >= sw_lng,
        Merchant.longitude <= ne_lng,
        Merchant.active == True
    )
    if categories:
        query = query.where(Merchant.category.in_(categories))
    result = await db.execute(query)
    return list(result.scalars().all())

async def update_merchant_statistics(merchant_id: uuid.UUID, db: AsyncSession):
    query = select(Transaction).where(Transaction.merchant_id == merchant_id, Transaction.payment_status == 'completed')
    result = await db.execute(query)
    transactions = list(result.scalars().all())
    
    count = len(transactions)
    if count == 0:
        return
        
    total_rev = sum(t.amount for t in transactions)
    avg_spend = total_rev / count
    sorted_amounts = sorted(t.amount for t in transactions)
    median_spend = sorted_amounts[count//2] if count > 0 else 0
    unique_customers = len(set(t.user_id for t in transactions))
    
    from collections import Counter
    user_counts = Counter(t.user_id for t in transactions)
    repeat_customers = sum(1 for v in user_counts.values() if v > 1)
    
    avg_cashback = sum(t.cashback_amount for t in transactions) / count
    coupons_used = sum(1 for t in transactions if t.coupon_id)
    coupon_rate = coupons_used / count if count > 0 else 0.0

    stat_query = select(MerchantStatistics).where(MerchantStatistics.merchant_id == merchant_id)
    stat_res = await db.execute(stat_query)
    stats = stat_res.scalars().first()

    if not stats:
        stats = MerchantStatistics(merchant_id=merchant_id)
        db.add(stats)
        
    stats.average_spend = avg_spend
    stats.median_spend = median_spend
    stats.transaction_count = count
    stats.customer_count = unique_customers
    stats.total_revenue = total_rev
    stats.repeat_customer_count = repeat_customers
    stats.avg_cashback = avg_cashback
    stats.coupon_redemption_rate = coupon_rate
    await db.commit()
