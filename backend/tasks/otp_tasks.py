"""
Celery background tasks for OTP delivery via email/SMS.
"""
import asyncio
import logging
from .celery_app import celery_app

logger = logging.getLogger("agrifarm.otp_tasks")


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def send_otp_email_task(self, email: str, code: str, purpose: str):
    """
    Send OTP verification code via email (Celery background task).
    Uses the dual-provider email service (Google API → SMTP fallback).
    Retries up to 2 times on failure.
    """
    try:
        from core.email_service import send_email
        from core.email_templates import otp_email

        html_body, plain_body = otp_email(code=code, purpose=purpose)

        subject_map = {
            "register": "AgriFarm AI — Verify Your Email",
            "forgot_password": "AgriFarm AI — Reset Your Password",
            "change_email": "AgriFarm AI — Confirm New Email",
            "change_phone": "AgriFarm AI — Confirm Phone Change",
        }
        subject = subject_map.get(purpose, "AgriFarm AI — Verification Code")

        # Run async email sender in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                send_email(
                    to=email,
                    subject=subject,
                    html_body=html_body,
                    plain_body=plain_body,
                )
            )
            logger.info("OTP email sent to %s for %s", email, purpose)
            return result
        finally:
            loop.close()

    except Exception as exc:
        logger.error("OTP email failed to %s: %s (retry %d)", email, exc, self.request.retries)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def send_welcome_email_task(self, email: str, full_name: str):
    """Send welcome email after successful registration."""
    try:
        from core.email_service import send_email
        from core.email_templates import welcome_email

        html_body, plain_body = welcome_email(full_name=full_name)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                send_email(
                    to=email,
                    subject="Welcome to AgriFarm AI! 🌱",
                    html_body=html_body,
                    plain_body=plain_body,
                )
            )
            logger.info("Welcome email sent to %s", email)
            return result
        finally:
            loop.close()

    except Exception as exc:
        logger.error("Welcome email failed to %s: %s", email, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def send_password_reset_email_task(self, email: str, full_name: str):
    """Send notification after password reset."""
    try:
        from core.email_service import send_email
        from core.email_templates import password_reset_success_email

        html_body, plain_body = password_reset_success_email(full_name=full_name)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                send_email(
                    to=email,
                    subject="AgriFarm AI — Password Changed",
                    html_body=html_body,
                    plain_body=plain_body,
                )
            )
            logger.info("Password reset email sent to %s", email)
            return result
        finally:
            loop.close()

    except Exception as exc:
        logger.error("Password reset email failed to %s: %s", email, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def send_alert_email_task(self, email: str, full_name: str, alert_title: str, alert_message: str, severity: str = "warning"):
    """Send alert notification email (weather, disease, market)."""
    try:
        from core.email_service import send_email
        from core.email_templates import alert_email

        html_body, plain_body = alert_email(
            full_name=full_name,
            alert_title=alert_title,
            alert_message=alert_message,
            severity=severity,
        )

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                send_email(
                    to=email,
                    subject=f"AgriFarm AI — {alert_title}",
                    html_body=html_body,
                    plain_body=plain_body,
                )
            )
            logger.info("Alert email sent to %s: %s", email, alert_title)
            return result
        finally:
            loop.close()

    except Exception as exc:
        logger.error("Alert email failed to %s: %s", email, exc)
        raise self.retry(exc=exc)
