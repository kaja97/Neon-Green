from fastapi import HTTPException
from .error_codes import ErrorCode
from .messages import ERROR_MESSAGES


class AppException(HTTPException):
    """
    Base application exception. All service-layer errors raise this.

    Usage:
        raise AppException(ErrorCode.AUTH_LOGIN_INVALID_CREDENTIALS)
        raise AppException(ErrorCode.PROJECT_NOT_FOUND, status_code=404)
        raise AppException(ErrorCode.VALIDATION_ERROR, detail="Custom override")
    """

    # Auto-resolve HTTP status from error code pattern.
    # Order matters — first match wins.
    _STATUS_MAP: list[tuple[str, int]] = [
        # Specific patterns first
        ("AUTH_LOGIN_INVALID",     401),
        ("AUTH_LOGIN_ACCOUNT",     403),
        ("AUTH_LOGIN_EMAIL",       403),
        ("AUTH_TOKEN_",            401),
        ("AUTH_REFRESH_",          401),
        ("AUTH_REGISTER_",         409),
        ("AUTH_PASSWORD_WRONG",    401),
        ("AUTH_PASSWORD_SAME",     400),
        ("AUTH_PASSWORD_TOO",      400),
        ("AUTH_EMAIL_ALREADY",     409),
        ("AUTH_PHONE_ALREADY",     409),
        ("AUTH_ACCOUNT_NOT",       404),
        ("OTP_RATE_LIMITED",       429),
        ("OTP_MAX_ATTEMPTS",       429),
        ("OTP_SERVICE_UNAVAIL",    503),
        ("OTP_SEND_FAILED",        502),
        ("OTP_",                   400),
        ("ADMIN_FORBIDDEN",        403),
        ("ADMIN_CANNOT",           403),
        ("ADMIN_USER_NOT",         404),
        ("AI_RATE_LIMIT",          429),
        ("RATE_LIMITED",           429),
        ("_FORBIDDEN",             403),
        ("_NOT_FOUND",             404),
        ("_NOT_READY",             409),
        ("_ALREADY_",              409),
        ("_IN_PROGRESS",           409),
        ("_HAS_PROJECTS",          409),
        ("_ALREADY_EXISTS",        409),
        ("_DEACTIVATED",           403),
        ("_INVALID_",              422),
        ("_MISSING",               422),
        ("_IN_USE",                409),
        ("_REQUIRES_",             422),
        ("_PLAN_LOCKED",           409),
        ("_UNAVAILABLE",           503),
        ("_NOT_IMPLEMENTED",       501),
        ("_SEARCH_EMPTY",          404),
        ("VALIDATION_",            422),
        ("INTERNAL_",              500),
        ("UNAUTHORIZED",           401),
        ("FORBIDDEN",              403),
        ("NOT_FOUND",              404),
        ("CONFLICT",               409),
    ]

    def __init__(
        self,
        error_code: ErrorCode,
        status_code: int | None = None,
        detail: str | None = None,
        headers: dict[str, str] | None = None,
    ):
        self.error_code = error_code
        resolved_status = status_code or self._resolve_status(error_code)
        resolved_message = detail or ERROR_MESSAGES.get(
            error_code, "An error occurred."
        )

        super().__init__(
            status_code=resolved_status,
            detail={
                "code": error_code.value,
                "message": resolved_message,
            },
            headers=headers,
        )

    @classmethod
    def _resolve_status(cls, code: ErrorCode) -> int:
        code_str = code.value
        for pattern, status in cls._STATUS_MAP:
            if pattern in code_str:
                return status
        return 500  # Fallback


# ── Convenience Shortcuts ────────────────────────────────

class NotFoundException(AppException):
    """Shortcut for 404 errors."""
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=404, detail=detail)


class ForbiddenException(AppException):
    """Shortcut for 403 errors."""
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=403, detail=detail)


class ConflictException(AppException):
    """Shortcut for 409 errors."""
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=409, detail=detail)


class ValidationException(AppException):
    """Shortcut for 422 errors."""
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=422, detail=detail)


class RateLimitException(AppException):
    """Shortcut for 429 errors."""
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=429, detail=detail)
