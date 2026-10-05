import uuid
from pydantic import BaseModel
from typing import List, Optional

class GeminiCandidate(BaseModel):
    merchant_id: uuid.UUID
    name: str
    category: str
    average_bill: float
    distance_km: float
    base_score: float

class GeminiRecommendationRequest(BaseModel):
    current_category: str
    current_amount: float
    user_category_average: float
    candidates: List[GeminiCandidate]

class GeminiRankedMerchant(BaseModel):
    merchant_id: uuid.UUID
    reason: str
    confidence: float

class GeminiRecommendationResponse(BaseModel):
    recommended_merchants: List[GeminiRankedMerchant]
