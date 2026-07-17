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

    # ── p28: Cabbage ────────────────────────────
    {"plant_id": "p28", "variety_name": "Green Cabbage", "description": "Standard firm green heads."},
    {"plant_id": "p28", "variety_name": "Red Cabbage", "description": "Deep red-purple leaves, sweet flavor."},

    # ── p29: Carrot ─────────────────────────────
    {"plant_id": "p29", "variety_name": "Nantes", "description": "Cylindrical, sweet, and crisp."},
    {"plant_id": "p29", "variety_name": "Kuroda", "description": "Heat tolerant, good for tropical regions."},

    # ── p30: Pumpkin ────────────────────────────
    {"plant_id": "p30", "variety_name": "Sugar Pumpkin", "description": "Small, sweet, excellent for cooking."},
    {"plant_id": "p30", "variety_name": "Giant Pumpkin", "description": "Large variety, high yield."},

    # ── p31: Cucumber ───────────────────────────
    {"plant_id": "p31", "variety_name": "Slicing Cucumber", "description": "Long, dark green, good for salads."},
    {"plant_id": "p31", "variety_name": "Pickling Cucumber", "description": "Small, bumpy skin, ideal for pickling."},

    # ── p32: Watermelon ─────────────────────────
    {"plant_id": "p32", "variety_name": "Sugar Baby", "description": "Small, very sweet, dark green rind."},
    {"plant_id": "p32", "variety_name": "Crimson Sweet", "description": "Large, striped, excellent flavor."},

    # ── p33: Papaya ─────────────────────────────
    {"plant_id": "p33", "variety_name": "Red Lady", "description": "Dwarf, early bearing, sweet red flesh."},
    {"plant_id": "p33", "variety_name": "Solo", "description": "Small, sweet fruit, yellow-orange flesh."},

    # ── p34: Banana ─────────────────────────────
    {"plant_id": "p34", "variety_name": "Cavendish", "description": "Standard dessert banana, high yield."},
    {"plant_id": "p34", "variety_name": "Red Banana", "description": "Red skin, sweet creamy flesh."},

    # ── p35: Garlic ─────────────────────────────
    {"plant_id": "p35", "variety_name": "Softneck", "description": "Standard white garlic, stores well."},
    {"plant_id": "p35", "variety_name": "Hardneck", "description": "Stronger flavor, produces scapes."},

    # ── p36: Ginger ─────────────────────────────
    {"plant_id": "p36", "variety_name": "Local Ginger", "description": "Pungent and fibrous."},
    {"plant_id": "p36", "variety_name": "Giant Ginger", "description": "Large rhizomes, less fibrous."},

    # ── p37: Turmeric ───────────────────────────
    {"plant_id": "p37", "variety_name": "Local Turmeric", "description": "High curcumin content, deep orange."},

    # ── p38: Black Pepper ───────────────────────
    {"plant_id": "p38", "variety_name": "Panniyur", "description": "High yielding, long spikes."},
    {"plant_id": "p38", "variety_name": "Karimunda", "description": "Popular traditional variety, adaptable."},

    # ── p39: Mango ──────────────────────────────
    {"plant_id": "p39", "variety_name": "Alphonso", "description": "Rich, sweet, premium quality."},
    {"plant_id": "p39", "variety_name": "Tommy Atkins", "description": "Disease resistant, long shelf life."},

    # ── p40: Lettuce ────────────────────────────
    {"plant_id": "p40", "variety_name": "Iceberg", "description": "Crisp heads, heat sensitive."},
    {"plant_id": "p40", "variety_name": "Butterhead", "description": "Soft leaves, sweet flavor."},

    # ── p41: Cauliflower ────────────────────────
    {"plant_id": "p41", "variety_name": "Snowball", "description": "Classic white heads."},
    {"plant_id": "p41", "variety_name": "Tropical White", "description": "Heat tolerant variety."},

    # ── p42: Bell Pepper ────────────────────────
    {"plant_id": "p42", "variety_name": "California Wonder", "description": "Blocky, thick-walled, green to red."},
    {"plant_id": "p42", "variety_name": "Yellow Wonder", "description": "Sweet, turns yellow when ripe."},
]
