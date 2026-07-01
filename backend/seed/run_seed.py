import asyncio
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import async_session
from models.plant import Plant, PlantStage, PlantWaterReq, PlantNutrientReq
from models.account import Account
# from seed.farming_methods import farming_methods
from seed.plants import plants
from seed.stages import stages
from seed.water import water_requirements

async def seed_data():
    print("Starting database seeding...")
    async with async_session() as session:
        # Create map of old IDs to new UUIDs
        plant_id_map = {}
        stage_id_map = {}

        # 1. Insert Plants
        print("Inserting Plants...")
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
                optimal_ph_max=p_data.get("optimal_ph_max")
            )
            session.add(plant)
        
        await session.flush()
        
        # 2. Insert Stages
        print("Inserting Stages...")
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

        # 3. Insert Water Requirements
        print("Inserting Water Requirements...")
        for w_data in water_requirements:
            stage_id = stage_id_map.get(w_data["stage_id"])
            if not stage_id:
                continue
                
            water_req = PlantWaterReq(
                plant_stage_id=stage_id,
                water_mm_per_day=w_data["water_mm_per_day"],
                frequency_days=w_data["irrigation_frequency_days"],
                drought_tolerance="Medium"
            )
            session.add(water_req)

        await session.commit()
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_data())
