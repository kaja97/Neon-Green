import pytest
import uuid
from models.soil import SoilTest, SoilNutrientResult
from modules.soil.calculator import calculate_nutrient_gaps, OPTIMAL_RANGES


def _make_test():
    return SoilTest(id=uuid.uuid4())


def _make_result(**kwargs):
    """Create a SoilNutrientResult with default values, overridden by kwargs."""
    defaults = {
        "ph_level": 6.5,
    }
    defaults.update(kwargs)
    return SoilNutrientResult(**defaults)


# ── pH Tests ──

class TestPHRecommendations:
    def test_acidic_soil_recommends_lime_conventional(self):
        test = _make_test()
        result = _make_result(ph_level=5.5)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        lime_recs = [r for r in recs if "lime" in r.description.lower()]
        assert len(lime_recs) == 1, "Should recommend lime for acidic soil"
        assert "kg/acre" in lime_recs[0].description
        assert lime_recs[0].recommendation_type == "amendment"

    def test_acidic_soil_recommends_organic_alternative(self):
        test = _make_test()
        result = _make_result(ph_level=5.2)
        recs = calculate_nutrient_gaps(test, result, "organic")
        lime_recs = [r for r in recs if "lime" in r.description.lower() or "wood ash" in r.description.lower()]
        assert len(lime_recs) == 1, "Should recommend organic lime alternative"
        assert "Urea" not in lime_recs[0].description

    def test_alkaline_soil_recommends_sulfur(self):
        test = _make_test()
        result = _make_result(ph_level=8.0)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        sulfur_recs = [r for r in recs if "sulfur" in r.description.lower()]
        assert len(sulfur_recs) == 1, "Should recommend sulfur for alkaline soil"
        assert "kg/acre" in sulfur_recs[0].description

    def test_optimal_ph_no_recs(self):
        test = _make_test()
        result = _make_result(ph_level=6.5)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        ph_recs = [r for r in recs if "lime" in r.description.lower() or "sulfur" in r.description.lower()]
        assert len(ph_recs) == 0, "Optimal pH should produce no pH-related recommendations"


# ── Primary Macronutrient Tests ──

class TestPrimaryMacronutrients:
    def test_nitrogen_deficit_urea_conventional(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, nitrogen_n=120)  # below optimal 250
        recs = calculate_nutrient_gaps(test, result, "conventional")
        n_recs = [r for r in recs if "nitrogen" in r.description.lower()]
        assert len(n_recs) == 1
        assert "Urea" in n_recs[0].description
        # deficit = 250 - 120 = 130, kg = 130 * 0.4 = 52
        assert "52kg/acre" in n_recs[0].description
        assert n_recs[0].recommendation_type == "fertilizer"

    def test_nitrogen_deficit_organic_compost(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, nitrogen_n=100)
        recs = calculate_nutrient_gaps(test, result, "organic")
        n_recs = [r for r in recs if "nitrogen" in r.description.lower()]
        assert len(n_recs) == 1
        assert "compost" in n_recs[0].description.lower()
        assert "Urea" not in n_recs[0].description

    def test_phosphorus_deficit_real_kg(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, phosphorus_p=5)  # below optimal 20
        recs = calculate_nutrient_gaps(test, result, "conventional")
        p_recs = [r for r in recs if "phosphorus" in r.description.lower()]
        assert len(p_recs) == 1
        assert "TSP" in p_recs[0].description
        # deficit = 20 - 5 = 15, kg = 15 * 2.5 = 37.5 → 38
        assert "38kg/acre" in p_recs[0].description

    def test_potassium_deficit_real_kg(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, potassium_k=50)  # below optimal 150
        recs = calculate_nutrient_gaps(test, result, "conventional")
        k_recs = [r for r in recs if "potassium" in r.description.lower()]
        assert len(k_recs) == 1
        assert "MOP" in k_recs[0].description
        # deficit = 150 - 50 = 100, kg = 100 * 1.5 = 150
        assert "150kg/acre" in k_recs[0].description

    def test_optimal_npk_no_fertilizer_recs(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, nitrogen_n=300, phosphorus_p=30, potassium_k=200)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        fert_recs = [r for r in recs if r.recommendation_type == "fertilizer"]
        assert len(fert_recs) == 0, "Optimal NPK should produce no fertilizer recommendations"

    def test_excess_nitrogen_warning(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, nitrogen_n=600)  # above optimal 400
        recs = calculate_nutrient_gaps(test, result, "conventional")
        n_recs = [r for r in recs if "nitrogen" in r.description.lower()]
        assert len(n_recs) == 1
        assert "toxicity" in n_recs[0].description.lower() or "avoid" in n_recs[0].description.lower()
        assert n_recs[0].recommendation_type == "practice"


# ── Secondary Macronutrient Tests ──

class TestSecondaryMacronutrients:
    def test_calcium_deficit(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, calcium_ca=400)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        ca_recs = [r for r in recs if "calcium" in r.description.lower()]
        assert len(ca_recs) == 1
        assert "Gypsum" in ca_recs[0].description

    def test_magnesium_deficit_organic(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, magnesium_mg=50)
        recs = calculate_nutrient_gaps(test, result, "organic")
        mg_recs = [r for r in recs if "magnesium" in r.description.lower()]
        assert len(mg_recs) == 1
        assert "dolomite" in mg_recs[0].description.lower()


# ── Micronutrient Tests ──

class TestMicronutrients:
    def test_zinc_deficit(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, zinc_zn=0.3)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        zn_recs = [r for r in recs if "zinc" in r.description.lower()]
        assert len(zn_recs) == 1
        assert "Zinc sulfate" in zn_recs[0].description

    def test_iron_deficit(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, iron_fe=5)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        fe_recs = [r for r in recs if "iron" in r.description.lower()]
        assert len(fe_recs) == 1
        assert "Iron sulfate" in fe_recs[0].description


# ── NULL Nutrient Tests ──

class TestNullNutrients:
    def test_null_nutrients_skipped(self):
        test = _make_test()
        result = _make_result(ph_level=6.5)  # all nutrients are None
        recs = calculate_nutrient_gaps(test, result, "conventional")
        fert_recs = [r for r in recs if r.recommendation_type == "fertilizer"]
        assert len(fert_recs) == 0, "NULL nutrients should not generate recommendations"

    def test_mixed_null_and_values(self):
        test = _make_test()
        # Only nitrogen provided, rest are NULL
        result = _make_result(ph_level=6.5, nitrogen_n=100)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        n_recs = [r for r in recs if "nitrogen" in r.description.lower()]
        assert len(n_recs) == 1
        # No other nutrient recs
        other_recs = [r for r in recs if "phosphorus" in r.description.lower()
                      or "potassium" in r.description.lower()
                      or "zinc" in r.description.lower()]
        assert len(other_recs) == 0


# ── EC Tests ──

class TestECRecommendations:
    def test_high_ec_recommends_gypsum(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, electrical_conductivity_ec=3.5)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        ec_recs = [r for r in recs if "salinity" in r.description.lower()]
        assert len(ec_recs) == 1
        assert "gypsum" in ec_recs[0].description.lower()

    def test_normal_ec_no_recs(self):
        test = _make_test()
        result = _make_result(ph_level=6.5, electrical_conductivity_ec=1.2)
        recs = calculate_nutrient_gaps(test, result, "conventional")
        ec_recs = [r for r in recs if "salinity" in r.description.lower()]
        assert len(ec_recs) == 0
