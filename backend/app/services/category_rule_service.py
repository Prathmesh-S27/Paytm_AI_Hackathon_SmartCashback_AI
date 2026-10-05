from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.category_relationship import CategoryRelationship

async def get_related_categories(category: str, db: AsyncSession) -> list[str]:
    """Get allowed categories for recommendations.
    Only returns categories where source_category matches the current category.
    Always includes the source category itself.
    """
    query = select(CategoryRelationship).where(
        CategoryRelationship.source_category == category,
        CategoryRelationship.active == True
    )
    result = await db.execute(query)
    rels = result.scalars().all()
    
    cats = [category]  # Always include self
    for r in rels:
        if r.related_category not in cats:
            cats.append(r.related_category)
    return cats

async def get_related_categories_with_strength(category: str, db: AsyncSession) -> dict[str, float]:
    """Get allowed categories with their relationship strength.
    Returns {category_name: strength} dict. Source category has strength 1.0.
    """
    query = select(CategoryRelationship).where(
        CategoryRelationship.source_category == category,
        CategoryRelationship.active == True
    )
    result = await db.execute(query)
    rels = result.scalars().all()
    
    cats = {category: 1.0}
    for r in rels:
        cats[r.related_category] = r.strength
    return cats

async def is_category_allowed(source_category: str, target_category: str, db: AsyncSession) -> bool:
    if source_category == target_category:
        return True
    related = await get_related_categories(source_category, db)
    return target_category in related
