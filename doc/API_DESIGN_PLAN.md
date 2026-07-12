# AgriFarm AI — Full Backend API Architecture

> **Stack:** FastAPI · PostgreSQL 16 · Redis 7 · Celery · SQLAlchemy 2.0 · Pydantic v2
> **Architecture:** Modular Monolith — Use-Case-Driven (NOT raw CRUD)
> **Core Rule:** 80% deterministic Python. AI (Gemini) is a last resort only.

---

## Table of Contents

- [Part A — Cross-Cutting Concerns](#part-a--cross-cutting-concerns)
  - [A1. Standardized Response Envelope](#a1-standardized-response-envelope)
  - [A2. Error Handling Architecture](#a2-error-handling-architecture)
  - [A3. JWT Authentication Middleware](#a3-jwt-authentication-middleware)
  - [A4. Role-Based Access Control (RBAC)](#a4-role-based-access-control-rbac)
  - [A5. Rate Limiting](#a5-rate-limiting)
  - [A6. OTP Verification System](#a6-otp-verification-system)
  - [A7. Pagination Pattern](#a7-pagination-pattern)
  - [A8. Shared Enums](#a8-shared-enums)
- [Part B — New Infrastructure Required](#part-b--new-infrastructure-required)
  - [B1. New Database Tables](#b1-new-database-tables)
  - [B2. New Redis Key Schemas](#b2-new-redis-key-schemas)
  - [B3. New Config Settings](#b3-new-config-settings)
  - [B4. New Core Files](#b4-new-core-files)
- [Part C — Table-to-API Exposure Matrix](#part-c--table-to-api-exposure-matrix)
- [Part D — Module Specifications](#part-d--module-specifications)
  - [Module 1: Auth](#module-1-auth)
  - [Module 2: Farmer](#module-2-farmer)
  - [Module 3: Projects](#module-3-projects)
  - [Module 4: Master Data](#module-4-master-data)
  - [Module 5: Planner](#module-5-planner)
  - [Module 6: Weather](#module-6-weather)
  - [Module 7: Soil](#module-7-soil)
  - [Module 8: Disease](#module-8-disease)
  - [Module 9: AI](#module-9-ai)
  - [Module 10: Market](#module-10-market)
  - [Module 11: Notifications](#module-11-notifications)
  - [Module 12: Admin](#module-12-admin)
- [Part E — Celery Background Tasks](#part-e--celery-background-tasks)
- [Part F — Implementation Priority & Checklist](#part-f--implementation-priority--checklist)

---

# Part A — Cross-Cutting Concerns

## A1. Standardized Response Envelope

Every API response follows this envelope. No exceptions.

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": null
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 87,
    "total_pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_LOGIN_INVALID_CREDENTIALS",
    "message": "Incorrect email/phone or password."
  }
}
```

### Implementation — `core/response.py`

```python
from typing import Any, Optional
from pydantic import BaseModel


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    meta: Optional[PaginationMeta] = None


def success_response(data: Any, status_code: int = 200) -> dict:
    """Wrap data in standard envelope."""
    return {"success": True, "data": data, "meta": None}


def created_response(data: Any) -> dict:
    """Wrap data for 201 Created."""
    return {"success": True, "data": data, "meta": None}


def paginated_response(
    items: list, page: int, per_page: int, total: int
) -> dict:
    """Wrap list data with pagination metadata."""
    return {
        "success": True,
        "data": items,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


def message_response(message: str) -> dict:
    """Simple message response (e.g., for logout, OTP sent)."""
    return {"success": True, "data": {"message": message}, "meta": None}
```

---

## A2. Error Handling Architecture

### A2.1 Error Code Enum — `core/errors/error_codes.py`

Format: `DOMAIN_ACTION_REASON`. Every `HTTPException` in the app **MUST** use one of these codes.

```python
from enum import Enum


class ErrorCode(str, Enum):
    """Centralized, type-safe error code registry."""

    # ── Auth: Registration ────────────────────────────────
    AUTH_REGISTER_EMAIL_EXISTS        = "AUTH_REGISTER_EMAIL_EXISTS"
    AUTH_REGISTER_PHONE_EXISTS        = "AUTH_REGISTER_PHONE_EXISTS"
    AUTH_REGISTER_MISSING_CONTACT     = "AUTH_REGISTER_MISSING_CONTACT"
    AUTH_REGISTER_INVALID_METHOD      = "AUTH_REGISTER_INVALID_METHOD"

    # ── Auth: Login ───────────────────────────────────────
    AUTH_LOGIN_INVALID_CREDENTIALS    = "AUTH_LOGIN_INVALID_CREDENTIALS"
    AUTH_LOGIN_ACCOUNT_DEACTIVATED    = "AUTH_LOGIN_ACCOUNT_DEACTIVATED"
    AUTH_LOGIN_EMAIL_NOT_VERIFIED     = "AUTH_LOGIN_EMAIL_NOT_VERIFIED"

    # ── Auth: Tokens ──────────────────────────────────────
    AUTH_TOKEN_EXPIRED                = "AUTH_TOKEN_EXPIRED"
    AUTH_TOKEN_INVALID                = "AUTH_TOKEN_INVALID"
    AUTH_REFRESH_TOKEN_MISSING        = "AUTH_REFRESH_TOKEN_MISSING"
    AUTH_REFRESH_TOKEN_INVALID        = "AUTH_REFRESH_TOKEN_INVALID"

    # ── Auth: Password ────────────────────────────────────
    AUTH_PASSWORD_WRONG_CURRENT       = "AUTH_PASSWORD_WRONG_CURRENT"
    AUTH_PASSWORD_SAME_AS_CURRENT     = "AUTH_PASSWORD_SAME_AS_CURRENT"
    AUTH_PASSWORD_TOO_WEAK            = "AUTH_PASSWORD_TOO_WEAK"

    # ── Auth: Account ─────────────────────────────────────
    AUTH_ACCOUNT_NOT_FOUND            = "AUTH_ACCOUNT_NOT_FOUND"
    AUTH_EMAIL_ALREADY_IN_USE         = "AUTH_EMAIL_ALREADY_IN_USE"
    AUTH_PHONE_ALREADY_IN_USE         = "AUTH_PHONE_ALREADY_IN_USE"

    # ── Auth: OTP ─────────────────────────────────────────
    OTP_INVALID                       = "OTP_INVALID"
    OTP_EXPIRED                       = "OTP_EXPIRED"
    OTP_MAX_ATTEMPTS                  = "OTP_MAX_ATTEMPTS"
    OTP_RATE_LIMITED                  = "OTP_RATE_LIMITED"
    OTP_ALREADY_VERIFIED              = "OTP_ALREADY_VERIFIED"
    OTP_SEND_FAILED                   = "OTP_SEND_FAILED"

    # ── Farmer ────────────────────────────────────────────
    FARMER_PROFILE_NOT_FOUND          = "FARMER_PROFILE_NOT_FOUND"
    FARMER_LOCATION_NOT_FOUND         = "FARMER_LOCATION_NOT_FOUND"
    FARMER_LOCATION_FORBIDDEN         = "FARMER_LOCATION_FORBIDDEN"
    FARMER_LOCATION_HAS_PROJECTS      = "FARMER_LOCATION_HAS_PROJECTS"
    FARMER_LAND_NOT_FOUND             = "FARMER_LAND_NOT_FOUND"
    FARMER_LAND_FORBIDDEN             = "FARMER_LAND_FORBIDDEN"
    FARMER_LAND_INVALID_LOCATION      = "FARMER_LAND_INVALID_LOCATION"
    FARMER_LIVESTOCK_NOT_FOUND        = "FARMER_LIVESTOCK_NOT_FOUND"
    FARMER_LIVESTOCK_FORBIDDEN        = "FARMER_LIVESTOCK_FORBIDDEN"

    # ── Project ───────────────────────────────────────────
    PROJECT_NOT_FOUND                 = "PROJECT_NOT_FOUND"
    PROJECT_FORBIDDEN                 = "PROJECT_FORBIDDEN"
    PROJECT_INVALID_PLANT             = "PROJECT_INVALID_PLANT"
    PROJECT_INVALID_LOCATION          = "PROJECT_INVALID_LOCATION"
    PROJECT_INVALID_LAND_DETAIL       = "PROJECT_INVALID_LAND_DETAIL"
    PROJECT_INVALID_STATUS_TRANSITION = "PROJECT_INVALID_STATUS_TRANSITION"
    PROJECT_ALREADY_HARVESTED         = "PROJECT_ALREADY_HARVESTED"
    PROJECT_STATUS_REQUIRES_DATE      = "PROJECT_STATUS_REQUIRES_DATE"
    PROJECT_SERVICE_NOT_FOUND         = "PROJECT_SERVICE_NOT_FOUND"
    PROJECT_SERVICE_ALREADY_EXISTS    = "PROJECT_SERVICE_ALREADY_EXISTS"

    # ── Planner ───────────────────────────────────────────
    PLANNER_PLAN_NOT_FOUND            = "PLANNER_PLAN_NOT_FOUND"
    PLANNER_PLAN_NOT_READY            = "PLANNER_PLAN_NOT_READY"
    PLANNER_ACTIVITY_NOT_FOUND        = "PLANNER_ACTIVITY_NOT_FOUND"
    PLANNER_ACTIVITY_FORBIDDEN        = "PLANNER_ACTIVITY_FORBIDDEN"
    PLANNER_ACTIVITY_ALREADY_DONE     = "PLANNER_ACTIVITY_ALREADY_DONE"
    PLANNER_ACTIVITY_ALREADY_SKIPPED  = "PLANNER_ACTIVITY_ALREADY_SKIPPED"
    PLANNER_REGENERATE_IN_PROGRESS    = "PLANNER_REGENERATE_IN_PROGRESS"

    # ── Weather ───────────────────────────────────────────
    WEATHER_API_UNAVAILABLE           = "WEATHER_API_UNAVAILABLE"
    WEATHER_LOCATION_MISSING          = "WEATHER_LOCATION_MISSING"
    WEATHER_ALERT_NOT_FOUND           = "WEATHER_ALERT_NOT_FOUND"

    # ── Soil ──────────────────────────────────────────────
    SOIL_TEST_NOT_FOUND               = "SOIL_TEST_NOT_FOUND"
    SOIL_TEST_INVALID_ALL_ZERO        = "SOIL_TEST_INVALID_ALL_ZERO"
    SOIL_TEST_INVALID_PH              = "SOIL_TEST_INVALID_PH"
    SOIL_RECOMMENDATION_NOT_FOUND     = "SOIL_RECOMMENDATION_NOT_FOUND"

    # ── Disease ───────────────────────────────────────────
    DISEASE_ISSUE_NOT_FOUND           = "DISEASE_ISSUE_NOT_FOUND"
    DISEASE_ISSUE_FORBIDDEN           = "DISEASE_ISSUE_FORBIDDEN"
    DISEASE_ISSUE_INVALID_TRANSITION  = "DISEASE_ISSUE_INVALID_TRANSITION"
    DISEASE_NOT_FOUND                 = "DISEASE_NOT_FOUND"
    DISEASE_SEARCH_EMPTY              = "DISEASE_SEARCH_EMPTY"
    DISEASE_CV_NOT_IMPLEMENTED        = "DISEASE_CV_NOT_IMPLEMENTED"

    # ── AI ────────────────────────────────────────────────
    AI_RATE_LIMIT_EXCEEDED            = "AI_RATE_LIMIT_EXCEEDED"
    AI_GEMINI_UNAVAILABLE             = "AI_GEMINI_UNAVAILABLE"
    AI_CONTEXT_BUILD_FAILED           = "AI_CONTEXT_BUILD_FAILED"
    AI_CONVERSATION_NOT_FOUND         = "AI_CONVERSATION_NOT_FOUND"
    AI_CONVERSATION_FORBIDDEN         = "AI_CONVERSATION_FORBIDDEN"
    AI_SUMMARY_NOT_FOUND              = "AI_SUMMARY_NOT_FOUND"

    # ── Market ────────────────────────────────────────────
    MARKET_PRICE_NOT_FOUND            = "MARKET_PRICE_NOT_FOUND"
    MARKET_TREND_NOT_FOUND            = "MARKET_TREND_NOT_FOUND"
    MARKET_PLANT_NOT_FOUND            = "MARKET_PLANT_NOT_FOUND"

    # ── Notification ──────────────────────────────────────
    NOTIFICATION_NOT_FOUND            = "NOTIFICATION_NOT_FOUND"
    NOTIFICATION_FORBIDDEN            = "NOTIFICATION_FORBIDDEN"
    NOTIFICATION_PUSH_FAILED          = "NOTIFICATION_PUSH_FAILED"
    NOTIFICATION_SUB_NOT_FOUND        = "NOTIFICATION_SUB_NOT_FOUND"

    # ── Master Data ───────────────────────────────────────
    PLANT_NOT_FOUND                   = "PLANT_NOT_FOUND"
    PLANT_STAGE_NOT_FOUND             = "PLANT_STAGE_NOT_FOUND"
    FARMING_METHOD_NOT_FOUND          = "FARMING_METHOD_NOT_FOUND"

    # ── Admin ─────────────────────────────────────────────
    ADMIN_FORBIDDEN                   = "ADMIN_FORBIDDEN"
    ADMIN_CANNOT_DELETE_SELF          = "ADMIN_CANNOT_DELETE_SELF"
    ADMIN_USER_NOT_FOUND              = "ADMIN_USER_NOT_FOUND"

    # ── Generic ───────────────────────────────────────────
    VALIDATION_ERROR                  = "VALIDATION_ERROR"
    INTERNAL_SERVER_ERROR             = "INTERNAL_SERVER_ERROR"
    FORBIDDEN                         = "FORBIDDEN"
    UNAUTHORIZED                      = "UNAUTHORIZED"
    NOT_FOUND                         = "NOT_FOUND"
    CONFLICT                          = "CONFLICT"
    RATE_LIMITED                       = "RATE_LIMITED"
```

### A2.2 Error Message Catalog — `core/errors/messages.py`

```python
from .error_codes import ErrorCode

ERROR_MESSAGES: dict[ErrorCode, str] = {
    # Auth – Registration
    ErrorCode.AUTH_REGISTER_EMAIL_EXISTS:     "An account with this email already exists.",
    ErrorCode.AUTH_REGISTER_PHONE_EXISTS:     "An account with this phone already exists.",
    ErrorCode.AUTH_REGISTER_MISSING_CONTACT:  "Either email or phone number is required.",
    ErrorCode.AUTH_REGISTER_INVALID_METHOD:   "Farming method must be: organic, inorganic, or integrated.",

    # Auth – Login
    ErrorCode.AUTH_LOGIN_INVALID_CREDENTIALS: "Incorrect email/phone or password.",
    ErrorCode.AUTH_LOGIN_ACCOUNT_DEACTIVATED: "This account has been deactivated. Contact support.",
    ErrorCode.AUTH_LOGIN_EMAIL_NOT_VERIFIED:  "Please verify your email first. Check your inbox for the OTP.",

    # Auth – Tokens
    ErrorCode.AUTH_TOKEN_EXPIRED:             "Your session has expired. Please log in again.",
    ErrorCode.AUTH_TOKEN_INVALID:             "Invalid authentication token.",
    ErrorCode.AUTH_REFRESH_TOKEN_MISSING:     "Refresh token is missing.",
    ErrorCode.AUTH_REFRESH_TOKEN_INVALID:     "Refresh token is invalid or expired.",

    # Auth – Password
    ErrorCode.AUTH_PASSWORD_WRONG_CURRENT:    "Current password is incorrect.",
    ErrorCode.AUTH_PASSWORD_SAME_AS_CURRENT:  "New password must differ from the current one.",
    ErrorCode.AUTH_PASSWORD_TOO_WEAK:         "Password must be at least 8 characters with one number and one letter.",

    # Auth – Account
    ErrorCode.AUTH_ACCOUNT_NOT_FOUND:         "Account not found.",
    ErrorCode.AUTH_EMAIL_ALREADY_IN_USE:      "This email is already in use by another account.",
    ErrorCode.AUTH_PHONE_ALREADY_IN_USE:      "This phone is already in use by another account.",

    # OTP
    ErrorCode.OTP_INVALID:                    "The OTP code is incorrect.",
    ErrorCode.OTP_EXPIRED:                    "OTP has expired. Request a new one.",
    ErrorCode.OTP_MAX_ATTEMPTS:              "Too many incorrect attempts. Request a new OTP.",
    ErrorCode.OTP_RATE_LIMITED:              "Too many OTP requests. Try again in a few minutes.",
    ErrorCode.OTP_ALREADY_VERIFIED:          "This action has already been verified.",
    ErrorCode.OTP_SEND_FAILED:              "Failed to send OTP. Please try again.",

    # Farmer
    ErrorCode.FARMER_PROFILE_NOT_FOUND:       "Farmer profile not found. Complete registration first.",
    ErrorCode.FARMER_LOCATION_NOT_FOUND:      "Location not found.",
    ErrorCode.FARMER_LOCATION_FORBIDDEN:      "You do not have access to this location.",
    ErrorCode.FARMER_LOCATION_HAS_PROJECTS:   "Cannot delete location — it has active projects.",
    ErrorCode.FARMER_LAND_NOT_FOUND:          "Land detail not found.",
    ErrorCode.FARMER_LAND_FORBIDDEN:          "You do not have access to this land record.",
    ErrorCode.FARMER_LAND_INVALID_LOCATION:   "The specified location does not belong to you.",
    ErrorCode.FARMER_LIVESTOCK_NOT_FOUND:     "Livestock record not found.",
    ErrorCode.FARMER_LIVESTOCK_FORBIDDEN:     "You do not have access to this livestock record.",

    # Project
    ErrorCode.PROJECT_NOT_FOUND:                 "Project not found.",
    ErrorCode.PROJECT_FORBIDDEN:                 "You do not have access to this project.",
    ErrorCode.PROJECT_INVALID_PLANT:             "Selected crop is not available.",
    ErrorCode.PROJECT_INVALID_LOCATION:          "Selected location does not belong to you.",
    ErrorCode.PROJECT_INVALID_LAND_DETAIL:       "Selected land detail does not belong to you.",
    ErrorCode.PROJECT_INVALID_STATUS_TRANSITION: "This status transition is not allowed.",
    ErrorCode.PROJECT_ALREADY_HARVESTED:         "This project has already been harvested.",
    ErrorCode.PROJECT_STATUS_REQUIRES_DATE:      "Harvest date is required when marking as harvested.",
    ErrorCode.PROJECT_SERVICE_NOT_FOUND:         "Project service not found.",
    ErrorCode.PROJECT_SERVICE_ALREADY_EXISTS:    "This service is already enabled for the project.",

    # Planner
    ErrorCode.PLANNER_PLAN_NOT_FOUND:            "Activity plan not found for this project.",
    ErrorCode.PLANNER_PLAN_NOT_READY:            "Activity plan is still being generated. Check back shortly.",
    ErrorCode.PLANNER_ACTIVITY_NOT_FOUND:        "Activity not found.",
    ErrorCode.PLANNER_ACTIVITY_FORBIDDEN:        "You do not have access to this activity.",
    ErrorCode.PLANNER_ACTIVITY_ALREADY_DONE:     "This activity has already been marked complete.",
    ErrorCode.PLANNER_ACTIVITY_ALREADY_SKIPPED:  "This activity has already been skipped.",
    ErrorCode.PLANNER_REGENERATE_IN_PROGRESS:    "Plan regeneration is already in progress.",

    # Weather
    ErrorCode.WEATHER_API_UNAVAILABLE:   "Weather data is temporarily unavailable. Using cached data.",
    ErrorCode.WEATHER_LOCATION_MISSING:  "Project does not have a GPS location configured.",
    ErrorCode.WEATHER_ALERT_NOT_FOUND:   "Weather alert not found.",

    # Soil
    ErrorCode.SOIL_TEST_NOT_FOUND:            "No soil test found for this project.",
    ErrorCode.SOIL_TEST_INVALID_ALL_ZERO:     "All soil test values are zero — enter valid lab results.",
    ErrorCode.SOIL_TEST_INVALID_PH:           "pH value must be between 0.1 and 14.0.",
    ErrorCode.SOIL_RECOMMENDATION_NOT_FOUND:  "No soil recommendations found. Submit a soil test first.",

    # Disease
    ErrorCode.DISEASE_ISSUE_NOT_FOUND:           "Issue report not found.",
    ErrorCode.DISEASE_ISSUE_FORBIDDEN:           "You do not have access to this issue.",
    ErrorCode.DISEASE_ISSUE_INVALID_TRANSITION:  "This issue status transition is not allowed.",
    ErrorCode.DISEASE_NOT_FOUND:                 "Disease not found in the database.",
    ErrorCode.DISEASE_SEARCH_EMPTY:              "No diseases matched. Try describing what you see: leaf color, spots, wilting.",
    ErrorCode.DISEASE_CV_NOT_IMPLEMENTED:        "Image-based disease detection is coming soon.",

    # AI
    ErrorCode.AI_RATE_LIMIT_EXCEEDED:     "AI daily limit reached. Remaining calls reset at midnight.",
    ErrorCode.AI_GEMINI_UNAVAILABLE:      "AI service is temporarily unavailable.",
    ErrorCode.AI_CONTEXT_BUILD_FAILED:    "Failed to build project context for AI analysis.",
    ErrorCode.AI_CONVERSATION_NOT_FOUND:  "Conversation not found.",
    ErrorCode.AI_CONVERSATION_FORBIDDEN:  "You do not have access to this conversation.",
    ErrorCode.AI_SUMMARY_NOT_FOUND:       "No AI summary available yet. Click 'Generate' to create one.",

    # Market
    ErrorCode.MARKET_PRICE_NOT_FOUND: "No market prices found for this crop in the selected region.",
    ErrorCode.MARKET_TREND_NOT_FOUND: "No market trend data available yet.",
    ErrorCode.MARKET_PLANT_NOT_FOUND: "Crop not found for market lookup.",

    # Notification
    ErrorCode.NOTIFICATION_NOT_FOUND:    "Notification not found.",
    ErrorCode.NOTIFICATION_FORBIDDEN:    "You do not have access to this notification.",
    ErrorCode.NOTIFICATION_PUSH_FAILED:  "Push notification delivery failed.",
    ErrorCode.NOTIFICATION_SUB_NOT_FOUND: "Push subscription not found.",

    # Master Data
    ErrorCode.PLANT_NOT_FOUND:          "Crop not found.",
    ErrorCode.PLANT_STAGE_NOT_FOUND:    "Growth stage not found.",
    ErrorCode.FARMING_METHOD_NOT_FOUND: "Farming method not found.",

    # Admin
    ErrorCode.ADMIN_FORBIDDEN:           "Administrator access required.",
    ErrorCode.ADMIN_CANNOT_DELETE_SELF:   "You cannot deactivate your own admin account.",
    ErrorCode.ADMIN_USER_NOT_FOUND:      "User not found.",

    # Generic
    ErrorCode.VALIDATION_ERROR:       "Request validation failed.",
    ErrorCode.INTERNAL_SERVER_ERROR:   "An unexpected error occurred. Please try again.",
    ErrorCode.FORBIDDEN:              "You do not have permission to perform this action.",
    ErrorCode.UNAUTHORIZED:           "Authentication required.",
    ErrorCode.NOT_FOUND:              "Resource not found.",
    ErrorCode.CONFLICT:               "Resource already exists.",
    ErrorCode.RATE_LIMITED:           "Too many requests. Please slow down.",
}
```

### A2.3 Custom Exception Classes — `core/errors/exceptions.py`

```python
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

    # Auto-resolve HTTP status from error code pattern
    _STATUS_MAP: list[tuple[str, int]] = [
        # Specific patterns first (order matters — first match wins)
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
        ("_UNAVAILABLE",           503),
        ("_NOT_IMPLEMENTED",       501),
        ("_EMPTY",                 404),
        ("_SEND_FAILED",           502),
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
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=404, detail=detail)

class ForbiddenException(AppException):
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=403, detail=detail)

class ConflictException(AppException):
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=409, detail=detail)

class ValidationException(AppException):
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=422, detail=detail)

class RateLimitException(AppException):
    def __init__(self, error_code: ErrorCode, detail: str | None = None):
        super().__init__(error_code, status_code=429, detail=detail)
```

### A2.4 Global Exception Handlers — `core/errors/handlers.py`

Registered once in `main.py`. Catches `AppException` and all unhandled `Exception`.

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .exceptions import AppException
from .error_codes import ErrorCode
from .messages import ERROR_MESSAGES
import logging

logger = logging.getLogger("agrifarm")


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle all AppException — return structured error envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": exc.detail,
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic v2 validation errors — restructure into standard envelope."""
    errors = []
    for err in exc.errors():
        field = " → ".join(str(loc) for loc in err["loc"])
        errors.append({"field": field, "message": err["msg"]})

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": ErrorCode.VALIDATION_ERROR.value,
                "message": "Request validation failed.",
                "details": errors,
            },
        },
    )


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Last-resort handler. Log full traceback, return generic 500."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": ErrorCode.INTERNAL_SERVER_ERROR.value,
                "message": ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR],
            },
        },
    )
```

### A2.5 Registration in `main.py`

```python
from fastapi.exceptions import RequestValidationError
from core.errors.exceptions import AppException
from core.errors.handlers import (
    app_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
```

### A2.6 File Structure

```
backend/core/errors/
├── __init__.py          ← exports ErrorCode, AppException, etc.
├── error_codes.py       ← ErrorCode enum
├── messages.py          ← ERROR_MESSAGES dict
├── exceptions.py        ← AppException + shortcuts
└── handlers.py          ← Global handlers for main.py
```

---

## A3. JWT Authentication Middleware

### Existing: `dependencies.py` → `get_current_user`

Already implemented. Returns `Account` ORM object with `farmer_profile` eagerly loaded.

- Reads `Authorization: Bearer <token>` header
- Decodes JWT with `HS256`
- Checks `is_active` flag
- Raises `401` if invalid, `403` if deactivated

### Token Lifecycle

| Token Type | Storage | TTL | Rotation |
|-----------|---------|-----|----------|
| Access Token | Client memory / localStorage | 15 min (`JWT_ACCESS_EXPIRE_MINUTES`) | On refresh |
| Refresh Token | httpOnly cookie + Redis | 30 days (`JWT_REFRESH_EXPIRE_DAYS`) | On refresh (rotate both) |

### Token Payload

```json
{
  "sub": "account-uuid",
  "role": "farmer",
  "exp": 1721234567
}
```

> **Note:** The `role` claim is added as part of the RBAC changes (see A4). Currently `sub` is the only claim.

---

## A4. Role-Based Access Control (RBAC)

### Roles

| Role | Description | Access Level |
|------|-------------|-------------|
| `farmer` | Default role. Created on registration. | Own data only |
| `admin` | System administrator. Created via seed or manual DB update. | All data + admin panel |

### Dependencies — `dependencies.py`

```python
# EXISTING (modify to include role in token check)
async def get_current_user(...) -> Account:
    """Any authenticated user (farmer or admin)."""
    ...

# NEW
async def get_current_farmer(
    current_user: Account = Depends(get_current_user),
) -> Account:
    """Authenticated user who is a farmer with a profile."""
    if not current_user.farmer_profile:
        raise AppException(ErrorCode.FARMER_PROFILE_NOT_FOUND)
    return current_user

# NEW
async def get_admin_user(
    current_user: Account = Depends(get_current_user),
) -> Account:
    """Authenticated user with admin role."""
    if current_user.role != "admin":
        raise AppException(ErrorCode.ADMIN_FORBIDDEN)
    return current_user
```

### Usage in Routers

```python
# Farmer-only endpoint
@router.get("/profile")
async def get_profile(user: Account = Depends(get_current_farmer)): ...

# Admin-only endpoint
@router.get("/admin/users")
async def list_users(admin: Account = Depends(get_admin_user)): ...

# Any authenticated user
@router.get("/auth/me")
async def get_me(user: Account = Depends(get_current_user)): ...
```

---

## A5. Rate Limiting

### Strategy: Redis Sliding Window

All rate limits are enforced via Redis counters with TTL. Middleware checks on every request.

| Scope | Limit | Window | Redis Key |
|-------|-------|--------|-----------|
| Auth endpoints (login, register) | 5 req | per minute per IP | `ratelimit:auth:{ip}` |
| OTP requests | 3 req | per hour per identifier | `ratelimit:otp:{email_or_phone}` |
| General API | 100 req | per minute per user | `ratelimit:api:{user_id}` |
| AI Chat | 5 calls | per day per farmer | `ai_quota:chat:{farmer_id}` |
| AI Refresh | 3 calls | per day per farmer | `ai_quota:refresh:{farmer_id}` |
| AI Diagnosis | 2 calls | per day per farmer | `ai_quota:diagnosis:{farmer_id}` |

### Implementation — `core/rate_limiter.py`

```python
from core.redis import get_redis_client
from core.errors.exceptions import RateLimitException
from core.errors.error_codes import ErrorCode


async def check_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int,
    error_code: ErrorCode = ErrorCode.RATE_LIMITED,
) -> None:
    """
    Sliding window rate limiter using Redis INCR + EXPIRE.
    Raises RateLimitException if limit exceeded.
    """
    redis = await get_redis_client()
    if not redis:
        return  # Skip rate limiting if Redis unavailable

    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, window_seconds)

    if current > max_requests:
        raise RateLimitException(error_code)
```

---

## A6. OTP Verification System

### Design: Redis-Based (No DB Table)

OTPs are ephemeral — they expire in 5 minutes. Storing them in Redis is simpler, faster, and auto-cleanup.

### OTP Purposes

| Purpose | Trigger | Verifies |
|---------|---------|----------|
| `register` | `POST /auth/register` | Email ownership before account creation |
| `forgot_password` | `POST /auth/forgot-password` | Email/phone ownership before password reset |
| `change_email` | `POST /auth/change-email/request` | New email ownership before swap |
| `change_phone` | `POST /auth/change-phone/request` | New phone ownership before swap |

### Redis Key Schema

```
otp:{purpose}:{identifier}
```

**Example:** `otp:register:farmer@example.com`

**Value (JSON):**
```json
{
  "code": "482917",
  "attempts": 0,
  "created_at": "2025-04-15T10:30:00Z",
  "context": {}
}
```

**TTL:** 300 seconds (5 minutes)

### OTP Configuration

| Setting | Value |
|---------|-------|
| Code length | 6 digits |
| Expiry | 5 minutes |
| Max wrong attempts | 3 (then key is deleted) |
| Rate limit | 3 OTP sends per hour per identifier |
| Delivery | Email via SMTP / SMS via Twilio (Celery background task) |

### Implementation — `core/otp.py`

```python
import json
import secrets
from datetime import datetime, timezone
from core.redis import get_redis_client
from core.errors.exceptions import AppException, RateLimitException
from core.errors.error_codes import ErrorCode
from core.rate_limiter import check_rate_limit

OTP_TTL_SECONDS = 300        # 5 minutes
OTP_MAX_ATTEMPTS = 3
OTP_LENGTH = 6


async def generate_otp(
    purpose: str,
    identifier: str,
    context: dict | None = None,
) -> str:
    """
    Generate a 6-digit OTP and store in Redis.
    Rate limited: 3 per hour per identifier.
    Returns the OTP code (caller sends it via email/SMS).
    """
    # Rate limit: 3 OTP requests per hour per identifier
    await check_rate_limit(
        key=f"ratelimit:otp:{identifier}",
        max_requests=3,
        window_seconds=3600,
        error_code=ErrorCode.OTP_RATE_LIMITED,
    )

    redis = await get_redis_client()
    if not redis:
        raise AppException(ErrorCode.OTP_SEND_FAILED, detail="OTP service unavailable.")

    code = "".join([str(secrets.randbelow(10)) for _ in range(OTP_LENGTH)])

    otp_data = {
        "code": code,
        "attempts": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "context": context or {},
    }

    key = f"otp:{purpose}:{identifier}"
    await redis.setex(key, OTP_TTL_SECONDS, json.dumps(otp_data))

    return code


async def verify_otp(
    purpose: str,
    identifier: str,
    submitted_code: str,
) -> dict:
    """
    Verify a 6-digit OTP. Returns the stored context on success.
    Raises on wrong code, expired, or max attempts.
    """
    redis = await get_redis_client()
    if not redis:
        raise AppException(ErrorCode.OTP_SEND_FAILED, detail="OTP service unavailable.")

    key = f"otp:{purpose}:{identifier}"
    raw = await redis.get(key)

    if not raw:
        raise AppException(ErrorCode.OTP_EXPIRED)

    otp_data = json.loads(raw)

    # Check max attempts
    if otp_data["attempts"] >= OTP_MAX_ATTEMPTS:
        await redis.delete(key)
        raise AppException(ErrorCode.OTP_MAX_ATTEMPTS)

    # Check code match
    if otp_data["code"] != submitted_code:
        otp_data["attempts"] += 1
        remaining_ttl = await redis.ttl(key)
        await redis.setex(key, max(remaining_ttl, 1), json.dumps(otp_data))
        remaining = OTP_MAX_ATTEMPTS - otp_data["attempts"]
        raise AppException(
            ErrorCode.OTP_INVALID,
            detail=f"Incorrect OTP. {remaining} attempt(s) remaining.",
        )

    # Success — delete the OTP key
    await redis.delete(key)
    return otp_data.get("context", {})
```

### OTP Delivery — Celery Background Tasks

```python
# tasks/otp_tasks.py

@celery_app.task(bind=True, max_retries=2)
def send_otp_email_task(self, email: str, code: str, purpose: str):
    """Send OTP via SMTP. Retry on failure."""
    try:
        subject_map = {
            "register": "AgriFarm AI — Verify Your Email",
            "forgot_password": "AgriFarm AI — Reset Your Password",
            "change_email": "AgriFarm AI — Confirm New Email",
        }
        # Use smtplib or SendGrid or any email provider
        send_email(
            to=email,
            subject=subject_map.get(purpose, "AgriFarm AI — Verification Code"),
            body=f"Your verification code is: {code}\n\nThis code expires in 5 minutes.",
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=10)


@celery_app.task(bind=True, max_retries=2)
def send_otp_sms_task(self, phone: str, code: str, purpose: str):
    """Send OTP via SMS (Twilio). Retry on failure."""
    try:
        send_sms(to=phone, body=f"AgriFarm AI code: {code}. Expires in 5 min.")
    except Exception as exc:
        raise self.retry(exc=exc, countdown=10)
```

---

## A7. Pagination Pattern

### Query Parameters (Shared)

All list endpoints accept:

```
?page=1&per_page=20&sort_by=created_at&sort_order=desc
```

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | int | 1 | — |
| `per_page` | int | 20 | 100 |
| `sort_by` | str | `created_at` | varies |
| `sort_order` | str | `desc` | `asc` or `desc` |

### Pagination Dependency — `core/pagination.py`

```python
from fastapi import Query
from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20
    sort_by: str = "created_at"
    sort_order: str = "desc"

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page


def get_pagination(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
) -> PaginationParams:
    return PaginationParams(
        page=page, per_page=per_page,
        sort_by=sort_by, sort_order=sort_order,
    )
```

---

## A8. Shared Enums — `core/enums.py`

All status fields across the system use these enums. Models and schemas reference them for validation.

```python
from enum import Enum


# ── Account ───────────────────────────────────────────────
class UserRole(str, Enum):
    FARMER = "farmer"
    ADMIN  = "admin"


# ── Farming Method ────────────────────────────────────────
class FarmingMethod(str, Enum):
    ORGANIC    = "organic"
    INORGANIC  = "inorganic"
    INTEGRATED = "integrated"


# ── Project ───────────────────────────────────────────────
class ProjectStatus(str, Enum):
    PLANNING  = "planning"
    ACTIVE    = "active"
    HARVESTED = "harvested"
    FAILED    = "failed"
    PAUSED    = "paused"


# Valid transitions (state machine)
PROJECT_STATUS_TRANSITIONS: dict[ProjectStatus, list[ProjectStatus]] = {
    ProjectStatus.PLANNING:  [ProjectStatus.ACTIVE],
    ProjectStatus.ACTIVE:    [ProjectStatus.HARVESTED, ProjectStatus.FAILED, ProjectStatus.PAUSED],
    ProjectStatus.PAUSED:    [ProjectStatus.ACTIVE],
    ProjectStatus.HARVESTED: [],
    ProjectStatus.FAILED:    [],
}


# ── Plan Generation ──────────────────────────────────────
class PlanGenerationStatus(str, Enum):
    PENDING    = "pending"
    GENERATING = "generating"
    COMPLETED  = "completed"
    FAILED     = "failed"


# ── Activity ─────────────────────────────────────────────
class ActivityStatus(str, Enum):
    PENDING     = "pending"
    DONE        = "done"
    SKIPPED     = "skipped"
    RESCHEDULED = "rescheduled"


class ActivityType(str, Enum):
    WATERING    = "watering"
    FERTILIZING = "fertilizing"
    MONITORING  = "monitoring"
    SPRAYING    = "spraying"
    HARVESTING  = "harvesting"


# ── Issue ────────────────────────────────────────────────
class IssueType(str, Enum):
    DISEASE             = "disease"
    PEST                = "pest"
    NUTRIENT_DEFICIENCY = "nutrient_deficiency"
    OTHER               = "other"


class IssueStatus(str, Enum):
    OPEN       = "open"
    DIAGNOSED  = "diagnosed"
    RESOLVED   = "resolved"
    MONITORING = "monitoring"


ISSUE_STATUS_TRANSITIONS: dict[IssueStatus, list[IssueStatus]] = {
    IssueStatus.OPEN:       [IssueStatus.DIAGNOSED, IssueStatus.RESOLVED],
    IssueStatus.DIAGNOSED:  [IssueStatus.RESOLVED, IssueStatus.MONITORING],
    IssueStatus.MONITORING: [IssueStatus.RESOLVED, IssueStatus.OPEN],
    IssueStatus.RESOLVED:   [],
}


class Severity(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


# ── Service Types (per-project toggles) ──────────────────
class ServiceType(str, Enum):
    WEATHER       = "weather"
    SOIL          = "soil"
    DISEASE       = "disease"
    AI            = "ai"
    MARKET        = "market"
    NOTIFICATIONS = "notifications"


# ── AI ───────────────────────────────────────────────────
class AICallType(str, Enum):
    CHAT      = "chat"       # 5/day
    REFRESH   = "refresh"    # 3/day
    DIAGNOSIS = "diagnosis"  # 2/day


AI_DAILY_QUOTAS: dict[AICallType, int] = {
    AICallType.CHAT:      5,
    AICallType.REFRESH:   3,
    AICallType.DIAGNOSIS: 2,
}


# ── Weather ──────────────────────────────────────────────
class AlertType(str, Enum):
    FLOOD_RISK                  = "flood_risk"
    FROST_RISK                  = "frost_risk"
    DISEASE_RISK_HIGH_HUMIDITY  = "disease_risk_high_humidity"
    HEAVY_RAIN                  = "heavy_rain"
    DROUGHT                     = "drought"
    EXTREME_HEAT                = "extreme_heat"


class AlertSeverity(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


# ── Notification ─────────────────────────────────────────
class NotificationType(str, Enum):
    ACTIVITY_REMINDER = "activity_reminder"
    WEATHER_ALERT     = "weather_alert"
    DISEASE_RISK      = "disease_risk"
    MARKET_ALERT      = "market_alert"
    AI_INSIGHT        = "ai_insight"
    SYSTEM            = "system"


# ── OTP ──────────────────────────────────────────────────
class OTPPurpose(str, Enum):
    REGISTER        = "register"
    FORGOT_PASSWORD = "forgot_password"
    CHANGE_EMAIL    = "change_email"
    CHANGE_PHONE    = "change_phone"


# ── Soil ─────────────────────────────────────────────────
class NutrientLevel(str, Enum):
    LOW    = "Low"
    MEDIUM = "Medium"
    HIGH   = "High"


class SoilRecommendationType(str, Enum):
    FERTILIZER = "fertilizer"
    AMENDMENT  = "amendment"
    PRACTICE   = "practice"


# ── Market ───────────────────────────────────────────────
class TrendDirection(str, Enum):
    RISING  = "rising"
    FALLING = "falling"
    STABLE  = "stable"
```

---

# Part B — New Infrastructure Required

## B1. New Database Tables

### B1.1 `push_subscriptions` — Web Push VAPID Subscriptions

```python
# models/notification.py (add to existing file)

class PushSubscription(BaseModel):
    __tablename__ = "push_subscriptions"

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farmer_profiles.id", ondelete="CASCADE"),
    )
    endpoint: Mapped[str] = mapped_column(Text, unique=True)
    p256dh_key: Mapped[str] = mapped_column(Text)
    auth_key: Mapped[str] = mapped_column(Text)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
```

### B1.2 No OTP Table Needed

OTPs are ephemeral — stored in Redis with 5-minute TTL. No database table.

### B1.3 Model Change: `accounts.role` Default

The existing `Account` model already has `role: Mapped[str] = mapped_column(String(20), default="farmer")`.
No schema change needed — just add `"admin"` as a valid role value.

### B1.4 New Migration Required

```
alembic revision --autogenerate -m "003_push_subscriptions"
```

---

## B2. New Redis Key Schemas

| Key Pattern | Purpose | TTL | Value Format |
|------------|---------|-----|-------------|
| `otp:{purpose}:{identifier}` | OTP verification | 300s (5 min) | JSON `{code, attempts, created_at, context}` |
| `ratelimit:otp:{identifier}` | OTP send rate limit | 3600s (1 hr) | int counter |
| `ratelimit:auth:{ip}` | Auth endpoint rate limit | 60s | int counter |
| `ratelimit:api:{user_id}` | General API rate limit | 60s | int counter |
| `refresh_token:{user_id}` | Refresh token storage | 30 days | token string |
| `ai_quota:{call_type}:{farmer_id}` | AI daily quota | 86400s (24 hr) | int counter |
| `dashboard:{project_id}` | Dashboard cache | 180s (3 min) | JSON blob |
| `weather:{lat},{lng}` | Weather forecast cache | 10800s (3 hr) | JSON blob |
| `otp_verified:{purpose}:{identifier}` | OTP verification flag (temp grant) | 600s (10 min) | `"1"` |

---

## B3. New Config Settings — `config.py`

```python
# Add to existing Settings class:

# SMTP (for OTP emails)
SMTP_HOST: Optional[str] = None
SMTP_PORT: int = 587
SMTP_USER: Optional[str] = None
SMTP_PASSWORD: Optional[str] = None
SMTP_FROM_EMAIL: str = "noreply@agrifarm.app"

# SMS (Twilio — for OTP)
TWILIO_ACCOUNT_SID: Optional[str] = None
TWILIO_AUTH_TOKEN: Optional[str] = None
TWILIO_FROM_NUMBER: Optional[str] = None

# OTP
OTP_LENGTH: int = 6
OTP_TTL_SECONDS: int = 300
OTP_MAX_ATTEMPTS: int = 3

# Rate Limiting
CELERY_EAGER_MODE: bool = False
```

---

## B4. New Core Files

| File | Purpose |
|------|---------|
| `core/errors/__init__.py` | Export `ErrorCode`, `AppException`, etc. |
| `core/errors/error_codes.py` | `ErrorCode` enum |
| `core/errors/messages.py` | `ERROR_MESSAGES` dict |
| `core/errors/exceptions.py` | `AppException` + shortcuts |
| `core/errors/handlers.py` | Global exception handlers |
| `core/response.py` | `success_response()`, `paginated_response()`, `message_response()` |
| `core/enums.py` | All shared enums |
| `core/otp.py` | `generate_otp()`, `verify_otp()` |
| `core/rate_limiter.py` | `check_rate_limit()` |
| `core/pagination.py` | `PaginationParams`, `get_pagination()` |
| `tasks/otp_tasks.py` | `send_otp_email_task`, `send_otp_sms_task` |

---

# Part C — Table-to-API Exposure Matrix

| # | Database Table | API Exposure | Module | Auth Level | Notes |
|---|---------------|-------------|--------|-----------|-------|
| 1 | `accounts` | **Use-Case endpoints** | Auth | Public (register/login), User (account ops) | OTP-verified registration. Soft-delete only. |
| 2 | `farmer_profiles` | **CRUD (own only)** | Farmer | User (farmer) | Created atomically during registration |
| 3 | `vendor_profiles` | **🚫 No API (v2.0)** | — | — | Marketplace — future |
| 4 | `buyer_profiles` | **🚫 No API (v2.0)** | — | — | Marketplace — future |
| 5 | `farmer_locations` | **CRUD (own only)** | Farmer | User (farmer) | PostGIS centroid |
| 6 | `farmer_land_details` | **CRUD (own only)** | Farmer | User (farmer) | FK validated to own location |
| 7 | `farmer_livestock` | **CRUD (own only)** | Farmer | User (farmer) | NEW — not yet implemented |
| 8 | `projects` | **Use-Case** | Project | User (farmer) | Status machine. No raw edits to internals. |
| 9 | `project_services` | **Nested toggle** | Project | User (farmer) | Enable/disable service per project |
| 10 | `plants` | **Read-Only** | Master | Public | Seed data — never user-modified |
| 11 | `plant_stages` | **Read-Only** | Master | Public | Nested under plants |
| 12 | `plant_nutrient_requirements` | **🚫 No API** | — | — | Internal: soil calculator |
| 13 | `plant_water_requirements` | **🚫 No API** | — | — | Internal: planner engine |
| 14 | `plant_fertilizer_recommendations` | **🚫 No API** | — | — | Internal: planner engine |
| 15 | `plant_diseases` | **Read-Only** | Disease | User | Search + view |
| 16 | `disease_solutions` | **Read-Only** | Disease | User | Filtered by farming method |
| 17 | `plant_pests` | **Read-Only** | Disease | User | Search + view |
| 18 | `pest_solutions` | **Read-Only** | Disease | User | Filtered by farming method |
| 19 | `activity_plans` | **🚫 No API** | — | — | Internal: auto-generated by planner engine |
| 20 | `farming_activities` | **Use-Case** | Planner | User (farmer) | Mark done/skip. Never raw create/delete. |
| 21 | `activity_details` | **🚫 No API** | — | — | Internal: auto-populated by engine |
| 22 | `soil_tests` | **Use-Case** | Soil | User (farmer) | Submit triggers calculator engine |
| 23 | `soil_nutrient_results` | **🚫 No API** | — | — | Internal: child of soil test |
| 24 | `soil_recommendations` | **Read + Mark Applied** | Soil | User (farmer) | Auto-generated, farmer marks applied |
| 25 | `weather_cache` | **🚫 No API** | — | — | Internal: Celery-managed cache |
| 26 | `weather_alerts` | **Read + Acknowledge** | Weather | User (farmer) | Celery-created, farmer reads |
| 27 | `project_issues` | **Use-Case** | Disease | User (farmer) | Report → auto-match → update status |
| 28 | `market_prices` | **Read-Only (User) / Write (Admin)** | Market | Public (read), Admin (write) | Admin adds prices |
| 29 | `market_trends` | **Read-Only** | Market | Public | Celery-computed |
| 30 | `notifications` | **Read + Mark Read** | Notification | User (farmer) | Celery-created, farmer manages |
| 31 | `push_subscriptions` | **Subscribe/Unsubscribe** | Notification | User (farmer) | **NEW TABLE** |
| 32 | `ai_project_summaries` | **Read + Refresh** | AI | User (farmer) | GET (cached), POST (trigger Gemini) |
| 33 | `ai_conversations` | **Read-Only** | AI | User (farmer) | Auto-created on first chat |
| 34 | `ai_query_logs` | **🚫 No API** | — | — | Internal: audit logging |
| 35 | `vendor_products` | **🚫 No API (v2.0)** | — | — | Marketplace — future |
| 36 | `harvest_listings` | **🚫 No API (v2.0)** | — | — | Marketplace — future |

---

# Part D — Module Specifications

---

## Module 1: Auth

**Router:** `modules/auth/router.py`
**Prefix:** `/auth`
**Tag:** `auth`

### Endpoint 1.1 — Request Registration OTP

Initiates registration. Does NOT create the account yet — sends OTP first.

```
POST /auth/register/request-otp
```

**Auth:** None (public)
**Rate Limit:** 5/min per IP, 3 OTP/hr per email

**Request Body:**
```python
class RegisterOTPRequest(BaseModel):
    email: EmailStr
    phone: Optional[str] = None  # E.164 format
```

**Business Logic:**
1. Validate email/phone format
2. Check if email or phone already exists in `accounts` → raise `AUTH_REGISTER_EMAIL_EXISTS` / `AUTH_REGISTER_PHONE_EXISTS`
3. Generate 6-digit OTP via `core/otp.py`
4. Dispatch `send_otp_email_task.delay(email, code, "register")` via Celery
5. If phone provided, also send SMS via `send_otp_sms_task.delay(phone, code, "register")`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Verification code sent to farmer@example.com",
    "otp_sent_to": "farmer@example.com",
    "expires_in_seconds": 300
  }
}
```

**Errors:** `AUTH_REGISTER_EMAIL_EXISTS (409)`, `AUTH_REGISTER_PHONE_EXISTS (409)`, `OTP_RATE_LIMITED (429)`, `OTP_SEND_FAILED (502)`

---

### Endpoint 1.2 — Complete Registration

Verifies OTP and creates the account + farmer profile atomically.

```
POST /auth/register/verify
```

**Auth:** None (public)

**Request Body:**
```python
class RegisterVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    password: str = Field(..., min_length=8, max_length=72)
    full_name: str = Field(..., min_length=2, max_length=255)
    farming_method: FarmingMethod  # enum: organic, inorganic, integrated
    primary_language: str = Field(default="en", max_length=10)
    phone: Optional[str] = None

    # Optional: register location in same step
    location: Optional[LocationData] = None
```

**Business Logic:**
1. Call `verify_otp("register", email, otp_code)` → raises on invalid/expired
2. Re-check email uniqueness (race condition guard)
3. Hash password with bcrypt
4. **Atomic transaction:** Create `Account` → `FarmerProfile` → optionally `FarmerLocation`
5. Generate access + refresh tokens
6. Store refresh token in Redis
7. Set refresh token as httpOnly cookie

**Response 201:**
```json
{
  "success": true,
  "data": {
    "account_id": "uuid",
    "farmer_profile_id": "uuid",
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 900
  }
}
```

**Side Effects:**
- Refresh token cookie set
- Refresh token stored in Redis (30-day TTL)

**Errors:** `OTP_INVALID (400)`, `OTP_EXPIRED (400)`, `OTP_MAX_ATTEMPTS (429)`, `AUTH_REGISTER_EMAIL_EXISTS (409)`, `AUTH_REGISTER_INVALID_METHOD (409)`

---

### Endpoint 1.3 — Login

```
POST /auth/login
```

**Auth:** None (public)
**Rate Limit:** 5/min per IP

**Request Body:**
```python
class LoginRequest(BaseModel):
    email_or_phone: str
    password: str = Field(..., max_length=72)
```

**Business Logic:**
1. Look up account by email OR phone (`SELECT ... WHERE email = x OR phone = x`)
2. Verify bcrypt password hash → raise generic error (no user enumeration)
3. Check `is_active` → raise `AUTH_LOGIN_ACCOUNT_DEACTIVATED`
4. Update `last_login_at = now()`
5. Generate access + refresh tokens (include `role` in JWT payload)
6. Store refresh token in Redis, set httpOnly cookie

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 900,
    "role": "farmer"
  }
}
```

**Errors:** `AUTH_LOGIN_INVALID_CREDENTIALS (401)`, `AUTH_LOGIN_ACCOUNT_DEACTIVATED (403)`, `RATE_LIMITED (429)`

---

### Endpoint 1.4 — Refresh Token

```
POST /auth/refresh
```

**Auth:** None (reads httpOnly cookie)

**Business Logic:**
1. Read `refresh_token` from httpOnly cookie
2. Decode JWT, validate signature + expiry
3. Compare against Redis stored token
4. Rotate: generate new access + refresh tokens
5. Update Redis, update cookie

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_eyJ...",
    "token_type": "bearer",
    "expires_in": 900
  }
}
```

**Errors:** `AUTH_REFRESH_TOKEN_MISSING (401)`, `AUTH_REFRESH_TOKEN_INVALID (401)`

---

### Endpoint 1.5 — Logout

```
POST /auth/logout
```

**Auth:** Bearer token (any authenticated user)

**Business Logic:**
1. Delete refresh token from Redis: `DEL refresh_token:{user_id}`
2. Clear httpOnly cookie (set expired)

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

---

### Endpoint 1.6 — Get Current User

```
GET /auth/me
```

**Auth:** Bearer token

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "farmer@example.com",
    "phone": "+94771234567",
    "role": "farmer",
    "is_verified": true,
    "farmer_profile": {
      "id": "uuid",
      "full_name": "Nimal Perera",
      "farming_method": "organic",
      "primary_language": "en",
      "experience_years": 5
    }
  }
}
```

---

### Endpoint 1.7 — Change Password

```
PATCH /auth/change-password
```

**Auth:** Bearer token

**Request Body:**
```python
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=72)
```

**Business Logic:**
1. Verify `current_password` against stored hash → raise `AUTH_PASSWORD_WRONG_CURRENT`
2. Check `new_password != current_password` → raise `AUTH_PASSWORD_SAME_AS_CURRENT`
3. Hash new password, update `account.password_hash`
4. **Invalidate all refresh tokens:** `DEL refresh_token:{user_id}`
5. Generate fresh access + refresh tokens, return them

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully.",
    "access_token": "new_eyJ...",
    "token_type": "bearer"
  }
}
```

**Side Effects:** All other sessions are logged out (refresh token invalidated)

**Errors:** `AUTH_PASSWORD_WRONG_CURRENT (401)`, `AUTH_PASSWORD_SAME_AS_CURRENT (400)`

---

### Endpoint 1.8 — Forgot Password: Request OTP

```
POST /auth/forgot-password/request-otp
```

**Auth:** None (public)
**Rate Limit:** 3 OTP/hr per identifier

**Request Body:**
```python
class ForgotPasswordOTPRequest(BaseModel):
    email_or_phone: str
```

**Business Logic:**
1. Look up account by email or phone
2. If not found → return `200` anyway (no user enumeration)
3. Generate OTP, send via email or SMS (Celery)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "If an account exists, a verification code has been sent.",
    "expires_in_seconds": 300
  }
}
```

---

### Endpoint 1.9 — Forgot Password: Verify OTP & Reset

```
POST /auth/forgot-password/verify
```

**Auth:** None (public)

**Request Body:**
```python
class ForgotPasswordVerifyRequest(BaseModel):
    email_or_phone: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=72)
```

**Business Logic:**
1. Verify OTP for `"forgot_password"` purpose
2. Look up account, hash new password, update
3. Invalidate all refresh tokens
4. Generate fresh tokens, return them (auto-login after reset)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully.",
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

**Errors:** `OTP_INVALID (400)`, `OTP_EXPIRED (400)`, `AUTH_ACCOUNT_NOT_FOUND (404)`

---

### Endpoint 1.10 — Change Email: Request OTP

```
POST /auth/change-email/request-otp
```

**Auth:** Bearer token

**Request Body:**
```python
class ChangeEmailRequest(BaseModel):
    new_email: EmailStr
```

**Business Logic:**
1. Check `new_email` not already in use by another account
2. Generate OTP for `"change_email"` purpose, identifier = `new_email`
3. Store old email in OTP context: `{"old_email": "...", "user_id": "..."}`
4. Send OTP to **new email** (verify they own it)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Verification code sent to new_email@example.com",
    "expires_in_seconds": 300
  }
}
```

**Errors:** `AUTH_EMAIL_ALREADY_IN_USE (409)`, `OTP_RATE_LIMITED (429)`

---

### Endpoint 1.11 — Change Email: Verify OTP

```
POST /auth/change-email/verify
```

**Auth:** Bearer token

**Request Body:**
```python
class ChangeEmailVerifyRequest(BaseModel):
    new_email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
```

**Business Logic:**
1. Verify OTP for `"change_email"` purpose, identifier = `new_email`
2. Validate context `user_id` matches `current_user.id` (prevent hijacking)
3. Update `account.email = new_email`

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Email updated successfully.", "email": "new_email@example.com" }
}
```

---

### Endpoint 1.12 — Change Phone: Request OTP

```
POST /auth/change-phone/request-otp
```

Same pattern as 1.10 but for phone. OTP sent via SMS.

---

### Endpoint 1.13 — Change Phone: Verify OTP

```
POST /auth/change-phone/verify
```

Same pattern as 1.11 but for phone.

---

### Endpoint 1.14 — Soft-Delete Account

```
DELETE /auth/account
```

**Auth:** Bearer token

**Business Logic:**
1. Set `account.is_active = False`
2. Delete all refresh tokens from Redis
3. Clear httpOnly cookie
4. Never hard-delete

**Response 204:** No Content

---

### Endpoint 1.15 — Swagger Docs Login (Hidden)

```
POST /auth/docs-login
```

**Auth:** OAuth2PasswordRequestForm (Swagger UI)
**Include in Schema:** `False`

Translates Swagger form login to `LoginRequest`.

---

### Auth Module Summary

| # | Endpoint | Method | Auth | Status |
|---|----------|--------|------|--------|
| 1.1 | `/auth/register/request-otp` | POST | Public | **NEW** |
| 1.2 | `/auth/register/verify` | POST | Public | **NEW** (replaces current register) |
| 1.3 | `/auth/login` | POST | Public | EXISTS (modify for role in JWT) |
| 1.4 | `/auth/refresh` | POST | Cookie | EXISTS |
| 1.5 | `/auth/logout` | POST | Bearer | **NEW** |
| 1.6 | `/auth/me` | GET | Bearer | EXISTS |
| 1.7 | `/auth/change-password` | PATCH | Bearer | **NEW** |
| 1.8 | `/auth/forgot-password/request-otp` | POST | Public | **NEW** |
| 1.9 | `/auth/forgot-password/verify` | POST | Public | **NEW** |
| 1.10 | `/auth/change-email/request-otp` | POST | Bearer | **NEW** |
| 1.11 | `/auth/change-email/verify` | POST | Bearer | **NEW** |
| 1.12 | `/auth/change-phone/request-otp` | POST | Bearer | **NEW** |
| 1.13 | `/auth/change-phone/verify` | POST | Bearer | **NEW** |
| 1.14 | `/auth/account` | DELETE | Bearer | EXISTS |
| 1.15 | `/auth/docs-login` | POST | Form | EXISTS (hidden) |

---

## Module 2: Farmer

**Router:** `modules/farmer/router.py`
**Prefix:** `/farmer`
**Auth:** All endpoints require Bearer token (farmer role)

### 2A. Profile

| # | Endpoint | Method | Business Rule | Status |
|---|----------|--------|---------------|--------|
| 2.1 | `/farmer/profile` | GET | Return own profile. Raise `FARMER_PROFILE_NOT_FOUND` if missing. | EXISTS |
| 2.2 | `/farmer/profile` | PUT | Update `full_name`, `primary_language`, `farming_method`, `experience_years`, `gender`, `education_level`, `bio`, `avatar_url`. Partial update (only set non-null fields). Cannot change `account_id`. | EXISTS |

**Request Body (2.2):**
```python
class FarmerProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    primary_language: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0, le=99)
    farming_method: Optional[FarmingMethod] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)
    avatar_url: Optional[str] = None
```

### 2B. Locations

| # | Endpoint | Method | Business Rule | Errors |
|---|----------|--------|---------------|--------|
| 2.3 | `/farmer/locations` | POST | Validate farmer profile exists. If `is_primary=true`, reset all others to `false`. Store centroid as PostGIS POINT from lat/lng. | `FARMER_PROFILE_NOT_FOUND` |
| 2.4 | `/farmer/locations` | GET | Return all locations for current farmer. Empty list if no profile. | — |
| 2.5 | `/farmer/locations/{id}` | GET | **NEW.** Return single location with details. Validate ownership. | `FARMER_LOCATION_NOT_FOUND`, `FARMER_LOCATION_FORBIDDEN` |
| 2.6 | `/farmer/locations/{id}` | PUT | Validate ownership. Handle `is_primary` toggle. | `FARMER_LOCATION_NOT_FOUND`, `FARMER_LOCATION_FORBIDDEN` |
| 2.7 | `/farmer/locations/{id}` | DELETE | Validate ownership. Check no active projects reference this location (`SELECT EXISTS ... WHERE location_id = x AND status IN ('active','planning')`). Hard delete. | `FARMER_LOCATION_NOT_FOUND`, `FARMER_LOCATION_FORBIDDEN`, `FARMER_LOCATION_HAS_PROJECTS` |

### 2C. Land Details

| # | Endpoint | Method | Business Rule | Errors |
|---|----------|--------|---------------|--------|
| 2.8 | `/farmer/land` | POST | Validate `location_id` belongs to current farmer (FK guard). | `FARMER_LAND_INVALID_LOCATION` |
| 2.9 | `/farmer/land` | GET | Return all land records for current farmer. | — |
| 2.10 | `/farmer/land/{id}` | GET | **NEW.** Single land detail. Validate ownership. | `FARMER_LAND_NOT_FOUND`, `FARMER_LAND_FORBIDDEN` |
| 2.11 | `/farmer/land/{id}` | PUT | Validate ownership. Cannot change `location_id`. | `FARMER_LAND_NOT_FOUND`, `FARMER_LAND_FORBIDDEN` |
| 2.12 | `/farmer/land/{id}` | DELETE | Validate ownership. Hard delete. | `FARMER_LAND_NOT_FOUND`, `FARMER_LAND_FORBIDDEN` |

### 2D. Livestock (NEW)

| # | Endpoint | Method | Business Rule | Errors |
|---|----------|--------|---------------|--------|
| 2.13 | `/farmer/livestock` | POST | **NEW.** Validate farmer profile. Create record. | `FARMER_PROFILE_NOT_FOUND` |
| 2.14 | `/farmer/livestock` | GET | **NEW.** Return all livestock for current farmer. | — |
| 2.15 | `/farmer/livestock/{id}` | PUT | **NEW.** Validate ownership. Update. | `FARMER_LIVESTOCK_NOT_FOUND`, `FARMER_LIVESTOCK_FORBIDDEN` |
| 2.16 | `/farmer/livestock/{id}` | DELETE | **NEW.** Validate ownership. Hard delete. | `FARMER_LIVESTOCK_NOT_FOUND`, `FARMER_LIVESTOCK_FORBIDDEN` |

**Request Body (2.13):**
```python
class LivestockCreate(BaseModel):
    animal_type: str = Field(..., max_length=100)
    count: int = Field(..., ge=1)
    purpose: Optional[str] = Field(None, max_length=100)  # dairy, meat, eggs, draft
```

**Response (2.13–2.15):**
```python
class LivestockResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    animal_type: str
    count: int
    purpose: Optional[str]
    model_config = ConfigDict(from_attributes=True)
```

---

## Module 3: Projects

**Router:** `modules/project/router.py`
**Prefix:** `/projects`
**Auth:** Bearer token (farmer role)

### 3A. Project CRUD

| # | Endpoint | Method | Business Rule | Side Effects |
|---|----------|--------|---------------|-------------|
| 3.1 | `/projects` | POST | Validate `plant_id` exists and `is_active`. Validate `location_id` belongs to farmer. Validate `land_detail_id` belongs to farmer (if provided). Validate `farming_method` is valid enum. Calculate `expected_harvest_date = planting_date + plant.growth_duration_days`. Set `status=planning`, `plan_generation_status=pending`. | **Celery:** `generate_season_plan_task.delay(project_id)` |
| 3.2 | `/projects` | GET | List farmer's projects. Filter: `?status=active&page=1&per_page=20`. | — |
| 3.3 | `/projects/{id}` | GET | Validate ownership. Return full project with plant info. | — |
| 3.4 | `/projects/{id}` | PUT | Update `name`, `area`, `area_unit`. Cannot change `plant_id` or `location_id` after plan is generated (if `plan_generation_status = completed`). | — |
| 3.5 | `/projects/{id}/status` | PATCH | **Status machine** — validate transition against `PROJECT_STATUS_TRANSITIONS`. Require `actual_harvest_date` when → `harvested`. Calculate `actual_yield_kg` on harvest. | Cache invalidation |
| 3.6 | `/projects/{id}` | DELETE | Validate ownership. Hard delete (cascades activities, issues, soil tests). | Cache invalidation |
| 3.7 | `/projects/{id}/dashboard` | GET | 11 parallel sub-queries via `asyncio.gather()`. Redis 3-min cache. | — |

**Request Body (3.1):**
```python
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    plant_id: uuid.UUID
    location_id: uuid.UUID
    land_detail_id: Optional[uuid.UUID] = None
    area: float = Field(..., gt=0, le=1000)
    area_unit: str = Field(default="acres", pattern="^(acres|hectares|perches)$")
    farming_method: FarmingMethod
    planting_date: date
```

**Request Body (3.5):**
```python
class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus
    actual_harvest_date: Optional[date] = None  # Required when status = harvested
    actual_yield_kg: Optional[float] = None
    actual_revenue: Optional[float] = None
    failure_reason: Optional[str] = None  # Required when status = failed
```

**Status Machine Enforcement Logic:**
```python
async def update_project_status(db, project_id, user_id, data):
    project = await _get_owned_project(db, project_id, user_id)
    current = ProjectStatus(project.status)
    target = data.status

    if target not in PROJECT_STATUS_TRANSITIONS[current]:
        raise AppException(
            ErrorCode.PROJECT_INVALID_STATUS_TRANSITION,
            detail=f"Cannot transition from '{current.value}' to '{target.value}'."
        )

    if target == ProjectStatus.HARVESTED and not data.actual_harvest_date:
        raise AppException(ErrorCode.PROJECT_STATUS_REQUIRES_DATE)

    project.status = target.value
    if data.actual_harvest_date:
        project.actual_harvest_date = data.actual_harvest_date
    ...
```

### 3B. Project Services (NEW)

| # | Endpoint | Method | Business Rule |
|---|----------|--------|---------------|
| 3.8 | `/projects/{id}/services` | GET | Return all 6 service types with `is_active` status for this project. Auto-create records if missing (default all active). |
| 3.9 | `/projects/{id}/services/{service_type}` | PATCH | Toggle `is_active` for a specific service. Body: `{"is_active": false}`. |

**Response (3.8):**
```json
{
  "success": true,
  "data": [
    { "service_type": "weather", "is_active": true },
    { "service_type": "soil", "is_active": true },
    { "service_type": "disease", "is_active": true },
    { "service_type": "ai", "is_active": false },
    { "service_type": "market", "is_active": true },
    { "service_type": "notifications", "is_active": true }
  ]
}
```

---

## Module 4: Master Data

**Router:** `modules/project/router.py` → `master_router`
**Auth:** None (public read-only)

| # | Endpoint | Method | Notes | Status |
|---|----------|--------|-------|--------|
| 4.1 | `/plants` | GET | List active plants. Filter: `?category=vegetable&search=tomato`. | EXISTS |
| 4.2 | `/plants/{id}` | GET | **NEW.** Full plant detail with optimal conditions. | NEW |
| 4.3 | `/plants/{id}/stages` | GET | Ordered by `stage_order`. | EXISTS |
| 4.4 | `/plants/{id}/diseases` | GET | **NEW.** Diseases affecting this plant. | NEW |
| 4.5 | `/plants/{id}/pests` | GET | **NEW.** Pests affecting this plant. | NEW |
| 4.6 | `/farming-methods` | GET | Return 3 methods: organic, inorganic, integrated. | EXISTS |

---

## Module 5: Planner

**Router:** `modules/planner/router.py`
**Prefix:** `/planner`
**Auth:** Bearer token (farmer role)

| # | Endpoint | Method | Business Rule | Side Effects | Status |
|---|----------|--------|---------------|-------------|--------|
| 5.1 | `/planner/{project_id}/today` | GET | Filter activities: `planned_date = today` AND `status = pending`. Validate project ownership. Check `plan_generation_status = completed`. | — | EXISTS |
| 5.2 | `/planner/{project_id}/activities` | GET | Full season plan. Filter: `?status=pending&activity_type=watering&stage_id=uuid&from_date=2025-04-01&to_date=2025-04-30&page=1`. | — | EXISTS |
| 5.3 | `/planner/activities/{id}` | GET | **NEW.** Single activity with `activity_details` (water liters, fertilizer kg, notes). | — | NEW |
| 5.4 | `/planner/activities/{id}/complete` | PATCH | Set `status=done`, `completed_at=now()`. Record `notes`, `actual_water_liters`, `actual_fertilizer_kg`. Idempotency check: raise `PLANNER_ACTIVITY_ALREADY_DONE` if already done. | `invalidate_dashboard_cache()` | EXISTS |
| 5.5 | `/planner/activities/{id}/skip` | PATCH | Set `status=skipped`. Record `skipped_reason` (required). Idempotency check. | `invalidate_dashboard_cache()` | EXISTS |
| 5.6 | `/planner/{project_id}/stats` | GET | **NEW.** Aggregate counts: total, pending, done, skipped, rescheduled. Progress %. Today's count. | — | NEW |

**Response (5.6):**
```json
{
  "success": true,
  "data": {
    "total": 77,
    "pending": 32,
    "done": 38,
    "skipped": 5,
    "rescheduled": 2,
    "progress_pct": 55.8,
    "today_pending": 3,
    "today_done": 1
  }
}
```

---

## Module 6: Weather

**Router:** `modules/weather/router.py`
**Prefix:** `/weather`
**Auth:** Bearer token

| # | Endpoint | Method | Business Rule | Status |
|---|----------|--------|---------------|--------|
| 6.1 | `/weather/{project_id}` | GET | Cache check order: Redis → PostgreSQL `weather_cache` → OpenWeatherMap API. Return current + 5-day forecast. If API fails, return stale cache (never 500). | EXISTS |
| 6.2 | `/weather/{project_id}/alerts` | GET | Return active (unresolved) weather alerts for project. | EXISTS |
| 6.3 | `/weather/alerts/{id}/acknowledge` | PATCH | **NEW.** Set `is_resolved = true`. Validate project ownership via alert → project → farmer chain. | NEW |

---

## Module 7: Soil

**Router:** `modules/soil/router.py`
**Prefix:** `/soil`
**Auth:** Bearer token

| # | Endpoint | Method | Business Rule | Side Effects | Status |
|---|----------|--------|---------------|-------------|--------|
| 7.1 | `/soil/tests/{project_id}` | POST | Validate ownership. Reject all-zero values. Require `ph > 0`. **Atomic:** Create `SoilTest` + `SoilNutrientResult`. Run `calculator.compute_recommendations()` → generate `SoilRecommendation` records. | `invalidate_dashboard_cache()` | EXISTS |
| 7.2 | `/soil/tests/{project_id}` | GET | List all soil tests for project, newest first. | — | EXISTS |
| 7.3 | `/soil/tests/{project_id}/latest` | GET | **NEW.** Return latest test with full results + recommendations. | — | NEW |
| 7.4 | `/soil/recommendations/{project_id}` | GET | Return latest recommendations. | — | EXISTS |
| 7.5 | `/soil/recommendations/{id}/applied` | PATCH | **NEW.** Set `is_applied=true`, `applied_at=now()`. | — | NEW |

---

## Module 8: Disease

**Router:** `modules/disease/router.py`
**Prefix:** `/disease`
**Auth:** Bearer token

| # | Endpoint | Method | Business Rule | Status |
|---|----------|--------|---------------|--------|
| 8.1 | `/disease/issues/{project_id}` | POST | Validate ownership. Run PostgreSQL FTS `ts_rank` against `plant_diseases`. If rank > 0.1 → DB match + solutions. If rank ≤ 0.1 → route to Gemini (check `diagnosis` quota, 2/day). Store `source: "database"` or `"ai_gemini"`. | EXISTS |
| 8.2 | `/disease/issues/{project_id}` | GET | List issues for project. Filter: `?status=open&severity=high`. | EXISTS |
| 8.3 | `/disease/issues/{id}/status` | PATCH | **NEW.** Status machine: `open→diagnosed→resolved→monitoring`. Validate ownership. | NEW |
| 8.4 | `/disease/search` | GET | Full-text search. Filter: `?q=yellow+spots&plant_id=uuid`. | EXISTS |
| 8.5 | `/disease/{disease_id}/solutions` | GET | Filter by `?farming_method=organic`. | EXISTS |
| 8.6 | `/disease/pests/search` | GET | **NEW.** Search pests by name/signs. Filter: `?q=caterpillar&plant_id=uuid`. | NEW |
| 8.7 | `/disease/pests/{pest_id}/solutions` | GET | **NEW.** Pest solutions filtered by farming method. | NEW |
| 8.8 | `/disease/identify-image` | POST | Placeholder → `501 Not Implemented`. | EXISTS (stub) |

**Request Body (8.3):**
```python
class IssueStatusUpdate(BaseModel):
    status: IssueStatus  # enum validated
    resolution_notes: Optional[str] = None
```

---

## Module 9: AI

**Router:** `modules/ai/router.py`
**Prefix:** `/ai`
**Auth:** Bearer token

| # | Endpoint | Method | Business Rule | Side Effects | Status |
|---|----------|--------|---------------|-------------|--------|
| 9.1 | `/ai/{project_id}/summary` | GET | Return cached summary from `ai_project_summaries`. **Never calls Gemini.** If no summary exists → return placeholder with "Click Generate". | — | EXISTS |
| 9.2 | `/ai/{project_id}/summary` | POST | **NEW.** Check context hash → skip if unchanged (save Gemini call). Check `refresh` quota (3/day). Build context → call Gemini → store result. | `invalidate_dashboard_cache()` | NEW |
| 9.3 | `/ai/{project_id}/chat` | POST | Route via intent classifier (regex). Deterministic intents (weather, schedule, price) → DB lookup, no AI call. Open-ended → Gemini (`chat` quota, 5/day). Auto-create conversation if `conversation_id` is null. | — | EXISTS |
| 9.4 | `/ai/{project_id}/conversations` | GET | List conversations for project. | — | EXISTS |
| 9.5 | `/ai/conversations/{id}/messages` | GET | Return messages for a conversation. Validate ownership. | — | EXISTS |
| 9.6 | `/ai/usage` | GET | **NEW.** Return today's remaining quota per bucket. | — | NEW |

**Response (9.2):**
```json
{
  "success": true,
  "data": {
    "summary": "📊 Your tomato crop is in Flowering stage (Day 45/90)...",
    "generated_at": "2025-04-15T10:30:00Z",
    "model": "gemini-2.0-flash",
    "cost_usd": 0.00,
    "context_changed": true,
    "quota_remaining": { "refresh": 2, "chat": 5, "diagnosis": 2 }
  }
}
```

**Response (9.6):**
```json
{
  "success": true,
  "data": {
    "chat": { "used": 2, "limit": 5, "remaining": 3 },
    "refresh": { "used": 1, "limit": 3, "remaining": 2 },
    "diagnosis": { "used": 0, "limit": 2, "remaining": 2 },
    "resets_at": "2025-04-16T00:00:00Z"
  }
}
```

---

## Module 10: Market

**Router:** `modules/market/router.py`
**Prefix:** `/market`

| # | Endpoint | Method | Auth | Business Rule | Status |
|---|----------|--------|------|---------------|--------|
| 10.1 | `/market/prices/{plant_id}` | GET | Public | Prices for plant in region. Filter: `?region=Jaffna&days=30`. | EXISTS |
| 10.2 | `/market/trends/{plant_id}` | GET | Public | Computed trend: direction, % change, 30-day stats. | EXISTS |
| 10.3 | `/market/estimate/{project_id}` | GET | Bearer | Revenue estimate: `area × yield_per_acre × latest_price`. | EXISTS |
| 10.4 | `/market/admin/prices` | POST | **Admin** | **NEW.** Manually add market prices. Batch support. | NEW |
| 10.5 | `/market/admin/prices/{id}` | PUT | **Admin** | **NEW.** Update a price record. | NEW |
| 10.6 | `/market/admin/prices/{id}` | DELETE | **Admin** | **NEW.** Delete a price record. | NEW |

**Request Body (10.4):**
```python
class MarketPriceCreate(BaseModel):
    plant_id: uuid.UUID
    region: str
    date: date
    price_per_kg: float = Field(..., gt=0)
    currency: str = "LKR"
    source: Optional[str] = None
```

---

## Module 11: Notifications

**Router:** `modules/notification/router.py`
**Prefix:** `/notifications`
**Auth:** Bearer token

| # | Endpoint | Method | Business Rule | Status |
|---|----------|--------|---------------|--------|
| 11.1 | `/notifications` | GET | List farmer's notifications. Filter: `?unread_only=true&type=activity_reminder&limit=50`. Sorted by `created_at DESC`. Paginated. | EXISTS |
| 11.2 | `/notifications/{id}/read` | PATCH | Mark single notification read. Validate ownership. | EXISTS |
| 11.3 | `/notifications/read-all` | PATCH | Bulk mark all unread as read for farmer. | EXISTS |
| 11.4 | `/notifications/count` | GET | Return `{unread: 5, total: 42}`. Used by TopBar bell. | EXISTS |
| 11.5 | `/notifications/{id}` | DELETE | **NEW.** Hard delete single notification. Validate ownership. | NEW |
| 11.6 | `/notifications/subscribe` | POST | **NEW.** Store Web Push subscription. Body: `{endpoint, keys: {p256dh, auth}}`. Upsert on `endpoint`. | NEW |
| 11.7 | `/notifications/subscribe` | DELETE | **NEW.** Remove push subscription by endpoint. | NEW |

**Request Body (11.6):**
```python
class PushSubscribeRequest(BaseModel):
    endpoint: str
    keys: PushKeys

class PushKeys(BaseModel):
    p256dh: str
    auth: str
```

---

## Module 12: Admin

**Router:** `modules/admin/router.py` **(NEW MODULE)**
**Prefix:** `/admin`
**Auth:** Bearer token + admin role

### Admin Endpoints

| # | Endpoint | Method | Business Rule |
|---|----------|--------|---------------|
| 12.1 | `/admin/users` | GET | List all user accounts. Filter: `?role=farmer&is_active=true&search=nimal&page=1`. Paginated. |
| 12.2 | `/admin/users/{id}` | GET | Get user detail with profile. |
| 12.3 | `/admin/users/{id}/deactivate` | PATCH | Soft-delete: `is_active = False`. Cannot deactivate self. Invalidate their refresh tokens. |
| 12.4 | `/admin/users/{id}/reactivate` | PATCH | Restore: `is_active = True`. |
| 12.5 | `/admin/users/{id}/role` | PATCH | Change user role (`farmer ↔ admin`). Body: `{"role": "admin"}`. |
| 12.6 | `/admin/stats` | GET | Dashboard stats: total users, active projects, AI calls today, etc. |
| 12.7 | `/admin/projects` | GET | List all projects across all farmers. Filter by status, plant, date. Paginated. |
| 12.8 | `/admin/projects/{id}` | GET | View any project detail (admin override, no ownership check). |
| 12.9 | `/admin/ai/usage` | GET | AI usage stats: total calls today, per-farmer breakdown, quota utilization. |
| 12.10 | `/admin/seed/validate` | POST | Run seed data validator. Return validation report. |

**Response (12.1):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "farmer@example.com",
      "phone": "+94771234567",
      "role": "farmer",
      "is_active": true,
      "last_login_at": "2025-04-15T10:30:00Z",
      "created_at": "2025-03-01T08:00:00Z",
      "farmer_profile": { "full_name": "Nimal Perera", "farming_method": "organic" },
      "project_count": 3
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 150, "total_pages": 8 }
}
```

**Response (12.6):**
```json
{
  "success": true,
  "data": {
    "users": { "total": 150, "active": 142, "deactivated": 8, "admins": 2 },
    "projects": { "total": 287, "active": 195, "harvested": 72, "failed": 20 },
    "ai": { "calls_today": 34, "quota_utilization_pct": 22.7 },
    "notifications": { "sent_today": 89, "push_subscribers": 120 }
  }
}
```

### Admin Module File Structure

```
modules/admin/
├── __init__.py
├── router.py      ← All admin endpoints
├── service.py     ← Business logic
└── schemas.py     ← Admin-specific request/response models
```

---

# Part E — Celery Background Tasks

## Task Registry

| Task File | Task Name | Trigger | Schedule | Side Effects |
|-----------|-----------|---------|----------|-------------|
| `tasks/planner_tasks.py` | `generate_season_plan_task` | Project creation | On-demand | Creates ~77 activities. Updates `plan_generation_status`. |
| `tasks/weather_tasks.py` | `refresh_weather_cache` | Celery Beat | Every 3 hours | Updates Redis + PostgreSQL cache |
| `tasks/weather_tasks.py` | `adjust_plan_for_weather` | Celery Beat | Daily at 5:00 AM | Skips/reschedules activities. Creates alerts. `invalidate_dashboard_cache()`. |
| `tasks/weather_tasks.py` | `check_weather_alerts` | Celery Beat | Every 6 hours | Creates `WeatherAlert` records. Creates notifications. |
| `tasks/notification_tasks.py` | `send_daily_notifications` | Celery Beat | Daily at 5:30 AM | Creates `Notification` DB records. Sends push notifications. |
| `tasks/market_tasks.py` | `compute_market_trends` | Celery Beat | Daily at midnight | Computes `MarketTrend` records. Creates `market_alert` notifications if price change > 15%. |
| `tasks/ai_tasks.py` | `generate_weekly_ai_summary` | Celery Beat | Sunday at 6:00 AM | Iterates active projects. 4-second throttle between calls. Creates/updates `AIProjectSummary`. |
| `tasks/otp_tasks.py` | `send_otp_email_task` | OTP request | On-demand | Sends OTP via SMTP. Max retries: 2. |
| `tasks/otp_tasks.py` | `send_otp_sms_task` | OTP request | On-demand | Sends OTP via Twilio SMS. Max retries: 2. |

## Celery Beat Schedule — `tasks/celery_app.py`

```python
celery_app.conf.beat_schedule = {
    "refresh-weather-cache": {
        "task": "tasks.weather_tasks.refresh_weather_cache",
        "schedule": crontab(minute=0, hour="*/3"),   # Every 3 hours
    },
    "adjust-plan-for-weather": {
        "task": "tasks.weather_tasks.adjust_plan_for_weather",
        "schedule": crontab(minute=0, hour=5),        # 5:00 AM daily
    },
    "check-weather-alerts": {
        "task": "tasks.weather_tasks.check_weather_alerts",
        "schedule": crontab(minute=0, hour="*/6"),    # Every 6 hours
    },
    "send-daily-notifications": {
        "task": "tasks.notification_tasks.send_daily_notifications",
        "schedule": crontab(minute=30, hour=5),       # 5:30 AM daily
    },
    "compute-market-trends": {
        "task": "tasks.market_tasks.compute_market_trends",
        "schedule": crontab(minute=0, hour=0),        # Midnight daily
    },
    "generate-weekly-ai-summary": {
        "task": "tasks.ai_tasks.generate_weekly_ai_summary",
        "schedule": crontab(minute=0, hour=6, day_of_week=0),  # Sunday 6 AM
    },
}
```

---

# Part F — Implementation Priority & Checklist

## Phase 1: Error & Response Infrastructure (All Modules Depend On This)

- [ ] Create `core/errors/__init__.py`
- [ ] Create `core/errors/error_codes.py` — ErrorCode enum
- [ ] Create `core/errors/messages.py` — ERROR_MESSAGES dict
- [ ] Create `core/errors/exceptions.py` — AppException + shortcuts
- [ ] Create `core/errors/handlers.py` — Global handlers
- [ ] Create `core/response.py` — Response envelope helpers
- [ ] Create `core/enums.py` — All shared enums
- [ ] Create `core/pagination.py` — PaginationParams
- [ ] Register exception handlers in `main.py`
- [ ] **Test:** Verify error response format for 3 error codes

## Phase 2: OTP & Rate Limiting Infrastructure

- [ ] Create `core/otp.py` — generate_otp(), verify_otp()
- [ ] Create `core/rate_limiter.py` — check_rate_limit()
- [ ] Create `tasks/otp_tasks.py` — send_otp_email_task, send_otp_sms_task
- [ ] Add SMTP/Twilio config to `config.py`
- [ ] **Test:** OTP generate → verify → expire → max attempts

## Phase 3: RBAC & Auth Refactor

- [ ] Add `get_current_farmer` dependency
- [ ] Add `get_admin_user` dependency
- [ ] Add `role` claim to JWT token payload
- [ ] Refactor `modules/auth/router.py`:
  - [ ] Replace `POST /register` with `POST /register/request-otp` + `POST /register/verify`
  - [ ] Add `POST /logout`
  - [ ] Add `PATCH /change-password`
  - [ ] Add `POST /forgot-password/request-otp` + `POST /forgot-password/verify`
  - [ ] Add `POST /change-email/request-otp` + `POST /change-email/verify`
  - [ ] Add `POST /change-phone/request-otp` + `POST /change-phone/verify`
- [ ] Refactor `modules/auth/service.py` → replace all `HTTPException` with `AppException`
- [ ] Refactor `modules/auth/schemas.py` → add all new schemas
- [ ] **Test:** Full registration OTP flow, forgot password flow

## Phase 4: Refactor Existing Modules (Error System)

- [ ] `modules/farmer/` → replace HTTPException with AppException
  - [ ] Add livestock CRUD (4 endpoints)
  - [ ] Add `GET /locations/{id}`, `GET /land/{id}`
- [ ] `modules/project/` → replace HTTPException with AppException
  - [ ] Add status transition validation with enum
  - [ ] Add project services endpoints (GET list, PATCH toggle)
- [ ] `modules/planner/` → add idempotency checks
  - [ ] Add `GET /activities/{id}` (single activity)
  - [ ] Add `GET /{project_id}/stats`
- [ ] `modules/weather/` → add `PATCH /alerts/{id}/acknowledge`
- [ ] `modules/soil/` → add `GET /tests/{id}/latest`, `PATCH /recommendations/{id}/applied`
- [ ] `modules/disease/` → add `PATCH /issues/{id}/status`, pest search/solutions
- [ ] `modules/ai/` → add `POST /summary` (refresh), `GET /usage`
- [ ] `modules/market/` → add admin price CRUD
- [ ] `modules/notification/` → add subscribe/unsubscribe/delete

## Phase 5: Admin Module (New)

- [ ] Create `modules/admin/__init__.py`
- [ ] Create `modules/admin/router.py`
- [ ] Create `modules/admin/service.py`
- [ ] Create `modules/admin/schemas.py`
- [ ] Mount admin router in `main.py`
- [ ] Implement all 10 admin endpoints

## Phase 6: New DB Table + Migration

- [ ] Add `PushSubscription` model to `models/notification.py`
- [ ] Register in `models/__init__.py`
- [ ] Run `alembic revision --autogenerate -m "003_push_subscriptions"`
- [ ] Run `alembic upgrade head`

## Phase 7: Integration Testing

- [ ] Test OTP flows (register, forgot password, change email/phone)
- [ ] Test RBAC (farmer cannot access admin, admin can access all)
- [ ] Test rate limiting (OTP, auth, AI)
- [ ] Test status machines (project, issue)
- [ ] Test error response format consistency
- [ ] Test ownership validation on all farmer-scoped endpoints
- [ ] Test dashboard cache invalidation

---

# Summary Statistics

| Category | Count |
|----------|-------|
| **Total Database Tables** | 37 (36 existing + 1 new `push_subscriptions`) |
| **Tables with API** | 17 |
| **Tables with No API (internal)** | 14 |
| **Tables deferred to v2.0+** | 6 |
| **Total API Endpoints (v1.0)** | **~85** |
| **Existing endpoints to keep** | ~30 |
| **Existing endpoints to refactor** | ~15 |
| **New endpoints to build** | ~40 |
| **ErrorCode enum members** | ~80 |
| **Shared Enums** | 18 |
| **Celery background tasks** | 9 |
| **New core infrastructure files** | 10 |
| **New module** | 1 (admin) |
