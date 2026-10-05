import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class MerchantBase(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    description: Optional[str] = None
    latitude: float
    longitude: float

    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    average_bill: float
    minimum_bill: float
    maximum_bill: float
    cashback_percentage: float = 0.0
    active: bool = True
    owner_id: Optional[uuid.UUID] = None

class MerchantCreate(MerchantBase):
    pass

class MerchantRead(MerchantBase):
    id: uuid.UUID
    rating: float
    total_transactions: int
    total_customers: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MerchantStatisticsRead(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    average_spend: float
    median_spend: float
    transaction_count: int
    customer_count: int
    total_revenue: float
    repeat_customer_count: int
    avg_cashback: float
    coupon_redemption_rate: float
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MerchantWithStats(MerchantRead):
    statistics: Optional[MerchantStatisticsRead] = None
    model_config = ConfigDict(from_attributes=True)
