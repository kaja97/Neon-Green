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

async def search_diseases(db: AsyncSession, query: str):
    # Using simple ILIKE matching on symptoms cast to string or name for fallback
    # In a full Postgres setup, we would use `to_tsvector` and `@@`.
    # Casting array to text for simpler search across dialects:
    from sqlalchemy import cast, String, or_
    
    search_term = f"%{query}%"
    result = await db.execute(
        select(PlantDisease).where(
            or_(
                PlantDisease.name.ilike(search_term),
                cast(PlantDisease.symptoms, String).ilike(search_term)
            )
        ).limit(10)
    )
    return result.scalars().all()

async def get_disease_solutions(db: AsyncSession, disease_id: uuid.UUID, farming_method: str = "conventional"):
    result = await db.execute(
        select(DiseaseSolution).where(
            DiseaseSolution.disease_id == disease_id,
            DiseaseSolution.farming_method == farming_method
        )
    )
    return result.scalars().all()
