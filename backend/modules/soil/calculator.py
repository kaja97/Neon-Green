"""
Soil Nutrient Gap Calculator + AI-Powered Recommendations

Two recommendation paths:
  1. generate_ai_recommendations()  — sends soil data + project context to Gemini
                                       for crop-specific, stage-aware recommendations
  2. calculate_nutrient_gaps()      — deterministic fallback using static conversion
                                       factors (used when Gemini is unavailable)
"""
import json
import logging
import re
from typing import Any

from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation
from .soil_ai_prompt import build_soil_recommendation_prompt

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# PATH 1: AI-Powered Recommendations via Gemini
# ═══════════════════════════════════════════════════════════════════════════════

async def generate_ai_recommendations(
    test: SoilTest,
    result: SoilNutrientResult,
    project_context: dict[str, Any],
) -> list[SoilRecommendation]:
    """Call Gemini to generate crop-specific soil recommendations.

    Args:
        test: The saved SoilTest record (for test.id)
        result: The SoilNutrientResult with all nutrient values
        project_context: Dict with crop, variety, farming_method, area, growth_stage, etc.

    Returns:
        List of SoilRecommendation ORM objects ready to db.add_all()

    Raises:
        Exception if Gemini call fails (caller should fall back to static calculator)
    """
    from modules.ai.gemini_client import get_gemini_client

    # Build soil data dict from the ORM model
    soil_data = _extract_soil_data(result)

    # Build the prompt
    prompt = build_soil_recommendation_prompt(soil_data, project_context)

    # Call Gemini
    client = get_gemini_client()
    if not client._is_configured():
        raise RuntimeError("Gemini API key not configured")

    raw_client = client._get_client()
    response = raw_client.models.generate_content(
        model=client.model_name,
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
        config={
            "temperature": 0.4,  # Lower temp for structured/factual output
            "max_output_tokens": 3000,
        },
    )

    response_text = response.text if response.text else ""
    logger.info("Gemini soil recommendations received (%d chars)", len(response_text))

    # Parse the JSON response
    recs_data = _parse_gemini_json(response_text)
    if not recs_data:
        raise ValueError("Failed to parse Gemini response as JSON")

    # Convert to SoilRecommendation ORM objects
    recommendations = []
    for item in recs_data:
        rec_type = item.get("recommendation_type", "practice")
        if rec_type not in ("fertilizer", "amendment", "practice"):
            rec_type = "practice"

        description = item.get("description", "")
        if not description:
            continue

        # Keep description clean for email and UI display
        priority = item.get("priority", "medium")

        recommendations.append(SoilRecommendation(
            soil_test_id=test.id,
            recommendation_type=rec_type,
            description=description,
        ))

    if not recommendations:
        raise ValueError("Gemini returned zero valid recommendations")

    logger.info(
        "Generated %d AI soil recommendations (fertilizer=%d, amendment=%d, practice=%d)",
        len(recommendations),
        sum(1 for r in recommendations if r.recommendation_type == "fertilizer"),
        sum(1 for r in recommendations if r.recommendation_type == "amendment"),
        sum(1 for r in recommendations if r.recommendation_type == "practice"),
    )
    return recommendations


def _extract_soil_data(result: SoilNutrientResult) -> dict[str, Any]:
    """Extract all nutrient values from the ORM model into a clean dict."""
    data = {}
    fields = [
        ("ph_level", "pH Level"),
        ("electrical_conductivity_ec", "EC (ds/m)"),
        ("organic_carbon_oc", "Organic Carbon (%)"),
        ("cation_exchange_capacity_cec", "CEC (meq/100g)"),
        ("nitrogen_n", "Nitrogen N (ppm)"),
        ("phosphorus_p", "Phosphorus P (ppm)"),
        ("potassium_k", "Potassium K (ppm)"),
        ("calcium_ca", "Calcium Ca (ppm)"),
        ("magnesium_mg", "Magnesium Mg (ppm)"),
        ("sulfur_s", "Sulfur S (ppm)"),
        ("zinc_zn", "Zinc Zn (ppm)"),
        ("boron_b", "Boron B (ppm)"),
        ("iron_fe", "Iron Fe (ppm)"),
        ("manganese_mn", "Manganese Mn (ppm)"),
        ("copper_cu", "Copper Cu (ppm)"),
    ]
    for attr, label in fields:
        val = getattr(result, attr, None)
        if val is not None:
            data[label] = float(val)
        else:
            data[label] = None
    return data


