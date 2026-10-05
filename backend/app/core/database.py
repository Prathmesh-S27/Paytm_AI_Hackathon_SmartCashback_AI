from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

db_url = settings.ASYNC_DATABASE_URL

# Handle Neon pooler: disable prepared statement cache
connect_args = {}
if "-pooler" in db_url:
    connect_args = {
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0,
    }

# Add SSL for Neon (cloud Postgres)
if "neon.tech" in db_url or "neon" in db_url:
    connect_args["ssl"] = "require"

engine = create_async_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
