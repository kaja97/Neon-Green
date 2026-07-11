FALLBACK_RESPONSES = {
    "weather": "Based on the weather forecast for your area, I recommend checking the weather module for the latest 5-day forecast. If heavy rain is expected, consider delaying fertilizer application and ensuring proper drainage.",
    "disease": "Common symptoms like yellow spots or wilting leaves could indicate several diseases. Use the Disease Search feature to look up specific symptoms. Early Blight and Late Blight are common in this season. Always remove and destroy infected plant parts.",
    "fertilizer": "For your current growth stage, check the Activity Planner for specific fertilizer recommendations. Remember: organic methods use compost, vermicompost, and bio-fertilizers; conventional methods use synthetic NPK formulations.",
    "watering": "Water requirements vary by growth stage. Check your activity plan for the recommended daily water amount. As a general rule: water deeply but less frequently. Morning watering is best to reduce disease risk.",
    "harvest": "Monitor your crop for maturity indicators specific to the variety. Check the Farming Circle on your dashboard to see how close you are to the expected harvest date.",
    "soil": "Soil health is crucial. If you haven't done a soil test recently, submit one through the Soil Analysis feature. Ideal pH for most vegetables is 6.0-7.0.",
    "general": "I can help with questions about your crop's health, watering schedule, fertilizer needs, weather impacts, and disease identification. Try asking something specific about your farm!"
}

def get_system_prompt(context_json: str) -> str:
    return f"""You are AgriFarm AI, a helpful farming assistant for Sri Lankan farmers.
You provide practical, actionable advice based on the farmer's specific context.
Keep responses concise (under 200 words). Use simple language.
Always consider the farmer's farming method (organic vs conventional) when recommending treatments.

FARMER'S CURRENT PROJECT CONTEXT:
{context_json}"""
