"""
Deterministic Soil Nutrient Gap Calculator
"""
from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation

def calculate_nutrient_gaps(test: SoilTest, result: SoilNutrientResult, farming_method: str) -> list[SoilRecommendation]:
    recs = []
    
    # pH logic
    if result.ph_level < 6.0:
        desc = "Apply agricultural lime (100kg/acre) to raise pH." if farming_method != "organic" else "Apply calcitic limestone or wood ash to raise pH."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="amendment", description=desc))
    elif result.ph_level > 7.5:
        desc = "Apply elemental sulfur to lower pH." if farming_method != "organic" else "Add pine needles or sphagnum peat moss to lower pH."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="amendment", description=desc))

    # Nitrogen
    if result.nitrogen_level.lower() == "low":
        desc = "Apply Urea (50kg/acre) as basal dressing." if farming_method != "organic" else "Apply mature compost or blood meal (high N)."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))

    # Phosphorus
    if result.phosphorus_level.lower() == "low":
        desc = "Apply TSP (Triple Super Phosphate) (25kg/acre)." if farming_method != "organic" else "Apply bone meal or rock phosphate."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))

    # Potassium
    if result.potassium_level.lower() == "low":
        desc = "Apply MOP (Muriate of Potash) (25kg/acre)." if farming_method != "organic" else "Apply kelp meal or banana peel tea."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))
        
    return recs
