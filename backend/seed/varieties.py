"""
Seed data for plant_varieties.

Each entry references a plant by its seed id (p1, p2, ...) and provides 2-3
realistic named varieties/cultivars for that crop. These are the options shown
in the second dropdown of the New Project wizard after a plant is chosen.
"""

varieties = [
    # ── p1: Tomato ──────────────────────────────
    {"plant_id": "p1", "variety_name": "Roma", "description": "Plum tomato, thick flesh, ideal for sauces and paste."},
    {"plant_id": "p1", "variety_name": "Cherry", "description": "Small, sweet fruit; high-yielding and quick to mature."},
    {"plant_id": "p1", "variety_name": "Beefsteak", "description": "Large, juicy fruit for fresh market."},

    # ── p2: Chili ───────────────────────────────
    {"plant_id": "p2", "variety_name": "Red Hot", "description": "High pungency cayenne type for drying."},
    {"plant_id": "p2", "variety_name": "Bird's Eye", "description": "Small very hot pods, popular for spice powder."},

    # ── p3: Rice ────────────────────────────────
    {"plant_id": "p3", "variety_name": "Samba", "description": "Short-grain, hard texture, suited to dry-zone paddies."},
    {"plant_id": "p3", "variety_name": "Nadu", "description": "Medium-grain all-purpose variety."},
    {"plant_id": "p3", "variety_name": "Basmati", "description": "Long-grain fragrant rice."},

    # ── p4: Brinjal ─────────────────────────────
    {"plant_id": "p4", "variety_name": "Long Purple", "description": "Elongated purple fruit, high yield."},
    {"plant_id": "p4", "variety_name": "Round Green", "description": "Round green-white fruit, mild flavor."},

    # ── p5: Beans ───────────────────────────────
    {"plant_id": "p5", "variety_name": "Bush Bean", "description": "Compact, no staking needed; quick harvest."},
    {"plant_id": "p5", "variety_name": "Pole Bean", "description": "Climbing type, longer harvest window."},

    # ── p6: Onion ───────────────────────────────
    {"plant_id": "p6", "variety_name": "Red Onion", "description": "Pungent red bulbs, good storage."},
    {"plant_id": "p6", "variety_name": "Big Onion", "description": "Large yellow-brown bulbs for fresh market."},

    # ── p7: Potato ──────────────────────────────
    {"plant_id": "p7", "variety_name": "Granola", "description": "Yellow skin/lesh, versatile table potato."},
    {"plant_id": "p7", "variety_name": "Desiree", "description": "Red skin, high yielding."},

    # ── p8: Cassava ─────────────────────────────
    {"plant_id": "p8", "variety_name": "Mukunuwenna", "description": "Local high-yielding bitter type."},
    {"plant_id": "p8", "variety_name": "Sweet Cassava", "description": "Low-cyanide sweet variety."},

    # ── p9: Finger Millet ───────────────────────
    {"plant_id": "p9", "variety_name": "Local Ragi", "description": "Traditional variety, drought tolerant."},

    # ── p10: Coconut ────────────────────────────
    {"plant_id": "p10", "variety_name": "Tall Typica", "description": "Classic tall coconut, long productive life."},
    {"plant_id": "p10", "variety_name": "Dwarf", "description": "Shorter, earlier-bearing hybrid."},

    # ── p11: Green Gram ─────────────────────────
    {"plant_id": "p11", "variety_name": "Local Mung", "description": "Short-season pulse, nitrogen fixing."},

    # ── p12: Okra ───────────────────────────────
    {"plant_id": "p12", "variety_name": "Green Smooth", "description": "Smooth green pods, tender when young."},
    {"plant_id": "p12", "variety_name": "Red Spine", "description": "Reddish stems, robust grower."},

    # ── p13: Cowpea ─────────────────────────────
    {"plant_id": "p13", "variety_name": "Bush Cowpea", "description": "Bushy, early-maturing grain/forage type."},

    # ── p14: Bitter Gourd ───────────────────────
    {"plant_id": "p14", "variety_name": "White Bitter", "description": "Pale, long fruit; milder bitterness."},

    # ── p15: Sweet Potato ───────────────────────
    {"plant_id": "p15", "variety_name": "Orange Flesh", "description": "Sweet orange flesh, rich in carotene."},
    {"plant_id": "p15", "variety_name": "White Flesh", "description": "Drier starchy white flesh."},

    # ── p16: Peanut ─────────────────────────────
    {"plant_id": "p16", "variety_name": "Virginia", "description": "Large-seeded bunch type."},

    # ── p17: Black Gram ─────────────────────────
    {"plant_id": "p17", "variety_name": "Local Urad", "description": "Traditional black gram, short season."},

    # ── p18: Soybean ────────────────────────────
    {"plant_id": "p18", "variety_name": "Yellow Soybean", "description": "Standard oilseed/forage variety."},

    # ── p19: Maize ──────────────────────────────
    {"plant_id": "p19", "variety_name": "Hybrid Yellow", "description": "High-yielding yellow grain hybrid."},
    {"plant_id": "p19", "variety_name": "Open-Pollinated White", "description": "White grain, seed-savable."},

    # ── p20: Pearl Millet ───────────────────────
    {"plant_id": "p20", "variety_name": "Local Kurakkan", "description": "Heat- and drought-tolerant local type."},

    # ── p21: Sorghum ────────────────────────────
    {"plant_id": "p21", "variety_name": "Grain Sorghum", "description": "Dual-purpose grain/forage."},

    # ── p22: Foxtail Millet ─────────────────────
    {"plant_id": "p22", "variety_name": "Local Thinai", "description": "Short-season millet for dry zones."},

    # ── p23: Gotukola ───────────────────────────
    {"plant_id": "p23", "variety_name": "Local Gotukola", "description": "Perennial leafy green, cut-and-come-again."},

    # ── p24: Spinach ────────────────────────────
    {"plant_id": "p24", "variety_name": "Bloomsdale", "description": "Savoy-leaf spinach, heat tolerant."},
    {"plant_id": "p24", "variety_name": "Malabar Spinach", "description": "Vining heat-loving spinach substitute."},

    # ── p25: Beetroot ───────────────────────────
    {"plant_id": "p25", "variety_name": "Detroit", "description": "Round dark-red roots, reliable cropper."},

    # ── p26: Radish ─────────────────────────────
    {"plant_id": "p26", "variety_name": "White Icicle", "description": "Long white crisp roots."},
    {"plant_id": "p26", "variety_name": "Cherry Belle", "description": "Round red quick-maturing roots."},

    # ── p27: Yam ────────────────────────────────
    {"plant_id": "p27", "variety_name": "Lesser Yam", "description": "Local lesser yam, starchy tubers."},
]
