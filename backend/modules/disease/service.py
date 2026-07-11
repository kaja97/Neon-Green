from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import date
import uuid

from models.project import Project
from models.issue import ProjectIssue
from models.plant_health import PlantDisease, DiseaseSolution
from .schemas import IssueCreate

async def report_issue(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: IssueCreate):
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != account_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    issue = ProjectIssue(
        project_id=project_id,
        issue_type=data.issue_type,
        title=data.title,
        description=data.description,
        severity=data.severity,
        reported_date=date.today(),
        status="open",
        images=data.images
    )
    
    db.add(issue)
    await db.commit()
    await db.refresh(issue)
    return issue

async def get_issues(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != account_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    result = await db.execute(
        select(ProjectIssue)
        .where(ProjectIssue.project_id == project_id)
        .order_by(ProjectIssue.reported_date.desc())
    )
    return result.scalars().all()

from .matcher import match_disease

async def search_diseases(db: AsyncSession, query: str):
    # 1. Use deterministic PostgreSQL full-text search
    matches = await match_disease(db, query)
    
    if matches:
        ids = [m["id"] for m in matches]
        # Keep the order returned by matcher (highest rank first)
        # Using a simple IN clause, but reordering in python to match rank order
        result = await db.execute(select(PlantDisease).where(PlantDisease.id.in_(ids)))
        diseases = result.scalars().all()
        
        # Sort by rank
        id_to_rank = {m["id"]: m["rank"] for m in matches}
        diseases.sort(key=lambda d: id_to_rank.get(d.id, 0), reverse=True)
        return diseases
        
    # 2. Fallback to AI (Phase 6 placeholder)
    # If no DB match, we would invoke the Gemini API here.
    return []

async def get_disease_solutions(db: AsyncSession, disease_id: uuid.UUID, farming_method: str = "conventional"):
    result = await db.execute(
        select(DiseaseSolution).where(
            DiseaseSolution.disease_id == disease_id,
            DiseaseSolution.farming_method == farming_method
        )
    )
    return result.scalars().all()
