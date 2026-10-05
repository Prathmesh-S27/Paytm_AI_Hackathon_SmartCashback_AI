import uuid
from sqlalchemy import String, Float, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class Merchant(TimestampMixin, Base):
    __tablename__ = 'merchants'

    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(100), index=True)
    subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

    address: Mapped[str] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    average_bill: Mapped[float] = mapped_column(Float)
    minimum_bill: Mapped[float] = mapped_column(Float)
    maximum_bill: Mapped[float] = mapped_column(Float)
    cashback_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    rating: Mapped[float] = mapped_column(Float, default=4.0)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    total_customers: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)

class MerchantStatistics(TimestampMixin, Base):
    __tablename__ = 'merchant_statistics'
    
    merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'), unique=True)
    average_spend: Mapped[float] = mapped_column(Float, default=0.0)
    median_spend: Mapped[float] = mapped_column(Float, default=0.0)
    transaction_count: Mapped[int] = mapped_column(Integer, default=0)
    customer_count: Mapped[int] = mapped_column(Integer, default=0)
    total_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    repeat_customer_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_cashback: Mapped[float] = mapped_column(Float, default=0.0)
    coupon_redemption_rate: Mapped[float] = mapped_column(Float, default=0.0)
