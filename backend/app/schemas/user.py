import uuid
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserCategoryProfileRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category: str
    transaction_count: int
    total_spend: float
    average_spend: float
    median_spend: float
    min_spend: float
    max_spend: float
    last_transaction_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
