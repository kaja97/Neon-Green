# backend/seed/pruning.py
# Pruning guide records for crops that require pruning operations.
# Format: stage_id, pruning_type, pruning_method, trigger_day, frequency_days,
#          pre_pruning, post_pruning, tools_needed, season_notes, importance

pruning_guides = [
    # ══════════════════════════════════════════════════════════════════════
    # Tomato (p1) — stages: s1=Germination, s2=Seedling, s3=Vegetative,
    #               s4=Flowering, s5=Fruiting, s6=Harvesting
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s3",
        "pruning_type": "desuckering",
        "pruning_method": "Remove side shoots (suckers) growing in the leaf axils between the main stem and branches. Pinch them off when they are 2-5 cm long. Focus on suckers below the first flower cluster.",
        "trigger_day": 5,
        "frequency_days": 7,
        "pre_pruning": "Sterilize hands or tools with rubbing alcohol. Prune in the morning when plants are turgid and wounds heal fastest.",
        "post_pruning": "Monitor removal points for 2 days. Apply a light dusting of fungicide powder if weather is humid. Avoid overhead irrigation for 24 hours.",
        "tools_needed": "Clean fingers (pinching) or sharp pruning shears for thick suckers",
        "season_notes": "Avoid pruning during heavy rains — wounds invite bacterial wilt. In dry season, prune freely.",
        "importance": "critical",
    },
    {
        "stage_id": "s4",
        "pruning_type": "desuckering",
        "pruning_method": "Continue removing axillary suckers weekly. Also remove any yellowing or diseased lower leaves to improve air circulation around the flower trusses.",
        "trigger_day": 0,
        "frequency_days": 7,
        "pre_pruning": "Sterilize tools between plants to prevent spread of bacterial diseases.",
        "post_pruning": "Apply copper-based fungicide spray if removing diseased leaves. Ensure good airflow around plants.",
        "tools_needed": "Sharp pruning shears, rubbing alcohol for sterilization",
        "season_notes": "Critical during monsoon season to reduce fungal disease pressure.",
        "importance": "critical",
    },
    {
        "stage_id": "s4",
        "pruning_type": "pinching",
        "pruning_method": "For determinate varieties, pinch the growing tip after 4-5 flower clusters to redirect energy to fruit development. For indeterminate types, allow main stem to grow but limit to 2 main leaders.",
        "trigger_day": 7,
        "frequency_days": 0,
        "pre_pruning": "Identify whether your variety is determinate or indeterminate before pinching.",
        "post_pruning": "Apply balanced foliar feed (NPK 19-19-19) to support fruit set after energy redirection.",
        "tools_needed": "Clean fingers or sharp scissors",
        "season_notes": "Best done during cool morning hours.",
        "importance": "recommended",
    },
    {
        "stage_id": "s5",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove leaves below the lowest ripening fruit cluster. Remove no more than 3 leaves per week per plant. This improves air circulation and speeds ripening.",
        "trigger_day": 5,
        "frequency_days": 7,
        "pre_pruning": "Ensure soil moisture is adequate before stressing the plant with leaf removal.",
        "post_pruning": "Monitor for sunscald on exposed fruits. Provide shade cloth if temperatures exceed 35°C.",
        "tools_needed": "Sharp pruning shears",
        "season_notes": "Be conservative in dry hot weather — leaves provide shade to fruits.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Chili (p2) — stages: s7=Germination, s8=Seedling, s9=Vegetative,
    #              s10=Flowering, s11=Fruiting, s12=Harvesting
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s9",
        "pruning_type": "topping",
        "pruning_method": "When plants reach 25-30 cm height, pinch off the growing tip above the 5th or 6th node. This forces lateral branching and creates a bushier plant with more fruiting sites.",
        "trigger_day": 10,
        "frequency_days": 0,
        "pre_pruning": "Ensure plant is healthy and well-watered. Avoid topping stressed plants.",
        "post_pruning": "Apply nitrogen-rich fertilizer within 3 days to support new branch growth. Water well.",
        "tools_needed": "Clean fingers or small scissors",
        "season_notes": "Best done during active vegetative growth in warm weather.",
        "importance": "critical",
    },
    {
        "stage_id": "s9",
        "pruning_type": "desuckering",
        "pruning_method": "Remove all shoots below the first Y-fork (main branching point). These lower suckers take energy from the productive upper canopy.",
        "trigger_day": 15,
        "frequency_days": 10,
        "pre_pruning": "Sterilize tools. Water plants well the day before.",
        "post_pruning": "Monitor for wilting. Mulch around base to retain moisture.",
        "tools_needed": "Sharp pruning shears or clean fingers",
        "season_notes": "Avoid during heavy rains to prevent bacterial infection at wound sites.",
        "importance": "recommended",
    },
    {
        "stage_id": "s10",
        "pruning_type": "thinning",
        "pruning_method": "Remove interior branches that are crowded or crossing. Thin out excessive flower buds if plant is overloaded — keep 3-4 fruits per branch cluster for larger chili size.",
        "trigger_day": 5,
        "frequency_days": 14,
        "pre_pruning": "Assess overall plant vigour before thinning. Weak plants should retain more foliage.",
        "post_pruning": "Apply potassium-rich fertilizer to support fruit development on remaining branches.",
        "tools_needed": "Sharp pruning shears",
        "season_notes": "Thinning is especially important in rainy season to prevent fungal issues from dense canopy.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Brinjal / Eggplant (p4) — stages: s19=Germination, s20=Seedling,
    #    s21=Vegetative, s22=Flowering, s23=Fruiting, s24=Harvesting
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s21",
        "pruning_type": "desuckering",
        "pruning_method": "Remove all side shoots below the main fork. Keep 3-4 main branches from the first branching point. Remove any shoots growing from the base (root suckers).",
        "trigger_day": 10,
        "frequency_days": 10,
        "pre_pruning": "Sterilize cutting tools. Best done in early morning.",
        "post_pruning": "Apply fungicide paste to large wounds. Monitor for bacterial wilt symptoms.",
        "tools_needed": "Sharp bypass secateurs",
        "season_notes": "Essential in monsoon season to prevent Phomopsis blight from poor air circulation.",
        "importance": "critical",
    },
    {
        "stage_id": "s22",
        "pruning_type": "pinching",
        "pruning_method": "Pinch off the first 2-3 flowers (crown flowers) to strengthen the plant frame before allowing fruiting. Remove any misshapen or small flowers.",
        "trigger_day": 0,
        "frequency_days": 0,
        "pre_pruning": "Check that plant has at least 6-8 healthy leaves before removing flowers.",
        "post_pruning": "Apply phosphorus-rich fertilizer to promote healthy subsequent flowering.",
        "tools_needed": "Clean fingers",
        "season_notes": "Especially important for early-season plantings when plants are still small.",
        "importance": "recommended",
    },
    {
        "stage_id": "s23",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove old, yellowing, or disease-spotted lower leaves. Remove leaves touching the soil surface. Keep the canopy open around developing fruits.",
        "trigger_day": 5,
        "frequency_days": 10,
        "pre_pruning": "Check for pest eggs on leaf undersides before removal — destroy infected leaves.",
        "post_pruning": "Dispose of removed leaves away from the field. Do not compost diseased material.",
        "tools_needed": "Pruning shears",
        "season_notes": "Critical during rainy season to reduce fruit rot from splashing soil.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Beans (p5) — stages: s25=Germination, s26=Seedling, s27=Vegetative,
    #              s28=Flowering, s29=Pod Formation, s30=Harvesting
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s27",
        "pruning_type": "training",
        "pruning_method": "For pole/climbing beans: train vines onto stakes or trellises by gently wrapping tendrils clockwise. Pinch the growing tip when vine reaches the top of the trellis (2m) to encourage lateral branching.",
        "trigger_day": 5,
        "frequency_days": 7,
        "pre_pruning": "Install stakes or trellis before vines start climbing. Ensure supports are sturdy.",
        "post_pruning": "Tie loosely with soft twine if vines don't self-cling. Avoid tight bindings.",
        "tools_needed": "Soft garden twine, stakes or trellis",
        "season_notes": "Train during morning when vines are most flexible. Avoid handling in wet conditions.",
        "importance": "critical",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Okra (p12) — stages: s67=Germination, s68=Seedling, s69=Vegetative,
    #              s70=Flowering, s71=Fruiting, s72=Harvesting
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s69",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove lower leaves that are yellowing, touching the ground, or showing disease. Keep at least 4-5 healthy leaves above each fruiting node for photosynthesis.",
        "trigger_day": 10,
        "frequency_days": 10,
        "pre_pruning": "Wear gloves — okra plant hairs can irritate skin. Sterilize tools.",
        "post_pruning": "Dispose of removed foliage. Monitor for increased pest activity on remaining leaves.",
        "tools_needed": "Sharp pruning shears, gardening gloves",
        "season_notes": "More aggressive leaf removal acceptable in humid monsoon season for airflow.",
        "importance": "recommended",
    },
    {
        "stage_id": "s71",
        "pruning_type": "topping",
        "pruning_method": "When plants exceed 1.5m and become difficult to harvest, cut the main stem back to 1m height. The plant will produce fresh lateral shoots with new fruiting nodes within 2-3 weeks.",
        "trigger_day": 10,
        "frequency_days": 0,
        "pre_pruning": "Ensure plant is healthy and well-fertilized before cutting back. Water deeply the day before.",
        "post_pruning": "Apply balanced NPK fertilizer immediately. Increase watering frequency for 1 week.",
        "tools_needed": "Heavy-duty pruning shears or loppers",
        "season_notes": "Best done during warm growing season. Avoid in cool weather as regrowth will be slow.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Bitter Gourd (p14) — stages listed from stages.py
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s81",
        "pruning_type": "training",
        "pruning_method": "Train main vine onto trellis or pandal structure. Remove all lateral branches up to 1m height to create a clean stem. Allow laterals above 1m to spread over the pandal.",
        "trigger_day": 5,
        "frequency_days": 7,
        "pre_pruning": "Ensure trellis/pandal is installed and sturdy before vine reaches it.",
        "post_pruning": "Tie vine to trellis with soft twine at 30cm intervals.",
        "tools_needed": "Soft garden twine, pruning shears",
        "season_notes": "Train during dry weather. Wet vines are brittle and may snap.",
        "importance": "critical",
    },
    {
        "stage_id": "s82",
        "pruning_type": "thinning",
        "pruning_method": "Remove excess lateral branches that overcrowd the canopy. Keep one branch per node on the main vine. Remove male flowers if female flower-to-fruit ratio drops below 1:3.",
        "trigger_day": 5,
        "frequency_days": 10,
        "pre_pruning": "Identify male vs female flowers before removal. Female flowers have a small fruit at the base.",
        "post_pruning": "Apply potassium fertilizer to support fruit development.",
        "tools_needed": "Sharp pruning shears",
        "season_notes": "Thinning improves fruit size and quality. Essential during peak fruiting.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Pumpkin (p30)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s177",
        "pruning_type": "vine_tipping",
        "pruning_method": "Pinch off the growing tips of main vine and lateral runners once 2-3 fruits have set per vine. This redirects energy to fruit development and limits vine sprawl.",
        "trigger_day": 10,
        "frequency_days": 0,
        "pre_pruning": "Count set fruits per vine. Only tip after adequate fruit load.",
        "post_pruning": "Apply potassium-rich fertilizer. Place straw or cardboard under developing fruits to prevent ground rot.",
        "tools_needed": "Clean fingers or scissors",
        "season_notes": "In rainy season, more aggressive tipping helps concentrate energy into fewer, larger fruits.",
        "importance": "recommended",
    },
    {
        "stage_id": "s177",
        "pruning_type": "thinning",
        "pruning_method": "Remove excess secondary lateral vines and poorly shaped small fruits. Keep only 2-3 best fruits per plant for maximum size.",
        "trigger_day": 15,
        "frequency_days": 0,
        "pre_pruning": "Identify the best-positioned and healthiest fruits to keep.",
        "post_pruning": "Monitor remaining fruits for even development. Increase watering.",
        "tools_needed": "Sharp pruning shears",
        "season_notes": "Fruit thinning is essential for large pumpkin varieties.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Cucumber (p31)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s183",
        "pruning_type": "training",
        "pruning_method": "Train main vine vertically on string or trellis. Remove all laterals and fruit from the bottom 40cm of the vine. Above 40cm, allow laterals to grow 2 leaves past a fruit, then pinch the tip.",
        "trigger_day": 3,
        "frequency_days": 5,
        "pre_pruning": "Install vertical strings or trellis support. Check string tension.",
        "post_pruning": "Clip vine to string with plant clips. Ensure good air circulation.",
        "tools_needed": "Sharp scissors, plant clips, trellis string",
        "season_notes": "Vertical training is essential in greenhouse and rainy season cultivation.",
        "importance": "critical",
    },
    {
        "stage_id": "s184",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove old lower leaves below the lowest harvesting zone. Remove no more than 2 leaves per plant per week. Remove leaves showing powdery mildew symptoms immediately.",
        "trigger_day": 5,
        "frequency_days": 7,
        "pre_pruning": "Check leaves for pest eggs or beneficial insects before removing.",
        "post_pruning": "Apply foliar potassium spray. Improve ventilation if in greenhouse.",
        "tools_needed": "Sharp pruning shears",
        "season_notes": "Critical during humid monsoon season to control powdery mildew spread.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Watermelon (p32)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s189",
        "pruning_type": "vine_tipping",
        "pruning_method": "Allow only 2-3 main runners per plant. Pinch off all other lateral runners. Once 2 fruits set per vine, pinch the growing tip 5 leaves beyond the last fruit.",
        "trigger_day": 10,
        "frequency_days": 0,
        "pre_pruning": "Mark the strongest 2-3 runners before removing others.",
        "post_pruning": "Place mulch under developing fruits. Apply calcium spray to prevent blossom end rot.",
        "tools_needed": "Clean fingers or scissors",
        "season_notes": "Fruit thinning to 2-3 fruits per plant yields larger, sweeter watermelons.",
        "importance": "critical",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Papaya (p33)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s195",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove old lower leaves that droop below the fruit cluster. Keep 20-25 functional leaves on the crown. Remove leaves showing ring spot virus or powdery mildew immediately.",
        "trigger_day": 10,
        "frequency_days": 14,
        "pre_pruning": "Sterilize cutting tool between plants to prevent spread of papaya ring spot virus.",
        "post_pruning": "Burn or bury diseased leaves far from the field. Apply Bordeaux mixture to cut surfaces.",
        "tools_needed": "Sharp machete or pruning saw, disinfectant",
        "season_notes": "More frequent leaf removal in monsoon to improve air circulation and reduce fungal diseases.",
        "importance": "critical",
    },
    {
        "stage_id": "s197",
        "pruning_type": "thinning",
        "pruning_method": "Thin fruit clusters to 1-2 fruits per node. Remove deformed, very small, or pest-damaged fruits. This improves size and quality of remaining fruits.",
        "trigger_day": 5,
        "frequency_days": 14,
        "pre_pruning": "Identify fruits with pest damage or deformity for removal.",
        "post_pruning": "Apply balanced fertilizer after thinning to support remaining fruit growth.",
        "tools_needed": "Clean fingers or small knife",
        "season_notes": "Essential for commercial-quality papaya production.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Banana (p34)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s201",
        "pruning_type": "desuckering",
        "pruning_method": "Remove all unwanted suckers (sword suckers and water suckers) leaving only the mother plant and 1 follower sucker. Cut suckers at ground level and destroy the growing point by gouging out the center with a sharp tool.",
        "trigger_day": 15,
        "frequency_days": 21,
        "pre_pruning": "Identify the healthiest sword sucker as the follower. Sterilize the cutting tool.",
        "post_pruning": "Apply kerosene or herbicide to the cut sucker stump to prevent regrowth. Fill the hole to prevent water collection and weevil breeding.",
        "tools_needed": "Sharp spade or sucker-removal tool, kerosene",
        "season_notes": "Desucker year-round but especially important before monsoon season.",
        "importance": "critical",
    },
    {
        "stage_id": "s201",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove dried, hanging, or completely yellowed leaves by cutting at the pseudostem junction. Keep at least 8-10 healthy green leaves at all times for photosynthesis.",
        "trigger_day": 20,
        "frequency_days": 14,
        "pre_pruning": "Check leaves for Sigatoka leaf spot before removal. Inspect for natural enemies on leaves.",
        "post_pruning": "Stack removed leaves as mulch around the base of the mat. Do not compost Sigatoka-infected leaves.",
        "tools_needed": "Sharp curved knife or machete",
        "season_notes": "More frequent during monsoon when leaf diseases are prevalent.",
        "importance": "recommended",
    },
    {
        "stage_id": "s203",
        "pruning_type": "thinning",
        "pruning_method": "After the bunch emerges, remove the male bud (bell) once 8-10 hands are formed. Remove the last 1-2 small hands (false hands) for uniform bunch development.",
        "trigger_day": 10,
        "frequency_days": 0,
        "pre_pruning": "Wait until adequate hands are formed. Count hands from the top.",
        "post_pruning": "Apply potassium-rich fertilizer. Support the bunch with props if heavy. Cover bunch with blue perforated bags for pest protection.",
        "tools_needed": "Sharp sickle or knife, bunch cover bags",
        "season_notes": "Male bud removal redirects energy to fruit filling. Critical for commercial quality.",
        "importance": "critical",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Black Pepper (p38)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s225",
        "pruning_type": "training",
        "pruning_method": "Train the main orthotropic shoot (climbing runner) onto the support standard (living or dead). Tie at 30cm intervals. Remove all plagiotropic (lateral fruiting) branches below 1m height.",
        "trigger_day": 10,
        "frequency_days": 14,
        "pre_pruning": "Check support standard health. Replace dead standards promptly.",
        "post_pruning": "Tie vine securely but loosely. Apply organic mulch around the base.",
        "tools_needed": "Coir rope or jute twine, pruning shears",
        "season_notes": "Train during pre-monsoon season. Vines establish aerial roots better in humid conditions.",
        "importance": "critical",
    },
    {
        "stage_id": "s225",
        "pruning_type": "maintenance",
        "pruning_method": "Remove dead or unproductive lateral branches. Cut back overgrown hanging shoots. Maintain vine at manageable height (4-5m) by topping.",
        "trigger_day": 20,
        "frequency_days": 30,
        "pre_pruning": "Sterilize tools. Identify dead or diseased wood for removal.",
        "post_pruning": "Apply Bordeaux paste to large cut surfaces. Ensure good sunlight penetration into the canopy.",
        "tools_needed": "Sharp secateurs, ladder, Bordeaux paste",
        "season_notes": "Best done after harvest season before new flush growth begins.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Mango (p39)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s231",
        "pruning_type": "formative",
        "pruning_method": "Shape young trees by selecting 3-4 well-spaced scaffold branches at 60-80cm height. Remove competing leaders, water sprouts, and branches growing inward or downward. Maintain open center canopy shape.",
        "trigger_day": 10,
        "frequency_days": 30,
        "pre_pruning": "Plan the desired tree shape before cutting. Sterilize tools.",
        "post_pruning": "Seal large cuts (>2cm diameter) with wound sealant or Bordeaux paste. Apply balanced fertilizer.",
        "tools_needed": "Bypass secateurs, pruning saw, wound sealant",
        "season_notes": "Prune immediately after harvest (Yala season). Avoid pruning during flowering or monsoon.",
        "importance": "critical",
    },
    {
        "stage_id": "s232",
        "pruning_type": "maintenance",
        "pruning_method": "Remove dead wood, crossing branches, and water sprouts. Tip-prune new flushes after harvest to promote uniform re-flowering. Remove low-hanging branches that obstruct farm operations.",
        "trigger_day": 5,
        "frequency_days": 0,
        "pre_pruning": "Assess tree for dead or diseased wood. Plan cuts to maintain open canopy.",
        "post_pruning": "Apply copper-based fungicide to cut surfaces. Remove all pruning debris from under the tree.",
        "tools_needed": "Pruning saw, loppers, ladder",
        "season_notes": "Post-harvest pruning (July-August in Sri Lanka) stimulates new flush for next season flowering.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Bell Pepper (p42)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s249",
        "pruning_type": "topping",
        "pruning_method": "When plant reaches 30cm, pinch out the crown flower (first flower at the main fork). Remove side shoots below the main fork. Keep 2-4 main leaders above the fork.",
        "trigger_day": 5,
        "frequency_days": 0,
        "pre_pruning": "Identify the first flower bud at the Y-fork. Ensure plant is healthy.",
        "post_pruning": "Apply phosphorus-rich fertilizer. Water well. Stake the plant if needed.",
        "tools_needed": "Clean fingers or small scissors",
        "season_notes": "Removing the crown flower is critical — it allows the plant frame to strengthen before fruiting.",
        "importance": "critical",
    },
    {
        "stage_id": "s249",
        "pruning_type": "desuckering",
        "pruning_method": "Remove all side shoots growing below the first Y-fork. These compete with the productive upper canopy. Also remove any inward-growing branches that block light.",
        "trigger_day": 10,
        "frequency_days": 10,
        "pre_pruning": "Sterilize tools between plants.",
        "post_pruning": "Monitor for pest entry through pruning wounds. Apply neem oil spray if needed.",
        "tools_needed": "Sharp pruning shears",
        "season_notes": "Regular desuckering produces fewer but larger, higher-quality peppers.",
        "importance": "recommended",
    },
    {
        "stage_id": "s250",
        "pruning_type": "leaf_removal",
        "pruning_method": "Remove yellowing lower leaves and leaves touching the ground. During heavy fruiting, thin out some interior leaves to improve air circulation and light penetration to ripening fruits.",
        "trigger_day": 5,
        "frequency_days": 10,
        "pre_pruning": "Check for beneficial insects on leaves before removing.",
        "post_pruning": "Apply potassium foliar spray to support fruit ripening.",
        "tools_needed": "Pruning shears",
        "season_notes": "Important during monsoon to reduce anthracnose and fruit rot.",
        "importance": "recommended",
    },

    # ══════════════════════════════════════════════════════════════════════
    # Coconut (p10)
    # ══════════════════════════════════════════════════════════════════════
    {
        "stage_id": "s57",
        "pruning_type": "maintenance",
        "pruning_method": "Remove dead, hanging, and fully dried fronds. Keep 25-30 green fronds on the crown. Remove only fronds hanging below horizontal — never cut green upward-pointing fronds.",
        "trigger_day": 30,
        "frequency_days": 90,
        "pre_pruning": "Ensure climber safety equipment is in good condition. Schedule on a dry day.",
        "post_pruning": "Stack removed fronds as mulch around the base or use as firewood. Check crown for rhinoceros beetle damage while pruning.",
        "tools_needed": "Sharp machete or sickle, climbing harness, coconut climbing equipment",
        "season_notes": "Prune 2-3 times per year. Best done before monsoon to reduce breeding sites for rhinoceros beetle.",
        "importance": "recommended",
    },
]
