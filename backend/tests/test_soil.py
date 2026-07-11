import pytest
import uuid
from models.soil import SoilTest, SoilNutrientResult
from modules.soil.calculator import calculate_nutrient_gaps

def test_soil_calculator_nitrogen():
    test = SoilTest(id=uuid.uuid4())
    result = SoilNutrientResult(
        ph_level=6.5,
        nitrogen_level="low",
        phosphorus_level="optimal",
        potassium_level="optimal"
    )
    
    # Conventional
    recs_conv = calculate_nutrient_gaps(test, result, "conventional")
    assert any("Urea" in r.description for r in recs_conv), "Should recommend Urea for conventional low nitrogen"
    
    # Organic
    recs_org = calculate_nutrient_gaps(test, result, "organic")
    assert any("compost" in r.description.lower() for r in recs_org), "Should recommend compost/blood meal for organic low nitrogen"
    assert not any("Urea" in r.description for r in recs_org), "Should NOT recommend Urea for organic"

def test_soil_calculator_ph():
    test = SoilTest(id=uuid.uuid4())
    
    result_low = SoilNutrientResult(ph_level=5.5, nitrogen_level="optimal", phosphorus_level="optimal", potassium_level="optimal")
    recs_low = calculate_nutrient_gaps(test, result_low, "conventional")
    assert any("lime" in r.description.lower() for r in recs_low)
    
    result_high = SoilNutrientResult(ph_level=8.0, nitrogen_level="optimal", phosphorus_level="optimal", potassium_level="optimal")
    recs_high = calculate_nutrient_gaps(test, result_high, "conventional")
    assert any("sulfur" in r.description.lower() for r in recs_high)
