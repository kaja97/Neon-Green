# backend/seed/disease_solutions.py
# 80 disease solution records (2 per disease: 1 organic + 1 conventional)

disease_solutions = [
    # ── Tomato ──────────────────────────────
    # Early Blight (d1)
    {"disease_id": "d1", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre of water", "instructions": "Spray at 10-day intervals starting at first symptom. Ensure complete leaf coverage. Repeat 3-4 times."},
    {"disease_id": "d1", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma viride", "dosage": "4g per litre of water", "instructions": "Preventive foliar spray every 15 days. Apply in the evening. Can also treat seed before planting."},
    # Late Blight (d2)
    {"disease_id": "d2", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Metalaxyl + Mancozeb (Ridomil Gold)", "dosage": "2g per litre", "instructions": "Spray immediately at first sign. Repeat every 7 days during wet weather. Remove infected parts."},
    {"disease_id": "d2", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Copper Hydroxide (Bordeaux Mixture)", "dosage": "1% solution (1kg CuSO4 + 1kg lime in 100L)", "instructions": "Preventive spray before rainy season. Curative spray at first symptoms. Approved for organic farming."},
    # Bacterial Wilt (d3)
    {"disease_id": "d3", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Streptomycin Sulphate", "dosage": "500ppm soil drench", "instructions": "Soil drench around healthy plants. Remove and destroy infected plants. Avoid waterlogging."},
    {"disease_id": "d3", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens", "dosage": "10g per litre soil drench", "instructions": "Apply bio-control agent as soil drench. Crop rotation mandatory. Add lime to raise pH above 6.5."},
    # Fusarium Wilt (d4)
    {"disease_id": "d4", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim 50% WP", "dosage": "2g per litre soil drench", "instructions": "Soil drench at transplanting. Use resistant varieties. Ensure proper drainage."},
    {"disease_id": "d4", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per litre or 2kg per acre in soil", "instructions": "Apply to soil before planting. Mix with FYM for better establishment. Rotate with non-Solanaceae crops."},
    # Leaf Curl Virus (d5)
    {"disease_id": "d5", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid 17.8 SL", "dosage": "0.3ml per litre", "instructions": "Spray against whitefly vector. Uproot and destroy infected plants. Use yellow sticky traps."},
    {"disease_id": "d5", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil (Azadirachtin)", "dosage": "5ml per litre", "instructions": "Spray neem oil to repel whiteflies. Install yellow sticky traps. Use barrier crops."},
    # Blossom End Rot (d6)
    {"disease_id": "d6", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Calcium Chloride foliar spray", "dosage": "4g per litre", "instructions": "Foliar spray during fruiting. Maintain consistent irrigation. Reduce excess nitrogen."},
    {"disease_id": "d6", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Crushed Eggshell + Mulching", "dosage": "200g eggshell per plant, 5cm mulch layer", "instructions": "Add crushed eggshells to soil for calcium. Mulch to maintain moisture. Water consistently."},
    # Powdery Mildew (d7)
    {"disease_id": "d7", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Sulphur 80% WP", "dosage": "3g per litre", "instructions": "Spray at first appearance. Avoid in temperatures above 35C. Repeat every 10 days."},
    {"disease_id": "d7", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Potassium Bicarbonate", "dosage": "5g per litre + few drops soap", "instructions": "Spray on affected leaves. Effective and food-safe. Improve air circulation."},
    # Septoria Leaf Spot (d8)
    {"disease_id": "d8", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Chlorothalonil 75% WP", "dosage": "2g per litre", "instructions": "Spray at 10-day intervals. Remove lower infected leaves. Avoid overhead watering."},
    {"disease_id": "d8", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Preventive spray before rains. Remove infected leaves promptly. Maintain good mulch."},

    # ── Chili ───────────────────────────────
    # Anthracnose (d9)
    {"disease_id": "d9", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre", "instructions": "Spray at fruit formation and repeat at 15-day intervals. Harvest ripe fruits promptly."},
    {"disease_id": "d9", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma viride + Neem Oil", "dosage": "4g Trichoderma + 3ml neem per litre", "instructions": "Preventive spray from flowering. Remove infected fruits. Use disease-free seeds."},
    # Chili Leaf Curl (d10)
    {"disease_id": "d10", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Thiamethoxam 25% WG", "dosage": "0.5g per litre", "instructions": "Control whitefly vector. Spray at 15-day intervals. Uproot severely infected plants."},
    {"disease_id": "d10", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Seed Kernel Extract", "dosage": "50g crushed kernels per litre", "instructions": "Soak kernels overnight, strain, spray. Install yellow sticky traps. Grow marigold as trap crop."},
    # Damping Off (d11)
    {"disease_id": "d11", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Captan 50% WP", "dosage": "3g per litre soil drench", "instructions": "Treat nursery soil before sowing. Avoid overwatering. Ensure good drainage in nursery beds."},
    {"disease_id": "d11", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per kg seed + soil application", "instructions": "Seed treatment and soil application. Use raised nursery beds. Avoid dense sowing."},
    # Cercospora Leaf Spot (d12)
    {"disease_id": "d12", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Repeat every 10-14 days. Remove severely infected leaves."},
    {"disease_id": "d12", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Apply at early symptoms. Improve spacing for air circulation. Remove fallen debris."},
    # Bacterial Leaf Spot (d13)
    {"disease_id": "d13", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Copper Hydroxide + Streptomycin", "dosage": "2g Cu(OH)2 + 500ppm streptomycin per litre", "instructions": "Spray at 7-day intervals during wet weather. Avoid overhead irrigation."},
    {"disease_id": "d13", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux Mixture", "dosage": "1% solution", "instructions": "Preventive spray before monsoon. Use drip irrigation. Rotate with non-Solanaceae crops."},
    # Powdery Mildew (d14)
    {"disease_id": "d14", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Dinocap 48% EC", "dosage": "1ml per litre", "instructions": "Spray at first symptoms. Repeat at 10-day intervals. Improve ventilation."},
    {"disease_id": "d14", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Milk Spray", "dosage": "1 part milk : 9 parts water", "instructions": "Spray weekly. The proteins in milk fight powdery mildew naturally. Best in morning."},
    # Fusarium Wilt (d15)
    {"disease_id": "d15", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim soil drench", "dosage": "2g per litre", "instructions": "Drench soil at planting. Use resistant varieties. 3-year crop rotation."},
    {"disease_id": "d15", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma + Bio-compost", "dosage": "2kg Trichoderma per acre in compost", "instructions": "Enrich compost with Trichoderma before application. Lime acidic soils. Deep ploughing."},
    # Fruit Rot (d16)
    {"disease_id": "d16", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Metalaxyl + Mancozeb", "dosage": "2g per litre", "instructions": "Spray during fruiting in wet weather. Ensure good drainage. Stake plants upright."},
    {"disease_id": "d16", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Preventive spray before rains. Improve drainage. Mulch to prevent soil splash."},

    # ── Rice ────────────────────────────────
    # Blast (d17)
    {"disease_id": "d17", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Tricyclazole 75% WP", "dosage": "0.6g per litre", "instructions": "Spray at first symptom or preventively at tillering and booting. Reduce excess nitrogen."},
    {"disease_id": "d17", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens", "dosage": "10g per litre foliar spray", "instructions": "Preventive spray at tillering. Balanced organic nutrition. Use resistant varieties."},
    # Bacterial Leaf Blight (d18)
    {"disease_id": "d18", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Streptomycin + Copper Oxychloride", "dosage": "500ppm + 3g per litre", "instructions": "Spray at first symptoms. Drain excess water. Reduce nitrogen fertilizer."},
    {"disease_id": "d18", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Pseudomonas", "dosage": "5ml neem + 10g Pseudomonas per litre", "instructions": "Foliar spray every 15 days from tillering. Good water management essential."},
    # Sheath Blight (d19)
    {"disease_id": "d19", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Hexaconazole 5% EC", "dosage": "2ml per litre", "instructions": "Spray at sheath level when symptoms appear. Reduce plant density. Lower nitrogen."},
    {"disease_id": "d19", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma viride", "dosage": "4g per litre", "instructions": "Apply at transplanting and tillering. Maintain wider spacing. Remove weed hosts."},
    # Brown Spot (d20)
    {"disease_id": "d20", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Apply balanced NPK fertilizer. Address soil deficiencies."},
    {"disease_id": "d20", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Potassium-rich compost", "dosage": "Apply balanced organic manure", "instructions": "Address nutrient deficiency with balanced compost. Improve soil health. Use resistant varieties."},
    # Tungro (d21)
    {"disease_id": "d21", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbofuran 3G", "dosage": "7.5kg per acre in nursery", "instructions": "Control leafhopper vector in nursery. Synchronize planting in community. Remove infected plants."},
    {"disease_id": "d21", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Cake in nursery", "dosage": "100kg per acre", "instructions": "Apply neem cake to repel leafhoppers. Use light traps. Grow resistant varieties."},
    # False Smut (d22)
    {"disease_id": "d22", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Propiconazole 25% EC", "dosage": "1ml per litre", "instructions": "Spray at booting and heading stages. Remove smut balls manually. Reduce nitrogen."},
    {"disease_id": "d22", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Balanced nutrition + Trichoderma", "dosage": "4g Trichoderma per litre at booting", "instructions": "Apply bio-control at booting. Avoid excess nitrogen. Use clean certified seed."},
    # Stem Rot (d23)
    {"disease_id": "d23", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre at stem base", "instructions": "Spray at water line area. Decompose stubble with urea treatment. Reduce waterlogging."},
    {"disease_id": "d23", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma + proper stubble management", "dosage": "2kg Trichoderma per acre", "instructions": "Apply to field during stubble decomposition. Alternate wet-dry irrigation. Good drainage."},
    # Grain Discoloration (d24)
    {"disease_id": "d24", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Mancozeb spray at heading", "dosage": "2.5g per litre", "instructions": "Spray at heading and grain filling. Harvest at correct moisture. Avoid delayed harvest."},
    {"disease_id": "d24", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Timely harvest + proper drying", "dosage": "N/A", "instructions": "Harvest at 20-22% grain moisture. Dry to 14% before storage. Control grain sucking insects."},

    # ── Brinjal ─────────────────────────────
    # Bacterial Wilt (d25)
    {"disease_id": "d25", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Streptomycin soil drench", "dosage": "500ppm", "instructions": "Drench around healthy plants. Remove infected plants with root ball. Solarize soil."},
    {"disease_id": "d25", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens + Lime", "dosage": "10g Pseudomonas per litre + lime to pH 6.5", "instructions": "Bio-control soil drench. Raise pH with lime. Graft onto resistant rootstock if available."},
    # Phomopsis Blight (d26)
    {"disease_id": "d26", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre", "instructions": "Spray at first symptoms. Remove infected fruits. Treat seeds with Thiram before sowing."},
    {"disease_id": "d26", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma seed treatment + Neem spray", "dosage": "5g/kg seed + 5ml neem/litre", "instructions": "Treat seeds. Spray neem preventively. Remove infected plant parts promptly."},
    # Little Leaf (d27)
    {"disease_id": "d27", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Dimethoate 30% EC", "dosage": "2ml per litre", "instructions": "Control leafhopper vector. Uproot and destroy infected plants. Use clean planting material."},
    {"disease_id": "d27", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Yellow Sticky Traps", "dosage": "5ml neem per litre", "instructions": "Spray neem to control leafhoppers. Install traps. Remove infected plants and weed hosts."},
    # Cercospora Leaf Spot (d28)
    {"disease_id": "d28", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at 10-day intervals. Remove severely infected leaves. Ensure proper spacing."},
    {"disease_id": "d28", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Apply at early symptom stage. Improve air circulation. Remove crop debris."},
    # Verticillium Wilt (d29)
    {"disease_id": "d29", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Soil fumigation + Carbendazim", "dosage": "2g Carbendazim per litre drench", "instructions": "Drench soil at transplanting. Use resistant varieties. Rotate with cereals for 3 years."},
    {"disease_id": "d29", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Soil solarization + Trichoderma", "dosage": "Solarize 4-6 weeks + 2kg Trichoderma/acre", "instructions": "Solarize with clear plastic in summer. Apply Trichoderma to enriched compost."},
    # Damping Off (d30)
    {"disease_id": "d30", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Captan 50% WP seed treatment", "dosage": "3g per kg seed", "instructions": "Treat seeds before sowing. Use sterilized nursery media. Avoid waterlogging."},
    {"disease_id": "d30", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per kg seed", "instructions": "Seed treatment. Use raised beds. Maintain proper drainage. Avoid dense nursery sowing."},
    # Powdery Mildew (d31)
    {"disease_id": "d31", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Sulphur 80% WP", "dosage": "3g per litre", "instructions": "Spray at first symptoms. Avoid in hot weather above 35C. Improve spacing."},
    {"disease_id": "d31", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Potassium Bicarbonate spray", "dosage": "5g per litre + wetting agent", "instructions": "Spray weekly on affected areas. Improves air circulation. Prune for better light."},
    # Mosaic Virus (d32)
    {"disease_id": "d32", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid 17.8 SL", "dosage": "0.3ml per litre", "instructions": "Control aphid vectors. Remove infected plants. Disinfect tools between plants."},
    {"disease_id": "d32", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Reflective Mulch", "dosage": "5ml neem per litre", "instructions": "Spray neem for aphid control. Use reflective mulch to repel aphids. Remove infected plants."},

    # ── Beans ───────────────────────────────
    # Anthracnose (d33)
    {"disease_id": "d33", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim + Mancozeb", "dosage": "2g combined per litre", "instructions": "Spray at flowering and pod formation. Use certified disease-free seeds."},
    {"disease_id": "d33", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma seed treatment + Copper", "dosage": "5g/kg seed + 3g Cu/litre spray", "instructions": "Treat seeds. Spray copper preventively at flowering. Use 3-year rotation."},
    # Rust (d34)
    {"disease_id": "d34", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Oxycarboxin 75% WP", "dosage": "1g per litre", "instructions": "Spray at first pustule appearance. Repeat every 10 days. Use resistant varieties."},
    {"disease_id": "d34", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Sulphur dust or spray", "dosage": "3g wettable sulphur per litre", "instructions": "Apply at early symptoms. Remove severely infected leaves. Plant resistant varieties."},
    # Angular Leaf Spot (d35)
    {"disease_id": "d35", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Use disease-free seed. Rotate with cereals."},
    {"disease_id": "d35", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide spray", "dosage": "2g per litre", "instructions": "Preventive spray at flowering. Use certified seed. Improve drainage."},
    # Common Bacterial Blight (d36)
    {"disease_id": "d36", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Streptomycin + Copper", "dosage": "500ppm streptomycin + 2g Cu per litre", "instructions": "Spray every 7 days during wet weather. Use pathogen-free seed. Avoid field when wet."},
    {"disease_id": "d36", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux Mixture", "dosage": "0.5% solution", "instructions": "Preventive spray. Use certified disease-free seed. Practice 2-year rotation."},
    # Root Rot (d37)
    {"disease_id": "d37", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Metalaxyl seed treatment", "dosage": "2g per kg seed", "instructions": "Seed treatment before planting. Improve soil drainage. Avoid compaction."},
    {"disease_id": "d37", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per kg seed + soil application", "instructions": "Seed and soil treatment. Raised beds for better drainage. Add compost for soil health."},
    # Bean Mosaic Virus (d38)
    {"disease_id": "d38", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid seed treatment", "dosage": "5ml per kg seed", "instructions": "Seed treatment to protect seedlings. Control aphids. Use virus-free certified seed."},
    {"disease_id": "d38", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Virus-free seed", "dosage": "5ml neem per litre for aphids", "instructions": "Control aphids with neem. Source certified virus-free seeds. Remove infected plants early."},
    # Powdery Mildew (d39)
    {"disease_id": "d39", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Sulphur 80% WP", "dosage": "3g per litre", "instructions": "Spray at first symptoms. Avoid in extreme heat. Improve air circulation."},
    {"disease_id": "d39", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Baking Soda spray", "dosage": "5g baking soda + 5ml oil per litre", "instructions": "Spray weekly on affected plants. The alkaline pH inhibits fungal growth. Best in morning."},
    # Halo Blight (d40)
    {"disease_id": "d40", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Spray at first symptoms. Do not work in field when plants are wet. Use disease-free seed."},
    {"disease_id": "d40", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux Mixture + crop rotation", "dosage": "0.5% Bordeaux solution", "instructions": "Preventive spray before wet season. Use certified seed. 3-year rotation with non-legumes."},
]