def _parse_gemini_json(text: str) -> list[dict] | None:
    """Extract and parse JSON from Gemini's response text.

    Handles cases where Gemini wraps JSON in ```json ... ``` code blocks
    or includes extra text before/after.
    """
    # Try direct parse first
    try:
        parsed = json.loads(text.strip())
        if isinstance(parsed, dict) and "recommendations" in parsed:
            return parsed["recommendations"]
        if isinstance(parsed, list):
            return parsed
        return None
    except json.JSONDecodeError:
        pass

    # Try extracting from ```json ... ``` code block
    code_block = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if code_block:
        try:
            parsed = json.loads(code_block.group(1).strip())
            if isinstance(parsed, dict) and "recommendations" in parsed:
                return parsed["recommendations"]
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass

    # Try finding JSON object in text
    brace_match = re.search(r"\{.*\}", text, re.DOTALL)
    if brace_match:
        try:
            parsed = json.loads(brace_match.group())
            if isinstance(parsed, dict) and "recommendations" in parsed:
                return parsed["recommendations"]
        except json.JSONDecodeError:
            pass

    logger.error("Failed to parse Gemini soil JSON. Raw text: %s", text[:500])
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# PATH 2: Static Fallback Calculator (deterministic, no API needed)
# ═══════════════════════════════════════════════════════════════════════════════

# Optimal ranges for each nutrient (ppm)
OPTIMAL_RANGES: dict[str, dict[str, float]] = {
    # Primary Macronutrients
    "nitrogen_n":  {"min": 250, "max": 400},
    "phosphorus_p": {"min": 20,  "max": 40},
    "potassium_k":  {"min": 150, "max": 250},
    # Secondary Macronutrients
    "calcium_ca":   {"min": 800, "max": 1600},
    "magnesium_mg": {"min": 100, "max": 200},
    "sulfur_s":     {"min": 10,  "max": 30},
    # Micronutrients
    "zinc_zn":      {"min": 1.0, "max": 5.0},
    "boron_b":      {"min": 0.5, "max": 2.0},
    "iron_fe":      {"min": 10,  "max": 40},
    "manganese_mn": {"min": 5,   "max": 30},
    "copper_cu":    {"min": 0.5, "max": 5.0},
}

# Conversion factors: deficit_ppm × factor = kg/acre of product to apply
PRIMARY_CONVERSION = {
    "nitrogen_n":  {"product": "Urea (46% N)",       "organic_alt": "compost or blood meal",          "factor": 0.4},
    "phosphorus_p": {"product": "TSP (Triple Super Phosphate)", "organic_alt": "bone meal or rock phosphate", "factor": 2.5},
    "potassium_k":  {"product": "MOP (Muriate of Potash)", "organic_alt": "kelp meal or banana peel tea", "factor": 1.5},
}

SECONDARY_CONVERSION = {
    "calcium_ca":   {"product": "Gypsum (Calcium sulfate)",           "organic_alt": "agricultural lime or dolomite", "factor": 0.12},
    "magnesium_mg": {"product": "Magnesium sulfate (Epsom salt)",      "organic_alt": "dolomite lime or kieserite",     "factor": 0.25},
    "sulfur_s":     {"product": "Elemental sulfur",                   "organic_alt": "gypsum or composted manure",     "factor": 0.6},
}

MICRO_CONVERSION = {
    "zinc_zn":      {"product": "Zinc sulfate",      "organic_alt": "zinc chelate or compost",  "factor": 3.0},
    "boron_b":      {"product": "Borax (Sodium borate)", "organic_alt": "compost or seaweed extract", "factor": 2.5},
    "iron_fe":      {"product": "Iron sulfate",      "organic_alt": "seaweed extract or compost", "factor": 0.3},
    "manganese_mn": {"product": "Manganese sulfate",  "organic_alt": "compost or manure",         "factor": 0.5},
    "copper_cu":    {"product": "Copper sulfate",     "organic_alt": "copper chelate or compost",  "factor": 5.0},
}


def _round_kg(value: float) -> int:
    """Round kg/acre to nearest integer, minimum 1 if positive."""
    rounded = round(value)
    return max(1, rounded) if rounded > 0 else 1


