import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.schemas.coupon import CouponRead, CouponCreate, CouponUpdate
from app.models.coupon import Coupon

router = APIRouter(prefix="/api/coupons", tags=["coupons"])

@router.get("", response_model=list[CouponRead])
async def list_coupons(
    category: Optional[str] = None,
    merchant_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Coupon)
    if category:
        query = query.where(Coupon.category == category)

    if merchant_id:
        query = query.where(Coupon.merchant_id == merchant_id)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.post("", response_model=CouponRead)
async def create_coupon(req: CouponCreate, db: AsyncSession = Depends(get_db)):
    coupon = Coupon(**req.model_dump())
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon

@router.get("/{coupon_id}", response_model=CouponRead)
async def get_coupon(coupon_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Coupon).where(Coupon.id == coupon_id)
    result = await db.execute(query)
    coupon = result.scalars().first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon

@router.put("/{coupon_id}", response_model=CouponRead)
async def update_coupon(coupon_id: uuid.UUID, req: CouponUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Coupon).where(Coupon.id == coupon_id)
    result = await db.execute(query)
    coupon = result.scalars().first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(coupon, key, value)
        
    await db.commit()
    await db.refresh(coupon)
    return coupon

@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Coupon).where(Coupon.id == coupon_id)
    result = await db.execute(query)
    coupon = result.scalars().first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    await db.delete(coupon)
    await db.commit()
    return {"status": "success"}
