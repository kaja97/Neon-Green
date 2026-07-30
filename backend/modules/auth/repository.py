from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import Optional
from models.account import Account, FarmerProfile
from core.base_repository import BaseRepository
from pydantic import BaseModel, EmailStr
from modules.auth.schemas import AccountUpdate

class AccountCreate(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str
    role: str = "farmer"
    is_verified: bool = False
    is_active: bool = True

class AccountRepository(BaseRepository[Account, AccountCreate, AccountUpdate]):
    def __init__(self):
        super().__init__(Account)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[Account]:
        result = await db.execute(select(self.model).where(self.model.email == email))
        return result.scalars().first()

    async def get_by_phone(self, db: AsyncSession, phone: str) -> Optional[Account]:
        result = await db.execute(select(self.model).where(self.model.phone == phone))
        return result.scalars().first()

    async def get_by_email_or_phone(self, db: AsyncSession, email_or_phone: str) -> Optional[Account]:
        result = await db.execute(
            select(self.model).where(
                or_(
                    self.model.email == email_or_phone,
                    self.model.phone == email_or_phone
                )
            )
        )
        return result.scalars().first()

class FarmerProfileCreate(BaseModel):
    account_id: str
    full_name: str
    farming_method: str
    primary_language: str
    experience_years: int = 0

class FarmerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    farming_method: Optional[str] = None
    primary_language: Optional[str] = None
    experience_years: Optional[int] = None

class FarmerProfileRepository(BaseRepository[FarmerProfile, FarmerProfileCreate, FarmerProfileUpdate]):
    def __init__(self):
        super().__init__(FarmerProfile)
