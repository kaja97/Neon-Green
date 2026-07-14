from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date
import uuid

class IssueCreate(BaseModel):
    issue_type: str  # disease, pest, nutrient_deficiency, other
    title: str
    description: Optional[str] = None
    severity: str  # low, medium, high, critical
    images: Optional[List[str]] = None

class IssueResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    issue_type: str
    title: str
    description: Optional[str]
    severity: str
    reported_date: date
    status: str
    resolved_date: Optional[date] = None
    images: Optional[List[str]]
    ai_diagnosis: Optional[str]
    identified_disease_id: Optional[uuid.UUID]
    identified_pest_id: Optional[uuid.UUID]

    model_config = ConfigDict(from_attributes=True)

class DiseaseSearchResponse(BaseModel):
    id: uuid.UUID
    plant_id: uuid.UUID
    name: str
    scientific_name: Optional[str]
    description: Optional[str]
    symptoms: List[str]
    severity: str
    image_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class DiseaseSolutionResponse(BaseModel):
    id: uuid.UUID
    farming_method: str
    solution_type: str
    treatment_name: str
    dosage: str
    instructions: str

    model_config = ConfigDict(from_attributes=True)

class DiseaseSolutionCreate(BaseModel):
    farming_method: str  # organic, conventional
    solution_type: str   # preventive, curative
    treatment_name: str
    dosage: str
    instructions: str
