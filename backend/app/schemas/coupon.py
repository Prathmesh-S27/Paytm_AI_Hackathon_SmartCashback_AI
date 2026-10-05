import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CouponBase(BaseModel):
    merchant_id: uuid.UUID

    category: str
    title: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    minimum_transaction_amount: float = 0.0
    maximum_discount: Optional[float] = None
    valid_from: datetime
    valid_until: datetime
    usage_limit: int = 100
    user_usage_limit: int = 1
    active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    minimum_transaction_amount: Optional[float] = None
    maximum_discount: Optional[float] = None
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = None
    user_usage_limit: Optional[int] = None
    active: Optional[bool] = None

class CouponRead(CouponBase):
    id: uuid.UUID
    used_count: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
