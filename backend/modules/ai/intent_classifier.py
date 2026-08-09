import re

INTENT_PATTERNS = {
    "weather": r"\b(weather|rain|temperature|humidity|forecast|wind|storm|drought|frost)\b",
    "disease": r"\b(disease|blight|wilt|rot|fungus|pest|insect|yellow|spots|leaves|curling|mildew)\b",
    "fertilizer": r"\b(fertilizer|nutrient|npk|nitrogen|phosphorus|potassium|urea|compost|manure|feed)\b",
    "watering": r"\b(water|irrigation|irrigat|drought|moisture|dry|wet)\b",
    "pruning": r"\b(prun|trim|desuck|topping|pinch|sucker|cut\s*back|train|thinning|vine\s*tip)\b",
    "harvest": r"\b(harvest|yield|pick|ready|mature|ripe)\b",
    "soil": r"\b(soil|ph|acidity|alkaline|organic matter|clay|sandy|loam)\b",
    "schedule": r"\b(schedule|plan|activity|task|todo|next|upcoming|calendar)\b",
    "progress": r"\b(progress|stage|growth|how is|status|overview|dashboard)\b",
}

# Patterns that indicate the user wants specific numeric / calculation answers
CALCULATION_PATTERNS = r"\b(how much|how many|quantity|dosage|per acre|per hectare|calculate|deficit|level|ppm|kg|gram|litre|liter|ratio|amount|shortage|excess|requirement|need\s+per|apply\s+per)\b"


def classify_intent(message: str) -> tuple[str, bool]:
    """Classify a farmer's question into an intent and whether it needs calculation.

    Returns:
        (intent, needs_calculation) — e.g. ("fertilizer", True)
    """
    message_lower = message.lower()
    scores = {}
    for intent, pattern in INTENT_PATTERNS.items():
        matches = re.findall(pattern, message_lower)
        if matches:
            scores[intent] = len(matches)

    intent = max(scores, key=scores.get) if scores else "general"

    # Check if the question demands specific numeric / quantity answers
    needs_calculation = bool(re.search(CALCULATION_PATTERNS, message_lower))

    # Promote fertilizer/soil questions with calculation keywords to nutrient_calculation
    if needs_calculation and intent in ("fertilizer", "soil"):
        intent = "nutrient_calculation"

    return intent, needs_calculation
