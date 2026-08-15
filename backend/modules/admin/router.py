"""
Admin router — Full management API for user accounts, global projects,
master data (plants, varieties, stages, nutrients, water, fertilizers, pruning,
diseases, pests, solutions), and field reported issues triage.
All endpoints require admin role.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_admin_user, get_admin_service
from models.account import Account
from core.response import success_response, paginated_response
from core.pagination import PaginationParams, get_pagination
from .service import AdminService
from .schemas import (
    AdminRoleUpdate,
    PlantCreate,
    PlantUpdate,
    PlantVarietyCreate,
    PlantVarietyUpdate,
    PlantStageCreate,
    PlantStageUpdate,
    FertilizerRecommendationCreate,
    PruningGuideCreate,
    DiseaseCreate,
    DiseaseUpdate,
    PestCreate,
    PestUpdate,
    IssueStatusUpdate,
)
from typing import Optional
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])


# ─── 1. Admin Telemetry & Statistics ────────────────────────

@router.get("/stats", status_code=200)
async def get_admin_stats(
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """System-wide statistics for admin overview."""
    result = await admin_service.get_admin_stats(db)
    return success_response(result)


# ─── 2. User Management ─────────────────────────────────────

@router.get("/users", status_code=200)
async def list_users(
    role: Optional[str] = Query(None, description="Filter by role: farmer, vendor, buyer, admin"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name, email, phone"),
    pagination: PaginationParams = Depends(get_pagination),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List user accounts across all roles. Admin only."""
    users, total = await admin_service.list_users(db, pagination, role, is_active, search)
    return paginated_response(users, pagination.page, pagination.per_page, total)


