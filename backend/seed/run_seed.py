"""
Complete database seeder — inserts all reference data:
  - 5 Plants with yield data
  - 30 Plant Stages
  - 30 Water Requirements
  - 30 Nutrient Requirements
  - 40 Diseases
  - 80 Disease Solutions
  - 150 Market Prices (30 days × 5 crops × 2 regions)
"""
import asyncio
import uuid
import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import async_session
from sqlalchemy.future import select
from models.plant import Plant, PlantStage, PlantWaterReq, PlantNutrientReq
from models.plant_health import PlantDisease, DiseaseSolution
from models.market import MarketPrice
from models.plant_fertilizer import PlantFertilizerRecommendation

from seed.plants import plants
from seed.stages import stages
from seed.water import water_requirements
from seed.nutrient_requirements import nutrient_requirements
from seed.diseases import diseases
from seed.disease_solutions import disease_solutions
from seed.market_prices import generate_market_prices
from seed.fertilizers import fertilizers

# Expected yields per acre in kg (for revenue estimation)
YIELD_DATA = {
    "p1": 8000,   # Tomato
    "p2": 3000,   # Chili
    "p3": 2500,   # Rice
    "p4": 6000,   # Brinjal
    "p5": 4000,   # Beans
    "p6": 6000,   # Onion
    "p7": 8000,   # Potato
    "p8": 10000,  # Cassava
    "p9": 1200,   # Finger Millet
    "p10": 4500,  # Coconut
    "p11": 800,    # Green Gram
    "p12": 4500,   # Okra
    "p13": 1000,   # Cowpea
    "p14": 5000,   # Bitter Gourd
    "p15": 8000,   # Sweet Potato
    "p16": 1200,   # Peanut
    "p17": 800,    # Black Gram
    "p18": 1000,   # Soybean
    "p19": 3000,   # Maize
    "p20": 1000,   # Pearl Millet
    "p21": 1200,   # Sorghum
    "p22": 900,    # Foxtail Millet
    "p23": 2500,   # Gotukola
    "p24": 3000,   # Spinach
    "p25": 6000,   # Beetroot
    "p26": 5000,   # Radish
    "p27": 9000,   # Yam
}

