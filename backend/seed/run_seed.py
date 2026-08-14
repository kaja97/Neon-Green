"""
Complete database seeder & migrator — inserts and syncs all reference data:
  - 70 Plants with complete metadata
  - 158+ Plant Varieties with biological and agronomic parameters
  - 420 Plant Stages (6 continuous stages per crop)
  - 420 Water Requirements
  - 420 Nutrient Requirements
  - 1260 Fertilizer Recommendations (Conventional, Organic, Integrated)
  - 138+ Pruning Guides
  - 280 Diseases with complete symptomology
  - 840 Disease Solutions across farming methods
  - 6300+ Market Prices across major economic centers
  - Generates seasonal activity plans for all projects in DB
"""

import asyncio
import uuid
import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import async_session
from sqlalchemy.future import select
from sqlalchemy import text
from models.plant import Plant, PlantVariety, PlantStage, PlantWaterReq, PlantNutrientReq
from models.plant_health import PlantDisease, DiseaseSolution
from models.market import MarketPrice
from models.plant_fertilizer import PlantFertilizerRecommendation
from models.plant_pruning import PlantPruningGuide
from models.project import Project
from modules.planner.sync_planner import generate_plan_for_project

from seed.plants import plants
from seed.varieties import varieties
from seed.stages import stages
from seed.water import water_requirements
from seed.nutrient_requirements import nutrient_requirements
from seed.diseases import diseases
from seed.disease_solutions import disease_solutions
from seed.market_prices import generate_market_prices
from seed.fertilizers import fertilizers
from seed.pruning import pruning_guides

