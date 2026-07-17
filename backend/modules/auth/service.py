"""
Auth service — all business logic for registration (OTP), login,
password management, email/phone change, and account operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from datetime import datetime, timezone

from models.account import Account, FarmerProfile
from core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from core.redis import get_redis_client
from core.otp import generate_otp, verify_otp
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.rate_limiter import check_rate_limit
from config import settings

from .schemas import (
    RegisterOTPRequest,
    RegisterVerifyRequest,
    LoginRequest,
    TokenResponse,
    RegisterResponse,
    ChangePasswordRequest,
    ForgotPasswordOTPRequest,
    ForgotPasswordVerifyRequest,
    ChangeEmailRequest,
    ChangeEmailVerifyRequest,
    ChangePhoneRequest,
    ChangePhoneVerifyRequest,
    AccountUpdate,
)


# ── Token Helpers ────────────────────────────────────────

async def _store_refresh_token(user_id: str, token: str) -> None:
    """Store refresh token in Redis with TTL."""
    redis = await get_redis_client()
    if redis:
        await redis.setex(
            f"refresh_token:{user_id}",
            settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
            token,
        )


async def _invalidate_refresh_tokens(user_id: str) -> None:
    """Delete all refresh tokens for a user (logout all sessions)."""
    redis = await get_redis_client()
    if redis:
        await redis.delete(f"refresh_token:{user_id}")


def _generate_tokens(account_id: str, role: str) -> tuple[str, str]:
    """Generate access + refresh token pair with role claim."""
    payload = {"sub": str(account_id), "role": role}
    access = create_access_token(payload)
    refresh = create_refresh_token(payload)
    return access, refresh


# ── 1. Registration OTP Flow ────────────────────────────

async def request_register_otp(
    db: AsyncSession, data: RegisterOTPRequest
) -> dict:
    """
    Step 1: Check email/phone uniqueness, generate OTP, dispatch email.
    Does NOT create the account yet.
    """
    # Check email uniqueness
    result = await db.execute(
        select(Account).where(Account.email == data.email)
    )
    if result.scalars().first():
        raise AppException(ErrorCode.AUTH_REGISTER_EMAIL_EXISTS)

    # Check phone uniqueness (if provided)
    if data.phone:
        result = await db.execute(
            select(Account).where(Account.phone == data.phone)
        )
        if result.scalars().first():
            raise AppException(ErrorCode.AUTH_REGISTER_PHONE_EXISTS)

    # Generate OTP
    code = await generate_otp(
        purpose="register",
        identifier=data.email,
        context={"phone": data.phone},
    )

    # Dispatch email via Celery
    try:
        from tasks.otp_tasks import send_otp_email_task
        send_otp_email_task.delay(data.email, code, "register")
    except Exception as exc:
        # If Celery is not running, log but don't fail (dev mode)
        import logging
        logging.getLogger("agrifarm.auth").warning(
            "Celery not available (or eager execution failed). Error: %s. OTP code for %s: %s", exc, data.email, code
        )

    return {
        "message": f"Verification code sent to {data.email}",
        "otp_sent_to": data.email,
        "expires_in_seconds": 300,
    }


async def verify_register_otp(
    db: AsyncSession, data: RegisterVerifyRequest
) -> RegisterResponse:
    """
    Step 2: Verify OTP, then create Account + FarmerProfile atomically.
    """
    # Verify OTP
    context = await verify_otp("register", data.email, data.otp_code)

    # Re-check email uniqueness (race condition guard)
    result = await db.execute(
        select(Account).where(Account.email == data.email)
    )
    if result.scalars().first():
        raise AppException(ErrorCode.AUTH_REGISTER_EMAIL_EXISTS)

    # Create account
    hashed_pwd = get_password_hash(data.password)
    new_account = Account(
        email=data.email,
        phone=data.phone,
        password_hash=hashed_pwd,
        role="farmer",
        is_verified=True,  # Verified via OTP
    )
    db.add(new_account)
    await db.flush()

    # Create farmer profile
    new_profile = FarmerProfile(
        account_id=new_account.id,
        full_name=data.full_name,
        farming_method=data.farming_method.value,
        primary_language=data.primary_language,
    )
    db.add(new_profile)
    await db.flush()  # Populate new_profile.id before using it in FarmerLocation

    # Create location if provided
    if data.location:
        from models.farmer import FarmerLocation
        from geoalchemy2.elements import WKTElement
        new_location = FarmerLocation(
            farmer_id=new_profile.id,
            name=data.location.label,
            district=data.location.district,
            centroid=WKTElement(
                f"POINT({data.location.longitude} {data.location.latitude})",
                srid=4326,
            ),
            is_primary=True,
        )
        db.add(new_location)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        import logging
        logging.getLogger("agrifarm.auth").error("Registration IntegrityError: %s", e.orig)
        raise AppException(ErrorCode.AUTH_REGISTER_EMAIL_EXISTS)

    # Generate tokens
    access, refresh = _generate_tokens(str(new_account.id), new_account.role)
    await _store_refresh_token(str(new_account.id), refresh)

    # Send welcome email (non-blocking)
    try:
        from tasks.otp_tasks import send_welcome_email_task
        send_welcome_email_task.delay(data.email, data.full_name)
    except Exception:
        pass

    return RegisterResponse(
        account_id=new_account.id,
        farmer_profile_id=new_profile.id,
        access_token=access,
        refresh_token=refresh,
    )


# ── 2. Login ────────────────────────────────────────────

async def login_user(
    db: AsyncSession, data: LoginRequest, client_ip: str = ""
) -> TokenResponse:
    """Authenticate user via email/phone + password."""
    # Rate limit by IP
    if client_ip:
        await check_rate_limit(
            key=f"ratelimit:auth:{client_ip}",
            max_requests=5,
            window_seconds=60,
            error_code=ErrorCode.RATE_LIMITED,
        )

    query = select(Account).where(
        or_(
            Account.email == data.email_or_phone,
            Account.phone == data.email_or_phone,
        )
    )
    result = await db.execute(query)
    account = result.scalars().first()

    # Generic error — no user enumeration
    if not account or not verify_password(data.password, account.password_hash):
        raise AppException(ErrorCode.AUTH_LOGIN_INVALID_CREDENTIALS)

    if not account.is_active:
        raise AppException(ErrorCode.AUTH_LOGIN_ACCOUNT_DEACTIVATED)

    # Update last login
    account.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    # Generate tokens with role
    access, refresh = _generate_tokens(str(account.id), account.role)
    await _store_refresh_token(str(account.id), refresh)

    return TokenResponse(
        access_token=access,
        role=account.role,
        refresh_token=refresh,
    )


# ── 3. Refresh Token ────────────────────────────────────

async def refresh_tokens(refresh_token: str) -> TokenResponse:
    """Validate refresh token, rotate both tokens."""
    import jwt as pyjwt
    from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

    try:
        payload = pyjwt.decode(
            refresh_token, settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        role = payload.get("role", "farmer")
        if not user_id:
            raise AppException(ErrorCode.AUTH_REFRESH_TOKEN_INVALID)
    except ExpiredSignatureError:
        raise AppException(ErrorCode.AUTH_REFRESH_TOKEN_INVALID)
    except InvalidTokenError:
        raise AppException(ErrorCode.AUTH_REFRESH_TOKEN_INVALID)

    # Verify against stored token in Redis
    redis = await get_redis_client()
    if redis:
        stored = await redis.get(f"refresh_token:{user_id}")
        if stored != refresh_token:
            raise AppException(ErrorCode.AUTH_REFRESH_TOKEN_INVALID)

    # Rotate tokens
    new_access, new_refresh = _generate_tokens(user_id, role)
    await _store_refresh_token(user_id, new_refresh)

    return TokenResponse(access_token=new_access, role=role, refresh_token=new_refresh)


# ── 4. Logout ────────────────────────────────────────────

async def logout_user(user_id: str) -> None:
    """Delete refresh token from Redis."""
    await _invalidate_refresh_tokens(user_id)


# ── 5. Change Password ──────────────────────────────────

async def change_password(
    db: AsyncSession, user: Account, data: ChangePasswordRequest
) -> TokenResponse:
    """Verify current password, set new, invalidate all sessions."""
    if not verify_password(data.current_password, user.password_hash):
        raise AppException(ErrorCode.AUTH_PASSWORD_WRONG_CURRENT)

    if verify_password(data.new_password, user.password_hash):
        raise AppException(ErrorCode.AUTH_PASSWORD_SAME_AS_CURRENT)

    user.password_hash = get_password_hash(data.new_password)
    await db.commit()

    # Invalidate all sessions, generate fresh tokens
    await _invalidate_refresh_tokens(str(user.id))
    access, refresh = _generate_tokens(str(user.id), user.role)
    await _store_refresh_token(str(user.id), refresh)

    return TokenResponse(access_token=access, role=user.role, refresh_token=refresh)


# ── 6. Forgot Password (OTP) ────────────────────────────

async def request_forgot_password_otp(
    db: AsyncSession, data: ForgotPasswordOTPRequest
) -> dict:
    """Send OTP for password reset. Returns 200 regardless (no user enumeration)."""
    query = select(Account).where(
        or_(
            Account.email == data.email_or_phone,
            Account.phone == data.email_or_phone,
        )
    )
    result = await db.execute(query)
    account = result.scalars().first()

    if account and account.email:
        try:
            code = await generate_otp(
                purpose="forgot_password",
                identifier=account.email,
                context={"user_id": str(account.id)},
            )
            from tasks.otp_tasks import send_otp_email_task
            send_otp_email_task.delay(account.email, code, "forgot_password")
        except Exception:
            import logging
            logging.getLogger("agrifarm.auth").warning(
                "Failed to send forgot-password OTP for %s", data.email_or_phone
            )

    # Always return 200 to prevent user enumeration
    return {
        "message": "If an account exists, a verification code has been sent.",
        "expires_in_seconds": 300,
    }


async def verify_forgot_password_otp(
    db: AsyncSession, data: ForgotPasswordVerifyRequest
) -> TokenResponse:
    """Verify OTP and reset password. Auto-login after reset."""
    # Find account
    query = select(Account).where(
        or_(
            Account.email == data.email_or_phone,
            Account.phone == data.email_or_phone,
        )
    )
    result = await db.execute(query)
    account = result.scalars().first()

    if not account:
        raise AppException(ErrorCode.AUTH_ACCOUNT_NOT_FOUND)

    # Verify OTP
    await verify_otp("forgot_password", account.email, data.otp_code)

    # Reset password
    account.password_hash = get_password_hash(data.new_password)
    await db.commit()

    # Invalidate all sessions
    await _invalidate_refresh_tokens(str(account.id))

    # Generate fresh tokens (auto-login)
    access, refresh = _generate_tokens(str(account.id), account.role)
    await _store_refresh_token(str(account.id), refresh)

    # Send notification email
    try:
        from tasks.otp_tasks import send_password_reset_email_task
        if account.farmer_profile:
            send_password_reset_email_task.delay(account.email, account.farmer_profile.full_name)
        else:
            send_password_reset_email_task.delay(account.email, "User")
    except Exception:
        pass

    return TokenResponse(access_token=access, role=account.role, refresh_token=refresh)


# ── 7. Change Email (OTP) ───────────────────────────────

async def request_change_email_otp(
    db: AsyncSession, user: Account, data: ChangeEmailRequest
) -> dict:
    """Send OTP to new email address for verification."""
    # Check new email not already in use
    result = await db.execute(
        select(Account).where(Account.email == data.new_email).where(Account.id != user.id)
    )
    if result.scalars().first():
        raise AppException(ErrorCode.AUTH_EMAIL_ALREADY_IN_USE)

    code = await generate_otp(
        purpose="change_email",
        identifier=data.new_email,
        context={"user_id": str(user.id), "old_email": user.email},
    )

    try:
        from tasks.otp_tasks import send_otp_email_task
        send_otp_email_task.delay(data.new_email, code, "change_email")
    except Exception:
        import logging
        logging.getLogger("agrifarm.auth").warning(
            "Celery not available. OTP for %s: %s", data.new_email, code
        )

    return {
        "message": f"Verification code sent to {data.new_email}",
        "otp_sent_to": data.new_email,
        "expires_in_seconds": 300,
    }


async def verify_change_email_otp(
    db: AsyncSession, user: Account, data: ChangeEmailVerifyRequest
) -> dict:
    """Verify OTP and update email."""
    context = await verify_otp("change_email", data.new_email, data.otp_code)

    # Validate context matches current user
    if context.get("user_id") != str(user.id):
        raise AppException(ErrorCode.AUTH_TOKEN_INVALID)

    # Re-check uniqueness
    result = await db.execute(
        select(Account).where(Account.email == data.new_email).where(Account.id != user.id)
    )
    if result.scalars().first():
        raise AppException(ErrorCode.AUTH_EMAIL_ALREADY_IN_USE)

    user.email = data.new_email
    await db.commit()

    return {"message": "Email updated successfully.", "email": data.new_email}


# ── 8. Change Phone (OTP) ───────────────────────────────

async def request_change_phone_otp(
    db: AsyncSession, user: Account, data: ChangePhoneRequest
) -> dict:
    """Send OTP for phone change verification."""
    # Check new phone not already in use
    result = await db.execute(
        select(Account).where(Account.phone == data.new_phone).where(Account.id != user.id)
    )
    if result.scalars().first():
        raise AppException(ErrorCode.AUTH_PHONE_ALREADY_IN_USE)

    code = await generate_otp(
        purpose="change_phone",
        identifier=data.new_phone,
        context={"user_id": str(user.id), "old_phone": user.phone},
    )

    # For phone change, we send OTP to new phone via email (SMS not implemented yet)
    # In production, this would be SMS via Twilio
    if user.email:
        try:
            from tasks.otp_tasks import send_otp_email_task
            send_otp_email_task.delay(user.email, code, "change_phone")
        except Exception:
            import logging
            logging.getLogger("agrifarm.auth").warning(
                "Celery not available. Phone change OTP: %s", code
            )

    return {
        "message": "Verification code sent to your email.",
        "otp_sent_to": user.email or data.new_phone,
        "expires_in_seconds": 300,
    }


async def verify_change_phone_otp(
    db: AsyncSession, user: Account, data: ChangePhoneVerifyRequest
) -> dict:
    """Verify OTP and update phone number."""
    context = await verify_otp("change_phone", data.new_phone, data.otp_code)

    if context.get("user_id") != str(user.id):
        raise AppException(ErrorCode.AUTH_TOKEN_INVALID)

    # Re-check uniqueness
    result = await db.execute(
        select(Account).where(Account.phone == data.new_phone).where(Account.id != user.id)
    )
    if result.scalars().first():
        raise AppException(ErrorCode.AUTH_PHONE_ALREADY_IN_USE)

    user.phone = data.new_phone
    await db.commit()

    return {"message": "Phone number updated successfully.", "phone": data.new_phone}


# ── 9. Soft-Delete Account ──────────────────────────────

async def delete_account(db: AsyncSession, user: Account) -> None:
    """Soft-delete: set is_active=False, invalidate sessions."""
    user.is_active = False
    await db.commit()
    await _invalidate_refresh_tokens(str(user.id))


# ── 10. Get Current User Info ────────────────────────────

async def get_me(user: Account) -> dict:
    """Return current user info with farmer profile."""
    from sqlalchemy.orm import selectinload
    data = {
        "id": str(user.id),
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_verified": user.is_verified,
    }
    if user.farmer_profile:
        data["farmer_profile"] = {
            "id": str(user.farmer_profile.id),
            "full_name": user.farmer_profile.full_name,
            "farming_method": user.farmer_profile.farming_method,
            "primary_language": user.farmer_profile.primary_language,
            "experience_years": user.farmer_profile.experience_years,
        }
    else:
        data["farmer_profile"] = None
    return data
