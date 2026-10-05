import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CampaignBase(BaseModel):
    merchant_id: uuid.UUID
    title: str
    description: Optional[str] = None
    campaign_type: str
    discount_value: float
    discount_type: str
    minimum_bill: float = 0.0
    maximum_discount: Optional[float] = None
    target_category: Optional[str] = None
    start_date: datetime
    end_date: datetime
    active: bool = True

class CampaignCreate(CampaignBase):
    pass

class CampaignRead(CampaignBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
