from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_current_user
from models.account import Account
from .schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from . import service
import jwt
from jwt.exceptions import InvalidTokenError
from core.security import create_access_token, create_refresh_token
from core.redis import get_redis_client
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    tokens = await service.register_user(db, user_data)
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=False, # Set to True in production
        samesite="lax",
        max_age=30 * 24 * 60 * 60 # 30 days
    )
    return tokens

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    tokens = await service.login_user(db, login_data)
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=False, # Set to True in production
        samesite="lax",
        max_age=30 * 24 * 60 * 60 # 30 days
    )
    return tokens

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    redis_client = await get_redis_client()
    stored_token = await redis_client.get(f"refresh_token:{user_id}")
    if stored_token != refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token expired or invalid")

    new_access_token = create_access_token({"sub": user_id})
    new_refresh_token = create_refresh_token({"sub": user_id})

    await redis_client.setex(
        f"refresh_token:{user_id}",
        settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
        new_refresh_token
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60
    )

    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Account = Depends(get_current_user)):
    return current_user
