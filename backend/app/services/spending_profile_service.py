import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_category_profile import UserCategoryProfile

async def get_user_category_profile(user_id: uuid.UUID, category: str, db: AsyncSession) -> UserCategoryProfile | None:
    query = select(UserCategoryProfile).where(
        UserCategoryProfile.user_id == user_id,
        UserCategoryProfile.category == category
    )
    result = await db.execute(query)
    return result.scalars().first()

async def update_user_category_profile(user_id: uuid.UUID, category: str, amount: float, db: AsyncSession):
    profile = await get_user_category_profile(user_id, category, db)
    if not profile:
        profile = UserCategoryProfile(
            user_id=user_id,
            category=category,
            transaction_count=0,
            total_spend=0.0,
            average_spend=0.0,
            median_spend=0.0,
            min_spend=amount,
            max_spend=amount
        )
        db.add(profile)
    
    profile.transaction_count += 1
    profile.total_spend += amount
    profile.average_spend = profile.total_spend / profile.transaction_count
    
    if profile.min_spend == 0 or amount < profile.min_spend:
        profile.min_spend = amount
    if amount > profile.max_spend:
        profile.max_spend = amount
        
    profile.last_transaction_date = datetime.now(timezone.utc)
    await db.commit()

async def get_all_user_profiles(user_id: uuid.UUID, db: AsyncSession) -> list[UserCategoryProfile]:
    query = select(UserCategoryProfile).where(UserCategoryProfile.user_id == user_id)
    result = await db.execute(query)
    return list(result.scalars().all())
