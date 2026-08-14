import pytest
from seed.plants import plants
from seed.varieties import varieties
from seed.stages import stages
from seed.water import water_requirements
from seed.nutrient_requirements import nutrient_requirements
from seed.fertilizers import fertilizers
from seed.pruning import pruning_guides
from seed.diseases import diseases
from seed.disease_solutions import disease_solutions

def test_plants_metadata():
    assert len(plants) >= 70
    for p in plants:
        assert p["id"]
        assert p["common_name"]
        assert p["category"] in ["vegetable", "fruit", "grain", "legume", "tuber", "spice", "plantation", "cash_crop", "herb"]
        assert p["is_active"] is True

def test_varieties_completeness():
    assert len(varieties) >= 150
    plant_ids = {p["id"] for p in plants}
    for v in varieties:
        assert v["plant_id"] in plant_ids
        assert v["variety_name"]
        assert v["growth_duration_days"] > 0
        assert v["expected_yield_per_acre_kg"] > 0

def test_stages_continuity():
    assert len(stages) == len(plants) * 6
    for p in plants:
        p_stages = sorted([s for s in stages if s["plant_id"] == p["id"]], key=lambda x: x["stage_order"])
        assert len(p_stages) == 6
        expected_start = 0
        for s in p_stages:
            assert s["start_day"] == expected_start
            assert s["end_day"] > s["start_day"]
            expected_start = s["end_day"]

def test_water_and_nutrient_coverage():
    stage_ids = {s["id"] for s in stages}
    water_stage_ids = {w["stage_id"] for w in water_requirements}
    nutrient_stage_ids = {n["stage_id"] for n in nutrient_requirements}
    
    assert water_stage_ids == stage_ids
    assert nutrient_stage_ids == stage_ids

def test_organic_fertilizers_no_synthetics():
    synthetic_terms = ["urea", "tsp", "mop", "synthetic", "10-26-26"]
    for f in fertilizers:
        if f["farming_method"] == "organic":
            for term in synthetic_terms:
                assert term not in f["fertilizer_name"].lower(), f"Synthetic term '{term}' found in organic fertilizer: {f['fertilizer_name']}"

def test_diseases_and_solutions():
    assert len(diseases) >= 280
    assert len(disease_solutions) >= 840
    disease_ids = {d["id"] for d in diseases}
    for sol in disease_solutions:
        assert sol["disease_id"] in disease_ids
        assert sol["farming_method"] in ["conventional", "organic", "integrated"]
        assert sol["solution_type"] in ["curative", "preventive"]
