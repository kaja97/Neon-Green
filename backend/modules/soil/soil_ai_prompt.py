"""Prompt template for AI-powered soil recommendations via Gemini.

Sends the soil test data + project context to Gemini and instructs it to
return a JSON array of fertilizer & amendment recommendations.
"""
import json
from typing import Any


def build_soil_recommendation_prompt(
    soil_data: dict[str, Any],
    project_context: dict[str, Any],
) -> str:
    """Build the full prompt for Gemini to generate soil recommendations.

    Args:
        soil_data: Dict of nutrient values from the soil test (ppm, pH, EC, etc.)
        project_context: Dict with crop name, variety, farming method, area, growth stage, etc.

    Returns:
        Complete prompt string to send to Gemini.
    """
    response_template = {
        "recommendations": [
            {
                "recommendation_type": "fertilizer | amendment | practice",
                "description": "Full recommendation text with product name, dosage per acre, when to apply, how to apply, and why",
                "priority": "high | medium | low",
            }
        ]
    }

    prompt = f"""You are an expert Agriculture Soil Scientist and Fertilizer Advisor specializing in Sri Lankan farming.

═══════════════════════════════════════════════
TASK
═══════════════════════════════════════════════
Analyze the soil test results below and generate fertilizer & amendment recommendations
for this specific crop, farming method, and growth stage.

═══════════════════════════════════════════════
SOIL TEST DATA (laboratory results)
═══════════════════════════════════════════════
{json.dumps(soil_data, indent=2)}

═══════════════════════════════════════════════
PROJECT CONTEXT (farmer's crop details)
═══════════════════════════════════════════════
{json.dumps(project_context, indent=2)}

═══════════════════════════════════════════════
WHAT TO CALCULATE & RECOMMEND
═══════════════════════════════════════════════
For each nutrient, compare the test value against optimal ranges for the specific crop:

1. **pH Correction** (if outside 6.0–7.0 for most crops):
   - Calculate lime/sulfur needed per acre
   - Recommend specific products (agricultural lime, dolomite, elemental sulfur)

2. **Primary Macronutrients (N, P, K)**:
   - Calculate deficit = optimal_for_crop - measured_value
   - Convert deficit to kg/acre of specific fertilizer product
   - For organic farming: recommend organic alternatives (compost, bone meal, rock phosphate, etc.)
   - For conventional: recommend specific synthetic fertilizers (Urea, TSP, MOP, etc.)
   - Consider the growth stage: seedling needs more N, flowering needs more P & K

3. **Secondary Macronutrients (Ca, Mg, S)**:
   - Flag deficiencies and recommend specific amendments
   - Consider nutrient interactions (e.g., excess Ca blocks Mg absorption)

4. **Micronutrients (Zn, B, Fe, Mn, Cu)**:
   - Flag any that are below optimal for the crop
   - Recommend foliar sprays or soil amendments

5. **EC (Salinity)** if above 2.5 ds/m:
   - Recommend salinity management (gypsum, leaching, drainage)

6. **Organic Carbon / CEC**:
   - If low organic matter, recommend compost/green manure

7. **Excess Warnings**:
   - Flag any nutrients above optimal range
   - Warn about potential toxicity symptoms

═══════════════════════════════════════════════
RECOMMENDATION GUIDELINES
═══════════════════════════════════════════════
- Be specific: mention exact product names, dosages (kg/acre), and timing
- Consider the farming method: "{project_context.get('farming_method', 'conventional')}"
  - If organic: ONLY recommend organic-approved inputs
  - If conventional: recommend both synthetic and organic options
  - If integrated: mix of both
- Consider the growth stage: "{project_context.get('growth_stage', 'unknown')}"
  - Adjust NPK ratios based on stage
- Consider the area: {project_context.get('area', 'unknown')} — calculate total product needed
- Order recommendations by priority (most critical deficiency first)
- Include 1-2 general soil health practice recommendations

═══════════════════════════════════════════════
RESPONSE FORMAT (STRICT JSON)
═══════════════════════════════════════════════
You MUST respond with ONLY valid JSON matching this exact structure:
{json.dumps(response_template, indent=2)}

Rules:
- "recommendation_type" must be one of: "fertilizer", "amendment", "practice"
  - "fertilizer" = NPK, micronutrient products
  - "amendment" = pH correction, salinity management, organic matter
  - "practice" = warnings about excess nutrients, general soil health tips
- "description" must be a complete, readable sentence with:
  - Product/treatment name
  - Dosage per acre (and total for the farmer's area)
  - When to apply (relative to growth stage)
  - How to apply (soil drench, foliar spray, broadcasting, etc.)
- "priority" must be "high", "medium", or "low"
- Generate between 3-12 recommendations depending on how many issues exist
- Do NOT include explanations outside the JSON
- Return ONLY the JSON object, nothing else"""

    return prompt
