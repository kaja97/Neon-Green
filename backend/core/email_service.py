"""
Dual-provider email service.

Strategy:
  1. PRIMARY — Google Gmail API via OAuth 2.0 User Token (refresh token)
  2. FALLBACK — SMTP (Gmail app password) after 5 consecutive Google API failures

Failure counter stored in Redis: "email:google_failures"
  - Incremented on each Google API failure
  - Auto-resets after 1 hour (TTL)
  - When counter >= 5, all emails route to SMTP until TTL expires

Usage:
    from core.email_service import send_email
    await send_email(
        to="farmer@example.com",
        subject="Your OTP Code",
        html_body="<h1>123456</h1>",
        plain_body="Your code: 123456",
    )
"""
import json
import logging
import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger("agrifarm.email")

GOOGLE_FAILURE_KEY = "email:google_failures"
GOOGLE_FAILURE_THRESHOLD = 5
GOOGLE_FAILURE_TTL = 3600  # 1 hour — auto-reset


def _resolve_token_file(token_file: str) -> Optional[str]:
    """
    Resolve the token file path, checking multiple possible locations.
    Handles both Docker (/app/keys/token.json) and local (keys/token.json) paths.
    Returns the resolved path if found, None otherwise.
    """
    # 1. Try as-is (absolute or relative to cwd)
    if os.path.exists(token_file):
        return os.path.abspath(token_file)

    # 2. Try relative to this file's directory (core/ -> backend/ -> keys/)
    this_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(this_dir)
    project_root = os.path.dirname(backend_dir)

    candidates = [
        os.path.join(backend_dir, token_file),           # backend/keys/token.json
        os.path.join(project_root, token_file),           # <root>/keys/token.json
        os.path.join(project_root, "keys", "token.json"), # <root>/keys/token.json (hardcoded)
    ]

    for candidate in candidates:
        if os.path.exists(candidate):
            logger.debug("Resolved token file %s -> %s", token_file, candidate)
            return candidate

    return None


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    plain_body: Optional[str] = None,
) -> bool:
    """
    Send an email using the dual-provider strategy.

    1. Check Redis failure counter for Google API
    2. If counter < 5 → try Google Gmail API
    3. If Google fails → increment counter, try SMTP
    4. If counter >= 5 → skip Google, go directly to SMTP

    Returns True on success, False on total failure.
    """
    from core.redis import get_redis_client
    from config import settings

    redis = await get_redis_client()

    # Check if we should skip Google API
    google_failures = 0
    if redis:
        try:
            raw = await redis.get(GOOGLE_FAILURE_KEY)
            google_failures = int(raw) if raw else 0
        except Exception:
            google_failures = 0

    # Determine credential source: env var JSON string OR file path
    token_json_str = settings.GOOGLE_OAUTH_TOKEN_JSON
    resolved_path = None
    if not token_json_str and settings.GOOGLE_OAUTH_TOKEN_FILE:
        resolved_path = _resolve_token_file(settings.GOOGLE_OAUTH_TOKEN_FILE)

    has_google_creds = bool(token_json_str or resolved_path)

    # Try Google Gmail API first (if available and not in failure mode)
    if google_failures < GOOGLE_FAILURE_THRESHOLD and has_google_creds:
        try:
            success = await _send_via_google_api(
                to=to,
                subject=subject,
                html_body=html_body,
                plain_body=plain_body,
                token_file=resolved_path,
                token_json_str=token_json_str,
            )
            if success:
                # Reset failure counter on success
                if redis and google_failures > 0:
                    await redis.delete(GOOGLE_FAILURE_KEY)
                return True
            else:
                logger.warning("Google Gmail API returned False for %s", to)
        except Exception as e:
            logger.warning(
                "Google Gmail API failed (attempt %d): %s: %s",
                google_failures + 1, type(e).__name__, e,
            )
            # Increment failure counter
            if redis:
                try:
                    new_count = await redis.incr(GOOGLE_FAILURE_KEY)
                    if new_count == 1:
                        await redis.expire(GOOGLE_FAILURE_KEY, GOOGLE_FAILURE_TTL)
                except Exception:
                    pass
    else:
        if google_failures >= GOOGLE_FAILURE_THRESHOLD:
            logger.info("Google API in fallback mode (%d failures). Using SMTP.", google_failures)

    # Fallback to SMTP
    if settings.SMTP_HOST and settings.SMTP_USER:
        try:
            success = await _send_via_smtp(
                to=to,
                subject=subject,
                html_body=html_body,
                plain_body=plain_body,
                smtp_host=settings.SMTP_HOST,
                smtp_port=settings.SMTP_PORT,
                smtp_user=settings.SMTP_USER,
                smtp_password=settings.SMTP_PASSWORD,
                from_email=settings.SMTP_FROM_EMAIL,
            )
            if success:
                return True
        except Exception as e:
            logger.error("SMTP fallback also failed: %s: %s", type(e).__name__, e)
            raise

    # Neither provider available
    logger.error(
        "No email provider available. "
        "Configure GOOGLE_OAUTH_TOKEN_FILE or SMTP_HOST+SMTP_USER in .env"
    )
    return False


