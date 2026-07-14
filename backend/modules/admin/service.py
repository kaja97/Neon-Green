"""Admin service — business logic for user management and system stats."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_
from models.account import Account, FarmerProfile
from models.project import Project
from models.notification import Notification
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.redis import get_redis_client
from core.pagination import PaginationParams
from typing import Optional


async def list_users(
    db: AsyncSession,
    pagination: PaginationParams,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
) -> tuple[list[dict], int]:
    """List all user accounts with optional filters."""
    query = select(Account, FarmerProfile).outerjoin(
        FarmerProfile, Account.id == FarmerProfile.account_id
    )

    if role:
        query = query.where(Account.role == role)
    if is_active is not None:
        query = query.where(Account.is_active == is_active)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Account.email.ilike(search_term),
                Account.phone.ilike(search_term),
                FarmerProfile.full_name.ilike(search_term),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.offset(pagination.offset).limit(pagination.per_page)
    if pagination.sort_order == "desc":
        query = query.order_by(Account.created_at.desc())
    else:
        query = query.order_by(Account.created_at.asc())

    result = await db.execute(query)
    rows = result.all()

    users = []
    for account, profile in rows:
        users.append({
            "id": str(account.id),
            "email": account.email,
            "phone": account.phone,
            "role": account.role,
            "is_active": account.is_active,
            "is_verified": account.is_verified,
            "last_login_at": account.last_login_at.isoformat() if account.last_login_at else None,
            "created_at": account.created_at.isoformat(),
            "full_name": profile.full_name if profile else None,
        })

    return users, total


async def get_user_detail(db: AsyncSession, user_id: str) -> dict:
    """Get detailed user info."""
    result = await db.execute(
        select(Account, FarmerProfile).outerjoin(
            FarmerProfile, Account.id == FarmerProfile.account_id
        ).where(Account.id == user_id)
    )
    row = result.first()
    if not row:
        raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

    account, profile = row

    # Count projects — farmer_id is FarmerProfile.id, NOT Account.id
    proj_count = 0
    if profile:
        proj_count = (await db.execute(
            select(func.count()).select_from(Project).where(Project.farmer_id == profile.id)
        )).scalar() or 0

    return {
        "id": str(account.id),
        "email": account.email,
        "phone": account.phone,
        "role": account.role,
        "is_active": account.is_active,
        "is_verified": account.is_verified,
        "last_login_at": account.last_login_at.isoformat() if account.last_login_at else None,
        "created_at": account.created_at.isoformat(),
        "full_name": profile.full_name if profile else None,
        "farming_method": profile.farming_method if profile else None,
        "primary_language": profile.primary_language if profile else None,
        "experience_years": profile.experience_years if profile else 0,
        "project_count": proj_count,
    }


async def deactivate_user(
    db: AsyncSession, admin_user: Account, target_user_id: str
) -> dict:
    """Soft-delete a user. Cannot deactivate self."""
    if str(admin_user.id) == target_user_id:
        raise AppException(ErrorCode.ADMIN_CANNOT_DELETE_SELF)

    result = await db.execute(select(Account).where(Account.id == target_user_id))
    user = result.scalars().first()
    if not user:
        raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

    user.is_active = False
    await db.commit()

    # Invalidate their refresh tokens
    redis = await get_redis_client()
    if redis:
        await redis.delete(f"refresh_token:{target_user_id}")

    return {"message": f"User {user.email} has been deactivated."}


async def reactivate_user(db: AsyncSession, target_user_id: str) -> dict:
    """Restore a deactivated user."""
    result = await db.execute(select(Account).where(Account.id == target_user_id))
    user = result.scalars().first()
    if not user:
        raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

    user.is_active = True
    await db.commit()

    return {"message": f"User {user.email} has been reactivated."}


async def change_user_role(
    db: AsyncSession, admin_user: Account, target_user_id: str, new_role: str
) -> dict:
    """Change a user's role (farmer ↔ admin)."""
    if str(admin_user.id) == target_user_id:
        raise AppException(ErrorCode.ADMIN_CANNOT_DELETE_SELF, detail="Cannot change your own role.")

    result = await db.execute(select(Account).where(Account.id == target_user_id))
    user = result.scalars().first()
    if not user:
        raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

    user.role = new_role
    await db.commit()

    return {"message": f"User {user.email} role changed to {new_role}."}


