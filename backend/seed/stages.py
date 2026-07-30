# backend/seed/stages.py

stages = [
    # Tomato Stages (6 stages)
    {"id": "s1", "plant_id": "p1", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s2", "plant_id": "p1", "stage_name": "Seedling", "stage_order": 2, "start_day": 11, "end_day": 25},
    {"id": "s3", "plant_id": "p1", "stage_name": "Vegetative", "stage_order": 3, "start_day": 26, "end_day": 50},
    {"id": "s4", "plant_id": "p1", "stage_name": "Flowering", "stage_order": 4, "start_day": 51, "end_day": 65},
    {"id": "s5", "plant_id": "p1", "stage_name": "Fruiting", "stage_order": 5, "start_day": 66, "end_day": 85},
    {"id": "s6", "plant_id": "p1", "stage_name": "Harvesting", "stage_order": 6, "start_day": 86, "end_day": 90},

    # Chili Stages (6 stages)
    {"id": "s7", "plant_id": "p2", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 14},
    {"id": "s8", "plant_id": "p2", "stage_name": "Seedling", "stage_order": 2, "start_day": 15, "end_day": 35},
    {"id": "s9", "plant_id": "p2", "stage_name": "Vegetative", "stage_order": 3, "start_day": 36, "end_day": 65},
    {"id": "s10", "plant_id": "p2", "stage_name": "Flowering", "stage_order": 4, "start_day": 66, "end_day": 85},
    {"id": "s11", "plant_id": "p2", "stage_name": "Fruiting", "stage_order": 5, "start_day": 86, "end_day": 110},
    {"id": "s12", "plant_id": "p2", "stage_name": "Harvesting", "stage_order": 6, "start_day": 111, "end_day": 120},

    # Rice Stages (6 stages)
    {"id": "s13", "plant_id": "p3", "stage_name": "Nursery", "stage_order": 1, "start_day": 0, "end_day": 21},
    {"id": "s14", "plant_id": "p3", "stage_name": "Transplanting", "stage_order": 2, "start_day": 22, "end_day": 35},
    {"id": "s15", "plant_id": "p3", "stage_name": "Tillering", "stage_order": 3, "start_day": 36, "end_day": 70},
    {"id": "s16", "plant_id": "p3", "stage_name": "Booting", "stage_order": 4, "start_day": 71, "end_day": 100},
    {"id": "s17", "plant_id": "p3", "stage_name": "Grain Filling", "stage_order": 5, "start_day": 101, "end_day": 135},
    {"id": "s18", "plant_id": "p3", "stage_name": "Harvesting", "stage_order": 6, "start_day": 136, "end_day": 150},

    # Brinjal Stages (6 stages)
    {"id": "s19", "plant_id": "p4", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 12},
    {"id": "s20", "plant_id": "p4", "stage_name": "Seedling", "stage_order": 2, "start_day": 13, "end_day": 30},
    {"id": "s21", "plant_id": "p4", "stage_name": "Vegetative", "stage_order": 3, "start_day": 31, "end_day": 55},
    {"id": "s22", "plant_id": "p4", "stage_name": "Flowering", "stage_order": 4, "start_day": 56, "end_day": 75},
    {"id": "s23", "plant_id": "p4", "stage_name": "Fruiting", "stage_order": 5, "start_day": 76, "end_day": 100},
    {"id": "s24", "plant_id": "p4", "stage_name": "Harvesting", "stage_order": 6, "start_day": 101, "end_day": 110},

    # Beans Stages (6 stages)
    {"id": "s25", "plant_id": "p5", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s26", "plant_id": "p5", "stage_name": "Seedling", "stage_order": 2, "start_day": 8, "end_day": 20},
    {"id": "s27", "plant_id": "p5", "stage_name": "Vegetative", "stage_order": 3, "start_day": 21, "end_day": 40},
    {"id": "s28", "plant_id": "p5", "stage_name": "Flowering", "stage_order": 4, "start_day": 41, "end_day": 50},
    {"id": "s29", "plant_id": "p5", "stage_name": "Pod Formation", "stage_order": 5, "start_day": 51, "end_day": 63},
    {"id": "s30", "plant_id": "p5", "stage_name": "Harvesting", "stage_order": 6, "start_day": 64, "end_day": 70},

    # Onion Stages (6 stages)
    {"id": "s31", "plant_id": "p6", "stage_name": "Nursery", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s32", "plant_id": "p6", "stage_name": "Establishment", "stage_order": 2, "start_day": 31, "end_day": 45},
    {"id": "s33", "plant_id": "p6", "stage_name": "Vegetative", "stage_order": 3, "start_day": 46, "end_day": 75},
    {"id": "s34", "plant_id": "p6", "stage_name": "Bulb Initiation", "stage_order": 4, "start_day": 76, "end_day": 90},
    {"id": "s35", "plant_id": "p6", "stage_name": "Bulb Development", "stage_order": 5, "start_day": 91, "end_day": 110},
    {"id": "s36", "plant_id": "p6", "stage_name": "Harvesting", "stage_order": 6, "start_day": 111, "end_day": 120},

    # Potato Stages (6 stages)
    {"id": "s37", "plant_id": "p7", "stage_name": "Sprouting", "stage_order": 1, "start_day": 0, "end_day": 15},
    {"id": "s38", "plant_id": "p7", "stage_name": "Vegetative", "stage_order": 2, "start_day": 16, "end_day": 35},
    {"id": "s39", "plant_id": "p7", "stage_name": "Stolon Initiation", "stage_order": 3, "start_day": 36, "end_day": 50},
    {"id": "s40", "plant_id": "p7", "stage_name": "Tuber Initiation", "stage_order": 4, "start_day": 51, "end_day": 65},
    {"id": "s41", "plant_id": "p7", "stage_name": "Tuber Bulking", "stage_order": 5, "start_day": 66, "end_day": 85},
    {"id": "s42", "plant_id": "p7", "stage_name": "Harvesting", "stage_order": 6, "start_day": 86, "end_day": 100},

    # Cassava Stages (6 stages)
    {"id": "s43", "plant_id": "p8", "stage_name": "Establishment", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s44", "plant_id": "p8", "stage_name": "Early Canopy Development", "stage_order": 2, "start_day": 31, "end_day": 75},
    {"id": "s45", "plant_id": "p8", "stage_name": "Root Initiation", "stage_order": 3, "start_day": 76, "end_day": 120},
    {"id": "s46", "plant_id": "p8", "stage_name": "Tuber Bulking Phase 1", "stage_order": 4, "start_day": 121, "end_day": 180},
    {"id": "s47", "plant_id": "p8", "stage_name": "Tuber Bulking Phase 2", "stage_order": 5, "start_day": 181, "end_day": 220},
    {"id": "s48", "plant_id": "p8", "stage_name": "Harvesting", "stage_order": 6, "start_day": 221, "end_day": 240},

    # Finger Millet Stages (6 stages)
    {"id": "s49", "plant_id": "p9", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s50", "plant_id": "p9", "stage_name": "Establishment", "stage_order": 2, "start_day": 11, "end_day": 25},
    {"id": "s51", "plant_id": "p9", "stage_name": "Vegetative/Tillering", "stage_order": 3, "start_day": 26, "end_day": 50},
    {"id": "s52", "plant_id": "p9", "stage_name": "Flowering/Booting", "stage_order": 4, "start_day": 51, "end_day": 70},
    {"id": "s53", "plant_id": "p9", "stage_name": "Grain Bulking", "stage_order": 5, "start_day": 71, "end_day": 90},
    {"id": "s54", "plant_id": "p9", "stage_name": "Harvesting", "stage_order": 6, "start_day": 91, "end_day": 105},

    # Coconut Stages (6 stages)
    {"id": "s55", "plant_id": "p10", "stage_name": "Seedling Establishment", "stage_order": 1, "start_day": 0, "end_day": 60},
    {"id": "s56", "plant_id": "p10", "stage_name": "Canopy & Root Expansion", "stage_order": 2, "start_day": 61, "end_day": 120},
    {"id": "s57", "plant_id": "p10", "stage_name": "Early Vegetative", "stage_order": 3, "start_day": 121, "end_day": 180},
    {"id": "s58", "plant_id": "p10", "stage_name": "Mid Vegetative", "stage_order": 4, "start_day": 181, "end_day": 240},
    {"id": "s59", "plant_id": "p10", "stage_name": "Late Vegetative", "stage_order": 5, "start_day": 241, "end_day": 300},
    {"id": "s60", "plant_id": "p10", "stage_name": "Pre-bearing Phase", "stage_order": 6, "start_day": 301, "end_day": 365},

    # Green Gram Stages (6 stages)
    {"id": "s61", "plant_id": "p11", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 5},
    {"id": "s62", "plant_id": "p11", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 6, "end_day": 15},
    {"id": "s63", "plant_id": "p11", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 16, "end_day": 35},
    {"id": "s64", "plant_id": "p11", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 36, "end_day": 48},
    {"id": "s65", "plant_id": "p11", "stage_name": "Pod Development", "stage_order": 5, "start_day": 49, "end_day": 62},
    {"id": "s66", "plant_id": "p11", "stage_name": "Harvesting", "stage_order": 6, "start_day": 63, "end_day": 70},

    # Okra Stages (6 stages)
    {"id": "s67", "plant_id": "p12", "stage_name": "Germination & Emergence", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s68", "plant_id": "p12", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 8, "end_day": 20},
    {"id": "s69", "plant_id": "p12", "stage_name": "Active Vegetative", "stage_order": 3, "start_day": 21, "end_day": 45},
    {"id": "s70", "plant_id": "p12", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s71", "plant_id": "p12", "stage_name": "Pod Formation", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s72", "plant_id": "p12", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Cowpea Stages (6 stages)
    {"id": "s73", "plant_id": "p13", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 6},
    {"id": "s74", "plant_id": "p13", "stage_name": "Establishment/Seedling", "stage_order": 2, "start_day": 7, "end_day": 20},
    {"id": "s75", "plant_id": "p13", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 21, "end_day": 45},
    {"id": "s76", "plant_id": "p13", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s77", "plant_id": "p13", "stage_name": "Pod Development", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s78", "plant_id": "p13", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Bitter Gourd Stages (6 stages)
    {"id": "s79", "plant_id": "p14", "stage_name": "Establishment", "stage_order": 1, "start_day": 0, "end_day": 15},
    {"id": "s80", "plant_id": "p14", "stage_name": "Vegetative Vine growth", "stage_order": 2, "start_day": 16, "end_day": 45},
    {"id": "s81", "plant_id": "p14", "stage_name": "Flowering & Trellising", "stage_order": 3, "start_day": 46, "end_day": 65},
    {"id": "s82", "plant_id": "p14", "stage_name": "Fruit Setting", "stage_order": 4, "start_day": 66, "end_day": 85},
    {"id": "s83", "plant_id": "p14", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 86, "end_day": 105},
    {"id": "s84", "plant_id": "p14", "stage_name": "Harvesting", "stage_order": 6, "start_day": 106, "end_day": 120},

    # Sweet Potato Stages (6 stages)
    {"id": "s85", "plant_id": "p15", "stage_name": "Planting & Sprouting", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s86", "plant_id": "p15", "stage_name": "Establishment", "stage_order": 2, "start_day": 11, "end_day": 30},
    {"id": "s87", "plant_id": "p15", "stage_name": "Tuber Initiation", "stage_order": 3, "start_day": 31, "end_day": 50},
    {"id": "s88", "plant_id": "p15", "stage_name": "Tuber Development", "stage_order": 4, "start_day": 51, "end_day": 80},
    {"id": "s89", "plant_id": "p15", "stage_name": "Tuber Bulking", "stage_order": 5, "start_day": 81, "end_day": 110},
    {"id": "s90", "plant_id": "p15", "stage_name": "Harvesting", "stage_order": 6, "start_day": 111, "end_day": 120},

    # Peanut (p16)
    {"id": "s91", "plant_id": "p16", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s92", "plant_id": "p16", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 8, "end_day": 25},
    {"id": "s93", "plant_id": "p16", "stage_name": "Vegetative/Flowering", "stage_order": 3, "start_day": 26, "end_day": 45},
    {"id": "s94", "plant_id": "p16", "stage_name": "Pegging Phase", "stage_order": 4, "start_day": 46, "end_day": 70},
    {"id": "s95", "plant_id": "p16", "stage_name": "Pod Development", "stage_order": 5, "start_day": 71, "end_day": 95},
    {"id": "s96", "plant_id": "p16", "stage_name": "Harvesting", "stage_order": 6, "start_day": 96, "end_day": 110},

    # Black Gram (p17)
    {"id": "s97", "plant_id": "p17", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 5},
    {"id": "s98", "plant_id": "p17", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 6, "end_day": 15},
    {"id": "s99", "plant_id": "p17", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 16, "end_day": 35},
    {"id": "s100", "plant_id": "p17", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 36, "end_day": 50},
    {"id": "s101", "plant_id": "p17", "stage_name": "Pod Development", "stage_order": 5, "start_day": 51, "end_day": 70},
    {"id": "s102", "plant_id": "p17", "stage_name": "Harvesting", "stage_order": 6, "start_day": 71, "end_day": 80},

    # Soybean (p18)
    {"id": "s103", "plant_id": "p18", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s104", "plant_id": "p18", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 8, "end_day": 20},
    {"id": "s105", "plant_id": "p18", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 21, "end_day": 45},
    {"id": "s106", "plant_id": "p18", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 46, "end_day": 65},
    {"id": "s107", "plant_id": "p18", "stage_name": "Pod Filling", "stage_order": 5, "start_day": 66, "end_day": 85},
    {"id": "s108", "plant_id": "p18", "stage_name": "Harvesting", "stage_order": 6, "start_day": 86, "end_day": 100},

    # Maize (p19)
    {"id": "s109", "plant_id": "p19", "stage_name": "Germination/Emergence", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s110", "plant_id": "p19", "stage_name": "Early Vegetative", "stage_order": 2, "start_day": 11, "end_day": 35},
    {"id": "s111", "plant_id": "p19", "stage_name": "Tasseling", "stage_order": 3, "start_day": 36, "end_day": 55},
    {"id": "s112", "plant_id": "p19", "stage_name": "Silking Stage", "stage_order": 4, "start_day": 56, "end_day": 75},
    {"id": "s113", "plant_id": "p19", "stage_name": "Milk/Dough Phase", "stage_order": 5, "start_day": 76, "end_day": 95},
    {"id": "s114", "plant_id": "p19", "stage_name": "Harvesting", "stage_order": 6, "start_day": 96, "end_day": 110},

    # Pearl Millet (p20)
    {"id": "s115", "plant_id": "p20", "stage_name": "Seedling Phase", "stage_order": 1, "start_day": 0, "end_day": 12},
    {"id": "s116", "plant_id": "p20", "stage_name": "Active Tillering", "stage_order": 2, "start_day": 13, "end_day": 30},
    {"id": "s117", "plant_id": "p20", "stage_name": "Stem Elongation", "stage_order": 3, "start_day": 31, "end_day": 48},
    {"id": "s118", "plant_id": "p20", "stage_name": "Heading/Flowering", "stage_order": 4, "start_day": 49, "end_day": 65},
    {"id": "s119", "plant_id": "p20", "stage_name": "Grain Development", "stage_order": 5, "start_day": 66, "end_day": 80},
    {"id": "s120", "plant_id": "p20", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Sorghum (p21)
    {"id": "s121", "plant_id": "p21", "stage_name": "Seedling/Establishment", "stage_order": 1, "start_day": 0, "end_day": 15},
    {"id": "s122", "plant_id": "p21", "stage_name": "Vegetative/Tillering", "stage_order": 2, "start_day": 16, "end_day": 40},
    {"id": "s123", "plant_id": "p21", "stage_name": "Booting Phase", "stage_order": 3, "start_day": 41, "end_day": 60},
    {"id": "s124", "plant_id": "p21", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 61, "end_day": 75},
    {"id": "s125", "plant_id": "p21", "stage_name": "Grain Bulking", "stage_order": 5, "start_day": 76, "end_day": 95},
    {"id": "s126", "plant_id": "p21", "stage_name": "Harvesting", "stage_order": 6, "start_day": 96, "end_day": 110},

    # Foxtail Millet (p22)
    {"id": "s127", "plant_id": "p22", "stage_name": "Seedling Phase", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s128", "plant_id": "p22", "stage_name": "Active Tillering", "stage_order": 2, "start_day": 11, "end_day": 28},
    {"id": "s129", "plant_id": "p22", "stage_name": "Stem Elongation", "stage_order": 3, "start_day": 29, "end_day": 45},
    {"id": "s130", "plant_id": "p22", "stage_name": "Flowering/Panicle", "stage_order": 4, "start_day": 46, "end_day": 62},
    {"id": "s131", "plant_id": "p22", "stage_name": "Grain Filling", "stage_order": 5, "start_day": 63, "end_day": 80},
    {"id": "s132", "plant_id": "p22", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Gotukola (p23)
    {"id": "s133", "plant_id": "p23", "stage_name": "Planting & Rooting", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s134", "plant_id": "p23", "stage_name": "Runner Development", "stage_order": 2, "start_day": 11, "end_day": 30},
    {"id": "s135", "plant_id": "p23", "stage_name": "Foliar Expansion", "stage_order": 3, "start_day": 31, "end_day": 50},
    {"id": "s136", "plant_id": "p23", "stage_name": "Mature Growth", "stage_order": 4, "start_day": 51, "end_day": 70},
    {"id": "s137", "plant_id": "p23", "stage_name": "Primary Harvest", "stage_order": 5, "start_day": 71, "end_day": 80},
    {"id": "s138", "plant_id": "p23", "stage_name": "Secondary Harvest", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Spinach (p24)
    {"id": "s139", "plant_id": "p24", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 6},
    {"id": "s140", "plant_id": "p24", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 7, "end_day": 15},
    {"id": "s141", "plant_id": "p24", "stage_name": "Early Leafy Stage", "stage_order": 3, "start_day": 16, "end_day": 25},
    {"id": "s142", "plant_id": "p24", "stage_name": "Active Leafy growth", "stage_order": 4, "start_day": 26, "end_day": 35},
    {"id": "s143", "plant_id": "p24", "stage_name": "Mature Leafy phase", "stage_order": 5, "start_day": 36, "end_day": 45},
    {"id": "s144", "plant_id": "p24", "stage_name": "Harvesting", "stage_order": 6, "start_day": 46, "end_day": 50},

    # Beetroot (p25)
    {"id": "s145", "plant_id": "p25", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 8},
    {"id": "s146", "plant_id": "p25", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 9, "end_day": 20},
    {"id": "s147", "plant_id": "p25", "stage_name": "Vegetative Leafy growth", "stage_order": 3, "start_day": 21, "end_day": 38},
    {"id": "s148", "plant_id": "p25", "stage_name": "Root Initiation", "stage_order": 4, "start_day": 39, "end_day": 52},
    {"id": "s149", "plant_id": "p25", "stage_name": "Root Bulking", "stage_order": 5, "start_day": 53, "end_day": 68},
    {"id": "s150", "plant_id": "p25", "stage_name": "Harvesting", "stage_order": 6, "start_day": 69, "end_day": 75},

    # Radish (p26)
    {"id": "s151", "plant_id": "p26", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 5},
    {"id": "s152", "plant_id": "p26", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 6, "end_day": 12},
    {"id": "s153", "plant_id": "p26", "stage_name": "Active Vegetative", "stage_order": 3, "start_day": 13, "end_day": 22},
    {"id": "s154", "plant_id": "p26", "stage_name": "Root Swelling", "stage_order": 4, "start_day": 23, "end_day": 32},
    {"id": "s155", "plant_id": "p26", "stage_name": "Root Maturation", "stage_order": 5, "start_day": 33, "end_day": 40},
    {"id": "s156", "plant_id": "p26", "stage_name": "Harvesting", "stage_order": 6, "start_day": 41, "end_day": 45},

    # Yam (p27)
    {"id": "s157", "plant_id": "p27", "stage_name": "Sprouting & Rooting", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s158", "plant_id": "p27", "stage_name": "Vine Growth", "stage_order": 2, "start_day": 31, "end_day": 80},
    {"id": "s159", "plant_id": "p27", "stage_name": "Canopy Development", "stage_order": 3, "start_day": 81, "end_day": 130},
    {"id": "s160", "plant_id": "p27", "stage_name": "Tuber Initiation", "stage_order": 4, "start_day": 131, "end_day": 170},
    {"id": "s161", "plant_id": "p27", "stage_name": "Tuber Bulking", "stage_order": 5, "start_day": 171, "end_day": 220},
    {"id": "s162", "plant_id": "p27", "stage_name": "Harvesting", "stage_order": 6, "start_day": 221, "end_day": 240},

    # Cabbage (p28)
    {"id": "s163", "plant_id": "p28", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s164", "plant_id": "p28", "stage_name": "Seedling", "stage_order": 2, "start_day": 8, "end_day": 25},
    {"id": "s165", "plant_id": "p28", "stage_name": "Early Vegetative", "stage_order": 3, "start_day": 26, "end_day": 45},
    {"id": "s166", "plant_id": "p28", "stage_name": "Head Formation", "stage_order": 4, "start_day": 46, "end_day": 70},
    {"id": "s167", "plant_id": "p28", "stage_name": "Head Maturation", "stage_order": 5, "start_day": 71, "end_day": 90},
    {"id": "s168", "plant_id": "p28", "stage_name": "Harvesting", "stage_order": 6, "start_day": 91, "end_day": 100},

    # Carrot (p29)
    {"id": "s169", "plant_id": "p29", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s170", "plant_id": "p29", "stage_name": "Seedling", "stage_order": 2, "start_day": 8, "end_day": 20},
    {"id": "s171", "plant_id": "p29", "stage_name": "Vegetative", "stage_order": 3, "start_day": 21, "end_day": 35},
    {"id": "s172", "plant_id": "p29", "stage_name": "Root Initiation", "stage_order": 4, "start_day": 36, "end_day": 50},
    {"id": "s173", "plant_id": "p29", "stage_name": "Root Bulking", "stage_order": 5, "start_day": 51, "end_day": 65},
    {"id": "s174", "plant_id": "p29", "stage_name": "Harvesting", "stage_order": 6, "start_day": 66, "end_day": 75},

    # Pumpkin (p30)
    {"id": "s175", "plant_id": "p30", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s176", "plant_id": "p30", "stage_name": "Seedling/Vine Growth", "stage_order": 2, "start_day": 8, "end_day": 30},
    {"id": "s177", "plant_id": "p30", "stage_name": "Flowering", "stage_order": 3, "start_day": 31, "end_day": 50},
    {"id": "s178", "plant_id": "p30", "stage_name": "Fruit Set", "stage_order": 4, "start_day": 51, "end_day": 70},
    {"id": "s179", "plant_id": "p30", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 71, "end_day": 95},
    {"id": "s180", "plant_id": "p30", "stage_name": "Harvesting", "stage_order": 6, "start_day": 96, "end_day": 110},

    # Cucumber (p31)
    {"id": "s181", "plant_id": "p31", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 5},
    {"id": "s182", "plant_id": "p31", "stage_name": "Seedling/Vine Growth", "stage_order": 2, "start_day": 6, "end_day": 20},
    {"id": "s183", "plant_id": "p31", "stage_name": "Flowering", "stage_order": 3, "start_day": 21, "end_day": 35},
    {"id": "s184", "plant_id": "p31", "stage_name": "Fruit Set", "stage_order": 4, "start_day": 36, "end_day": 45},
    {"id": "s185", "plant_id": "p31", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 46, "end_day": 55},
    {"id": "s186", "plant_id": "p31", "stage_name": "Harvesting", "stage_order": 6, "start_day": 56, "end_day": 60},

    # Watermelon (p32)
    {"id": "s187", "plant_id": "p32", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s188", "plant_id": "p32", "stage_name": "Seedling/Vine Growth", "stage_order": 2, "start_day": 8, "end_day": 25},
    {"id": "s189", "plant_id": "p32", "stage_name": "Flowering", "stage_order": 3, "start_day": 26, "end_day": 45},
    {"id": "s190", "plant_id": "p32", "stage_name": "Fruit Set", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s191", "plant_id": "p32", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s192", "plant_id": "p32", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Papaya (p33)
    {"id": "s193", "plant_id": "p33", "stage_name": "Germination/Seedling", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s194", "plant_id": "p33", "stage_name": "Establishment", "stage_order": 2, "start_day": 31, "end_day": 60},
    {"id": "s195", "plant_id": "p33", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 61, "end_day": 120},
    {"id": "s196", "plant_id": "p33", "stage_name": "Flowering", "stage_order": 4, "start_day": 121, "end_day": 180},
    {"id": "s197", "plant_id": "p33", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 181, "end_day": 240},
    {"id": "s198", "plant_id": "p33", "stage_name": "Harvesting", "stage_order": 6, "start_day": 241, "end_day": 270},

    # Banana (p34)
    {"id": "s199", "plant_id": "p34", "stage_name": "Sucker Establishment", "stage_order": 1, "start_day": 0, "end_day": 60},
    {"id": "s200", "plant_id": "p34", "stage_name": "Early Vegetative", "stage_order": 2, "start_day": 61, "end_day": 120},
    {"id": "s201", "plant_id": "p34", "stage_name": "Active Vegetative", "stage_order": 3, "start_day": 121, "end_day": 200},
    {"id": "s202", "plant_id": "p34", "stage_name": "Shooting/Flowering", "stage_order": 4, "start_day": 201, "end_day": 260},
    {"id": "s203", "plant_id": "p34", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 261, "end_day": 330},
    {"id": "s204", "plant_id": "p34", "stage_name": "Harvesting", "stage_order": 6, "start_day": 331, "end_day": 365},

    # Garlic (p35)
    {"id": "s205", "plant_id": "p35", "stage_name": "Clove Sprouting", "stage_order": 1, "start_day": 0, "end_day": 15},
    {"id": "s206", "plant_id": "p35", "stage_name": "Establishment", "stage_order": 2, "start_day": 16, "end_day": 35},
    {"id": "s207", "plant_id": "p35", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 36, "end_day": 60},
    {"id": "s208", "plant_id": "p35", "stage_name": "Bulb Initiation", "stage_order": 4, "start_day": 61, "end_day": 85},
    {"id": "s209", "plant_id": "p35", "stage_name": "Bulb Bulking", "stage_order": 5, "start_day": 86, "end_day": 105},
    {"id": "s210", "plant_id": "p35", "stage_name": "Harvesting", "stage_order": 6, "start_day": 106, "end_day": 120},

    # Ginger (p36)
    {"id": "s211", "plant_id": "p36", "stage_name": "Sprouting", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s212", "plant_id": "p36", "stage_name": "Establishment", "stage_order": 2, "start_day": 31, "end_day": 60},
    {"id": "s213", "plant_id": "p36", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 61, "end_day": 120},
    {"id": "s214", "plant_id": "p36", "stage_name": "Rhizome Initiation", "stage_order": 4, "start_day": 121, "end_day": 160},
    {"id": "s215", "plant_id": "p36", "stage_name": "Rhizome Bulking", "stage_order": 5, "start_day": 161, "end_day": 210},
    {"id": "s216", "plant_id": "p36", "stage_name": "Harvesting", "stage_order": 6, "start_day": 211, "end_day": 240},

    # Turmeric (p37)
    {"id": "s217", "plant_id": "p37", "stage_name": "Sprouting", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s218", "plant_id": "p37", "stage_name": "Establishment", "stage_order": 2, "start_day": 31, "end_day": 60},
    {"id": "s219", "plant_id": "p37", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 61, "end_day": 120},
    {"id": "s220", "plant_id": "p37", "stage_name": "Rhizome Initiation", "stage_order": 4, "start_day": 121, "end_day": 160},
    {"id": "s221", "plant_id": "p37", "stage_name": "Rhizome Bulking", "stage_order": 5, "start_day": 161, "end_day": 210},
    {"id": "s222", "plant_id": "p37", "stage_name": "Harvesting", "stage_order": 6, "start_day": 211, "end_day": 240},

    # Black Pepper (p38)
    {"id": "s223", "plant_id": "p38", "stage_name": "Cutting Establishment", "stage_order": 1, "start_day": 0, "end_day": 60},
    {"id": "s224", "plant_id": "p38", "stage_name": "Early Vine Growth", "stage_order": 2, "start_day": 61, "end_day": 120},
    {"id": "s225", "plant_id": "p38", "stage_name": "Active Vine Growth", "stage_order": 3, "start_day": 121, "end_day": 200},
    {"id": "s226", "plant_id": "p38", "stage_name": "Spike Initiation/Flowering", "stage_order": 4, "start_day": 201, "end_day": 260},
    {"id": "s227", "plant_id": "p38", "stage_name": "Berry Development", "stage_order": 5, "start_day": 261, "end_day": 330},
    {"id": "s228", "plant_id": "p38", "stage_name": "Harvesting", "stage_order": 6, "start_day": 331, "end_day": 365},

    # Mango (p39)
    {"id": "s229", "plant_id": "p39", "stage_name": "Sapling Establishment", "stage_order": 1, "start_day": 0, "end_day": 60},
    {"id": "s230", "plant_id": "p39", "stage_name": "Early Vegetative", "stage_order": 2, "start_day": 61, "end_day": 120},
    {"id": "s231", "plant_id": "p39", "stage_name": "Mature Vegetative", "stage_order": 3, "start_day": 121, "end_day": 200},
    {"id": "s232", "plant_id": "p39", "stage_name": "Flowering/Panicle Emergence", "stage_order": 4, "start_day": 201, "end_day": 260},
    {"id": "s233", "plant_id": "p39", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 261, "end_day": 330},
    {"id": "s234", "plant_id": "p39", "stage_name": "Harvesting", "stage_order": 6, "start_day": 331, "end_day": 365},

    # Lettuce (p40)
    {"id": "s235", "plant_id": "p40", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 5},
    {"id": "s236", "plant_id": "p40", "stage_name": "Seedling", "stage_order": 2, "start_day": 6, "end_day": 15},
    {"id": "s237", "plant_id": "p40", "stage_name": "Early Leaf Growth", "stage_order": 3, "start_day": 16, "end_day": 25},
    {"id": "s238", "plant_id": "p40", "stage_name": "Rosette Formation", "stage_order": 4, "start_day": 26, "end_day": 35},
    {"id": "s239", "plant_id": "p40", "stage_name": "Head Maturation", "stage_order": 5, "start_day": 36, "end_day": 45},
    {"id": "s240", "plant_id": "p40", "stage_name": "Harvesting", "stage_order": 6, "start_day": 46, "end_day": 50},

    # Cauliflower (p41)
    {"id": "s241", "plant_id": "p41", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s242", "plant_id": "p41", "stage_name": "Seedling", "stage_order": 2, "start_day": 8, "end_day": 25},
    {"id": "s243", "plant_id": "p41", "stage_name": "Early Vegetative", "stage_order": 3, "start_day": 26, "end_day": 45},
    {"id": "s244", "plant_id": "p41", "stage_name": "Curd Initiation", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s245", "plant_id": "p41", "stage_name": "Curd Development", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s246", "plant_id": "p41", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Bell Pepper (p42)
    {"id": "s247", "plant_id": "p42", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s248", "plant_id": "p42", "stage_name": "Seedling", "stage_order": 2, "start_day": 8, "end_day": 25},
    {"id": "s249", "plant_id": "p42", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 26, "end_day": 45},
    {"id": "s250", "plant_id": "p42", "stage_name": "Flowering", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s251", "plant_id": "p42", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s252", "plant_id": "p42", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},
]