async def _send_via_google_api(
    to: str,
    subject: str,
    html_body: str,
    plain_body: Optional[str],
    token_file: Optional[str] = None,
    token_json_str: Optional[str] = None,
) -> bool:
    """
    Send email via Google Gmail API using OAuth 2.0 User Token (refresh token).

    Supports two credential sources:
      - token_json_str: JSON string from GOOGLE_OAUTH_TOKEN_JSON env var (cloud)
      - token_file: Path to token.json file (local/Docker)

    Requires:
      - google-auth
      - google-auth-oauthlib
      - google-api-python-client
    """
    import asyncio
    from functools import partial

    def _sync_send():
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build

        SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

        # Load credentials from env var JSON string or file
        using_env_var = False
        if token_json_str:
            info = json.loads(token_json_str)
            credentials = Credentials.from_authorized_user_info(info, SCOPES)
            using_env_var = True
            logger.debug("Loaded Google OAuth credentials from GOOGLE_OAUTH_TOKEN_JSON env var")
        elif token_file and os.path.exists(token_file):
            credentials = Credentials.from_authorized_user_file(token_file, SCOPES)
            logger.debug("Loaded Google OAuth credentials from file: %s", token_file)
        else:
            logger.error(
                "No OAuth token source available. "
                "Set GOOGLE_OAUTH_TOKEN_JSON env var or GOOGLE_OAUTH_TOKEN_FILE path."
            )
            return False

        from google.auth.exceptions import RefreshError

        if not credentials.valid:
            if credentials.expired and credentials.refresh_token:
                logger.info("Refreshing expired Google OAuth token...")
                try:
                    credentials.refresh(Request())
                    # Save refreshed token back to file (only when using file mode)
                    if not using_env_var and token_file:
                        try:
                            with open(token_file, "w") as f:
                                f.write(credentials.to_json())
                            logger.info("Refreshed token saved to %s", token_file)
                        except OSError as e:
                            logger.warning("Could not save refreshed token: %s", e)
                    else:
                        logger.info("Token refreshed in-memory (env var mode, no file write-back)")
                except RefreshError as re:
                    logger.error(
                        "Google OAuth refresh token expired or revoked (%s). "
                        "Re-authentication required (run 'python scripts/generate_token.py').",
                        re,
                    )
                    return False
            else:
                logger.error(
                    "OAuth token is invalid and cannot be refreshed. "
                    "Run 'python scripts/generate_token.py' to re-authenticate."
                )
                return False

        service = build("gmail", "v1", credentials=credentials, cache_discovery=False)

        # Build MIME message
        msg = MIMEMultipart("alternative")
        msg["To"] = to
        msg["From"] = "me"  # 'me' refers to the authenticated user
        msg["Subject"] = subject

        if plain_body:
            msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")

        service.users().messages().send(
            userId="me",
            body={"raw": raw_message},
        ).execute()

        return True

    # Run synchronous Google API call in thread pool
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _sync_send)

    if result:
        logger.info("Email sent via Google Gmail API to %s", to)
    return result


async def _send_via_smtp(
    to: str,
    subject: str,
    html_body: str,
    plain_body: Optional[str],
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    from_email: str,
) -> bool:
    """
    Send email via SMTP using aiosmtplib (async).
    Falls back to synchronous smtplib if aiosmtplib not installed.
    """
    msg = MIMEMultipart("alternative")
    msg["To"] = to
    msg["From"] = from_email
    msg["Subject"] = subject

    if plain_body:
        msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        # Try async SMTP first
        import aiosmtplib
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=False,
            start_tls=True,
        )
        logger.info("Email sent via SMTP (async) to %s", to)
        return True
    except ImportError:
        # Fallback to synchronous smtplib
        import asyncio
        import smtplib
        from functools import partial

        def _sync_smtp():
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            return True

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _sync_smtp)
        logger.info("Email sent via SMTP (sync) to %s", to)
        return result
