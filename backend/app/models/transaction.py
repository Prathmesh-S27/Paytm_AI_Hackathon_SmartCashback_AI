import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from sqlalchemy.dialects.postgresql import UUID

class Transaction(Base):
    __tablename__ = 'transactions'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'))
    merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'))
    merchant_category: Mapped[str] = mapped_column(String(100))
    amount: Mapped[float] = mapped_column(Float)
    payment_status: Mapped[str] = mapped_column(String(20), default='completed')

    cashback_amount: Mapped[float] = mapped_column(Float, default=0.0)
    coupon_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('coupons.id'), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