async def seed_data():
    print("🌱 Starting database seeding...")
    async with async_session() as session:
        # Idempotency check — skip if plants already exist
        existing = await session.execute(select(Plant).limit(1))
        if existing.scalars().first():
            print("✅ Data already seeded. Skipping.")
            return

        plant_id_map = {}
        stage_id_map = {}
        disease_id_map = {}

        # ── 1. Plants ────────────────────────────────────
        print("  📦 Inserting 5 Plants...")
        for p_data in plants:
            plant_id = uuid.uuid4()
            plant_id_map[p_data["id"]] = plant_id

            plant = Plant(
                id=plant_id,
                common_name=p_data["name"],
                scientific_name=p_data.get("scientific_name"),
                category="Vegetable" if p_data["name"] != "Rice" else "Grain",
                growth_duration_days=p_data["growth_duration_days"],
                optimal_ph_min=p_data.get("optimal_ph_min"),
                optimal_ph_max=p_data.get("optimal_ph_max"),
                expected_yield_per_acre_kg=YIELD_DATA.get(p_data["id"], 0)
            )
            session.add(plant)

        await session.flush()

        # ── 2. Plant Stages ──────────────────────────────
        print("  📦 Inserting 30 Stages...")
        for s_data in stages:
            stage_id = uuid.uuid4()
            stage_id_map[s_data["id"]] = stage_id

            plant_id = plant_id_map.get(s_data["plant_id"])
            if not plant_id:
                continue

            stage = PlantStage(
                id=stage_id,
                plant_id=plant_id,
                stage_name=s_data["stage_name"],
                stage_order=s_data["stage_order"],
                start_day=s_data["start_day"],
                end_day=s_data["end_day"]
            )
            session.add(stage)

        await session.flush()

        # ── 3. Water Requirements ────────────────────────
        print("  💧 Inserting Water Requirements...")
        for w_data in water_requirements:
            stage_id = stage_id_map.get(w_data["stage_id"])
            if not stage_id:
                continue

            water_req = PlantWaterReq(
                plant_stage_id=stage_id,
                water_mm_per_day=w_data["water_mm_per_day"],
                frequency_days=w_data["irrigation_frequency_days"],
                drought_tolerance=w_data.get("drought_tolerance", "Medium")
            )
            session.add(water_req)

        await session.flush()

        # ── 4. Nutrient Requirements ─────────────────────
        print("  🧪 Inserting Nutrient Requirements...")
        for n_data in nutrient_requirements:
            stage_id = stage_id_map.get(n_data["stage_id"])
            if not stage_id:
                continue

            nut_req = PlantNutrientReq(
                plant_stage_id=stage_id,
                nitrogen_kg=n_data["nitrogen_kg"],
                phosphorus_kg=n_data["phosphorus_kg"],
                potassium_kg=n_data["potassium_kg"]
            )
            session.add(nut_req)

        await session.flush()

        # ── 5. Diseases ──────────────────────────────────
        print("  🦠 Inserting 40 Diseases...")
        for d_data in diseases:
            disease_id = uuid.uuid4()
            disease_id_map[d_data["id"]] = disease_id

            plant_id = plant_id_map.get(d_data["plant_id"])
            if not plant_id:
                continue

            disease = PlantDisease(
                id=disease_id,
                plant_id=plant_id,
                name=d_data["name"],
                scientific_name=d_data.get("scientific_name"),
                description=d_data.get("description"),
                symptoms=d_data["symptoms"],
                conditions=d_data.get("conditions", []),
                severity=d_data["severity"]
            )
            session.add(disease)

        await session.flush()

        # ── 6. Disease Solutions ─────────────────────────
        print("  💊 Inserting 80 Disease Solutions...")
        for sol_data in disease_solutions:
            disease_id = disease_id_map.get(sol_data["disease_id"])
            if not disease_id:
                continue

            solution = DiseaseSolution(
                disease_id=disease_id,
                farming_method=sol_data["farming_method"],
                solution_type=sol_data["solution_type"],
                treatment_name=sol_data["treatment_name"],
                dosage=sol_data["dosage"],
                instructions=sol_data["instructions"]
            )
            session.add(solution)

        await session.flush()

        # ── 7. Market Prices ─────────────────────────────
        print("  💰 Inserting 300 Market Price records...")
        market_prices = generate_market_prices()
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

        # ── 8. Fertilizer Recommendations ────────────────
        print("  🧪 Inserting Fertilizer Recommendations...")
        for f_data in fertilizers:
            stage_id = stage_id_map.get(f_data["stage_id"])
            if not stage_id:
                continue

            fert_rec = PlantFertilizerRecommendation(
                plant_stage_id=stage_id,
                farming_method=f_data["farming_method"],
                fertilizer_name=f_data["fertilizer_name"],
                application_rate_per_acre_kg=f_data["rate"],
                instructions=f_data["instructions"]
            )
            session.add(fert_rec)

        # ── Commit all ───────────────────────────────────
        await session.commit()

    print("✅ Database seeding completed!")
    print("   📊 Summary:")
    print(f"      Plants:              {len(plants)}")
    print(f"      Stages:              {len(stages)}")
    print(f"      Water Requirements:  {len(water_requirements)}")
    print(f"      Nutrient Reqs:       {len(nutrient_requirements)}")
    print(f"      Diseases:            {len(diseases)}")
    print(f"      Disease Solutions:    {len(disease_solutions)}")
    print(f"      Market Prices:       {len(market_prices)}")
    print(f"      Fertilizer Reqs:     {len(fertilizers)}")

if __name__ == "__main__":
    asyncio.run(seed_data())
