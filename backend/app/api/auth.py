from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.api.deps import get_db
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    role: str = "customer"

@router.post("/login", response_model=UserRead)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == req.email, User.role == req.role)
    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users", response_model=list[UserRead])
async def get_demo_users(db: AsyncSession = Depends(get_db)):
    query_customers = select(User).where(User.role == 'customer').limit(8)
    query_others = select(User).where(User.role.in_(['merchant', 'admin']))
    
    customers = await db.execute(query_customers)
    others = await db.execute(query_others)
    
    all_users = list(others.scalars().all()) + list(customers.scalars().all())
    return all_users

@router.get("/merchants", response_model=list[UserRead])
async def get_demo_merchants(db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.role == 'merchant').limit(20)
    result = await db.execute(query)
    return list(result.scalars().all())
