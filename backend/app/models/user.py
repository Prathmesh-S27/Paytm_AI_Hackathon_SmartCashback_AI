from sqlalchemy import String, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin

class User(TimestampMixin, Base):
    __tablename__ = 'users'

    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default='customer')
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
