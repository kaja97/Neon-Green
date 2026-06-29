from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid

class RegisterRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str

class LoginRequest(BaseModel):
    email_or_phone: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: uuid.UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
