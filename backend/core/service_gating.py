"""Account- and project-level service access control."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from config import settings
from models.account import AccountFeature
from models.project import ProjectService

# Core service — always enabled when a project exists.
CORE_SERVICE = "activity_plan"

# Optional services that can be rolled out incrementally.
OPTIONAL_SERVICES = frozenset(
    {"weather", "soil", "disease_watch", "market_price", "notifications"}
)

# Deferred to future releases — never enabled by default.
FUTURE_SERVICES = frozenset({"ai_chat", "ai_agent"})

ALL_SERVICE_TYPES = frozenset({CORE_SERVICE, *OPTIONAL_SERVICES, *FUTURE_SERVICES})


def default_account_services() -> list[str]:
    raw = settings.DEFAULT_ACCOUNT_SERVICES.strip()
    if not raw:
        return [CORE_SERVICE]
    services = [s.strip() for s in raw.split(",") if s.strip()]
    return list(dict.fromkeys(services))


async def seed_account_features(db: AsyncSession, account_id: UUID) -> None:
    """Grant default services to a newly registered account."""
    for service_type in default_account_services():
        if service_type not in ALL_SERVICE_TYPES or service_type in FUTURE_SERVICES:
            continue
        db.add(
            AccountFeature(
                account_id=account_id,
                service_type=service_type,
                is_enabled=True,
                enabled_at=datetime.now(timezone.utc),
            )
        )


async def account_has_service(
    db: AsyncSession, account_id: UUID, service_type: str
) -> bool:
    if service_type == CORE_SERVICE:
        return True
    result = await db.execute(
        select(AccountFeature).where(
            AccountFeature.account_id == account_id,
            AccountFeature.service_type == service_type,
            AccountFeature.is_enabled == True,
        )
    )
    return result.scalars().first() is not None


async def project_has_service(
    db: AsyncSession, project_id: UUID, service_type: str
) -> bool:
    if service_type == CORE_SERVICE:
        return True
    result = await db.execute(
        select(ProjectService).where(
            ProjectService.project_id == project_id,
            ProjectService.service_type == service_type,
            ProjectService.is_active == True,
        )
    )
    return result.scalars().first() is not None


async def require_account_service(
    db: AsyncSession, account_id: UUID, service_type: str
) -> None:
    if service_type in FUTURE_SERVICES:
        raise HTTPException(
            status_code=403,
            detail=f"Service '{service_type}' is not available yet",
        )
    if not await account_has_service(db, account_id, service_type):
        raise HTTPException(
            status_code=403,
            detail=f"Your account does not have access to '{service_type}'",
        )


async def require_project_service(
    db: AsyncSession,
    account_id: UUID,
    project_id: UUID,
    service_type: str,
) -> None:
    if service_type in FUTURE_SERVICES:
        raise HTTPException(
            status_code=403,
            detail=f"Service '{service_type}' is not available yet",
        )
    if not await account_has_service(db, account_id, service_type):
        raise HTTPException(
            status_code=403,
            detail=f"Your account does not have access to '{service_type}'",
        )
    if not await project_has_service(db, project_id, service_type):
        raise HTTPException(
            status_code=403,
            detail=f"Service '{service_type}' is not enabled for this project",
        )


async def seed_project_services(
    db: AsyncSession, project_id: UUID, account_id: UUID
) -> None:
    """Create project_services rows for every service the account can use."""
    now = datetime.now(timezone.utc)
    for service_type in default_account_services():
        if service_type not in ALL_SERVICE_TYPES or service_type in FUTURE_SERVICES:
            continue
        if not await account_has_service(db, account_id, service_type):
            continue
        db.add(
            ProjectService(
                project_id=project_id,
                service_type=service_type,
                is_active=True,
                activated_at=now,
            )
        )


async def list_project_services(db: AsyncSession, project_id: UUID) -> list[ProjectService]:
    result = await db.execute(
        select(ProjectService)
        .where(ProjectService.project_id == project_id)
        .order_by(ProjectService.service_type)
    )
    return list(result.scalars().all())
