from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.redis import init_redis, close_redis
from app.core.database import engine
from app.api import auth, users, merchants, payments, coupons, recommendations, admin, campaigns

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    yield
    await close_redis()
    await engine.dispose()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(merchants.router)
app.include_router(payments.router)
app.include_router(coupons.router)
app.include_router(recommendations.router)
app.include_router(admin.router)
app.include_router(campaigns.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
