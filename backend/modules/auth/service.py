from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from models.account import Account, FarmerProfile
from .schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from .utils import hash_password, verify_password, create_access_token, create_refresh_token
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_

async def register_user(db: AsyncSession, user_data: RegisterRequest) -> TokenResponse:
    if not user_data.email and not user_data.phone:
        raise HTTPException(status_code=400, detail="Must provide either email or phone")

    # Check if user exists
    query = select(Account).where(
        or_(
            (Account.email == user_data.email) & (Account.email != None),
            (Account.phone == user_data.phone) & (Account.phone != None)
        )
    )
    result = await db.execute(query)
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=409, detail="User with this email or phone already exists")

    # Create account
    hashed_pwd = hash_password(user_data.password)
    new_account = Account(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_pwd,
        role="farmer"
    )
    db.add(new_account)
    await db.flush() # flush to get new_account.id

    # Create FarmerProfile
    new_profile = FarmerProfile(
        account_id=new_account.id,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )
    db.add(new_profile)
    
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Database error during registration")

    # Generate tokens
    access_token = create_access_token({"sub": str(new_account.id)})
    refresh_token = create_refresh_token({"sub": str(new_account.id)})

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
    
    # In a real app, store refresh token in Redis
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
