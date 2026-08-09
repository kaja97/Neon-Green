"""
HTML email templates for OTP, alerts, and notifications.
All templates return (html_body, plain_body) tuples.
"""

APP_NAME = "AgriFarm AI"
APP_COLOR = "#22c55e"  # Green theme


def _base_template(title: str, body_content: str) -> str:
    """Wrap content in a styled HTML email template."""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,{APP_COLOR},#16a34a);padding:30px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🌱 {APP_NAME}</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            {body_content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                © 2025 {APP_NAME}. Personalized AI Farming Assistant.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""


def otp_email(code: str, purpose: str, expires_minutes: int = 5) -> tuple[str, str]:
    """
    Generate OTP email template.

    Args:
        code: 6-digit OTP code
        purpose: Human-readable purpose (e.g., "verify your email", "reset your password")

    Returns:
        (html_body, plain_body)
    """
    purpose_map = {
        "register": "verify your email address",
        "forgot_password": "reset your password",
        "change_email": "confirm your new email address",
        "change_phone": "confirm your new phone number",
    }
    purpose_text = purpose_map.get(purpose, purpose)

    body = f"""
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Verification Code</h2>
        <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Use this code to <strong>{purpose_text}</strong>:
        </p>
        <div style="text-align:center;margin:32px 0;">
            <div style="display:inline-block;background-color:#f0fdf4;border:2px solid {APP_COLOR};border-radius:12px;padding:20px 40px;">
                <span style="font-size:36px;font-weight:700;color:#166534;letter-spacing:8px;">{code}</span>
            </div>
        </div>
        <p style="color:#6b7280;font-size:14px;">
            This code expires in <strong>{expires_minutes} minutes</strong>.
        </p>
        <p style="color:#9ca3af;font-size:13px;margin-top:24px;">
            If you didn't request this, please ignore this email.
        </p>
    """

    html = _base_template(f"Verification Code — {APP_NAME}", body)

    plain = (
        f"{APP_NAME}\n\n"
        f"Your verification code to {purpose_text}: {code}\n\n"
        f"This code expires in {expires_minutes} minutes.\n\n"
        f"If you didn't request this, please ignore this email."
    )

    return html, plain


def welcome_email(full_name: str) -> tuple[str, str]:
    """Welcome email after successful registration."""
    body = f"""
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Welcome, {full_name}! 🎉</h2>
        <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Your AgriFarm AI account has been created successfully.
        </p>
        <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Here's what you can do next:
        </p>
        <ul style="color:#4b5563;font-size:15px;line-height:2;">
            <li>🌿 Create your first farming project</li>
            <li>📍 Add your farm locations</li>
            <li>🤖 Get AI-powered farming recommendations</li>
            <li>🌤️ Receive weather-based activity adjustments</li>
        </ul>
    """

    html = _base_template(f"Welcome to {APP_NAME}", body)
    plain = (
        f"Welcome to {APP_NAME}, {full_name}!\n\n"
        f"Your account is ready. Create your first farming project to get started."
    )
    return html, plain


def password_reset_success_email(full_name: str) -> tuple[str, str]:
    """Notification after successful password reset."""
    body = f"""
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Password Changed</h2>
        <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Hi {full_name}, your password has been reset successfully.
        </p>
        <p style="color:#dc2626;font-size:14px;margin-top:16px;">
            ⚠️ If you did not make this change, please contact support immediately.
        </p>
    """
    html = _base_template("Password Changed", body)
    plain = (
        f"Hi {full_name}, your password has been reset successfully.\n\n"
        f"If you did not make this change, contact support immediately."
    )
    return html, plain


def alert_email(
    full_name: str,
    alert_title: str,
    alert_message: str,
    severity: str = "warning",
) -> tuple[str, str]:
    """Generic alert email (weather, disease risk, market)."""
    severity_colors = {
        "low": "#3b82f6",
        "medium": "#f59e0b",
        "high": "#f97316",
        "critical": "#dc2626",
        "warning": "#f59e0b",
    }
    color = severity_colors.get(severity, "#f59e0b")

    body = f"""
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">⚠️ {alert_title}</h2>
        <div style="border-left:4px solid {color};padding:16px 20px;background-color:#fffbeb;border-radius:0 8px 8px 0;margin:16px 0;">
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0;">
                {alert_message}
            </p>
        </div>
        <p style="color:#6b7280;font-size:14px;margin-top:16px;">
            Hi {full_name}, check your AgriFarm AI dashboard for more details.
        </p>
    """
    html = _base_template(alert_title, body)
    plain = f"Alert: {alert_title}\n\n{alert_message}\n\nHi {full_name}, check your dashboard for details."
    return html, plain