@router.get("/users/{user_id}", status_code=200)
async def get_user_detail(
    user_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Get detailed user info including specific role profiles and statistics."""
    result = await admin_service.get_user_detail(db, user_id)
    return success_response(result)


@router.patch("/users/{user_id}/deactivate", status_code=200)
async def deactivate_user(
    user_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Soft-delete/deactivate a user account."""
    result = await admin_service.deactivate_user(db, admin, user_id)
    return success_response(result)


@router.patch("/users/{user_id}/reactivate", status_code=200)
async def reactivate_user(
    user_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Restore a deactivated user account."""
    result = await admin_service.reactivate_user(db, user_id)
    return success_response(result)


@router.patch("/users/{user_id}/role", status_code=200)
async def change_user_role(
    user_id: str,
    data: AdminRoleUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Change user role."""
    result = await admin_service.change_user_role(db, admin, user_id, data.role.value)
    return success_response(result)


# ─── 3. Global Project Monitor ──────────────────────────────

@router.get("/projects", status_code=200)
async def list_all_projects(
    status: Optional[str] = None,
    pagination: PaginationParams = Depends(get_pagination),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List all farming projects across all farmers."""
    projects, total = await admin_service.list_projects(db, pagination, status)
    return paginated_response(projects, pagination.page, pagination.per_page, total)


@router.get("/projects/{project_id}", status_code=200)
async def get_project_detail(
    project_id: str,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """View complete project detail with stages, soil tests, and issue count."""
    result = await admin_service.get_project_detail(db, project_id)
    return success_response(result)


# ─── 4. Master Data: Plants & Growth Stages ─────────────────

@router.get("/plants", status_code=200)
async def list_plants(
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List all crops/plants with counts of stages and varieties."""
    result = await admin_service.list_plants(db)
    return success_response(result)


@router.get("/plants/{plant_id}", status_code=200)
async def get_plant_detail(
    plant_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Get full plant detail including growth stages, water/nutrient reqs, fertilizer recs, pruning guides, and varieties."""
    result = await admin_service.get_plant_detail(db, plant_id)
    return success_response(result)


@router.post("/plants", status_code=201)
async def create_plant(
    data: PlantCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Create a new crop/plant."""
    plant = await admin_service.create_plant(db, data)
    return success_response({"id": str(plant.id), "common_name": plant.common_name})


@router.put("/plants/{plant_id}", status_code=200)
async def update_plant(
    plant_id: uuid.UUID,
    data: PlantUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Update crop/plant attributes."""
    plant = await admin_service.update_plant(db, plant_id, data)
    return success_response({"id": str(plant.id), "common_name": plant.common_name, "message": "Updated successfully"})


@router.delete("/plants/{plant_id}", status_code=200)
async def delete_plant(
    plant_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a plant and its associated stages/varieties."""
    result = await admin_service.delete_plant(db, plant_id)
    return success_response(result)


# ─── 5. Master Data: Plant Varieties ────────────────────────

@router.get("/varieties", status_code=200)
async def list_varieties(
    plant_id: Optional[uuid.UUID] = Query(None, description="Optional plant ID to filter"),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List crop varieties with climatic and soil criteria."""
    result = await admin_service.list_varieties(db, plant_id)
    return success_response(result)


@router.post("/plants/{plant_id}/varieties", status_code=201)
async def create_variety(
    plant_id: uuid.UUID,
    data: PlantVarietyCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Add a new variety to a plant."""
    result = await admin_service.create_variety(db, plant_id, data)
    return success_response(result)


@router.put("/varieties/{variety_id}", status_code=200)
async def update_variety(
    variety_id: uuid.UUID,
    data: PlantVarietyUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Update a crop variety."""
    result = await admin_service.update_variety(db, variety_id, data)
    return success_response(result)


@router.delete("/varieties/{variety_id}", status_code=200)
async def delete_variety(
    variety_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a crop variety."""
    result = await admin_service.delete_variety(db, variety_id)
    return success_response(result)


# ─── 6. Master Data: Stages, Requirements & Guides ──────────

@router.post("/plants/{plant_id}/stages", status_code=201)
async def create_plant_stage(
    plant_id: uuid.UUID,
    data: PlantStageCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Add a growth stage with water & nutrient requirements to a plant."""
    result = await admin_service.create_plant_stage(db, plant_id, data)
    return success_response(result)


@router.put("/stages/{stage_id}", status_code=200)
async def update_plant_stage(
    stage_id: uuid.UUID,
    data: PlantStageUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Update growth stage details, water requirements, and nutrient targets."""
    result = await admin_service.update_plant_stage(db, stage_id, data)
    return success_response(result)


@router.delete("/stages/{stage_id}", status_code=200)
async def delete_plant_stage(
    stage_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a growth stage."""
    result = await admin_service.delete_plant_stage(db, stage_id)
    return success_response(result)


@router.post("/stages/{stage_id}/fertilizers", status_code=201)
async def create_fertilizer_recommendation(
    stage_id: uuid.UUID,
    data: FertilizerRecommendationCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Add a fertilizer recommendation to a stage."""
    result = await admin_service.create_fertilizer_rec(db, stage_id, data)
    return success_response(result)


@router.delete("/fertilizers/{rec_id}", status_code=200)
async def delete_fertilizer_recommendation(
    rec_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a fertilizer recommendation."""
    result = await admin_service.delete_fertilizer_rec(db, rec_id)
    return success_response(result)


@router.post("/stages/{stage_id}/pruning", status_code=201)
async def create_pruning_guide(
    stage_id: uuid.UUID,
    data: PruningGuideCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Add a pruning guide to a stage."""
    result = await admin_service.create_pruning_guide(db, stage_id, data)
    return success_response(result)


@router.delete("/pruning/{guide_id}", status_code=200)
async def delete_pruning_guide(
    guide_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a pruning guide."""
    result = await admin_service.delete_pruning_guide(db, guide_id)
    return success_response(result)


# ─── 7. Master Data: Diseases & Health ──────────────────────

@router.get("/diseases", status_code=200)
async def list_diseases(
    plant_id: Optional[uuid.UUID] = Query(None, description="Optional plant ID to filter"),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List diseases with crop names and solution counts."""
    result = await admin_service.list_diseases(db, plant_id)
    return success_response(result)


@router.get("/diseases/{disease_id}", status_code=200)
async def get_disease_detail(
    disease_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Get full disease detail with organic and conventional solutions."""
    result = await admin_service.get_disease_detail(db, disease_id)
    return success_response(result)


@router.post("/diseases", status_code=201)
async def create_disease(
    data: DiseaseCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Create a new disease entry with treatment solutions."""
    result = await admin_service.create_disease(db, data)
    return success_response(result)


@router.put("/diseases/{disease_id}", status_code=200)
async def update_disease(
    disease_id: uuid.UUID,
    data: DiseaseUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Update a disease entry and its solutions."""
    result = await admin_service.update_disease(db, disease_id, data)
    return success_response(result)


@router.delete("/diseases/{disease_id}", status_code=200)
async def delete_disease(
    disease_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a disease entry."""
    result = await admin_service.delete_disease(db, disease_id)
    return success_response(result)


# ─── 8. Master Data: Pests & Solutions ──────────────────────

@router.get("/pests", status_code=200)
async def list_pests(
    plant_id: Optional[uuid.UUID] = Query(None, description="Optional plant ID to filter"),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List pests across crops."""
    result = await admin_service.list_pests(db, plant_id)
    return success_response(result)


@router.get("/pests/{pest_id}", status_code=200)
async def get_pest_detail(
    pest_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Get full pest detail with treatment solutions."""
    result = await admin_service.get_pest_detail(db, pest_id)
    return success_response(result)


@router.post("/pests", status_code=201)
async def create_pest(
    data: PestCreate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Create a new pest entry with treatment solutions."""
    result = await admin_service.create_pest(db, data)
    return success_response(result)


@router.put("/pests/{pest_id}", status_code=200)
async def update_pest(
    pest_id: uuid.UUID,
    data: PestUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Update a pest entry and its solutions."""
    result = await admin_service.update_pest(db, pest_id, data)
    return success_response(result)


@router.delete("/pests/{pest_id}", status_code=200)
async def delete_pest(
    pest_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a pest entry."""
    result = await admin_service.delete_pest(db, pest_id)
    return success_response(result)


# ─── 9. Field Issues Triage ─────────────────────────────────

@router.get("/issues", status_code=200)
async def list_reported_issues(
    status: Optional[str] = Query(None, description="Filter by status: open, in_progress, resolved"),
    issue_type: Optional[str] = Query(None, description="Filter by type: disease, pest, nutrient_deficiency, other"),
    severity: Optional[str] = Query(None, description="Filter by severity: low, medium, high, critical"),
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project ID"),
    pagination: PaginationParams = Depends(get_pagination),
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """List farmer reported issues across projects."""
    issues, total = await admin_service.list_issues(db, pagination, status, issue_type, severity, project_id)
    return paginated_response(issues, pagination.page, pagination.per_page, total)


@router.get("/issues/{issue_id}", status_code=200)
async def get_issue_detail(
    issue_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Get rich detail of a reported issue."""
    result = await admin_service.get_issue_detail(db, issue_id)
    return success_response(result)


@router.patch("/issues/{issue_id}", status_code=200)
async def update_issue(
    issue_id: uuid.UUID,
    data: IssueStatusUpdate,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Update issue status, AI diagnosis, or link to master data disease/pest."""
    result = await admin_service.update_issue(db, issue_id, data)
    return success_response(result)


@router.delete("/issues/{issue_id}", status_code=200)
async def delete_issue(
    issue_id: uuid.UUID,
    admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    admin_service: AdminService = Depends(get_admin_service),
):
    """Delete a reported issue."""
    result = await admin_service.delete_issue(db, issue_id)
    return success_response(result)
