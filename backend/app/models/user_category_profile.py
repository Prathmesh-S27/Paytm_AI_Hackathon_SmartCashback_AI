import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class UserCategoryProfile(TimestampMixin, Base):
    __tablename__ = 'user_category_profiles'
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    transaction_count: Mapped[int] = mapped_column(Integer, default=0)
    total_spend: Mapped[float] = mapped_column(Float, default=0.0)
    average_spend: Mapped[float] = mapped_column(Float, default=0.0)
    median_spend: Mapped[float] = mapped_column(Float, default=0.0)
    min_spend: Mapped[float] = mapped_column(Float, default=0.0)
    max_spend: Mapped[float] = mapped_column(Float, default=0.0)
    last_transaction_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'category'),
    )
