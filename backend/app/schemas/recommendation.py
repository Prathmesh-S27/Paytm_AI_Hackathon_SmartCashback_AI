import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.coupon import CouponRead
from app.schemas.merchant import MerchantRead

class RecommendationBase(BaseModel):
    user_id: uuid.UUID
    transaction_id: uuid.UUID
    merchant_id: uuid.UUID
    merchant_category: str
    coupon_id: Optional[uuid.UUID] = None
    score: float
    reason: str
    gemini_explanation: Optional[str] = None
    status: str = 'active'

class RecommendationRead(RecommendationBase):
    id: uuid.UUID
    created_at: datetime
    coupon: Optional[CouponRead] = None
    merchant: Optional[MerchantRead] = None
    model_config = ConfigDict(from_attributes=True)

class RecommendationDetail(RecommendationRead):
    model_config = ConfigDict(from_attributes=True)

class RecommendationLogRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    transaction_id: uuid.UUID
    current_merchant_id: uuid.UUID
    current_category: str
    candidate_merchant_id: uuid.UUID
    candidate_category: str
    user_category_average: float
    merchant_average_bill: float
    distance_km: float
    category_score: float
    price_similarity: float
    history_score: float
    merchant_score: float
    final_score: float
    gemini_reason: Optional[str] = None
    final_decision: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
