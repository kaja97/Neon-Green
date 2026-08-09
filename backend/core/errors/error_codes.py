from enum import Enum


class ErrorCode(str, Enum):
    """
    Centralized, type-safe error code registry.
    Format: DOMAIN_ACTION_REASON
    Every exception in the app MUST reference one of these codes.
    """

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
    OTP_RATE_LIMITED                   = "OTP_RATE_LIMITED"
    OTP_ALREADY_VERIFIED              = "OTP_ALREADY_VERIFIED"
    OTP_SEND_FAILED                   = "OTP_SEND_FAILED"
    OTP_SERVICE_UNAVAILABLE           = "OTP_SERVICE_UNAVAILABLE"

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
    PROJECT_PLAN_LOCKED               = "PROJECT_PLAN_LOCKED"

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
