# backend/seed/nutrient_requirements.py
# Nutrient requirements per stage (NPK in kg/acre)

nutrient_requirements = [
    # Tomato (p1)
    {"stage_id": "s1", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s2", "nitrogen_kg": 5, "phosphorus_kg": 3, "potassium_kg": 2},
    {"stage_id": "s3", "nitrogen_kg": 25, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s4", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s5", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 30},
    {"stage_id": "s6", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 10},

    # Chili (p2)
    {"stage_id": "s7", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s8", "nitrogen_kg": 5, "phosphorus_kg": 3, "potassium_kg": 2},
    {"stage_id": "s9", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 12},
    {"stage_id": "s10", "nitrogen_kg": 12, "phosphorus_kg": 18, "potassium_kg": 22},
    {"stage_id": "s11", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 25},
    {"stage_id": "s12", "nitrogen_kg": 4, "phosphorus_kg": 4, "potassium_kg": 8},

    # Rice (p3)
    {"stage_id": "s13", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s14", "nitrogen_kg": 15, "phosphorus_kg": 8, "potassium_kg": 8},
    {"stage_id": "s15", "nitrogen_kg": 30, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s16", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s17", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 25},
    {"stage_id": "s18", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Brinjal (p4)
    {"stage_id": "s19", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s20", "nitrogen_kg": 6, "phosphorus_kg": 4, "potassium_kg": 3},
    {"stage_id": "s21", "nitrogen_kg": 22, "phosphorus_kg": 10, "potassium_kg": 14},
    {"stage_id": "s22", "nitrogen_kg": 14, "phosphorus_kg": 16, "potassium_kg": 22},
    {"stage_id": "s23", "nitrogen_kg": 10, "phosphorus_kg": 14, "potassium_kg": 28},
    {"stage_id": "s24", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 10},

    # Beans (p5)
    {"stage_id": "s25", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s26", "nitrogen_kg": 3, "phosphorus_kg": 5, "potassium_kg": 3},
    {"stage_id": "s27", "nitrogen_kg": 8, "phosphorus_kg": 10, "potassium_kg": 12},
    {"stage_id": "s28", "nitrogen_kg": 5, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s29", "nitrogen_kg": 3, "phosphorus_kg": 8, "potassium_kg": 10},
    {"stage_id": "s30", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Onion (p6)
    {"stage_id": "s31", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s32", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s33", "nitrogen_kg": 30, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s34", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s35", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 30},
    {"stage_id": "s36", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Potato (p7)
    {"stage_id": "s37", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s38", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s39", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s40", "nitrogen_kg": 20, "phosphorus_kg": 25, "potassium_kg": 30},
    {"stage_id": "s41", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 40},
    {"stage_id": "s42", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Cassava (p8)
    {"stage_id": "s43", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s44", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s45", "nitrogen_kg": 30, "phosphorus_kg": 10, "potassium_kg": 35},
    {"stage_id": "s46", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 45},
    {"stage_id": "s47", "nitrogen_kg": 10, "phosphorus_kg": 5, "potassium_kg": 50},
    {"stage_id": "s48", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Finger Millet (p9)
    {"stage_id": "s49", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s50", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s51", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s52", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s53", "nitrogen_kg": 10, "phosphorus_kg": 5, "potassium_kg": 20},
    {"stage_id": "s54", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Coconut (p10)
    {"stage_id": "s55", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s56", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s57", "nitrogen_kg": 20, "phosphorus_kg": 20, "potassium_kg": 35},
    {"stage_id": "s58", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 45},
    {"stage_id": "s59", "nitrogen_kg": 30, "phosphorus_kg": 25, "potassium_kg": 55},
    {"stage_id": "s60", "nitrogen_kg": 35, "phosphorus_kg": 30, "potassium_kg": 70},

    # Green Gram (p11)
    {"stage_id": "s61", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s62", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 3},
    {"stage_id": "s63", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 10},
    {"stage_id": "s64", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s65", "nitrogen_kg": 5, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s66", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Okra (p12)
    {"stage_id": "s67", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s68", "nitrogen_kg": 8, "phosphorus_kg": 6, "potassium_kg": 5},
    {"stage_id": "s69", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s70", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 20},
    {"stage_id": "s71", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s72", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 5},

    # Cowpea (p13)
    {"stage_id": "s73", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s74", "nitrogen_kg": 4, "phosphorus_kg": 5, "potassium_kg": 3},
    {"stage_id": "s75", "nitrogen_kg": 8, "phosphorus_kg": 15, "potassium_kg": 10},
    {"stage_id": "s76", "nitrogen_kg": 6, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s77", "nitrogen_kg": 4, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s78", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Bitter Gourd (p14)
    {"stage_id": "s79", "nitrogen_kg": 3, "phosphorus_kg": 3, "potassium_kg": 3},
    {"stage_id": "s80", "nitrogen_kg": 20, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s81", "nitrogen_kg": 15, "phosphorus_kg": 18, "potassium_kg": 20},
    {"stage_id": "s82", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s83", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 30},
    {"stage_id": "s84", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Sweet Potato (p15)
    {"stage_id": "s85", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s86", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s87", "nitrogen_kg": 20, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s88", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s89", "nitrogen_kg": 8, "phosphorus_kg": 8, "potassium_kg": 45},
    {"stage_id": "s90", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Peanut (p16)
    {"stage_id": "s91", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s92", "nitrogen_kg": 5, "phosphorus_kg": 8, "potassium_kg": 5},
    {"stage_id": "s93", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 12},
    {"stage_id": "s94", "nitrogen_kg": 8, "phosphorus_kg": 20, "potassium_kg": 15},
    {"stage_id": "s95", "nitrogen_kg": 5, "phosphorus_kg": 10, "potassium_kg": 20},
    {"stage_id": "s96", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Black Gram (p17)
    {"stage_id": "s97", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s98", "nitrogen_kg": 5, "phosphorus_kg": 6, "potassium_kg": 4},
    {"stage_id": "s99", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 10},
    {"stage_id": "s100", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s101", "nitrogen_kg": 4, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s102", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Soybean (p18)
    {"stage_id": "s103", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s104", "nitrogen_kg": 6, "phosphorus_kg": 8, "potassium_kg": 5},
    {"stage_id": "s105", "nitrogen_kg": 12, "phosphorus_kg": 18, "potassium_kg": 12},
    {"stage_id": "s106", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s107", "nitrogen_kg": 5, "phosphorus_kg": 12, "potassium_kg": 22},
    {"stage_id": "s108", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 8},

    # Maize (p19)
    {"stage_id": "s109", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s110", "nitrogen_kg": 35, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s111", "nitrogen_kg": 30, "phosphorus_kg": 25, "potassium_kg": 25},
    {"stage_id": "s112", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 30},
    {"stage_id": "s113", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s114", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 8},

    # Pearl Millet (p20)
    {"stage_id": "s115", "nitrogen_kg": 3, "phosphorus_kg": 3, "potassium_kg": 3},
    {"stage_id": "s116", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s117", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s118", "nitrogen_kg": 15, "phosphorus_kg": 12, "potassium_kg": 20},
    {"stage_id": "s119", "nitrogen_kg": 8, "phosphorus_kg": 8, "potassium_kg": 25},
    {"stage_id": "s120", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Sorghum (p21)
    {"stage_id": "s121", "nitrogen_kg": 4, "phosphorus_kg": 4, "potassium_kg": 4},
    {"stage_id": "s122", "nitrogen_kg": 25, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s123", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s124", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s125", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 30},
    {"stage_id": "s126", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 8},

    # Foxtail Millet (p22)
    {"stage_id": "s127", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s128", "nitrogen_kg": 12, "phosphorus_kg": 8, "potassium_kg": 8},
    {"stage_id": "s129", "nitrogen_kg": 18, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s130", "nitrogen_kg": 12, "phosphorus_kg": 10, "potassium_kg": 18},
    {"stage_id": "s131", "nitrogen_kg": 6, "phosphorus_kg": 6, "potassium_kg": 20},
    {"stage_id": "s132", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 4},

    # Gotukola (p23)
    {"stage_id": "s133", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s134", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s135", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s136", "nitrogen_kg": 20, "phosphorus_kg": 12, "potassium_kg": 20},
    {"stage_id": "s137", "nitrogen_kg": 15, "phosphorus_kg": 8, "potassium_kg": 15},
    {"stage_id": "s138", "nitrogen_kg": 10, "phosphorus_kg": 5, "potassium_kg": 10},

    # Spinach (p24)
    {"stage_id": "s139", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s140", "nitrogen_kg": 12, "phosphorus_kg": 6, "potassium_kg": 8},
    {"stage_id": "s141", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s142", "nitrogen_kg": 25, "phosphorus_kg": 12, "potassium_kg": 20},
    {"stage_id": "s143", "nitrogen_kg": 15, "phosphorus_kg": 8, "potassium_kg": 18},
    {"stage_id": "s144", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 5},

    # Beetroot (p25)
    {"stage_id": "s145", "nitrogen_kg": 3, "phosphorus_kg": 3, "potassium_kg": 3},
    {"stage_id": "s146", "nitrogen_kg": 12, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s147", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 18},
    {"stage_id": "s148", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s149", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s150", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Radish (p26)
    {"stage_id": "s151", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s152", "nitrogen_kg": 10, "phosphorus_kg": 8, "potassium_kg": 8},
    {"stage_id": "s153", "nitrogen_kg": 15, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s154", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s155", "nitrogen_kg": 5, "phosphorus_kg": 8, "potassium_kg": 25},
    {"stage_id": "s156", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Yam (p27)
    {"stage_id": "s157", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s158", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s159", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s160", "nitrogen_kg": 20, "phosphorus_kg": 25, "potassium_kg": 35},
    {"stage_id": "s161", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 55},
    {"stage_id": "s162", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 15},

    # Cabbage (p28)
    {"stage_id": "s163", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s164", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s165", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s166", "nitrogen_kg": 30, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s167", "nitrogen_kg": 10, "phosphorus_kg": 5, "potassium_kg": 15},
    {"stage_id": "s168", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Carrot (p29)
    {"stage_id": "s169", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s170", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s171", "nitrogen_kg": 15, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s172", "nitrogen_kg": 12, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s173", "nitrogen_kg": 5, "phosphorus_kg": 10, "potassium_kg": 30},
    {"stage_id": "s174", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Pumpkin (p30)
    {"stage_id": "s175", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s176", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s177", "nitrogen_kg": 20, "phosphorus_kg": 20, "potassium_kg": 20},
    {"stage_id": "s178", "nitrogen_kg": 15, "phosphorus_kg": 25, "potassium_kg": 30},
    {"stage_id": "s179", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s180", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Cucumber (p31)
    {"stage_id": "s181", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s182", "nitrogen_kg": 12, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s183", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s184", "nitrogen_kg": 10, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s185", "nitrogen_kg": 8, "phosphorus_kg": 15, "potassium_kg": 30},
    {"stage_id": "s186", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Watermelon (p32)
    {"stage_id": "s187", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s188", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s189", "nitrogen_kg": 20, "phosphorus_kg": 20, "potassium_kg": 20},
    {"stage_id": "s190", "nitrogen_kg": 15, "phosphorus_kg": 25, "potassium_kg": 30},
    {"stage_id": "s191", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s192", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Papaya (p33)
    {"stage_id": "s193", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s194", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s195", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 30},
    {"stage_id": "s196", "nitrogen_kg": 25, "phosphorus_kg": 30, "potassium_kg": 40},
    {"stage_id": "s197", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 45},
    {"stage_id": "s198", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Banana (p34)
    {"stage_id": "s199", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s200", "nitrogen_kg": 30, "phosphorus_kg": 15, "potassium_kg": 30},
    {"stage_id": "s201", "nitrogen_kg": 40, "phosphorus_kg": 20, "potassium_kg": 50},
    {"stage_id": "s202", "nitrogen_kg": 25, "phosphorus_kg": 25, "potassium_kg": 70},
    {"stage_id": "s203", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 80},
    {"stage_id": "s204", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 15},

    # Garlic (p35)
    {"stage_id": "s205", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s206", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s207", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s208", "nitrogen_kg": 12, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s209", "nitrogen_kg": 5, "phosphorus_kg": 15, "potassium_kg": 30},
    {"stage_id": "s210", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Ginger (p36)
    {"stage_id": "s211", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s212", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s213", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s214", "nitrogen_kg": 20, "phosphorus_kg": 25, "potassium_kg": 35},
    {"stage_id": "s215", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 40},
    {"stage_id": "s216", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Turmeric (p37)
    {"stage_id": "s217", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s218", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s219", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s220", "nitrogen_kg": 20, "phosphorus_kg": 25, "potassium_kg": 35},
    {"stage_id": "s221", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 40},
    {"stage_id": "s222", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Black Pepper (p38)
    {"stage_id": "s223", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s224", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s225", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 30},
    {"stage_id": "s226", "nitrogen_kg": 25, "phosphorus_kg": 30, "potassium_kg": 40},
    {"stage_id": "s227", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 45},
    {"stage_id": "s228", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Mango (p39)
    {"stage_id": "s229", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s230", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s231", "nitrogen_kg": 30, "phosphorus_kg": 25, "potassium_kg": 35},
    {"stage_id": "s232", "nitrogen_kg": 20, "phosphorus_kg": 35, "potassium_kg": 40},
    {"stage_id": "s233", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 50},
    {"stage_id": "s234", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 15},

    # Lettuce (p40)
    {"stage_id": "s235", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s236", "nitrogen_kg": 10, "phosphorus_kg": 8, "potassium_kg": 8},
    {"stage_id": "s237", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s238", "nitrogen_kg": 20, "phosphorus_kg": 12, "potassium_kg": 20},
    {"stage_id": "s239", "nitrogen_kg": 10, "phosphorus_kg": 8, "potassium_kg": 15},
    {"stage_id": "s240", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Cauliflower (p41)
    {"stage_id": "s241", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s242", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 12},
    {"stage_id": "s243", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s244", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 35},
    {"stage_id": "s245", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 20},
    {"stage_id": "s246", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Bell Pepper (p42)
    {"stage_id": "s247", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s248", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s249", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s250", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 30},
    {"stage_id": "s251", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s252", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},
]