async def seed_data(session=None):
    close_session_at_end = False
    if session is None:
        close_session_at_end = True
        session = async_session()

    try:
        print("🌱 Starting comprehensive database seed & migration...")

        # ── 1. Plants (Upsert) ───────────────────────────
        print(f"  📦 Processing {len(plants)} Plants...")
        existing_plants_res = await session.execute(select(Plant))
        existing_plants = {p.common_name.lower(): p for p in existing_plants_res.scalars().all()}
        
        plant_id_map = {} # seed_id -> db_uuid

        for p_data in plants:
            cname = p_data.get("common_name") or p_data.get("name")
            key = cname.lower()
            
            if key in existing_plants:
                p_db = existing_plants[key]
                p_db.common_name = cname
                p_db.local_name = p_data.get("local_name")
                p_db.category = p_data.get("category", "vegetable")
                p_db.sub_category = p_data.get("sub_category")
                p_db.description = p_data.get("description")
                p_db.is_active = True
                plant_id_map[p_data["id"]] = p_db.id
            else:
                new_id = uuid.uuid4()
                p_db = Plant(
                    id=new_id,
                    common_name=cname,
                    local_name=p_data.get("local_name"),
                    category=p_data.get("category", "vegetable"),
                    sub_category=p_data.get("sub_category"),
                    description=p_data.get("description"),
                    is_active=True
                )
                session.add(p_db)
                plant_id_map[p_data["id"]] = new_id

        await session.flush()

        # ── 2. Varieties (Upsert) ────────────────────────
        print(f"  🌱 Processing {len(varieties)} Varieties...")
        existing_vars_res = await session.execute(select(PlantVariety))
        existing_vars = {(v.plant_id, v.variety_name.lower()): v for v in existing_vars_res.scalars().all()}
        
        for v_data in varieties:
            plant_id = plant_id_map.get(v_data["plant_id"])
            if not plant_id:
                continue

            v_name = v_data["variety_name"]
            key = (plant_id, v_name.lower())

            if key in existing_vars:
                v_db = existing_vars[key]
                v_db.scientific_name = v_data.get("scientific_name")
                v_db.growth_duration_days = v_data["growth_duration_days"]
                v_db.optimal_ph_min = v_data.get("optimal_ph_min")
                v_db.optimal_ph_max = v_data.get("optimal_ph_max")
                v_db.optimal_temp_min = v_data.get("optimal_temp_min")
                v_db.optimal_temp_max = v_data.get("optimal_temp_max")
                v_db.optimal_rainfall_mm = v_data.get("optimal_rainfall_mm")
                v_db.expected_yield_per_acre_kg = v_data.get("expected_yield_per_acre_kg")
                v_db.compatible_soil_types = v_data.get("compatible_soil_types")
                v_db.companion_plants = v_data.get("companion_plants")
                v_db.incompatible_plants = v_data.get("incompatible_plants")
                v_db.description = v_data.get("description")
                v_db.is_active = True
            else:
                v_db = PlantVariety(
                    id=uuid.uuid4(),
                    plant_id=plant_id,
                    variety_name=v_name,
                    scientific_name=v_data.get("scientific_name"),
                    growth_duration_days=v_data["growth_duration_days"],
                    optimal_ph_min=v_data.get("optimal_ph_min"),
                    optimal_ph_max=v_data.get("optimal_ph_max"),
                    optimal_temp_min=v_data.get("optimal_temp_min"),
                    optimal_temp_max=v_data.get("optimal_temp_max"),
                    optimal_rainfall_mm=v_data.get("optimal_rainfall_mm"),
                    expected_yield_per_acre_kg=v_data.get("expected_yield_per_acre_kg"),
                    compatible_soil_types=v_data.get("compatible_soil_types"),
                    companion_plants=v_data.get("companion_plants"),
                    incompatible_plants=v_data.get("incompatible_plants"),
                    description=v_data.get("description"),
                    is_active=True
                )
                session.add(v_db)

        await session.flush()

        # ── 3. Plant Stages (Upsert) ─────────────────────
        print(f"  📦 Processing {len(stages)} Stages...")
        existing_stages_res = await session.execute(select(PlantStage))
        existing_stages = {(s.plant_id, s.stage_order): s for s in existing_stages_res.scalars().all()}
        
        stage_id_map = {} # seed_stage_id -> db_uuid

        for s_data in stages:
            plant_id = plant_id_map.get(s_data["plant_id"])
            if not plant_id:
                continue

            order = s_data["stage_order"]
            key = (plant_id, order)

            if key in existing_stages:
                s_db = existing_stages[key]
                s_db.stage_name = s_data["stage_name"]
                s_db.start_day = s_data["start_day"]
                s_db.end_day = s_data["end_day"]
                s_db.description = s_data.get("description")
                s_db.key_indicators = s_data.get("key_indicators")
                s_db.critical_actions = s_data.get("critical_actions")
                s_db.watch_for = s_data.get("watch_for")
                stage_id_map[s_data["id"]] = s_db.id
            else:
                stage_id = uuid.uuid4()
                stage_id_map[s_data["id"]] = stage_id
                s_db = PlantStage(
                    id=stage_id,
                    plant_id=plant_id,
                    stage_name=s_data["stage_name"],
                    stage_order=order,
                    start_day=s_data["start_day"],
                    end_day=s_data["end_day"],
                    description=s_data.get("description"),
                    key_indicators=s_data.get("key_indicators"),
                    critical_actions=s_data.get("critical_actions"),
                    watch_for=s_data.get("watch_for")
                )
                session.add(s_db)

        await session.flush()

        # ── 4. Water Requirements ────────────────────────
        print(f"  💧 Processing {len(water_requirements)} Water Requirements...")
        existing_water_res = await session.execute(select(PlantWaterReq))
        existing_water = {w.plant_stage_id: w for w in existing_water_res.scalars().all()}

        for w_data in water_requirements:
            stage_id = stage_id_map.get(w_data["stage_id"])
            if not stage_id:
                continue

            if stage_id in existing_water:
                w_db = existing_water[stage_id]
                w_db.water_mm_per_day = w_data["water_mm_per_day"]
                w_db.frequency_days = w_data["irrigation_frequency_days"]
                w_db.drought_tolerance = w_data.get("drought_tolerance", "Medium")
            else:
                w_db = PlantWaterReq(
                    plant_stage_id=stage_id,
                    water_mm_per_day=w_data["water_mm_per_day"],
                    frequency_days=w_data["irrigation_frequency_days"],
                    drought_tolerance=w_data.get("drought_tolerance", "Medium")
                )
                session.add(w_db)

        await session.flush()

        # ── 5. Nutrient Requirements ─────────────────────
        print(f"  🧪 Processing {len(nutrient_requirements)} Nutrient Requirements...")
        existing_nut_res = await session.execute(select(PlantNutrientReq))
        existing_nut = {n.plant_stage_id: n for n in existing_nut_res.scalars().all()}

        for n_data in nutrient_requirements:
            stage_id = stage_id_map.get(n_data["stage_id"])
            if not stage_id:
                continue

            if stage_id in existing_nut:
                n_db = existing_nut[stage_id]
                n_db.nitrogen_kg = n_data["nitrogen_kg"]
                n_db.phosphorus_kg = n_data["phosphorus_kg"]
                n_db.potassium_kg = n_data["potassium_kg"]
            else:
                n_db = PlantNutrientReq(
                    plant_stage_id=stage_id,
                    nitrogen_kg=n_data["nitrogen_kg"],
                    phosphorus_kg=n_data["phosphorus_kg"],
                    potassium_kg=n_data["potassium_kg"]
                )
                session.add(n_db)

        await session.flush()

        # ── 6. Fertilizers Recommendations ───────────────
        print(f"  🧪 Processing {len(fertilizers)} Fertilizer Recommendations...")
        existing_fert_res = await session.execute(select(PlantFertilizerRecommendation))
        existing_fert = {(f.plant_stage_id, f.farming_method): f for f in existing_fert_res.scalars().all()}

        for f_data in fertilizers:
            stage_id = stage_id_map.get(f_data["stage_id"])
            if not stage_id:
                continue

            method = f_data["farming_method"]
            key = (stage_id, method)

            if key in existing_fert:
                f_db = existing_fert[key]
                f_db.fertilizer_name = f_data["fertilizer_name"]
                f_db.application_rate_per_acre_kg = f_data["rate"]
                f_db.instructions = f_data.get("instructions")
            else:
                f_db = PlantFertilizerRecommendation(
                    plant_stage_id=stage_id,
                    farming_method=method,
                    fertilizer_name=f_data["fertilizer_name"],
                    application_rate_per_acre_kg=f_data["rate"],
                    instructions=f_data.get("instructions")
                )
                session.add(f_db)

        await session.flush()

        # ── 7. Pruning Guides ────────────────────────────
        print(f"  ✂️  Processing {len(pruning_guides)} Pruning Guides...")
        existing_prune_res = await session.execute(select(PlantPruningGuide))
        existing_prune = {(p.plant_stage_id, p.pruning_type): p for p in existing_prune_res.scalars().all()}

        for pg_data in pruning_guides:
            stage_id = stage_id_map.get(pg_data["stage_id"])
            if not stage_id:
                continue

            ptype = pg_data["pruning_type"]
            key = (stage_id, ptype)

            if key in existing_prune:
                p_db = existing_prune[key]
                p_db.pruning_method = pg_data["pruning_method"]
                p_db.trigger_day = pg_data.get("trigger_day", 0)
                p_db.frequency_days = pg_data.get("frequency_days", 0)
                p_db.pre_pruning = pg_data.get("pre_pruning")
                p_db.post_pruning = pg_data.get("post_pruning")
                p_db.tools_needed = pg_data.get("tools_needed")
                p_db.season_notes = pg_data.get("season_notes")
                p_db.importance = pg_data.get("importance", "recommended")
            else:
                p_db = PlantPruningGuide(
                    plant_stage_id=stage_id,
                    pruning_type=ptype,
                    pruning_method=pg_data["pruning_method"],
                    trigger_day=pg_data.get("trigger_day", 0),
                    frequency_days=pg_data.get("frequency_days", 0),
                    pre_pruning=pg_data.get("pre_pruning"),
                    post_pruning=pg_data.get("post_pruning"),
                    tools_needed=pg_data.get("tools_needed"),
                    season_notes=pg_data.get("season_notes"),
                    importance=pg_data.get("importance", "recommended")
                )
                session.add(p_db)

        await session.flush()

        # ── 8. Diseases (Upsert) ─────────────────────────
        print(f"  🦠 Processing {len(diseases)} Diseases...")
        existing_dis_res = await session.execute(select(PlantDisease))
        existing_dis = {(d.plant_id, d.name.lower()): d for d in existing_dis_res.scalars().all()}
        
        disease_id_map = {} # seed_dis_id -> db_uuid

        for d_data in diseases:
            plant_id = plant_id_map.get(d_data["plant_id"])
            if not plant_id:
                continue

            d_name = d_data["name"]
            key = (plant_id, d_name.lower())

            if key in existing_dis:
                d_db = existing_dis[key]
                d_db.scientific_name = d_data.get("scientific_name")
                d_db.description = d_data.get("description")
                d_db.symptoms = d_data["symptoms"]
                d_db.conditions = d_data.get("conditions", [])
                d_db.severity = d_data["severity"]
                disease_id_map[d_data["id"]] = d_db.id
            else:
                dis_id = uuid.uuid4()
                disease_id_map[d_data["id"]] = dis_id
                d_db = PlantDisease(
                    id=dis_id,
                    plant_id=plant_id,
                    name=d_name,
                    scientific_name=d_data.get("scientific_name"),
                    description=d_data.get("description"),
                    symptoms=d_data["symptoms"],
                    conditions=d_data.get("conditions", []),
                    severity=d_data["severity"]
                )
                session.add(d_db)

        await session.flush()

        # ── 9. Disease Solutions ─────────────────────────
        print(f"  💊 Processing {len(disease_solutions)} Disease Solutions...")
        existing_sol_res = await session.execute(select(DiseaseSolution))
        existing_sol = {(s.disease_id, s.farming_method, s.solution_type): s for s in existing_sol_res.scalars().all()}

        for sol_data in disease_solutions:
            disease_id = disease_id_map.get(sol_data["disease_id"])
            if not disease_id:
                continue

            key = (disease_id, sol_data["farming_method"], sol_data["solution_type"])

            if key in existing_sol:
                s_db = existing_sol[key]
                s_db.treatment_name = sol_data["treatment_name"]
                s_db.dosage = sol_data["dosage"]
                s_db.instructions = sol_data["instructions"]
            else:
                s_db = DiseaseSolution(
                    disease_id=disease_id,
                    farming_method=sol_data["farming_method"],
                    solution_type=sol_data["solution_type"],
                    treatment_name=sol_data["treatment_name"],
                    dosage=sol_data["dosage"],
                    instructions=sol_data["instructions"]
                )
                session.add(s_db)

        await session.flush()

        # ── 10. Market Prices ────────────────────────────
        print(f"  💰 Inserting / Updating Market Prices...")
        market_prices = generate_market_prices(days_back=15)
        for mp_data in market_prices:
            plant_id = plant_id_map.get(mp_data["plant_id"])
            if not plant_id:
                continue

            price = MarketPrice(
                plant_id=plant_id,
                region=mp_data["region"],
                date=date.fromisoformat(mp_data["date"]),
                price_per_kg=mp_data["price_per_kg"],
                currency=mp_data["currency"],
                source=mp_data["source"]
            )
            session.add(price)

        await session.flush()

        # ── 11. Activities Generation for all Projects ────
        print("  🚜 Generating Activity Plans for all Projects...")
        projects_res = await session.execute(select(Project))
        projects = projects_res.scalars().all()
        
        for proj in projects:
            print(f"     -> Generating full activity plan for project {proj.id} ({proj.name})...")
            try:
                count = await generate_plan_for_project(session, proj.id)
                proj.plan_generation_status = "completed"
                print(f"        ✓ Generated {count} farming activities.")
            except Exception as pe:
                print(f"        ⚠️ Error generating plan for {proj.id}: {pe}")

        await session.commit()
        print("✅ Database seed & migration completed successfully!")

    except Exception as e:
        await session.rollback()
        print(f"❌ Error during seeding: {e}")
        raise e
    finally:
        if close_session_at_end:
            await session.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
