import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from sqlalchemy.dialects.postgresql import UUID

class Recommendation(Base):
    __tablename__ = 'recommendations'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'))
    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('transactions.id'))
    merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'))
    merchant = relationship("Merchant", lazy="selectin", foreign_keys=[merchant_id])
    merchant_category: Mapped[str] = mapped_column(String(100))
    coupon_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('coupons.id'), nullable=True)
    coupon = relationship("Coupon", lazy="selectin")
    score: Mapped[float] = mapped_column(Float)
    reason: Mapped[str] = mapped_column(Text)
    gemini_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='active')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class RecommendationLog(Base):
    __tablename__ = 'recommendation_logs'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'))
    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('transactions.id'))
    current_merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'))
    current_category: Mapped[str] = mapped_column(String(100))
    candidate_merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'))
    candidate_category: Mapped[str] = mapped_column(String(100))
    user_category_average: Mapped[float] = mapped_column(Float)
    merchant_average_bill: Mapped[float] = mapped_column(Float)
    distance_km: Mapped[float] = mapped_column(Float)
    category_score: Mapped[float] = mapped_column(Float)
    price_similarity: Mapped[float] = mapped_column(Float)
    history_score: Mapped[float] = mapped_column(Float)
    merchant_score: Mapped[float] = mapped_column(Float)
    final_score: Mapped[float] = mapped_column(Float)
    gemini_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_decision: Mapped[str] = mapped_column(String(20)) # recommended/filtered/rejected
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