def soil_recommendation_email(
    full_name: str,
    crop_name: str,
    project_area: str,
    test_date: str,
    recommendations: list[dict],
) -> tuple[str, str]:
    """Email with AI-generated soil test recommendations.

    Args:
        full_name: Farmer's display name
        crop_name: Crop name from the project
        project_area: Area string e.g. "2.5 acres"
        test_date: ISO date string of the soil test
        recommendations: List of dicts with keys: recommendation_type, description, priority (optional)

    Returns:
        (html_body, plain_body)
    """
    # Group recommendations by type
    type_labels = {
        "fertilizer": ("🧪", "Fertilizer Recommendations", "#22c55e"),
        "amendment": ("🪨", "Soil Amendments", "#f59e0b"),
        "practice": ("📋", "Best Practices", "#3b82f6"),
    }

    # Build recommendation rows
    rec_rows = ""
    plain_recs = ""
    for i, rec in enumerate(recommendations, 1):
        rec_type = rec.get("recommendation_type", "practice")
        description = rec.get("description", "")
        emoji, _, color = type_labels.get(rec_type, ("📋", "Other", "#6b7280"))

        # Priority badge
        priority = ""
        if "HIGH PRIORITY" in description or rec.get("priority") == "high":
            priority = '<span style="display:inline-block;background-color:#fef2f2;color:#dc2626;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;margin-left:8px;">HIGH</span>'

        rec_rows += f"""
            <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;">
                    <div style="display:flex;align-items:flex-start;">
                        <span style="font-size:18px;margin-right:10px;">{emoji}</span>
                        <div>
                            <span style="display:inline-block;background-color:{color};color:white;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;text-transform:uppercase;">{rec_type}</span>
                            {priority}
                            <p style="color:#374151;font-size:14px;line-height:1.6;margin:6px 0 0;">{description}</p>
                        </div>
                    </div>
                </td>
            </tr>"""

        plain_recs += f"  {i}. [{rec_type.upper()}] {description}\n"

    body = f"""
        <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">🌱 Soil Test Results & Recommendations</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
            AI-powered analysis for your farm
        </p>

        <!-- Project Summary -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;margin-bottom:24px;">
            <tr>
                <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="color:#166534;font-size:14px;padding:4px 0;">
                                <strong>Crop:</strong> {crop_name}
                            </td>
                            <td style="color:#166534;font-size:14px;padding:4px 0;" align="right">
                                <strong>Area:</strong> {project_area}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="color:#166534;font-size:14px;padding:4px 0;">
                                <strong>Test Date:</strong> {test_date}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Recommendations -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <tr>
                <td style="background-color:#f9fafb;padding:12px 16px;border-bottom:1px solid #e5e7eb;">
                    <strong style="color:#111827;font-size:15px;">📊 AI Recommendations ({len(recommendations)})</strong>
                </td>
            </tr>
            {rec_rows}
        </table>

        <p style="color:#6b7280;font-size:13px;margin-top:24px;">
            These recommendations are generated by our AI based on your soil test results,
            crop requirements, and farming method. For best results, apply in the order listed.
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;">
            💡 View detailed recommendations and mark them as applied in your AgriFarm AI dashboard.
        </p>
    """

    html = _base_template(f"Soil Test Results — {crop_name}", body)

    plain = (
        f"{APP_NAME} — Soil Test Results & Recommendations\n\n"
        f"Hi {full_name},\n\n"
        f"Crop: {crop_name} | Area: {project_area} | Test Date: {test_date}\n\n"
        f"AI Recommendations ({len(recommendations)}):\n"
        f"{plain_recs}\n"
        f"View details in your AgriFarm AI dashboard."
    )

    return html, plain

