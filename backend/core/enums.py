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


# ── Transaction ──────────────────────────────────────────
class TransactionStatus(str, Enum):
    PENDING   = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


TRANSACTION_STATUS_TRANSITIONS: dict["TransactionStatus", list["TransactionStatus"]] = {
    TransactionStatus.PENDING:   [TransactionStatus.CONFIRMED, TransactionStatus.CANCELLED],
    TransactionStatus.CONFIRMED: [TransactionStatus.COMPLETED, TransactionStatus.CANCELLED],
    TransactionStatus.COMPLETED: [],
    TransactionStatus.CANCELLED: [],
}


# ── Product Status ───────────────────────────────────────
class ProductStatus(str, Enum):
    AVAILABLE = "available"
    SOLD_OUT  = "sold_out"
    HIDDEN    = "hidden"
