import uuid
import json
import logging
import re
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation
from models.project import Project
from models.plant import Plant, PlantVariety
from .repository import SoilTestRepository, SoilNutrientResultRepository, SoilRecommendationRepository
from .schemas import SoilTestCreate, SoilNutrientResultCreate
from .calculator import calculate_nutrient_gaps, generate_ai_recommendations
from modules.project.repository import ProjectRepository
from core.file_security import scan_file_safety, FileSecurityError
from .soil_document_parser import parse_soil_document
from .soil_extractor_prompt import build_soil_extractor_system_prompt

logger = logging.getLogger(__name__)


class SoilService:
    def __init__(
        self,
        test_repo: SoilTestRepository,
        result_repo: SoilNutrientResultRepository,
        rec_repo: SoilRecommendationRepository,
        project_repo: ProjectRepository,
    ):
        self.test_repo = test_repo
        self.result_repo = result_repo
        self.rec_repo = rec_repo
        self.project_repo = project_repo

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        from models.account import Account
        account = await db.get(Account, account_id)
        if not account or not account.farmer_profile:
            raise HTTPException(status_code=403, detail="User is not registered as a farmer")
        return account.farmer_profile.id

    async def _build_project_context(
        self, db: AsyncSession, project: Project
    ) -> dict[str, Any]:
        """Gather crop name, variety, growth stage, farming method, area for Gemini."""
        plant = await db.get(Plant, project.plant_id)
        variety = await db.get(PlantVariety, project.variety_id) if project.variety_id else None

        days_since_planting = None
        growth_stage = "vegetative"
        if project.planting_date:
            days_since_planting = (date.today() - project.planting_date).days
            if days_since_planting < 14:
                growth_stage = "nursery / seedling"
            elif days_since_planting < 45:
                growth_stage = "vegetative"
            elif days_since_planting < 75:
                growth_stage = "flowering"
            elif days_since_planting < 105:
                growth_stage = "fruit development"
            else:
                growth_stage = "harvest / maturity"

        return {
            "crop_name": plant.common_name if plant else "Unknown Crop",
            "crop_category": plant.category if plant else None,
            "variety": variety.variety_name if variety else None,
            "farming_method": project.farming_method,
            "area": f"{float(project.area)} {project.area_unit}",
            "growth_stage": growth_stage,
            "days_since_planting": days_since_planting,
            "planting_date": project.planting_date.isoformat() if project.planting_date else None,
        }

    async def submit_soil_test(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: SoilTestCreate):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        # 1. Save soil test
        soil_test = SoilTest(
            project_id=project_id,
            test_date=data.test_date,
            tested_by=data.tested_by,
            status="completed",
            notes=data.notes
        )
        db.add(soil_test)
        await db.flush()

        # 2. Save nutrient results
        soil_res = SoilNutrientResult(
            soil_test_id=soil_test.id,
            # Physical & Chemical
            ph_level=data.results.ph_level,
            electrical_conductivity_ec=data.results.electrical_conductivity_ec,
            organic_carbon_oc=data.results.organic_carbon_oc,
            cation_exchange_capacity_cec=data.results.cation_exchange_capacity_cec,
            # Primary Macronutrients
            nitrogen_n=data.results.nitrogen_n,
            phosphorus_p=data.results.phosphorus_p,
            potassium_k=data.results.potassium_k,
            # Secondary Macronutrients
            calcium_ca=data.results.calcium_ca,
            magnesium_mg=data.results.magnesium_mg,
            sulfur_s=data.results.sulfur_s,
            # Micronutrients
            zinc_zn=data.results.zinc_zn,
            boron_b=data.results.boron_b,
            iron_fe=data.results.iron_fe,
            manganese_mn=data.results.manganese_mn,
            copper_cu=data.results.copper_cu,
        )
        db.add(soil_res)

        # 3. Generate recommendations — try AI first, fall back to static calculator
        try:
            project_context = await self._build_project_context(db, project)
            recs = await generate_ai_recommendations(soil_test, soil_res, project_context)
            logger.info("AI-generated %d soil recommendations for project %s", len(recs), project_id)
        except Exception as e:
            logger.warning(
                "AI soil recommendations failed, falling back to static calculator: %s", e
            )
            recs = calculate_nutrient_gaps(soil_test, soil_res, project.farming_method)

        db.add_all(recs)

        await db.commit()
        await db.refresh(soil_test)

        soil_test.results = soil_res
        soil_test.recommendations = await self.rec_repo.get_by_test(db, soil_test.id)

        # 4. Email the recommendations to the farmer (fire-and-forget, never blocks)
        await self._send_recommendation_email(
            db, account_id, project, soil_test, soil_test.recommendations
        )

        return soil_test

    async def extract_soil_report(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Security scan document and extract soil nutrient values using Gemini AI."""
        # 1. Multi-layer security and integrity check
        try:
            is_safe, safety_msg = scan_file_safety(file_bytes, filename, content_type)
        except FileSecurityError as se:
            raise HTTPException(status_code=400, detail=f"File security check failed: {str(se)}")

        # 2. Extract text or multimodal payload
        extracted_text, raw_image_bytes, mime_type = parse_soil_document(file_bytes, filename, content_type)

        # 3. Build extraction prompt
        system_prompt = build_soil_extractor_system_prompt()

        from modules.ai.gemini_client import get_gemini_client
        client = get_gemini_client()
        if not client._is_configured():
            # Fallback if Gemini key is missing: return default structured format
            logger.warning("Gemini AI not configured. Returning baseline template.")
            return {
                "test_date": date.today().isoformat(),
                "tested_by": None,
                "notes": f"Uploaded file: {filename} (AI offline - please review fields)",
                "results": {
                    "ph_level": 6.5,
                    "electrical_conductivity_ec": None,
                    "organic_carbon_oc": None,
                    "cation_exchange_capacity_cec": None,
                    "nitrogen_n": None,
                    "phosphorus_p": None,
                    "potassium_k": None,
                    "calcium_ca": None,
                    "magnesium_mg": None,
                    "sulfur_s": None,
                    "zinc_zn": None,
                    "boron_b": None,
                    "iron_fe": None,
                    "manganese_mn": None,
                    "copper_cu": None,
                },
                "raw_extracted_nutrients": [],
                "confidence_score": 0.5,
                "security_scan": {"safe": is_safe, "message": safety_msg},
            }

        raw_client = client._get_client()

        # Prepare Gemini content parts (multimodal or text)
        parts = [{"text": system_prompt}]

        if raw_image_bytes:
            # Multimodal image/PDF bytes
            try:
                from google.genai import types
                parts.append(types.Part.from_bytes(data=raw_image_bytes, mime_type=mime_type))
            except Exception as e:
                logger.warning("Could not attach binary part to GenAI client: %s", e)

        if extracted_text:
            parts.append({"text": f"\n\n=== EXTRACTED LABORATORY REPORT CONTENT ===\nFilename: {filename}\n\n{extracted_text}"})
        else:
            parts.append({"text": f"\n\nAnalyze the attached document/image '{filename}' and extract all laboratory soil analysis data."})

        try:
            response = raw_client.models.generate_content(
                model=client.model_name,
                contents=[{"role": "user", "parts": parts}],
                config={"temperature": 0.1, "max_output_tokens": 2048},
            )

            response_text = response.text or "{}"
            # Clean markdown codeblocks if present
            cleaned_json = re.sub(r"^```json\s*", "", response_text.strip())
            cleaned_json = re.sub(r"^```\s*", "", cleaned_json)
            cleaned_json = re.sub(r"\s*```$", "", cleaned_json)

            data = json.loads(cleaned_json)

            # Ensure results dict exists and contains ph_level
            results = data.get("results", {})
            if "ph_level" not in results or results["ph_level"] is None:
                results["ph_level"] = 6.5
            else:
                try:
                    results["ph_level"] = float(results["ph_level"])
                except (ValueError, TypeError):
                    results["ph_level"] = 6.5

            data["results"] = results
            data["security_scan"] = {"safe": is_safe, "message": safety_msg}
            return data

        except Exception as e:
            logger.error("Gemini soil report extraction error: %s", e, exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"AI extraction failed to process document: {str(e)}"
            )

    async def upload_and_create_soil_test(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
        account_id: uuid.UUID,
        file_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None
    ) -> SoilTest:
        """One-click upload, security scan, AI extraction, and soil test creation with recommendations."""
        # 1. Extract report data via AI
        extracted = await self.extract_soil_report(file_bytes, filename, content_type)

        # 2. Parse test_date
        test_date_val = date.today()
        if extracted.get("test_date"):
            try:
                test_date_val = date.fromisoformat(str(extracted["test_date"]))
            except Exception:
                test_date_val = date.today()

        # 3. Build SoilTestCreate payload
        res_data = extracted.get("results", {})
        nutrient_create = SoilNutrientResultCreate(
            ph_level=float(res_data.get("ph_level", 6.5)),
            electrical_conductivity_ec=res_data.get("electrical_conductivity_ec"),
            organic_carbon_oc=res_data.get("organic_carbon_oc"),
            cation_exchange_capacity_cec=res_data.get("cation_exchange_capacity_cec"),
            nitrogen_n=res_data.get("nitrogen_n"),
            phosphorus_p=res_data.get("phosphorus_p"),
            potassium_k=res_data.get("potassium_k"),
            calcium_ca=res_data.get("calcium_ca"),
            magnesium_mg=res_data.get("magnesium_mg"),
            sulfur_s=res_data.get("sulfur_s"),
            zinc_zn=res_data.get("zinc_zn"),
            boron_b=res_data.get("boron_b"),
            iron_fe=res_data.get("iron_fe"),
            manganese_mn=res_data.get("manganese_mn"),
            copper_cu=res_data.get("copper_cu"),
        )

        test_create = SoilTestCreate(
            test_date=test_date_val,
            tested_by=extracted.get("tested_by") or f"Report: {filename}",
            notes=extracted.get("notes") or f"AI auto-extracted from {filename}",
            results=nutrient_create
        )

        # 4. Submit soil test & calculate recommendations
        return await self.submit_soil_test(db, project_id, account_id, test_create)

    async def _send_recommendation_email(
        self,
        db: AsyncSession,
        account_id: uuid.UUID,
        project: Project,
        soil_test: SoilTest,
        recommendations: list[SoilRecommendation],
    ) -> None:
        """Send soil recommendations to the farmer's email. Failures are logged, not raised."""
        try:
            from models.account import Account
            from core.email_service import send_email
            from core.email_templates import soil_recommendation_email

            account = await db.get(Account, account_id)
            if not account or not account.email:
                logger.warning("No email found for account %s — skipping soil email", account_id)
                return

            profile = account.farmer_profile
            full_name = profile.full_name if profile else "Farmer"

            plant = await db.get(Plant, project.plant_id)
            crop_name = plant.common_name if plant else "Unknown Crop"
            project_area = f"{float(project.area)} {project.area_unit}"
            test_date = soil_test.test_date.isoformat()

            rec_dicts = [
                {
                    "recommendation_type": r.recommendation_type,
                    "description": r.description,
                }
                for r in recommendations
            ]

            if not rec_dicts:
                logger.info("No recommendations to email for project %s", project.id)
                return

            html_body, plain_body = soil_recommendation_email(
                full_name=full_name,
                crop_name=crop_name,
                project_area=project_area,
                test_date=test_date,
                recommendations=rec_dicts,
            )

            success = await send_email(
                to=account.email,
                subject=f"🌱 Soil Test Results & Recommendations — {crop_name}",
                html_body=html_body,
                plain_body=plain_body,
            )

            if success:
                logger.info(
                    "Soil recommendation email sent to %s for project %s",
                    account.email, project.id,
                )
            else:
                logger.warning(
                    "Soil recommendation email failed for %s (project %s)",
                    account.email, project.id,
                )
        except Exception as e:
            logger.error("Failed to send soil recommendation email: %s", e, exc_info=True)

    async def get_soil_tests(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        tests = await self.test_repo.get_by_project(db, project_id)

        if not tests:
            return []

        for test in tests:
            test.results = await self.result_repo.get_by_test(db, test.id)
            test.recommendations = await self.rec_repo.get_by_test(db, test.id)

        return tests

    async def resend_soil_email(
        self,
        db: AsyncSession,
        test_id: uuid.UUID,
        account_id: uuid.UUID,
    ):
        soil_test = await self.test_repo.get(db, test_id)
        if not soil_test:
            raise HTTPException(status_code=404, detail="Soil test not found")

        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, soil_test.project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this soil test")

        soil_test.recommendations = await self.rec_repo.get_by_test(db, soil_test.id)
        await self._send_recommendation_email(
            db, account_id, project, soil_test, soil_test.recommendations
        )
        return {"message": "Soil recommendation email sent successfully"}

    async def get_soil_recommendations(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        tests = await self.test_repo.get_by_project(db, project_id)
        if not tests:
            return []

        latest = tests[0]
        return await self.rec_repo.get_by_test(db, latest.id)
