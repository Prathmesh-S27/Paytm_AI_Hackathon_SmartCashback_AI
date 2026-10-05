import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class Coupon(TimestampMixin, Base):
    __tablename__ = 'coupons'

    merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'))

    category: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    discount_type: Mapped[str] = mapped_column(String(20)) # percentage/flat
    discount_value: Mapped[float] = mapped_column(Float)
    minimum_transaction_amount: Mapped[float] = mapped_column(Float, default=0.0)
    maximum_discount: Mapped[float | None] = mapped_column(Float, nullable=True)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    usage_limit: Mapped[int] = mapped_column(Integer, default=100)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    user_usage_limit: Mapped[int] = mapped_column(Integer, default=1)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

class CouponRedemption(Base):
    __tablename__ = 'coupon_redemptions'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coupon_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('coupons.id'))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'))
    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('transactions.id'))
    discount_amount: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
