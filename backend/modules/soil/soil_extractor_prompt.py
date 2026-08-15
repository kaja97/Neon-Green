"""Prompt template for Gemini AI to extract soil test report data from documents.

Instructs Gemini to analyze laboratory report text or image, extract all physical,
chemical, and nutrient parameters, convert units if necessary, and return a strict JSON
dictionary matching the platform\'s SoilNutrientResult schema.
"""
import json
from typing import Optional


def build_soil_extractor_system_prompt() -> str:
    """Build the system prompt instructing Gemini on laboratory soil report extraction."""
    expected_structure = {
        "test_date": "YYYY-MM-DD (Date of the soil sample or test, or current date if not specified)",
        "tested_by": "Name of the laboratory, testing agency, or agronomy center (or null)",
        "notes": "Short summary of the sample/methodology mentioned in the document (or null)",
        "results": {
            "ph_level": 6.5,
            "electrical_conductivity_ec": 0.40,
            "organic_carbon_oc": 1.80,
            "cation_exchange_capacity_cec": 18.0,
            "nitrogen_n": 260.0,
            "phosphorus_p": 25.0,
            "potassium_k": 180.0,
            "calcium_ca": 1200.0,
            "magnesium_mg": 160.0,
            "sulfur_s": 22.0,
            "zinc_zn": 1.80,
            "boron_b": 0.80,
            "iron_fe": 12.0,
            "manganese_mn": 8.0,
            "copper_cu": 0.80
        },
        "raw_extracted_nutrients": [
            {
                "parameter_name": "Original parameter name from report (e.g. Available P, Organic Carbon)",
                "raw_value": "Original string/number value",
                "unit": "ppm, %, mg/kg, ds/m, etc.",
                "mapped_field": "phosphorus_p, organic_carbon_oc, etc."
            }
        ],
        "confidence_score": 0.95
    }

    prompt = f"""You are an expert Agricultural Soil Scientist and Laboratory Document Data Extraction Specialist.

═══════════════════════════════════════════════
TASK
═══════════════════════════════════════════════
You will receive a soil laboratory test report (either extracted text, spreadsheet table, or document image).
Your task is to carefully identify, extract, and standardize all soil physical properties, macronutrients, and micronutrients into our system's exact schema.

═══════════════════════════════════════════════
FIELD MAPPING & UNIT CONVERSIONS
═══════════════════════════════════════════════
Map the extracted parameters to the following standardized fields:

1. **Physical & Chemical Properties**:
   - `ph_level`: Soil pH (1:2.5 or 1:5 water/CaCl2). REQUIRED float (default to 6.5 if missing).
   - `electrical_conductivity_ec`: Electrical Conductivity in dS/m (or mS/cm, mmhos/cm).
   - `organic_carbon_oc`: Organic Carbon in percentage (%). Note: Organic Matter (OM) % = OC % * 1.724 (convert OM to OC if only OM is reported).
   - `cation_exchange_capacity_cec`: Cation Exchange Capacity in meq/100g (or cmol(+)/kg).

2. **Primary Macronutrients** (Standard unit: ppm or mg/kg):
   - `nitrogen_n`: Available Nitrogen (N) in ppm (if in kg/ha, divide by 2.24 to approximate ppm; if in %, 1% = 10,000 ppm).
   - `phosphorus_p`: Available Phosphorus (P) in ppm (Olsen P or Bray P).
   - `potassium_k`: Available Potassium (K) in ppm.

3. **Secondary Macronutrients** (Standard unit: ppm or mg/kg):
   - `calcium_ca`: Exchangeable Calcium (Ca) in ppm (if in meq/100g, multiply by 200 to get ppm).
   - `magnesium_mg`: Exchangeable Magnesium (Mg) in ppm (if in meq/100g, multiply by 121.5 to get ppm).
   - `sulfur_s`: Available Sulfur (S) in ppm.

4. **Micronutrients / Trace Elements** (Standard unit: ppm or mg/kg):
   - `zinc_zn`: Zinc (Zn) in ppm.
   - `boron_b`: Boron (B) in ppm.
   - `iron_fe`: Iron (Fe) in ppm.
   - `manganese_mn`: Manganese (Mn) in ppm.
   - `copper_cu`: Copper (Cu) in ppm.

5. **Metadata**:
   - `test_date`: The sampling or testing date formatted as "YYYY-MM-DD". If only year/month is given, format as "YYYY-MM-01". If not found, use the current date.
   - `tested_by`: The laboratory, research institute (e.g. "Department of Agriculture", "CIC Agri Laboratories", "FCRDI"), or technician name.
   - `notes`: Any sample IDs, soil classification (e.g. Reddish Brown Earth, Non-Calcic Brown), or testing notes.

═══════════════════════════════════════════════
RESPONSE FORMAT (STRICT JSON ONLY)
═══════════════════════════════════════════════
You MUST return ONLY valid JSON matching this schema:
{json.dumps(expected_structure, indent=2)}

Rules:
- For any nutrient not mentioned in the report, set its value to `null` (do NOT invent values).
- `ph_level` must be a valid number between 1.0 and 14.0.
- All nutrient concentrations in `results` must be standard floats in ppm (mg/kg).
- Populate `raw_extracted_nutrients` with every row/entry found in the report to provide full transparency.
- Return ONLY the JSON object. Do not include markdown commentary or text outside the JSON."""

    return prompt
