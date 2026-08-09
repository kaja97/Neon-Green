from .error_codes import ErrorCode

ERROR_MESSAGES: dict[ErrorCode, str] = {
    # ── Auth: Registration ────────────────────────────────
    ErrorCode.AUTH_REGISTER_EMAIL_EXISTS:     "An account with this email already exists.",
    ErrorCode.AUTH_REGISTER_PHONE_EXISTS:     "An account with this phone already exists.",
    ErrorCode.AUTH_REGISTER_MISSING_CONTACT:  "Either email or phone number is required.",
    ErrorCode.AUTH_REGISTER_INVALID_METHOD:   "Farming method must be: organic, inorganic, or integrated.",

    # ── Auth: Login ───────────────────────────────────────
    ErrorCode.AUTH_LOGIN_INVALID_CREDENTIALS: "Incorrect email/phone or password.",
    ErrorCode.AUTH_LOGIN_ACCOUNT_DEACTIVATED: "This account has been deactivated. Contact support.",
    ErrorCode.AUTH_LOGIN_EMAIL_NOT_VERIFIED:  "Please verify your email first. Check your inbox for the OTP.",

    # ── Auth: Tokens ──────────────────────────────────────
    ErrorCode.AUTH_TOKEN_EXPIRED:             "Your session has expired. Please log in again.",
    ErrorCode.AUTH_TOKEN_INVALID:             "Invalid authentication token.",
    ErrorCode.AUTH_REFRESH_TOKEN_MISSING:     "Refresh token is missing.",
    ErrorCode.AUTH_REFRESH_TOKEN_INVALID:     "Refresh token is invalid or expired.",

    # ── Auth: Password ────────────────────────────────────
    ErrorCode.AUTH_PASSWORD_WRONG_CURRENT:    "Current password is incorrect.",
    ErrorCode.AUTH_PASSWORD_SAME_AS_CURRENT:  "New password must differ from the current one.",
    ErrorCode.AUTH_PASSWORD_TOO_WEAK:         "Password must be at least 8 characters with one number and one letter.",

    # ── Auth: Account ─────────────────────────────────────
    ErrorCode.AUTH_ACCOUNT_NOT_FOUND:         "Account not found.",
    ErrorCode.AUTH_EMAIL_ALREADY_IN_USE:      "This email is already in use by another account.",
    ErrorCode.AUTH_PHONE_ALREADY_IN_USE:      "This phone is already in use by another account.",

    # ── OTP ───────────────────────────────────────────────
    ErrorCode.OTP_INVALID:                    "The OTP code is incorrect.",
    ErrorCode.OTP_EXPIRED:                    "OTP has expired. Request a new one.",
    ErrorCode.OTP_MAX_ATTEMPTS:              "Too many incorrect attempts. Request a new OTP.",
    ErrorCode.OTP_RATE_LIMITED:              "Too many OTP requests. Try again in a few minutes.",
    ErrorCode.OTP_ALREADY_VERIFIED:          "This action has already been verified.",
    ErrorCode.OTP_SEND_FAILED:              "Failed to send OTP. Please try again.",
    ErrorCode.OTP_SERVICE_UNAVAILABLE:       "OTP service is temporarily unavailable.",

    # ── Farmer ────────────────────────────────────────────
    ErrorCode.FARMER_PROFILE_NOT_FOUND:       "Farmer profile not found. Complete registration first.",
    ErrorCode.FARMER_LOCATION_NOT_FOUND:      "Location not found.",
    ErrorCode.FARMER_LOCATION_FORBIDDEN:      "You do not have access to this location.",
    ErrorCode.FARMER_LOCATION_HAS_PROJECTS:   "Cannot delete location — it has active projects.",
    ErrorCode.FARMER_LAND_NOT_FOUND:          "Land detail not found.",
    ErrorCode.FARMER_LAND_FORBIDDEN:          "You do not have access to this land record.",
    ErrorCode.FARMER_LAND_INVALID_LOCATION:   "The specified location does not belong to you.",
    ErrorCode.FARMER_LIVESTOCK_NOT_FOUND:     "Livestock record not found.",
    ErrorCode.FARMER_LIVESTOCK_FORBIDDEN:     "You do not have access to this livestock record.",

    # ── Project ───────────────────────────────────────────
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
    ErrorCode.PROJECT_PLAN_LOCKED:               "Cannot change plant or location after plan generation.",

    # ── Planner ───────────────────────────────────────────
    ErrorCode.PLANNER_PLAN_NOT_FOUND:            "Activity plan not found for this project.",
    ErrorCode.PLANNER_PLAN_NOT_READY:            "Activity plan is still being generated. Check back shortly.",
    ErrorCode.PLANNER_ACTIVITY_NOT_FOUND:        "Activity not found.",
    ErrorCode.PLANNER_ACTIVITY_FORBIDDEN:        "You do not have access to this activity.",
    ErrorCode.PLANNER_ACTIVITY_ALREADY_DONE:     "This activity has already been marked complete.",
    ErrorCode.PLANNER_ACTIVITY_ALREADY_SKIPPED:  "This activity has already been skipped.",
    ErrorCode.PLANNER_REGENERATE_IN_PROGRESS:    "Plan regeneration is already in progress.",

    # ── Weather ───────────────────────────────────────────
    ErrorCode.WEATHER_API_UNAVAILABLE:   "Weather data is temporarily unavailable. Using cached data.",
    ErrorCode.WEATHER_LOCATION_MISSING:  "Project does not have a GPS location configured.",
    ErrorCode.WEATHER_ALERT_NOT_FOUND:   "Weather alert not found.",

    # ── Soil ──────────────────────────────────────────────
    ErrorCode.SOIL_TEST_NOT_FOUND:            "No soil test found for this project.",
    ErrorCode.SOIL_TEST_INVALID_ALL_ZERO:     "All soil test values are zero — enter valid lab results.",
    ErrorCode.SOIL_TEST_INVALID_PH:           "pH value must be between 0.1 and 14.0.",
    ErrorCode.SOIL_RECOMMENDATION_NOT_FOUND:  "No soil recommendations found. Submit a soil test first.",

    # ── Disease ───────────────────────────────────────────
    ErrorCode.DISEASE_ISSUE_NOT_FOUND:           "Issue report not found.",
    ErrorCode.DISEASE_ISSUE_FORBIDDEN:           "You do not have access to this issue.",
    ErrorCode.DISEASE_ISSUE_INVALID_TRANSITION:  "This issue status transition is not allowed.",
    ErrorCode.DISEASE_NOT_FOUND:                 "Disease not found in the database.",
    ErrorCode.DISEASE_SEARCH_EMPTY:              "No diseases matched. Try describing what you see: leaf color, spots, wilting.",
    ErrorCode.DISEASE_CV_NOT_IMPLEMENTED:        "Image-based disease detection is coming soon.",

    # ── AI ────────────────────────────────────────────────
    ErrorCode.AI_RATE_LIMIT_EXCEEDED:     "AI daily limit reached. Remaining calls reset at midnight.",
    ErrorCode.AI_GEMINI_UNAVAILABLE:      "AI service is temporarily unavailable.",
    ErrorCode.AI_CONTEXT_BUILD_FAILED:    "Failed to build project context for AI analysis.",
    ErrorCode.AI_CONVERSATION_NOT_FOUND:  "Conversation not found.",
    ErrorCode.AI_CONVERSATION_FORBIDDEN:  "You do not have access to this conversation.",
    ErrorCode.AI_SUMMARY_NOT_FOUND:       "No AI summary available yet. Click 'Generate' to create one.",

    # ── Market ────────────────────────────────────────────
    ErrorCode.MARKET_PRICE_NOT_FOUND: "No market prices found for this crop in the selected region.",
    ErrorCode.MARKET_TREND_NOT_FOUND: "No market trend data available yet.",
    ErrorCode.MARKET_PLANT_NOT_FOUND: "Crop not found for market lookup.",

    # ── Notification ──────────────────────────────────────
    ErrorCode.NOTIFICATION_NOT_FOUND:    "Notification not found.",
    ErrorCode.NOTIFICATION_FORBIDDEN:    "You do not have access to this notification.",
    ErrorCode.NOTIFICATION_PUSH_FAILED:  "Push notification delivery failed.",
    ErrorCode.NOTIFICATION_SUB_NOT_FOUND: "Push subscription not found.",

    # ── Master Data ───────────────────────────────────────
    ErrorCode.PLANT_NOT_FOUND:          "Crop not found.",
    ErrorCode.PLANT_STAGE_NOT_FOUND:    "Growth stage not found.",
    ErrorCode.FARMING_METHOD_NOT_FOUND: "Farming method not found.",

    # ── Admin ─────────────────────────────────────────────
    ErrorCode.ADMIN_FORBIDDEN:           "Administrator access required.",
    ErrorCode.ADMIN_CANNOT_DELETE_SELF:   "You cannot deactivate your own admin account.",
    ErrorCode.ADMIN_USER_NOT_FOUND:      "User not found.",

    # ── Generic ───────────────────────────────────────────
    ErrorCode.VALIDATION_ERROR:       "Request validation failed.",
    ErrorCode.INTERNAL_SERVER_ERROR:   "An unexpected error occurred. Please try again.",
    ErrorCode.FORBIDDEN:              "You do not have permission to perform this action.",
    ErrorCode.UNAUTHORIZED:           "Authentication required.",
    ErrorCode.NOT_FOUND:              "Resource not found.",
    ErrorCode.CONFLICT:               "Resource already exists.",
    ErrorCode.RATE_LIMITED:           "Too many requests. Please slow down.",
}
