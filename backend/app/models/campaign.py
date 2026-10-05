import uuid
from datetime import datetime
from sqlalchemy import String, Float, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class Campaign(TimestampMixin, Base):
    __tablename__ = 'campaigns'
    
    merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('merchants.id'))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    campaign_type: Mapped[str] = mapped_column(String(50)) # cashback/discount/bogo
    discount_value: Mapped[float] = mapped_column(Float)
    discount_type: Mapped[str] = mapped_column(String(20))
    minimum_bill: Mapped[float] = mapped_column(Float, default=0.0)
    maximum_discount: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