async def get_admin_stats(db: AsyncSession) -> dict:
    """Dashboard stats for admin panel."""
    # User stats
    total_users = (await db.execute(select(func.count()).select_from(Account))).scalar() or 0
    active_users = (await db.execute(
        select(func.count()).select_from(Account).where(Account.is_active == True)
    )).scalar() or 0
    admin_count = (await db.execute(
        select(func.count()).select_from(Account).where(Account.role == "admin")
    )).scalar() or 0

    # Project stats
    total_projects = (await db.execute(select(func.count()).select_from(Project))).scalar() or 0
    active_projects = (await db.execute(
        select(func.count()).select_from(Project).where(Project.status == "active")
    )).scalar() or 0
    harvested_projects = (await db.execute(
        select(func.count()).select_from(Project).where(Project.status == "harvested")
    )).scalar() or 0

    # Notification stats
    total_notifications = (await db.execute(
        select(func.count()).select_from(Notification)
    )).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "deactivated": total_users - active_users,
            "admins": admin_count,
        },
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "harvested": harvested_projects,
            "failed": total_projects - active_projects - harvested_projects,
        },
        "ai": {
            "calls_today": 0,  # TODO: track from ai_query_logs
            "quota_utilization_pct": 0.0,
        },
        "notifications": {
            "sent_today": 0,  # TODO: filter by created_at today
            "total": total_notifications,
        },
    }

# --- Master Data Management ---
from models.plant import Plant
from models.plant_health import PlantDisease, PlantPest, DiseaseSolution
from .schemas import PlantCreate, PlantUpdate, DiseaseCreate, DiseaseUpdate
import uuid
from fastapi import HTTPException

async def list_plants(db: AsyncSession):
    result = await db.execute(select(Plant).where(Plant.is_active == True).order_by(Plant.common_name))
    return result.scalars().all()

async def create_plant(db: AsyncSession, data: PlantCreate) -> Plant:
    plant = Plant(**data.model_dump())
    db.add(plant)
    await db.commit()
    await db.refresh(plant)
    return plant

async def update_plant(db: AsyncSession, plant_id: uuid.UUID, data: PlantUpdate) -> Plant:
    plant = await db.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(plant, k, v)
    await db.commit()
    await db.refresh(plant)
    return plant

async def delete_plant(db: AsyncSession, plant_id: uuid.UUID) -> dict:
    plant = await db.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    await db.delete(plant)
    await db.commit()
    return {"message": "Plant deleted"}

async def list_diseases(db: AsyncSession):
    """List all diseases with optional plant info for admin master-data."""
    result = await db.execute(select(PlantDisease).order_by(PlantDisease.name))
    return result.scalars().all()

async def create_disease(db: AsyncSession, data: DiseaseCreate) -> dict:
    solutions_data = data.solutions or []
    disease_dict = data.model_dump(exclude={"solutions"})

    disease = PlantDisease(**disease_dict)
    db.add(disease)
    await db.flush()  # get disease.id for solutions FK

    for sol in solutions_data:
        solution = DiseaseSolution(disease_id=disease.id, **sol.model_dump())
        db.add(solution)

    await db.commit()
    await db.refresh(disease)
    return {"id": str(disease.id), "name": disease.name, "solutions_count": len(solutions_data)}

async def update_disease(db: AsyncSession, disease_id: uuid.UUID, data: DiseaseUpdate) -> dict:
    disease = await db.get(PlantDisease, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    solutions_data = data.solutions
    update_dict = data.model_dump(exclude={"solutions"}, exclude_unset=True)
    for k, v in update_dict.items():
        setattr(disease, k, v)

    # If solutions are provided, replace them entirely
    if solutions_data is not None:
        # Delete existing solutions
        existing = await db.execute(select(DiseaseSolution).where(DiseaseSolution.disease_id == disease.id))
        for sol in existing.scalars().all():
            await db.delete(sol)
        # Create new ones
        for sol in solutions_data:
            new_sol = DiseaseSolution(disease_id=disease.id, **sol.model_dump())
            db.add(new_sol)

    await db.commit()
    await db.refresh(disease)
    return {"id": str(disease.id), "name": disease.name, "message": "Updated successfully"}

async def delete_disease(db: AsyncSession, disease_id: uuid.UUID) -> dict:
    disease = await db.get(PlantDisease, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    await db.delete(disease)
    await db.commit()
    return {"message": "Disease deleted"}
