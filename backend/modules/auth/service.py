"""
Auth service — all business logic for registration (OTP), login,
password management, email/phone change, and account operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
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
from core.base_service import BaseService
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
)

from .repository import AccountRepository, FarmerProfileRepository, AccountCreate, FarmerProfileCreate

class AuthService(BaseService):
    def __init__(self, account_repo: AccountRepository, profile_repo: FarmerProfileRepository):
        super().__init__()
        self.account_repo = account_repo
        self.profile_repo = profile_repo

    # ── Token Helpers ────────────────────────────────────────

    async def _store_refresh_token(self, user_id: str, token: str) -> None:
        """Store refresh token in Redis with TTL."""
        redis = await get_redis_client()
        if redis:
            await redis.setex(
                f"refresh_token:{user_id}",
                settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
                token,
            )

    async def _invalidate_refresh_tokens(self, user_id: str) -> None:
        """Delete all refresh tokens for a user (logout all sessions)."""
        redis = await get_redis_client()
        if redis:
            await redis.delete(f"refresh_token:{user_id}")

    def _generate_tokens(self, account_id: str, role: str) -> tuple[str, str]:
        """Generate access + refresh token pair with role claim."""
        payload = {"sub": str(account_id), "role": role}
        access = create_access_token(payload)
        refresh = create_refresh_token(payload)
        return access, refresh

    # ── 1. Registration OTP Flow ────────────────────────────

    async def request_register_otp(self, db: AsyncSession, data: RegisterOTPRequest) -> dict:
        if await self.account_repo.get_by_email(db, data.email):
            raise AppException(ErrorCode.AUTH_REGISTER_EMAIL_EXISTS)

        if data.phone and await self.account_repo.get_by_phone(db, data.phone):
            raise AppException(ErrorCode.AUTH_REGISTER_PHONE_EXISTS)

        code = await generate_otp(
            purpose="register",
            identifier=data.email,
            context={"phone": data.phone},
        )

        try:
            from tasks.otp_tasks import send_otp_email_task
            send_otp_email_task.delay(data.email, code, "register")
        except Exception as exc:
            self.logger.warning("Celery not available (or eager execution failed). Error: %s. OTP code for %s: %s", exc, data.email, code)

        return {
            "message": f"Verification code sent to {data.email}",
            "otp_sent_to": data.email,
            "expires_in_seconds": 300,
        }

    async def verify_register_otp(self, db: AsyncSession, data: RegisterVerifyRequest) -> RegisterResponse:
        await verify_otp("register", data.email, data.otp_code)

        if await self.account_repo.get_by_email(db, data.email):
            raise AppException(ErrorCode.AUTH_REGISTER_EMAIL_EXISTS)

        hashed_pwd = get_password_hash(data.password)
        account_in = AccountCreate(
            email=data.email,
            phone=data.phone,
            password_hash=hashed_pwd,
            role=data.role,
            is_verified=True,
        )
        
        profile_id = None
        try:
            new_account = await self.account_repo.create(db, obj_in=account_in)
            
            if data.role == "farmer":
                profile_in = FarmerProfileCreate(
                    account_id=str(new_account.id),
                    full_name=data.full_name,
                    farming_method=data.farming_method.value if data.farming_method else "integrated",
                    primary_language=data.primary_language,
                    experience_years=0
                )
                new_profile = await self.profile_repo.create(db, obj_in=profile_in)
                profile_id = new_profile.id
    
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
            
            elif data.role == "vendor":
                from models.account import VendorProfile
                vendor_profile = VendorProfile(
                    account_id=new_account.id,
                    business_name=data.business_name or data.full_name,
                    tax_id=data.tax_id,
                    warehouse_location=data.warehouse_location,
                )
                db.add(vendor_profile)
                await db.flush()
                profile_id = vendor_profile.id
                
            elif data.role == "buyer":
                from models.account import BuyerProfile
                buyer_profile = BuyerProfile(
                    account_id=new_account.id,
                    full_name=data.full_name,
                    buyer_type=data.buyer_type or "Individual",
                    delivery_address=data.delivery_address,
                )
                db.add(buyer_profile)
                await db.flush()
                profile_id = buyer_profile.id
                
            await db.commit()
        except IntegrityError as e:
            await db.rollback()
            self.logger.error("Registration IntegrityError: %s", e.orig)
            raise AppException(ErrorCode.AUTH_REGISTER_EMAIL_EXISTS)

        access, refresh = self._generate_tokens(str(new_account.id), new_account.role)
        await self._store_refresh_token(str(new_account.id), refresh)

        try:
            from tasks.otp_tasks import send_welcome_email_task
            send_welcome_email_task.delay(data.email, data.full_name)
        except Exception:
            pass

        return RegisterResponse(
            account_id=new_account.id,
            profile_id=profile_id,
            access_token=access,
            refresh_token=refresh,
        )

    # ── 2. Login ────────────────────────────────────────────

    async def login_user(self, db: AsyncSession, data: LoginRequest, client_ip: str = "") -> TokenResponse:
        if client_ip:
            await check_rate_limit(
                key=f"ratelimit:auth:{client_ip}",
                max_requests=5,
                window_seconds=60,
                error_code=ErrorCode.RATE_LIMITED,
            )

        account = await self.account_repo.get_by_email_or_phone(db, data.email_or_phone)

        if not account or not verify_password(data.password, account.password_hash):
            raise AppException(ErrorCode.AUTH_LOGIN_INVALID_CREDENTIALS)

        if not account.is_active:
            raise AppException(ErrorCode.AUTH_LOGIN_ACCOUNT_DEACTIVATED)

        await self.account_repo.update(db, db_obj=account, obj_in={"last_login_at": datetime.now(timezone.utc)})
        await db.commit()

        access, refresh = self._generate_tokens(str(account.id), account.role)
        await self._store_refresh_token(str(account.id), refresh)

        return TokenResponse(
            access_token=access,
            role=account.role,
            refresh_token=refresh,
        )

    # ── 3. Refresh Token ────────────────────────────────────

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
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

        redis = await get_redis_client()
        if redis:
            stored = await redis.get(f"refresh_token:{user_id}")
            if stored != refresh_token:
                raise AppException(ErrorCode.AUTH_REFRESH_TOKEN_INVALID)

        new_access, new_refresh = self._generate_tokens(user_id, role)
        await self._store_refresh_token(user_id, new_refresh)

        return TokenResponse(access_token=new_access, role=role, refresh_token=new_refresh)

    # ── 4. Logout ────────────────────────────────────────────

    async def logout_user(self, user_id: str) -> None:
        await self._invalidate_refresh_tokens(user_id)

    # ── 5. Change Password ──────────────────────────────────

    async def change_password(self, db: AsyncSession, user: Account, data: ChangePasswordRequest) -> TokenResponse:
        if not verify_password(data.current_password, user.password_hash):
            raise AppException(ErrorCode.AUTH_PASSWORD_WRONG_CURRENT)

        if verify_password(data.new_password, user.password_hash):
            raise AppException(ErrorCode.AUTH_PASSWORD_SAME_AS_CURRENT)

        user.password_hash = get_password_hash(data.new_password)
        await db.commit()

        await self._invalidate_refresh_tokens(str(user.id))
        access, refresh = self._generate_tokens(str(user.id), user.role)
        await self._store_refresh_token(str(user.id), refresh)

        return TokenResponse(access_token=access, role=user.role, refresh_token=refresh)

    # ── 6. Forgot Password (OTP) ────────────────────────────

    async def request_forgot_password_otp(self, db: AsyncSession, data: ForgotPasswordOTPRequest) -> dict:
        account = await self.account_repo.get_by_email_or_phone(db, data.email_or_phone)

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
                self.logger.warning("Failed to send forgot-password OTP for %s", data.email_or_phone)

        return {
            "message": "If an account exists, a verification code has been sent.",
            "expires_in_seconds": 300,
        }

    async def verify_forgot_password_otp(self, db: AsyncSession, data: ForgotPasswordVerifyRequest) -> TokenResponse:
        account = await self.account_repo.get_by_email_or_phone(db, data.email_or_phone)

        if not account:
            raise AppException(ErrorCode.AUTH_ACCOUNT_NOT_FOUND)

        await verify_otp("forgot_password", account.email, data.otp_code)

        account.password_hash = get_password_hash(data.new_password)
        await db.commit()

        await self._invalidate_refresh_tokens(str(account.id))

        access, refresh = self._generate_tokens(str(account.id), account.role)
        await self._store_refresh_token(str(account.id), refresh)

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

    async def request_change_email_otp(self, db: AsyncSession, user: Account, data: ChangeEmailRequest) -> dict:
        existing = await self.account_repo.get_by_email(db, data.new_email)
        if existing and existing.id != user.id:
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
            self.logger.warning("Celery not available. OTP for %s: %s", data.new_email, code)

        return {
            "message": f"Verification code sent to {data.new_email}",
            "otp_sent_to": data.new_email,
            "expires_in_seconds": 300,
        }

    async def verify_change_email_otp(self, db: AsyncSession, user: Account, data: ChangeEmailVerifyRequest) -> dict:
        context = await verify_otp("change_email", data.new_email, data.otp_code)

        if context.get("user_id") != str(user.id):
            raise AppException(ErrorCode.AUTH_TOKEN_INVALID)

        existing = await self.account_repo.get_by_email(db, data.new_email)
        if existing and existing.id != user.id:
            raise AppException(ErrorCode.AUTH_EMAIL_ALREADY_IN_USE)

        user.email = data.new_email
        await db.commit()

        return {"message": "Email updated successfully.", "email": data.new_email}

    # ── 8. Change Phone (OTP) ───────────────────────────────

    async def request_change_phone_otp(self, db: AsyncSession, user: Account, data: ChangePhoneRequest) -> dict:
        existing = await self.account_repo.get_by_phone(db, data.new_phone)
        if existing and existing.id != user.id:
            raise AppException(ErrorCode.AUTH_PHONE_ALREADY_IN_USE)

        code = await generate_otp(
            purpose="change_phone",
            identifier=data.new_phone,
            context={"user_id": str(user.id), "old_phone": user.phone},
        )

        if user.email:
            try:
                from tasks.otp_tasks import send_otp_email_task
                send_otp_email_task.delay(user.email, code, "change_phone")
            except Exception:
                self.logger.warning("Celery not available. Phone change OTP: %s", code)

        return {
            "message": "Verification code sent to your email.",
            "otp_sent_to": user.email or data.new_phone,
            "expires_in_seconds": 300,
        }

    async def verify_change_phone_otp(self, db: AsyncSession, user: Account, data: ChangePhoneVerifyRequest) -> dict:
        context = await verify_otp("change_phone", data.new_phone, data.otp_code)

        if context.get("user_id") != str(user.id):
            raise AppException(ErrorCode.AUTH_TOKEN_INVALID)

        existing = await self.account_repo.get_by_phone(db, data.new_phone)
        if existing and existing.id != user.id:
            raise AppException(ErrorCode.AUTH_PHONE_ALREADY_IN_USE)

        user.phone = data.new_phone
        await db.commit()

        return {"message": "Phone number updated successfully.", "phone": data.new_phone}

    # ── 9. Soft-Delete Account ──────────────────────────────

    async def delete_account(self, db: AsyncSession, user: Account) -> None:
        user.is_active = False
        await db.commit()
        await self._invalidate_refresh_tokens(str(user.id))

    # ── 10. Get Current User Info ────────────────────────────

    async def get_me(self, user: Account) -> dict:
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
            
        if user.vendor_profile:
            data["vendor_profile"] = {
                "id": str(user.vendor_profile.id),
                "business_name": user.vendor_profile.business_name,
                "rating": user.vendor_profile.rating,
                "is_verified": user.vendor_profile.is_verified,
            }
            
        if user.buyer_profile:
            data["buyer_profile"] = {
                "id": str(user.buyer_profile.id),
                "full_name": user.buyer_profile.full_name,
                "buyer_type": user.buyer_profile.buyer_type,
            }
            
        return data
