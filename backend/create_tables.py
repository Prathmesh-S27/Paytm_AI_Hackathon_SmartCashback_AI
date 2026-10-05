from sqlalchemy import create_engine
from app.models.base import Base
from app.models import *
from app.core.config import settings

def run_create_tables():
    db_url = settings.SYNC_DATABASE_URL
    engine = create_engine(db_url, echo=True)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    engine.dispose()

if __name__ == "__main__":
    run_create_tables()
