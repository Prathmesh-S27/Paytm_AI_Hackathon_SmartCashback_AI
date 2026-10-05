import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.schemas.campaign import CampaignRead, CampaignCreate
from app.models.campaign import Campaign

router = APIRouter(tags=["campaigns"])

@router.get("/api/merchants/{merchant_id}/campaigns", response_model=list[CampaignRead])
async def get_merchant_campaigns(merchant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = select(Campaign).where(Campaign.merchant_id == merchant_id)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.post("/api/merchants/{merchant_id}/campaigns", response_model=CampaignRead)
async def create_campaign(merchant_id: uuid.UUID, req: CampaignCreate, db: AsyncSession = Depends(get_db)):
    if req.merchant_id != merchant_id:
        raise HTTPException(status_code=400, detail="Merchant ID mismatch")
    campaign = Campaign(**req.model_dump())
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@router.get("/api/admin/campaigns", response_model=list[CampaignRead])
async def admin_get_campaigns(db: AsyncSession = Depends(get_db)):
    query = select(Campaign)
    result = await db.execute(query)
    return list(result.scalars().all())
