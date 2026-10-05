import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.recommendation import RecommendationRead

class TransactionBase(BaseModel):
    user_id: uuid.UUID
    merchant_id: uuid.UUID
    amount: float

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: uuid.UUID
    merchant_category: str
    payment_status: str

    cashback_amount: float
    coupon_id: Optional[uuid.UUID] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaymentRequest(TransactionBase):
    coupon_id: Optional[uuid.UUID] = None

class PaymentResponse(BaseModel):
    transaction: TransactionRead
    recommendations: List[RecommendationRead]
    model_config = ConfigDict(from_attributes=True)
