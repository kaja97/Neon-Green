"""Auth module schemas — OTP-based registration, login, password management, email/phone change."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from core.enums import FarmingMethod
import uuid


# ── Registration (OTP Flow) ─────────────────────────────

class LocationData(BaseModel):
    """Optional location data included during registration."""
    label: str = Field(..., max_length=255)
    district: str = Field(..., max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class RegisterOTPRequest(BaseModel):
    """Step 1: Request OTP to verify email before account creation."""
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20, pattern=r"^\+?[0-9]\d{6,14}$")


class RegisterVerifyRequest(BaseModel):
    """Step 2: Verify OTP and complete registration."""
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    password: str = Field(..., min_length=8, max_length=72)
    full_name: str = Field(..., min_length=2, max_length=255)
    farming_method: FarmingMethod
    primary_language: str = Field(default="en", max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[LocationData] = None


# ── Login ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email_or_phone: str
    password: str = Field(..., max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes in seconds
    role: Optional[str] = None
    refresh_token: Optional[str] = None


# ── Password Management ─────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=72)


class ForgotPasswordOTPRequest(BaseModel):
    """Request OTP for password reset."""
    email_or_phone: str


class ForgotPasswordVerifyRequest(BaseModel):
    """Verify OTP and set new password."""
    email_or_phone: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=72)


# ── Email/Phone Change (OTP) ────────────────────────────

class ChangeEmailRequest(BaseModel):
    new_email: EmailStr


class ChangeEmailVerifyRequest(BaseModel):
    new_email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)


class ChangePhoneRequest(BaseModel):
    new_phone: str = Field(..., max_length=20, pattern=r"^\+?[0-9]\d{6,14}$")


class ChangePhoneVerifyRequest(BaseModel):
    new_phone: str = Field(..., max_length=20)
    otp_code: str = Field(..., min_length=6, max_length=6)


# ── Account Update (Admin/Legacy) ───────────────────────

class AccountUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


# ── Response Models ──────────────────────────────────────

class FarmerProfileShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    full_name: str
    farming_method: str
    primary_language: str
    experience_years: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_verified: bool = False
    farmer_profile: Optional[FarmerProfileShort] = None


class RegisterResponse(BaseModel):
    account_id: uuid.UUID
    farmer_profile_id: uuid.UUID
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 900
    refresh_token: Optional[str] = None


class OTPSentResponse(BaseModel):
    message: str
    otp_sent_to: str
    expires_in_seconds: int = 300