def calculate_nutrient_gaps(
    test: SoilTest,
    result: SoilNutrientResult,
    farming_method: str,
) -> list[SoilRecommendation]:
    """Calculate fertilizer & amendment recommendations from numeric soil test values.

    This is the deterministic fallback used when Gemini AI is unavailable.
    """
    recs = []

    # ── pH Recommendations ──
    ph = float(result.ph_level) if result.ph_level is not None else None
    if ph is not None:
        if ph < 6.0:
            deficit = round((6.5 - ph) * 150, 1)  # ~150 kg lime per 0.1 pH unit per acre
            if farming_method != "organic":
                desc = f"Soil is acidic (pH {ph}). Apply agricultural lime ({_round_kg(deficit)}kg/acre) to raise pH toward 6.5."
            else:
                desc = f"Soil is acidic (pH {ph}). Apply calcitic limestone or wood ash ({_round_kg(deficit)}kg/acre) to raise pH."
            recs.append(SoilRecommendation(
                soil_test_id=test.id,
                recommendation_type="amendment",
                description=desc,
            ))
        elif ph > 7.5:
            excess = round((ph - 7.5) * 50, 1)  # ~50 kg sulfur per 0.1 pH unit per acre
            if farming_method != "organic":
                desc = f"Soil is alkaline (pH {ph}). Apply elemental sulfur ({_round_kg(excess)}kg/acre) to lower pH toward 7.0."
            else:
                desc = f"Soil is alkaline (pH {ph}). Add pine needles or sphagnum peat moss ({_round_kg(excess)}kg/acre) to lower pH."
            recs.append(SoilRecommendation(
                soil_test_id=test.id,
                recommendation_type="amendment",
                description=desc,
            ))

    # ── EC (Electrical Conductivity) ──
    ec = float(result.electrical_conductivity_ec) if result.electrical_conductivity_ec is not None else None
    if ec is not None and ec > 2.5:
        if farming_method != "organic":
            desc = f"High soil salinity (EC {ec} ds/m). Apply gypsum (500kg/acre) and improve drainage. Consider leaching irrigation."
        else:
            desc = f"High soil salinity (EC {ec} ds/m). Add organic matter to improve soil structure and apply gypsum (500kg/acre)."
        recs.append(SoilRecommendation(
            soil_test_id=test.id,
            recommendation_type="amendment",
            description=desc,
        ))

    # ── Primary Macronutrients ──
    _process_nutrients(test, result, recs, PRIMARY_CONVERSION, "fertilizer", farming_method)

    # ── Secondary Macronutrients ──
    _process_nutrients(test, result, recs, SECONDARY_CONVERSION, "fertilizer", farming_method)

    # ── Micronutrients ──
    _process_nutrients(test, result, recs, MICRO_CONVERSION, "fertilizer", farming_method)

    return recs


def _process_nutrients(
    test: SoilTest,
    result: SoilNutrientResult,
    recs: list[SoilRecommendation],
    conversion_table: dict[str, dict],
    rec_type: str,
    farming_method: str,
) -> None:
    """Generic nutrient processing: check deficit, apply conversion factor, generate recommendation."""
    for attr, info in conversion_table.items():
        value = getattr(result, attr, None)
        if value is None:
            continue  # Not tested — skip

        value_ppm = float(value)
        optimal = OPTIMAL_RANGES[attr]
        friendly_name = attr.replace("_", " ").title()

        if value_ppm < optimal["min"]:
            deficit_ppm = optimal["min"] - value_ppm
            kg_per_acre = _round_kg(deficit_ppm * info["factor"])

            if farming_method != "organic":
                desc = (
                    f"{friendly_name} is deficient ({value_ppm} ppm, optimal: {optimal['min']}-{optimal['max']} ppm). "
                    f"Apply {info['product']} ({kg_per_acre}kg/acre)."
                )
            else:
                desc = (
                    f"{friendly_name} is deficient ({value_ppm} ppm, optimal: {optimal['min']}-{optimal['max']} ppm). "
                    f"Apply {info['organic_alt']} ({kg_per_acre}kg/acre)."
                )
            recs.append(SoilRecommendation(
                soil_test_id=test.id,
                recommendation_type=rec_type,
                description=desc,
            ))

        elif value_ppm > optimal["max"]:
            # Optimal to abundant reserve
            desc = (
                f"{friendly_name} reserve is abundant ({value_ppm} ppm, optimal: {optimal['min']}-{optimal['max']} ppm). "
                f"Sufficient nutrient reserve present; withhold additional {friendly_name.lower()} fertilizer this cycle."
            )
            recs.append(SoilRecommendation(
                soil_test_id=test.id,
                recommendation_type="practice",
                description=desc,
            ))
