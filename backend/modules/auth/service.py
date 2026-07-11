from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from models.account import Account, FarmerProfile
from .schemas import RegisterRequest, LoginRequest, TokenResponse
from core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from core.redis import get_redis_client
from config import settings

async def _store_refresh_token(user_id: str, token: str):
    """Store refresh token in Redis if available, otherwise skip."""
    redis_client = await get_redis_client()
    if redis_client:
        await redis_client.setex(
            f"refresh_token:{user_id}",
            settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
            token
        )

async def register_user(db: AsyncSession, user_data: RegisterRequest) -> TokenResponse:
    if not user_data.email and not user_data.phone:
        raise HTTPException(status_code=400, detail="Must provide either email or phone")

    conditions = []
    if user_data.email:
        conditions.append(Account.email == user_data.email)
    if user_data.phone:
        conditions.append(Account.phone == user_data.phone)

    query = select(Account).where(or_(*conditions))
    result = await db.execute(query)
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=409, detail="User with this email or phone already exists")

    hashed_pwd = get_password_hash(user_data.password)
    new_account = Account(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_pwd,
        role="farmer"
    )
    db.add(new_account)
    await db.flush()

    new_profile = FarmerProfile(
        account_id=new_account.id,
        full_name=user_data.full_name,
        farming_method=user_data.farming_method,
        primary_language=user_data.primary_language
    )
    db.add(new_profile)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Database error during registration")

    access_token = create_access_token({"sub": str(new_account.id)})
    refresh_token = create_refresh_token({"sub": str(new_account.id)})

    await _store_refresh_token(str(new_account.id), refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

async def login_user(db: AsyncSession, login_data: LoginRequest) -> TokenResponse:
    query = select(Account).where(
        or_(
            Account.email == login_data.email_or_phone,
            Account.phone == login_data.email_or_phone
        )
    )
    result = await db.execute(query)
    account = result.scalars().first()

    if not account or not verify_password(login_data.password, account.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token({"sub": str(account.id)})
    refresh_token = create_refresh_token({"sub": str(account.id)})
    
    await _store_refresh_token(str(account.id), refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
