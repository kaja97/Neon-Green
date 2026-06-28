from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import BaseModel
import uuid

class PlantDisease(BaseModel):
    __tablename__ = "plant_diseases"
    
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    scientific_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    symptoms: Mapped[list[str]] = mapped_column(ARRAY(String))
    conditions: Mapped[list[str]] = mapped_column(ARRAY(String)) # e.g. "high humidity", "temp > 30C"
    severity: Mapped[str] = mapped_column(String(50))
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

class DiseaseSolution(BaseModel):
    __tablename__ = "disease_solutions"
    
    disease_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_diseases.id", ondelete="CASCADE"))
    farming_method: Mapped[str] = mapped_column(String(50)) # organic, conventional
    solution_type: Mapped[str] = mapped_column(String(50)) # preventive, curative
    treatment_name: Mapped[str] = mapped_column(String(255))
    dosage: Mapped[str] = mapped_column(String(255))
    instructions: Mapped[Text] = mapped_column(Text)

class PlantPest(BaseModel):
    __tablename__ = "plant_pests"
    
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    scientific_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    signs: Mapped[list[str]] = mapped_column(ARRAY(String))
    affected_parts: Mapped[list[str]] = mapped_column(ARRAY(String))
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

class PestSolution(BaseModel):
    __tablename__ = "pest_solutions"
    
    pest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_pests.id", ondelete="CASCADE"))
    farming_method: Mapped[str] = mapped_column(String(50))
    treatment_name: Mapped[str] = mapped_column(String(255))
    dosage: Mapped[str] = mapped_column(String(255))
    instructions: Mapped[Text] = mapped_column(Text)
