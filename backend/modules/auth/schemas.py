from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid

class LocationData(BaseModel):
    label: str
    district: str
    latitude: float
    longitude: float

class RegisterRequest(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=8, max_length=72)
    
    full_name: str
    farming_method: str = Field(..., description="organic, conventional, or integrated")
    primary_language: str = Field(..., description="English, Sinhala, or Tamil")
    
    location: Optional[LocationData] = None

class AccountUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8, max_length=72)

class LoginRequest(BaseModel):
    email_or_phone: str
    password: str = Field(..., max_length=72)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    # refresh_token is set via httpOnly cookie, so we might not need to return it here,
    # but we can for non-browser clients.
    refresh_token: Optional[str] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
