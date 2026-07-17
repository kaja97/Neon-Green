"""
Auth router — 15 endpoints covering OTP registration, login, token management,
password operations, email/phone change, and account lifecycle.
"""
from fastapi import APIRouter, Depends, Response, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_current_user
from models.account import Account
from core.response import success_response, created_response, message_response
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from . import service
from .schemas import (
    RegisterOTPRequest,
    RegisterVerifyRequest,
    LoginRequest,
    ChangePasswordRequest,
    ForgotPasswordOTPRequest,
    ForgotPasswordVerifyRequest,
    ChangeEmailRequest,
    ChangeEmailVerifyRequest,
    ChangePhoneRequest,
    ChangePhoneVerifyRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_MAX_AGE = 30 * 24 * 60 * 60  # 30 days


def _set_refresh_cookie(response: Response, token: str) -> None:
    """Set httpOnly refresh token cookie."""
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=False,  # TODO: True in production
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Clear refresh token cookie."""
    response.delete_cookie(key="refresh_token", httponly=True, samesite="lax")


# ─── 1.1 Register: Request OTP ──────────────────────────

@router.post("/register/request-otp", status_code=200)
async def register_request_otp(
    data: RegisterOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to email for registration verification."""
    result = await service.request_register_otp(db, data)
    return success_response(result)


# ─── 1.2 Register: Verify OTP & Create Account ──────────

@router.post("/register/verify", status_code=201)
async def register_verify(
    data: RegisterVerifyRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and create account + farmer profile atomically."""
    result = await service.verify_register_otp(db, data)
    if result.refresh_token:
        _set_refresh_cookie(response, result.refresh_token)
    return created_response(result.model_dump(exclude={"refresh_token"}))


# ─── 1.3 Login ──────────────────────────────────────────

@router.post("/login", status_code=200)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with email/phone + password. Returns JWT tokens."""
    client_ip = request.client.host if request.client else ""
    tokens = await service.login_user(db, data, client_ip)
    if tokens.refresh_token:
        _set_refresh_cookie(response, tokens.refresh_token)
    return success_response(tokens.model_dump(exclude={"refresh_token"}))


# ─── 1.4 Refresh Token ──────────────────────────────────

@router.post("/refresh", status_code=200)
async def refresh(request: Request, response: Response):
    """Rotate access + refresh tokens using httpOnly cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise AppException(ErrorCode.AUTH_REFRESH_TOKEN_MISSING)

    tokens = await service.refresh_tokens(refresh_token)
    if tokens.refresh_token:
        _set_refresh_cookie(response, tokens.refresh_token)
    return success_response(tokens.model_dump(exclude={"refresh_token"}))


# ─── 1.5 Logout ─────────────────────────────────────────

@router.post("/logout", status_code=200)
async def logout(
    response: Response,
    current_user: Account = Depends(get_current_user),
):
    """Invalidate refresh token and clear cookie."""
    await service.logout_user(str(current_user.id))
    _clear_refresh_cookie(response)
    return message_response("Logged out successfully.")


# ─── 1.6 Get Current User ───────────────────────────────

@router.get("/me", status_code=200)
async def get_me(current_user: Account = Depends(get_current_user)):
    """Return current authenticated user with profile."""
    data = await service.get_me(current_user)
    return success_response(data)


# ─── 1.7 Change Password ────────────────────────────────

@router.patch("/change-password", status_code=200)
async def change_password(
    data: ChangePasswordRequest,
    response: Response,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change password. Requires current password. Invalidates all sessions."""
    tokens = await service.change_password(db, current_user, data)
    if tokens.refresh_token:
        _set_refresh_cookie(response, tokens.refresh_token)
    return success_response({
        "message": "Password changed successfully.",
        "access_token": tokens.access_token,
        "token_type": tokens.token_type,
    })


# ─── 1.8 Forgot Password: Request OTP ───────────────────

@router.post("/forgot-password/request-otp", status_code=200)
async def forgot_password_request_otp(
    data: ForgotPasswordOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send password reset OTP. Returns 200 regardless (no user enumeration)."""
    result = await service.request_forgot_password_otp(db, data)
    return success_response(result)


# ─── 1.9 Forgot Password: Verify OTP & Reset ────────────

@router.post("/forgot-password/verify", status_code=200)
async def forgot_password_verify(
    data: ForgotPasswordVerifyRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and set new password. Returns fresh tokens (auto-login)."""
    tokens = await service.verify_forgot_password_otp(db, data)
    if tokens.refresh_token:
        _set_refresh_cookie(response, tokens.refresh_token)
    return success_response({
        "message": "Password reset successfully.",
        "access_token": tokens.access_token,
        "token_type": tokens.token_type,
    })


# ─── 1.10 Change Email: Request OTP ─────────────────────

@router.post("/change-email/request-otp", status_code=200)
async def change_email_request_otp(
    data: ChangeEmailRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to new email address for verification."""
    result = await service.request_change_email_otp(db, current_user, data)
    return success_response(result)


# ─── 1.11 Change Email: Verify OTP ──────────────────────

@router.post("/change-email/verify", status_code=200)
async def change_email_verify(
    data: ChangeEmailVerifyRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and update email address."""
    result = await service.verify_change_email_otp(db, current_user, data)
    return success_response(result)


# ─── 1.12 Change Phone: Request OTP ─────────────────────

@router.post("/change-phone/request-otp", status_code=200)
async def change_phone_request_otp(
    data: ChangePhoneRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send OTP for phone number change."""
    result = await service.request_change_phone_otp(db, current_user, data)
    return success_response(result)


# ─── 1.13 Change Phone: Verify OTP ──────────────────────

@router.post("/change-phone/verify", status_code=200)
async def change_phone_verify(
    data: ChangePhoneVerifyRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and update phone number."""
    result = await service.verify_change_phone_otp(db, current_user, data)
    return success_response(result)


# ─── 1.14 Soft-Delete Account ───────────────────────────

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    response: Response,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete account (set is_active=False). Never hard-deletes."""
    await service.delete_account(db, current_user)
    _clear_refresh_cookie(response)
    return None


# ─── 1.15 Swagger Docs Login (Hidden) ───────────────────

@router.post("/docs-login", include_in_schema=False)
async def docs_login(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """OAuth2 form login for Swagger UI. Hidden from API docs."""
    data = LoginRequest(email_or_phone=form_data.username, password=form_data.password)
    client_ip = request.client.host if request.client else ""
    tokens = await service.login_user(db, data, client_ip)
    if tokens.refresh_token:
        _set_refresh_cookie(response, tokens.refresh_token)
    return {"access_token": tokens.access_token, "token_type": "bearer"}
