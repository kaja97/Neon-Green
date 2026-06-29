# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_current_user
from models.account import Account
from .schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from . import service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await service.register_user(db, user_data)

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await service.login_user(db, login_data)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Account = Depends(get_current_user)):
    return current_user
