import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from sqlalchemy.dialects.postgresql import UUID

class CategoryRelationship(Base):
    __tablename__ = 'category_relationships'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_category: Mapped[str] = mapped_column(String(100))
    related_category: Mapped[str] = mapped_column(String(100))
    relationship_type: Mapped[str] = mapped_column(String(50), default='complementary')
    strength: Mapped[float] = mapped_column(Float, default=0.8)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('source_category', 'related_category'),
    )
