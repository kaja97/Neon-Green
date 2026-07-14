"""
Admin router — 10 endpoints for user management, project overview, and system stats.
All endpoints require admin role.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_admin_user
from models.account import Account
from core.response import success_response, paginated_response, message_response
from core.pagination import PaginationParams, get_pagination
from . import service
from .schemas import AdminRoleUpdate
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


# ─── 12.1 List Users ────────────────────────────────────

@router.get("/users", status_code=200)
async def list_users(
    role: Optional[str] = Query(None, description="Filter by role: farmer, admin"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name, email, phone"),
    pagination: PaginationParams = Depends(get_pagination),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all user accounts. Admin only."""
    users, total = await service.list_users(db, pagination, role, is_active, search)
    return paginated_response(users, pagination.page, pagination.per_page, total)


# ─── 12.2 Get User Detail ───────────────────────────────

@router.get("/users/{user_id}", status_code=200)
async def get_user_detail(
    user_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed user info including profile and project count."""
    result = await service.get_user_detail(db, user_id)
    return success_response(result)


# ─── 12.3 Deactivate User ───────────────────────────────

@router.patch("/users/{user_id}/deactivate", status_code=200)
async def deactivate_user(
    user_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a user account. Cannot deactivate self."""
    result = await service.deactivate_user(db, admin, user_id)
    return success_response(result)


# ─── 12.4 Reactivate User ───────────────────────────────

@router.patch("/users/{user_id}/reactivate", status_code=200)
async def reactivate_user(
    user_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Restore a deactivated user account."""
    result = await service.reactivate_user(db, user_id)
    return success_response(result)


# ─── 12.5 Change User Role ──────────────────────────────

@router.patch("/users/{user_id}/role", status_code=200)
async def change_user_role(
    user_id: str,
    data: AdminRoleUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user role (farmer ↔ admin)."""
    result = await service.change_user_role(db, admin, user_id, data.role.value)
    return success_response(result)


# ─── 12.6 Admin Stats ───────────────────────────────────

@router.get("/stats", status_code=200)
async def get_admin_stats(
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """System-wide statistics for admin dashboard."""
    result = await service.get_admin_stats(db)
    return success_response(result)


# ─── 12.7 List All Projects ─────────────────────────────

@router.get("/projects", status_code=200)
async def list_all_projects(
    status: Optional[str] = Query(None, description="Filter by project status"),
    pagination: PaginationParams = Depends(get_pagination),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all projects across all farmers. Admin overview."""
    from sqlalchemy.future import select
    from sqlalchemy import func
    from models.project import Project

    query = select(Project)
    if status:
        query = query.where(Project.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Project.created_at.desc()).offset(pagination.offset).limit(pagination.per_page)
    result = await db.execute(query)
    projects = result.scalars().all()

    items = []
    for p in projects:
        items.append({
            "id": str(p.id),
            "farmer_id": str(p.farmer_id),
            "name": p.name,
            "status": p.status,
            "farming_method": p.farming_method,
            "planting_date": p.planting_date.isoformat() if p.planting_date else None,
            "created_at": p.created_at.isoformat(),
        })

    return paginated_response(items, pagination.page, pagination.per_page, total)


# ─── 12.8 Get Any Project Detail ────────────────────────

@router.get("/projects/{project_id}", status_code=200)
async def get_project_detail(
    project_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """View any project detail (admin override, no ownership check)."""
    from sqlalchemy.future import select
    from models.project import Project
    from core.errors.exceptions import AppException
    from core.errors.error_codes import ErrorCode

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
        raise AppException(ErrorCode.PROJECT_NOT_FOUND)

    return success_response({
        "id": str(project.id),
        "farmer_id": str(project.farmer_id),
        "name": project.name,
        "status": project.status,
        "farming_method": project.farming_method,
        "area": float(project.area) if project.area else None,
        "area_unit": project.area_unit,
        "planting_date": project.planting_date.isoformat() if project.planting_date else None,
        "expected_harvest_date": project.expected_harvest_date.isoformat() if project.expected_harvest_date else None,
        "plan_generation_status": project.plan_generation_status,
        "created_at": project.created_at.isoformat(),
    })


# ─── Master Data Management ─────────────────────────────

from .schemas import PlantCreate, PlantUpdate, DiseaseCreate, DiseaseUpdate
import uuid

@router.get("/plants", status_code=200)
async def list_all_plants(
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all plants for admin master-data management."""
    plants = await service.list_plants(db)
    from modules.project.schemas import PlantResponse
    return success_response([PlantResponse.model_validate(p).model_dump() for p in plants])

@router.post("/plants", status_code=201)
async def create_plant(
    data: PlantCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.create_plant(db, data)
    return success_response({"id": str(result.id), "common_name": result.common_name})

@router.put("/plants/{plant_id}", status_code=200)
async def update_plant(
    plant_id: uuid.UUID,
    data: PlantUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.update_plant(db, plant_id, data)
    return success_response({"id": str(result.id), "message": "Updated successfully"})

@router.delete("/plants/{plant_id}", status_code=200)
async def delete_plant(
    plant_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.delete_plant(db, plant_id)
    return success_response(result)

@router.get("/diseases", status_code=200)
async def list_all_diseases(
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all diseases for admin master-data management."""
    diseases = await service.list_diseases(db)
    from modules.disease.schemas import DiseaseSearchResponse
    return success_response([DiseaseSearchResponse.model_validate(d).model_dump() for d in diseases])

@router.post("/diseases", status_code=201)
async def create_disease(
    data: DiseaseCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.create_disease(db, data)
    return success_response(result)

@router.put("/diseases/{disease_id}", status_code=200)
async def update_disease(
    disease_id: uuid.UUID,
    data: DiseaseUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.update_disease(db, disease_id, data)
    return success_response(result)

@router.delete("/diseases/{disease_id}", status_code=200)
async def delete_disease(
    disease_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.delete_disease(db, disease_id)
    return success_response(result)
