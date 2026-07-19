from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from database import get_db
from config import settings
from models.account import Account
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/docs-login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Account:
    """
    Any authenticated user (farmer or admin).
    Decodes JWT, loads Account with farmer_profile eager-loaded.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AppException(ErrorCode.AUTH_TOKEN_INVALID)
    except ExpiredSignatureError:
        raise AppException(ErrorCode.AUTH_TOKEN_EXPIRED)
    except InvalidTokenError:
        raise AppException(ErrorCode.AUTH_TOKEN_INVALID)

    result = await db.execute(
        select(Account)
        .options(selectinload(Account.farmer_profile))
        .where(Account.id == user_id)
    )
    user = result.scalars().first()

    if user is None:
        raise AppException(ErrorCode.AUTH_ACCOUNT_NOT_FOUND)

    if not user.is_active:
        raise AppException(ErrorCode.AUTH_LOGIN_ACCOUNT_DEACTIVATED)

    return user


async def get_current_farmer(
    current_user: Account = Depends(get_current_user),
) -> Account:
    """
    Authenticated user who is a farmer with a profile.
    Use this for all farmer-scoped endpoints.
    """
    if not current_user.farmer_profile:
        raise AppException(ErrorCode.FARMER_PROFILE_NOT_FOUND)
    return current_user


async def get_admin_user(
    current_user: Account = Depends(get_current_user),
) -> Account:
    """
    Authenticated user with admin role.
    Use this for all /admin/* endpoints.
    """
    if current_user.role != "admin":
        raise AppException(ErrorCode.ADMIN_FORBIDDEN)
    return current_user

def get_auth_service() -> "AuthService":
    from modules.auth.service import AuthService
    from modules.auth.repository import AccountRepository, FarmerProfileRepository
    return AuthService(
        account_repo=AccountRepository(),
        profile_repo=FarmerProfileRepository(),
    )

def get_admin_service() -> "AdminService":
    from modules.admin.service import AdminService
    from modules.auth.repository import AccountRepository
    from modules.admin.repository import PlantRepository, DiseaseRepository
    return AdminService(
        account_repo=AccountRepository(),
        plant_repo=PlantRepository(),
        disease_repo=DiseaseRepository(),
    )

def get_farmer_service() -> "FarmerService":
    from modules.farmer.service import FarmerService
    from modules.auth.repository import FarmerProfileRepository
    from modules.farmer.repository import FarmerLocationRepository, FarmerLandDetailRepository, FarmerLivestockRepository
    return FarmerService(
        profile_repo=FarmerProfileRepository(),
        location_repo=FarmerLocationRepository(),
        land_repo=FarmerLandDetailRepository(),
        livestock_repo=FarmerLivestockRepository(),
    )

def get_project_service() -> "ProjectService":
    from modules.project.service import ProjectService
    from modules.auth.repository import FarmerProfileRepository
    from modules.admin.repository import PlantRepository
    from modules.project.repository import ProjectRepository, PlantStageRepository
    return ProjectService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        plant_repo=PlantRepository(),
        stage_repo=PlantStageRepository(),
    )


def get_disease_service() -> "DiseaseService":
    from modules.disease.service import DiseaseService
    from modules.auth.repository import FarmerProfileRepository
    from modules.project.repository import ProjectRepository
    from modules.disease.repository import ProjectIssueRepository, DiseaseSolutionRepository
    return DiseaseService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        issue_repo=ProjectIssueRepository(),
        solution_repo=DiseaseSolutionRepository(),
    )

def get_soil_service() -> "SoilService":
    from modules.soil.service import SoilService
    from modules.auth.repository import FarmerProfileRepository
    from modules.project.repository import ProjectRepository
    from modules.soil.repository import SoilTestRepository, SoilNutrientResultRepository, SoilRecommendationRepository
    return SoilService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        test_repo=SoilTestRepository(),
        result_repo=SoilNutrientResultRepository(),
        rec_repo=SoilRecommendationRepository(),
    )

def get_weather_service() -> "WeatherService":
    from modules.weather.service import WeatherService
    from modules.auth.repository import FarmerProfileRepository
    from modules.project.repository import ProjectRepository
    from modules.weather.repository import WeatherCacheRepository, WeatherAlertRepository
    from modules.weather.client import WeatherClient
    return WeatherService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        cache_repo=WeatherCacheRepository(),
        alert_repo=WeatherAlertRepository(),
        weather_client=WeatherClient(),
    )

def get_ai_service() -> "AIService":
    from modules.ai.service import AIService
    from modules.auth.repository import FarmerProfileRepository
    from modules.project.repository import ProjectRepository
    from modules.ai.repository import AIConversationRepository, AIQueryLogRepository, AIProjectSummaryRepository
    return AIService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        conv_repo=AIConversationRepository(),
        log_repo=AIQueryLogRepository(),
        summary_repo=AIProjectSummaryRepository(),
    )

def get_planner_service() -> "PlannerService":
    from modules.planner.service import PlannerService
    from modules.auth.repository import FarmerProfileRepository
    from modules.project.repository import ProjectRepository
    from modules.planner.repository import ActivityPlanRepository, FarmingActivityRepository, ActivityDetailRepository
    return PlannerService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        plan_repo=ActivityPlanRepository(),
        activity_repo=FarmingActivityRepository(),
        detail_repo=ActivityDetailRepository(),
    )

def get_market_service() -> "MarketService":
    from modules.market.service import MarketService
    from modules.auth.repository import FarmerProfileRepository
    from modules.project.repository import ProjectRepository
    from modules.market.repository import MarketPriceRepository
    return MarketService(
        profile_repo=FarmerProfileRepository(),
        project_repo=ProjectRepository(),
        price_repo=MarketPriceRepository(),
    )

def get_notification_service() -> "NotificationService":
    from modules.notification.service import NotificationService
    from modules.auth.repository import FarmerProfileRepository
    from modules.notification.repository import NotificationRepository
    return NotificationService(
        profile_repo=FarmerProfileRepository(),
        notification_repo=NotificationRepository(),
    )

def get_marketplace_service() -> "MarketplaceService":
    from modules.marketplace.service import MarketplaceService
    from modules.marketplace.repository import ProductRepository
    return MarketplaceService(
        product_repo=ProductRepository(),
    )

