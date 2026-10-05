from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost/paytm"
    GEMINI_API_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"
    PROJECT_NAME: str = "Merchant Cashback MVP"

    @computed_field
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Ensure the URL uses asyncpg driver and strip incompatible query args."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        # asyncpg does not accept ?sslmode=... in the connection string
        if "?" in url:
            url = url.split("?")[0]
            
        return url

    @computed_field
    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Get sync URL for create_tables and seed scripts."""
        url = self.DATABASE_URL
        # Remove asyncpg driver for sync usage
        url = url.replace("+asyncpg", "")
        # Normalize to postgresql+psycopg2://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        elif not url.startswith("postgresql+psycopg2://"):
            url = "postgresql+psycopg2://" + url.split("://", 1)[-1]
        return url

settings = Settings()
