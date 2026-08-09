"""
OTP (One-Time Password) verification system.

Storage: Redis (ephemeral, auto-cleanup via TTL)
Key format: otp:{purpose}:{identifier}
Value: JSON {code, attempts, created_at, context}
TTL: 300 seconds (5 minutes)
Max attempts: 3
"""
import json
import secrets
import logging
from datetime import datetime, timezone
from typing import Optional

from core.redis import get_redis_client
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.rate_limiter import check_rate_limit

logger = logging.getLogger("agrifarm.otp")

OTP_TTL_SECONDS = 300        # 5 minutes
OTP_MAX_ATTEMPTS = 3
OTP_LENGTH = 6
OTP_VERIFIED_TTL = 600       # 10 minutes — window to complete the action after OTP verified


async def generate_otp(
    purpose: str,
    identifier: str,
    context: Optional[dict] = None,
) -> str:
    """
    Generate a 6-digit OTP and store in Redis.

    Args:
        purpose: One of: register, forgot_password, change_email, change_phone
        identifier: Email or phone number
        context: Optional data to store with OTP (e.g., user_id for change flows)

    Returns:
        The 6-digit OTP code (caller sends it via email/SMS)

    Raises:
        OTP_RATE_LIMITED: If more than 3 OTP requests per hour
        OTP_SERVICE_UNAVAILABLE: If Redis is not available
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
        raise AppException(ErrorCode.OTP_SERVICE_UNAVAILABLE)

    # Generate cryptographically secure 6-digit code
    code = "".join([str(secrets.randbelow(10)) for _ in range(OTP_LENGTH)])

    otp_data = {
        "code": code,
        "attempts": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "context": context or {},
    }

    key = f"otp:{purpose}:{identifier}"
    await redis.setex(key, OTP_TTL_SECONDS, json.dumps(otp_data))

    logger.info("OTP generated for %s:%s", purpose, identifier)
    return code


async def verify_otp(
    purpose: str,
    identifier: str,
    submitted_code: str,
) -> dict:
    """
    Verify a 6-digit OTP.

    Args:
        purpose: Same purpose used during generation
        identifier: Same identifier used during generation
        submitted_code: The code the user submitted

    Returns:
        The stored context dict on success

    Raises:
        OTP_EXPIRED: If OTP key doesn't exist (expired or never generated)
        OTP_MAX_ATTEMPTS: If wrong code submitted 3+ times
        OTP_INVALID: If code doesn't match
    """
    redis = await get_redis_client()
    if not redis:
        raise AppException(ErrorCode.OTP_SERVICE_UNAVAILABLE)

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

    # Success — delete the OTP key and set a verified flag
    await redis.delete(key)

    # Set a short-lived verification flag (10 min window to complete the action)
    verified_key = f"otp_verified:{purpose}:{identifier}"
    await redis.setex(verified_key, OTP_VERIFIED_TTL, "1")

    logger.info("OTP verified successfully for %s:%s", purpose, identifier)
    return otp_data.get("context", {})


async def is_otp_verified(purpose: str, identifier: str) -> bool:
    """
    Check if an OTP has been recently verified for this purpose + identifier.
    Used for two-step flows where OTP verification and action are separate requests.
    """
    redis = await get_redis_client()
    if not redis:
        return False

    verified_key = f"otp_verified:{purpose}:{identifier}"
    result = await redis.get(verified_key)
    return result == "1"


async def consume_otp_verification(purpose: str, identifier: str) -> None:
    """
    Consume (delete) the verification flag after the action is completed.
    Prevents the same OTP verification from being reused.
    """
    redis = await get_redis_client()
    if redis:
        verified_key = f"otp_verified:{purpose}:{identifier}"
        await redis.delete(verified_key)
