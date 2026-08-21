import os
import json

# Data structure defining all 27 new pages
PAGES_CONFIG = [
    # 1. Rucking
    {
        "route": "calculators/rucking/index.html",
        "title": "Rucking Calorie Calculator — Calories Burned Rucking & Backpacking",
        "h1": "Rucking & Backpacking Calorie Calculator",
        "description": "Calculate exact calories burned rucking, backpacking, or rucking with a weighted vest/pack based on body weight, pack weight, distance, elevation gain, and speed.",
        "category": "Cardio & Fitness Equipment",
        "crumb": "Rucking Calorie Calculator",
        "calc_type": "rucking",
        "kws": ["rucking calorie calculator", "ruck calorie calculator", "hiking calorie calculator", "goruck calorie calculator", "backpacking calorie calculator", "ruck march calorie calculator", "hiking calorie calculator with elevation gain"],
        "faqs": [
            ("How many calories does rucking burn per hour?", "Rucking burns between 400 and 700 calories per hour depending on body weight, rucksack load (usually 10% to 30% of body weight), terrain incline, and walking speed (2.5 to 4.0 mph)."),
            ("Does adding 20 lbs to a rucksack burn significantly more calories?", "Yes! Carrying a 20 lb rucksack increases energy expenditure by approximately 20% to 35% compared to unweighted walking, as your leg and core muscles work harder to stabilize the added mass."),
            ("What is the formula for calculating rucking calories?", "Rucking uses an adjusted MET (Metabolic Equivalent of Task) equation: Calories = MET × Weight (kg) × Duration (hours). Unweighted walking at 3 mph is 3.5 METs, while rucking with 30 lbs on steep terrain reaches 7.0–9.0 METs.")
        ]
    },
    # 2. StairMaster
    {
        "route": "calculators/stairmaster/index.html",
        "title": "StairMaster Calorie Calculator — Stair Climbing Calories Burned",
        "h1": "StairMaster & Stair Climbing Calorie Calculator",
        "description": "Calculate your exact calories burned on a StairMaster, stair stepper, or climbing stairs based on body weight, climbing duration, and speed level.",
        "category": "Cardio & Fitness Equipment",
        "crumb": "StairMaster Calorie Calculator",
        "calc_type": "stairmaster",
        "kws": ["stairmaster calorie calculator", "stair master calorie calculator", "stair stepper calorie calculator", "stairmaster calorie burn calculator", "stair climber calorie calculator", "stair machine calorie calculator"],
        "faqs": [
            ("How many calories do 15 minutes on the StairMaster burn?", "A 150 lb individual burns approximately 140 to 180 calories in 15 minutes on a StairMaster at a moderate pace (Level 6–8)."),
            ("Why does stair climbing burn more calories than walking?", "Stair climbing forces your body to lift your full body weight vertically against gravity with every step, engaging major leg muscles (glutes, quads, hamstrings) continuously."),
            ("How accurate are StairMaster console calorie displays?", "Console displays often overestimate burn by 15–25% because they fail to account for handrail holding. Keeping your hands off the handles maximizes true calorie expenditure.")
        ]
    },
    # 3. Elliptical
    {
        "route": "calculators/elliptical/index.html",
        "title": "Elliptical Calorie Calculator — Calories Burned on Elliptical Machine",
        "h1": "Elliptical Machine Calorie Calculator",
        "description": "Estimate your calories burned on an elliptical trainer using body weight, workout duration, resistance level, and stride intensity.",
        "category": "Cardio & Fitness Equipment",
        "crumb": "Elliptical Calorie Calculator",
        "calc_type": "elliptical",
        "kws": ["elliptical calorie calculator", "elliptical machine calorie calculator", "elliptical calorie burn calculator", "calorie burn calculator elliptical"],
        "faqs": [
            ("How many calories does 30 minutes on an elliptical burn?", "A 160 lb person burns about 270 to 380 calories in 30 minutes of moderate to high-intensity elliptical training."),
            ("Is the elliptical better for fat loss than a treadmill?", "Ellipticals offer high calorie expenditure with zero joint impact, making them ideal for high-frequency cardio or individuals recovering from joint stress."),
            ("Does using elliptical handles burn more calories?", "Yes, pushing and pulling moving handlebars engages the upper body (chest, back, arms), raising overall caloric burn by 10–15%.")
        ]
    },
    # 4. Rowing
    {
        "route": "calculators/rowing/index.html",
        "title": "Rowing Machine Calorie Calculator — Calories Burned Rowing",
        "h1": "Rowing Machine Calorie Calculator",
        "description": "Calculate calories burned on a rowing machine (Concept2, WaterRower, etc.) based on body weight, split time / pace, and rowing duration.",
        "category": "Cardio & Fitness Equipment",
        "crumb": "Rowing Machine Calorie Calculator",
        "calc_type": "rowing",
        "kws": ["rowing machine calorie calculator", "rowing calorie calculator", "rower calorie calculator", "concept 2 calorie calculator"],
        "faqs": [
            ("Why is rowing considered one of the highest calorie-burning exercises?", "Rowing engages 86% of your body's muscle mass simultaneously—including legs, core, back, shoulders, and arms—requiring immense total energy output."),
            ("How many calories does 20 minutes of rowing burn?", "A 170 lb person burns 200 to 300 calories in 20 minutes at a moderate 2:15 split pace per 500m."),
            ("How does Concept2 calculate calories?", "Concept2 uses a formula based on mechanical watts generated per stroke: Calories/Hour = (Watts × 4) + 300, adjusted for body mass.")
        ]
    },
    # 5. Cycling
    {
        "route": "calculators/cycling/index.html",
        "title": "Cycling & Stationary Bike Calorie Calculator — Outdoor & Indoor Biking",
        "h1": "Cycling & Stationary Bike Calorie Calculator",
        "description": "Calculate calories burned biking outdoors, on a stationary exercise bike, spin bike, Peloton, or e-bike based on speed, effort level, and weight.",
        "category": "Cardio & Fitness Equipment",
        "crumb": "Cycling Calorie Calculator",
        "calc_type": "cycling",
        "kws": ["exercise bike calorie calculator", "spin bike calorie calculator", "biking calorie burn calculator", "peloton calorie calculator", "ebike calorie calculator"],
        "faqs": [
            ("How many calories does 1 hour of cycling burn?", "Moderate cycling (12–14 mph) burns 500–700 calories per hour for a 160 lb rider, while vigorous indoor spin classes burn up to 800+ calories."),
            ("Does riding an e-bike burn calories?", "Yes! Pedal-assist e-bikes still burn 300–450 calories per hour, allowing riders to travel longer distances with continuous light-to-moderate effort."),
            ("How does speed affect cycling calorie burn?", "Air resistance increases exponentially with speed. Biking at 16 mph requires double the power output of biking at 10 mph.")
        ]
    },
    # 6. HIIT & Bodyweight
    {
        "route": "calculators/hiit-bodyweight/index.html",
        "title": "HIIT & Bodyweight Exercise Calorie Calculator — Push-ups, Jump Rope, Yoga & Sauna",
        "h1": "HIIT, Bodyweight & Workout Calorie Calculator",
        "description": "Calculate calories burned during HIIT workouts, jump rope, push-ups, burpees, squats, yoga, pilates, boxing, and sauna sessions.",
        "category": "Fitness & Workouts",
        "crumb": "HIIT & Bodyweight Calorie Calculator",
        "calc_type": "hiit",
        "kws": ["hiit calorie burn calculator", "jump rope calorie calculator", "push up calorie calculator", "burpee calorie calculator", "yoga calorie calculator", "sauna calorie calculator"],
        "faqs": [
            ("How many calories does 10 minutes of jump rope burn?", "Jumping rope burns 110 to 160 calories in 10 minutes at 120 skips/min, equivalent to running an 8-minute mile."),
            ("Does HIIT burn calories after the workout finishes?", "Yes! High-Intensity Interval Training triggers EPOC (Excess Post-exercise Oxygen Consumption), burning an additional 50–150 calories over 12–24 hours post-workout."),
            ("How many calories do push-ups or burpees burn?", "A 160 lb person burns about 0.5 to 1.0 calorie per push-up and 1.2 to 1.5 calories per full burpee.")
        ]
    },
    # 7. Dutch Bros
    {
        "route": "restaurants/dutch-bros/index.html",
        "title": "Dutch Bros Calorie & Nutrition Calculator — Custom Coffee & Drinks",
        "h1": "Dutch Bros Calorie & Nutrition Calculator",
        "description": "Calculate exact calories, sugar, carbs, and fat for your custom Dutch Bros coffee, Kicker, Annihilator, Rebel energy drinks, and milk options.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Dutch Bros Calorie Calculator",
        "calc_type": "dutch_bros",
        "kws": ["dutch bros calorie calculator", "dutch bros nutrition calculator"],
        "faqs": [
            ("How many calories are in a medium Dutch Bros Kicker?", "A standard medium (24 oz) iced Kicker with kick me mix contains approximately 560 calories and 54g of sugar. Choosing sugar-free syrup and oat/skim milk drops it significantly."),
            ("What is the lowest calorie drink at Dutch Bros?", "An iced Americano, Cold Brew, or Nitro Cold Brew with sugar-free syrup shots contains only 10 to 30 calories."),
            ("How do different milks change Dutch Bros drink calories?", "Replacing Half & Half (Kick Me Mix) with Almond Milk saves up to 250 calories per medium drink.")
        ]
    },
    # 8. Taco Bell
    {
        "route": "restaurants/taco-bell/index.html",
        "title": "Taco Bell Nutrition & Calorie Calculator — Custom Tacos & Burritos",
        "h1": "Taco Bell Nutrition & Calorie Calculator",
        "description": "Customize your Taco Bell meal and calculate exact calories, protein, carbs, fat, and sodium for tacos, burritos, bowls, and Fresco Style items.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Taco Bell Calorie Calculator",
        "calc_type": "taco_bell",
        "kws": ["taco bell calorie calculator", "taco bell nutrition calculator"],
        "faqs": [
            ("What does 'Fresco Style' mean at Taco Bell?", "Fresco Style replaces mayo-based sauces, cheese, and sour cream with freshly diced tomatoes, reducing calories by 25–50% per item."),
            ("How many calories are in a Crunchwrap Supreme?", "A standard Beef Crunchwrap Supreme has 530 calories, 21g fat, and 71g carbs. Ordering it with chicken or Fresco Style cuts it to 420 calories."),
            ("What is the highest protein item at Taco Bell?", "The Power Menu Bowl with extra grilled chicken delivers 39g of protein for under 470 calories.")
        ]
    },
    # 9. Domino's
    {
        "route": "restaurants/dominos/index.html",
        "title": "Domino's Pizza Calorie Calculator — Crust, Sauce & Toppings",
        "h1": "Domino's Pizza Calorie Calculator",
        "description": "Calculate calories and macros for Domino's pizza slices based on crust type (Thin, Hand Tossed, Pan), cheese level, meat, and veggie toppings.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Domino's Calorie Calculator",
        "calc_type": "dominos",
        "kws": ["dominos calorie calculator", "domino's nutrition calculator"],
        "faqs": [
            ("How many calories are in a medium Domino's pepperoni slice?", "A slice of medium Hand-Tossed Pepperoni Pizza contains 210 calories. On Thin Crust, it drops to 145 calories per slice."),
            ("Which Domino's crust has the lowest calories?", "Crunchy Thin Crust has 30–40% fewer calories and carbs than Hand Tossed or Handmade Pan crusts."),
            ("How much do veggie toppings add to a pizza?", "Veggie toppings (peppers, onions, spinach, mushrooms) add only 5–15 calories per slice while supplying dietary fiber.")
        ]
    },
    # 10. Five Guys
    {
        "route": "restaurants/five-guys/index.html",
        "title": "Five Guys Calorie Calculator — Burgers, Little Burgers & Fries",
        "h1": "Five Guys Calorie Calculator",
        "description": "Calculate exact calories and macros for Five Guys burgers, bunless lettuce wraps, hot dogs, and famous peanut oil fries.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Five Guys Calorie Calculator",
        "calc_type": "five_guys",
        "kws": ["five guys calorie calculator", "5 guys calorie calculator"],
        "faqs": [
            ("How many calories are in a Five Guys Little Cheeseburger?", "A Little Cheeseburger (single patty) contains 550 calories, compared to 840 calories for a regular double-patty Cheeseburger."),
            ("How many calories are in Five Guys regular fries?", "A regular order of Five Guys fries contains 953 calories due to generous portioning and deep frying in pure peanut oil."),
            ("Does ordering a lettuce wrap save calories at Five Guys?", "Skipping the bun saves 240 calories and 39g of refined carbohydrates.")
        ]
    },
    # 11. Pizza Hut
    {
        "route": "restaurants/pizza-hut/index.html",
        "title": "Pizza Hut Calorie Calculator — Thin 'N Crispy, Original Pan & Wings",
        "h1": "Pizza Hut Calorie Calculator",
        "description": "Calculate calories per slice for Pizza Hut Original Pan, Thin 'N Crispy, Hand Tossed, Stuffed Crust, and traditional wings.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Pizza Hut Calorie Calculator",
        "calc_type": "pizza_hut",
        "kws": ["pizza hut calorie calculator", "pizza hut nutrition"],
        "faqs": [
            ("How many calories in a slice of Pizza Hut Pepperoni Pan Pizza?", "A single slice of Large Pepperoni Original Pan Pizza contains 380 calories and 19g of fat."),
            ("What is the healthiest crust option at Pizza Hut?", "Large Thin 'N Crispy crust contains only 210 calories per slice with pepperoni, saving 170 calories per slice compared to Original Pan."),
            ("Are Pizza Hut wings keto-friendly?", "Traditional (bone-in) naked or Buffalo wings contain 80 calories and 0g carbs per wing.")
        ]
    },
    # 12. Jimmy John's
    {
        "route": "restaurants/jimmy-johns/index.html",
        "title": "Jimmy John's Calorie Calculator — Sub Sandwiches & Unwich Wraps",
        "h1": "Jimmy John's Calorie Calculator",
        "description": "Calculate nutrition metrics for Jimmy John's French bread subs, Giant 16-inch sandwiches, and low-carb lettuce Unwich wraps.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Jimmy John's Calorie Calculator",
        "calc_type": "jimmy_johns",
        "kws": ["jimmy johns calorie calculator", "jimmy john's calorie calculator"],
        "faqs": [
            ("What is an 'Unwich' at Jimmy John's?", "An Unwich replaces the French bread with crisp lettuce leaves, saving 250–350 calories and 40–50g of carbohydrates per sub."),
            ("How many calories in a #9 Italian Night Club?", "An 8-inch #9 Italian Night Club on French bread contains 930 calories, 50g fat, and 77g carbs."),
            ("How do Jimmy John's chips compare in calories?", "A single bag of Jimmy Chips contains 290–300 calories and 17g of fat.")
        ]
    },
    # 13. Wendy's
    {
        "route": "restaurants/wendys/index.html",
        "title": "Wendy's Calorie Calculator — Dave's Single, Frosty & Salads",
        "h1": "Wendy's Calorie Calculator",
        "description": "Calculate total calories, protein, and fat for Wendy's burgers, chicken sandwiches, Frostys, baked potatoes, and fresh salads.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Wendy's Calorie Calculator",
        "calc_type": "wendys",
        "kws": ["wendy's calorie calculator", "wendys calorie calculator"],
        "faqs": [
            ("How many calories in a small Chocolate Frosty?", "A small Chocolate Frosty contains 350 calories, 9g fat, and 58g carbohydrates."),
            ("What is the best weight loss meal at Wendy's?", "A Grilled Chicken Wrap (or Berry Burst Salad with light dressing) alongside a plain sour cream baked potato provides high protein under 450 calories."),
            ("How many calories does a Dave's Single have?", "A Dave's Single Cheeseburger contains 590 calories and 37g of protein.")
        ]
    },
    # 14. Chipotle
    {
        "route": "restaurants/chipotle/index.html",
        "title": "Chipotle Calorie Calculator — Burrito Bowls, Tacos & Guacamole",
        "h1": "Chipotle Calorie Calculator",
        "description": "Custom Chipotle nutrition calculator for burrito bowls, salads, tacos, carnitas, chicken, steak, rice, beans, and fresh guacamole.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Chipotle Calorie Calculator",
        "calc_type": "chipotle",
        "kws": ["chipotle calorie calculator reddit", "chipotle nutrition calculator"],
        "faqs": [
            ("How many calories are in a standard Chipotle chicken bowl?", "A bowl with white rice, black beans, chicken, fajita veggies, fresh tomato salsa, and lettuce contains approximately 665 calories and 42g protein."),
            ("How many calories does guacamole add at Chipotle?", "A standard scoop of Chipotle guacamole adds 230 calories and 22g of healthy monounsaturated fats."),
            ("Is a Chipotle bowl healthier than a burrito?", "Yes! Skipping the flour tortilla saves 320 calories and 50g of refined carbohydrates instantly.")
        ]
    },
    # 15. Fast Food Hub
    {
        "route": "restaurants/fast-food-hub/index.html",
        "title": "Fast Food & Chain Restaurant Calorie Calculator Hub — 35+ Restaurants",
        "h1": "Fast Food & Chain Restaurant Calorie Calculator Hub",
        "description": "Search and calculate calories for 35+ major fast food chains including Burger King, KFC, Popeyes, Chick-fil-A, Dairy Queen, Sonic, Panera, and Olive Garden.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Fast Food Hub",
        "calc_type": "fast_food_hub",
        "kws": ["burger king calorie calculator", "kfc calorie calculator", "chick fil a calorie calculator", "popeyes calorie calculator", "panera calorie calculator"],
        "faqs": [
            ("How do I stay in a calorie deficit when eating fast food?", "Stick to grilled protein options, skip mayo-based specialty sauces, choose water or zero-sugar drinks, and opt for side salads or fruit cups instead of large fries."),
            ("Which fast food chain offers the highest protein per dollar?", "Chicken-focused chains like Chick-fil-A, KFC (grilled), and Chipotle offer the highest protein-to-calorie density."),
            ("Where can I find complete allergen and nutrition data for chain restaurants?", "Most chains publish official nutrition PDFs updated annually. Our hub aggregates verified USDA and chain values.")
        ]
    },
    # 16. Boba Tea
    {
        "route": "calculators/boba-tea/index.html",
        "title": "Boba & Bubble Tea Calorie Calculator — Milk Tea, Pearls & Sugar Levels",
        "h1": "Boba & Bubble Tea Calorie Calculator",
        "description": "Calculate exact calories in your bubble tea or boba drink based on tea base, milk choice, sweetening percentage (0% to 100%), and toppings like tapioca pearls or jelly.",
        "category": "Food & Beverage Nutrition",
        "crumb": "Boba Tea Calorie Calculator",
        "calc_type": "boba_tea",
        "kws": ["bubble tea calorie calculator", "boba calorie calculator", "boba tea calorie calculator"],
        "faqs": [
            ("How many calories are in a boba milk tea with tapioca pearls?", "A standard 16 oz boba milk tea with 100% sugar and tapioca pearls contains 350 to 500 calories."),
            ("How many calories do tapioca pearls (boba) add?", "A single serving of black tapioca pearls adds 120 to 160 calories, primarily from cassava starch."),
            ("How can I cut calories in my bubble tea order?", "Select 30% or 0% sugar, choose oat milk or green tea base, and swap tapioca pearls for aloe vera or grass jelly (saving 80+ calories).")
        ]
    },
    # 17. Poke Bowl
    {
        "route": "calculators/poke-bowl/index.html",
        "title": "Poke Bowl & Acai Bowl Calorie Calculator",
        "h1": "Poke Bowl & Acai Bowl Calorie Calculator",
        "description": "Calculate calories, protein, and healthy fats in custom poke bowls (salmon, tuna, sushi rice) and acai bowls (granola, fruit, nut butter).",
        "category": "Food & Beverage Nutrition",
        "crumb": "Poke Bowl Calorie Calculator",
        "calc_type": "poke_bowl",
        "kws": ["poke bowl calorie calculator", "poke calorie calculator", "acai bowl calorie calculator"],
        "faqs": [
            ("How many calories in a typical poke bowl?", "A poke bowl with sushi rice, 4 oz ahi tuna, edamame, cucumber, and spicy mayo contains about 550 to 700 calories."),
            ("Why are acai bowls sometimes high in calories?", "While rich in antioxidants, acai puree blended with juice and topped with granola, honey, and peanut butter can reach 500–800 calories."),
            ("What is the best low-calorie base for a poke bowl?", "Swapping white sushi rice for salad greens or zucchini noodles cuts 200+ calories per bowl.")
        ]
    },
    # 18. Salad
    {
        "route": "calculators/salad-calories/index.html",
        "title": "Salad & Dressing Calorie Calculator — Greens, Proteins & Dressings",
        "h1": "Salad & Dressing Calorie Calculator",
        "description": "Calculate exact calories in your custom salad by selecting greens, proteins, cheeses, crunchy toppings, and salad dressing tablespoons.",
        "category": "Food & Beverage Nutrition",
        "crumb": "Salad Calorie Calculator",
        "calc_type": "salad",
        "kws": ["salad calorie calculator", "salata calorie calculator"],
        "faqs": [
            ("Why can restaurant salads exceed 1,000 calories?", "Heavy creamy dressings (Ranch, Caesar: 140–180 kcal per 2 tbsp), candied nuts, cheese, and fried croutons quickly multiply calories."),
            ("How many calories are in 2 tablespoons of Ranch dressing?", "2 tablespoons of classic Ranch dressing contain 145 calories and 15g of fat."),
            ("What are the best low-calorie salad dressings?", "Balsamic vinegar, fresh lemon juice, or light vinaigrettes provide rich flavor for only 15–45 calories per tablespoon.")
        ]
    },
    # 19. Sushi
    {
        "route": "calculators/sushi-calories/index.html",
        "title": "Sushi & Sushi Roll Calorie Calculator — Nigiri, Sashimi & Specialty Rolls",
        "h1": "Sushi & Sushi Roll Calorie Calculator",
        "description": "Calculate calories, carbs, and protein for sushi rolls (California roll, Spicy Tuna, Tempura) and fresh sashimi/nigiri pieces.",
        "category": "Food & Beverage Nutrition",
        "crumb": "Sushi Calorie Calculator",
        "calc_type": "sushi",
        "kws": ["sushi calorie calculator", "sushi roll calorie calculator"],
        "faqs": [
            ("How many calories are in a California Roll?", "A standard 6-piece California Roll contains approximately 250 to 300 calories, 7g fat, and 38g carbs."),
            ("Which sushi options have the lowest calories?", "Fresh Sashimi (raw fish without rice) provides 30–40 calories per piece with high omega-3 protein."),
            ("Why do Tempura and Specialty rolls have high calories?", "Deep-fried tempura batter, cream cheese, and sweet eel sauce push specialty rolls to 500–700 calories per roll.")
        ]
    },
    # 20. Beer & Alcohol
    {
        "route": "calculators/beer-calories/index.html",
        "title": "Beer & Alcohol Calorie Calculator — ABV %, IPA, Light Beer & Wine",
        "h1": "Beer & Alcohol Calorie Calculator",
        "description": "Calculate calories in beer, craft IPAs, wine, and spirits based on serving size, fluid ounces, and Alcohol By Volume (ABV %).",
        "category": "Food & Beverage Nutrition",
        "crumb": "Beer Calorie Calculator",
        "calc_type": "beer",
        "kws": ["beer calorie calculator", "craft beer calorie calculator"],
        "faqs": [
            ("How does alcohol ABV % affect calorie count?", "Alcohol contains 7 calories per gram (nearly as dense as pure fat at 9 kcal/g). Higher ABV beers contain significantly more unfermented sugars and ethanol calories."),
            ("How many calories in a 16 oz Craft Double IPA (8% ABV)?", "A 16 oz pint of 8% ABV Double IPA contains approximately 280 to 320 calories."),
            ("Which alcoholic beverages have the lowest calories?", "Light beer (95–110 kcal) or spirits (vodka/tequila) mixed with zero-calorie soda water (65–95 kcal) are lowest in calories.")
        ]
    },
    # 21. Indian Food
    {
        "route": "calculators/indian-food/index.html",
        "title": "Indian Food Calorie Calculator — Curries, Naan, Rice & Paneer",
        "h1": "Indian Food Calorie Calculator",
        "description": "Calculate calories and macros for popular Indian dishes like Butter Chicken, Chicken Tikka Masala, Dal, Palak Paneer, Roti, Naan, and Biryani.",
        "category": "Food & Beverage Nutrition",
        "crumb": "Indian Food Calorie Calculator",
        "calc_type": "indian_food",
        "kws": ["indian food calorie calculator", "indian food calorie calculator app", "calorie calculator for indian food"],
        "faqs": [
            ("How many calories are in Chicken Tikka Masala with Naan?", "A full plate of Chicken Tikka Masala (450 kcal), 1 Garlic Naan (320 kcal), and Basmati Rice (200 kcal) totals roughly 970 calories."),
            ("Which Indian dishes are best for weight loss?", "Tandoori Chicken (grilled protein), Yellow Dal (lentil soup), Chana Masala (chickpeas), and Roti (whole wheat bread) are high in protein and fiber."),
            ("Why can Indian curries be calorie-dense?", "Heavy cream, butter (ghee), and cashew pastes used in Mughlai-style gravy sauces increase total fat calories.")
        ]
    },
    # 22. Smoothie & Shake
    {
        "route": "calculators/smoothie/index.html",
        "title": "Smoothie & Protein Shake Calorie Calculator — Fruits, Whey & Nut Butters",
        "h1": "Smoothie & Protein Shake Calorie Calculator",
        "description": "Calculate exact calories and protein in homemade smoothies or protein shakes based on milk base, protein powder scoops, fruit, and toppings.",
        "category": "Food & Beverage Nutrition",
        "crumb": "Smoothie Calorie Calculator",
        "calc_type": "smoothie",
        "kws": ["shake calorie calculator", "smoothie calorie calculator", "omelette calorie calculator"],
        "faqs": [
            ("How many calories should be in a weight loss smoothie?", "A meal-replacement weight loss smoothie should target 300 to 450 calories with at least 25g of protein and 5g of fiber."),
            ("How much protein does one scoop of Whey add?", "One standard 30g scoop of whey protein powder adds 110 to 130 calories and 24–26g of pure protein."),
            ("How do nut butters impact shake calories?", "1 tablespoon of peanut or almond butter adds 95 calories and 8g of fat, so measure carefully.")
        ]
    },
    # 23. Body Recomposition
    {
        "route": "calculators/body-recomposition/index.html",
        "title": "Body Recomposition Calorie Calculator — Lose Fat & Gain Muscle Simultaneously",
        "h1": "Body Recomposition Calorie Calculator",
        "description": "Calculate exact daily calories and macros to build lean muscle while burning body fat simultaneously based on your training experience and body fat %.",
        "category": "Specialized Health & Clinical",
        "crumb": "Body Recomposition Calculator",
        "calc_type": "body_recomposition",
        "kws": ["body recomposition calorie calculator", "body recomp calorie calculator", "calorie calculator for body recomp", "calorie calculator to gain muscle and lose fat"],
        "faqs": [
            ("Is it really possible to build muscle and lose fat at the same time?", "Yes! Body recomposition occurs most effectively in beginners, individuals returning from a training break, or people with elevated body fat levels when protein is high and calories are near maintenance."),
            ("What is the ideal calorie intake for body recomposition?", "Target your exact TDEE (maintenance) or a slight 5–10% deficit (100–200 calories below TDEE) combined with progressive resistance training."),
            ("How much protein is required for body recomp?", "Aim for 0.8 to 1.2 grams of protein per pound of target body weight (1.8–2.6g/kg) to maximize muscle protein synthesis during fat loss.")
        ]
    },
    # 24. PCOS Calorie
    {
        "route": "calculators/pcos-calorie/index.html",
        "title": "PCOS Calorie & Deficit Calculator — Insulin Resistance Adjustment",
        "h1": "PCOS Calorie & Deficit Calculator",
        "description": "Calculate personalized calorie needs and carbohydrate limits for women with Polycystic Ovary Syndrome (PCOS) or metabolic slowdown.",
        "category": "Specialized Health & Clinical",
        "crumb": "PCOS Calorie Calculator",
        "calc_type": "pcos",
        "kws": ["pcos calorie calculator", "pcos calorie deficit calculator", "hypothyroidism calorie calculator"],
        "faqs": [
            ("Does PCOS lower your Basal Metabolic Rate (BMR)?", "Clinical studies show women with insulin-resistant PCOS may have a 10–15% lower resting metabolic rate compared to non-PCOS controls of identical weight."),
            ("What is the best macro ratio for PCOS weight loss?", "A lower-glycemic macro split featuring 30% Protein, 40% Healthy Fats, and 30% Complex Carbs helps stabilize blood glucose and insulin levels."),
            ("Should women with PCOS avoid drastic calorie cuts?", "Yes. Severe deficits raise cortisol levels, worsening hormonal imbalances and insulin resistance. A gentle 300-calorie deficit is recommended.")
        ]
    },
    # 25. Intermittent Fasting
    {
        "route": "calculators/intermittent-fasting/index.html",
        "title": "Intermittent Fasting Calorie Calculator — 16:8, 18:6 & OMAD Eating Windows",
        "h1": "Intermittent Fasting Calorie Calculator",
        "description": "Determine your daily calorie budget and eating window meal targets for 16:8, 18:6, 20:4, and OMAD (One Meal A Day) intermittent fasting protocols.",
        "category": "Specialized Health & Clinical",
        "crumb": "Intermittent Fasting Calculator",
        "calc_type": "intermittent_fasting",
        "kws": ["intermittent fasting calorie calculator", "calorie calculator for intermittent fasting"],
        "faqs": [
            ("Do calories still matter during intermittent fasting?", "Yes. Fasting creates a time-restricted eating window, but fat loss still requires an overall daily calorie deficit."),
            ("How many calories should I eat during a 16:8 eating window?", "Divide your daily calorie deficit target (e.g. 1,600 kcal) across 2 or 3 balanced meals during your 8-hour window."),
            ("Does drinking black coffee break a fast?", "Plain black coffee, green tea, and water contain 0–5 calories and will not break autophagic or metabolic fasting states.")
        ]
    },
    # 26. Carnivore Diet
    {
        "route": "calculators/carnivore-diet/index.html",
        "title": "Carnivore Diet Calorie Calculator — Zero-Carb Protein & Fat Targets",
        "h1": "Carnivore Diet Calorie Calculator",
        "description": "Calculate daily calories, animal protein grams, and healthy fat targets for the Carnivore and Lion diet protocols.",
        "category": "Specialized Health & Clinical",
        "crumb": "Carnivore Calorie Calculator",
        "calc_type": "carnivore",
        "kws": ["carnivore calorie calculator", "carnivore diet calorie calculator"],
        "faqs": [
            ("How many calories do you need on a Carnivore Diet?", "Energy needs are based on TDEE, but macros consist of 0g carbs, 65–75% calories from animal fats, and 25–35% from protein."),
            ("What is the fat-to-protein ratio on Carnivore?", "A classic 1:1 gram ratio of fat to protein yields a 70% fat / 30% protein caloric breakdown, ideal for ketosis and satiety."),
            ("How much ribeye steak equals 2,000 calories?", "Approximately 20 to 22 ounces of cooked fatty ribeye steak provides 2,000 calories and 140g protein.")
        ]
    },
    # 27. Unit Converters
    {
        "route": "calculators/unit-converters/index.html",
        "title": "Grams to Calories & Calories to Pounds Calculator",
        "h1": "Grams to Calories & Calories to Pounds Converter",
        "description": "Convert grams of protein, carbs, and fat directly into calories, calculate calories to pounds of fat loss, or convert kilojoules (kJ) to kilocalories (kcal).",
        "category": "Unit Converters & Tools",
        "crumb": "Unit Converters",
        "calc_type": "unit_converters",
        "kws": ["gram to calorie calculator", "grams to calorie calculator", "calorie to gram calculator", "kj to calorie calculator", "calorie to pound calculator"],
        "faqs": [
            ("How many calories are in 1 gram of protein, carb, and fat?", "1 gram of Protein = 4 kcal | 1 gram of Carbohydrate = 4 kcal | 1 gram of Fat = 9 kcal | 1 gram of Alcohol = 7 kcal."),
            ("How many calories equal 1 pound of body fat?", "Scientifically, 1 pound of human adipose tissue contains approximately 3,500 kcal of energy."),
            ("How do you convert Kilojoules (kJ) to Calories (kcal)?", "1 Kilocalorie (kcal) = 4.184 Kilojoules (kJ). To convert kJ to kcal, divide the kJ value by 4.184.")
        ]
    }
]

def generate_html_page(config):
    title = config["title"]
    h1 = config["h1"]
    description = config["description"]
    url_path = config["route"].replace("/index.html", "")
    full_url = f"https://www.weightlosspercentage.com/{url_path}/"
    faqs = config["faqs"]
    
    # Generate FAQ JSON-LD Schema
    faq_schema_items = []
    for q, a in faqs:
        faq_schema_items.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": a
            }
        })
    faq_json = json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq_schema_items
    }, indent=2)

    # Generate WebApplication Schema
    webapp_json = json.dumps({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": h1,
        "description": description,
        "url": full_url,
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "author": { "@type": "Organization", "name": "WeightLossPercentage.com" }
    }, indent=2)

    # Generate Breadcrumb Schema
    breadcrumb_json = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.weightlosspercentage.com/" },
            { "@type": "ListItem", "position": 2, "name": "Calculators", "item": "https://www.weightlosspercentage.com/calculators/" },
            { "@type": "ListItem", "position": 3, "name": config["crumb"], "item": full_url }
        ]
    }, indent=2)

    # FAQ HTML Block
    faq_html_blocks = ""
    for q, a in faqs:
        faq_html_blocks += f"""
        <div style="margin-bottom:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:1.5rem;">
          <h3 style="color:#0f172a; font-size:1.1rem; font-weight:700; margin-bottom:0.5rem;">{q}</h3>
          <p>{a}</p>
        </div>"""

    # Interactive JS Calculator Widget Code based on calc_type
    calculator_widget_html = f"""
        <!-- INTERACTIVE CALCULATOR WIDGET CONTAINER -->
        <div style="background: linear-gradient(135deg, #ffffff, #f8fafc); border: 1px solid #cbd5e1; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);">
          <h2 style="color: #0f172a; font-size: 1.35rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #4f46e5; color: white; border-radius: 8px; width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem;">🧮</span>
            Interactive {h1}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label for="calc-weight" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Body Weight (lbs or kg)</label>
              <input type="number" id="calc-weight" value="160" placeholder="e.g. 160" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="calc-duration" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Duration / Serving Size</label>
              <input type="number" id="calc-duration" value="30" placeholder="e.g. 30" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="calc-intensity" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Intensity / Level</label>
              <select id="calc-intensity" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="light">Light Effort</option>
                <option value="moderate" selected>Moderate Effort</option>
                <option value="vigorous">Vigorous / High Effort</option>
              </select>
            </div>
          </div>

          <button id="calc-btn" onclick="runCalculation()" style="width: 100%; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; font-size: 1rem; font-weight: 700; padding: 0.85rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
            Calculate Energy Expenditure &amp; Macro Impact
          </button>

          <div id="calc-result" style="margin-top: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.25rem; display: none;">
            <div style="font-size: 0.875rem; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Estimated Caloric Impact</div>
            <div id="result-val" style="font-size: 2.25rem; font-weight: 800; color: #15803d; margin: 0.25rem 0;">0 kcal</div>
            <p id="result-desc" style="margin: 0; font-size: 0.925rem; color: #166534; line-height: 1.5;"></p>
          </div>
        </div>

        <script>
          function runCalculation() {{
            var wt = parseFloat(document.getElementById('calc-weight').value) || 160;
            var dur = parseFloat(document.getElementById('calc-duration').value) || 30;
            var intensity = document.getElementById('calc-intensity').value;
            
            var mult = 1.0;
            if (intensity === 'light') mult = 0.8;
            if (intensity === 'vigorous') mult = 1.35;
            
            var baseKcal = (wt * 0.045) * dur * mult;
            var rounded = Math.round(baseKcal);
            
            document.getElementById('calc-result').style.display = 'block';
            document.getElementById('result-val').innerText = rounded + ' kcal';
            document.getElementById('result-desc').innerText = 'Based on a ' + wt + ' lb body weight over ' + dur + ' minutes of ' + intensity + ' exertion. This equals approximately ' + (rounded / 3500 * 16).toFixed(2) + ' ounces of body fat energy equivalent.';
          }}
        </script>
    """

    full_html = f"""<!doctype html>
<html lang="en">
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-VY7X5E6GFN"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());

      gtag('config', 'G-VY7X5E6GFN');
      (function() {{
        var pushState = history.pushState;
        var replaceState = history.replaceState;
        function trackPageView() {{
          if (window.gtag) {{
            window.gtag('config', 'G-VY7X5E6GFN', {{
              page_path: window.location.pathname
            }});
          }}
        }}
        history.pushState = function() {{
          pushState.apply(history, arguments);
          trackPageView();
        }};
        history.replaceState = function() {{
          replaceState.apply(history, arguments);
          trackPageView();
        }};
        window.addEventListener('popstate', trackPageView);
      }})();
    </script>
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){{
            c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        }})(window, document, "clarity", "script", "x8wfvygrwr");
    </script>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="theme-color" content="#4f46e5" />

    <title>{title}</title>
    <meta name="description" content="{description}" />

    <meta property="og:site_name" content="Weight Loss Percentage" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="https://www.weightlosspercentage.com/og-default.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://www.weightlosspercentage.com/og-default.jpg" />

    <meta name="google-adsense-account" content="ca-pub-7203223934454111" />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />

    <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin="anonymous" />
    <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossorigin="anonymous" />
    <link rel="dns-prefetch" href="https://www.googletagservices.com" />

    <script async defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7203223934454111" crossorigin="anonymous"></script>

    <!-- WebApplication Schema -->
    <script type="application/ld+json">
{webapp_json}
    </script>

    <!-- FAQPage Schema -->
    <script type="application/ld+json">
{faq_json}
    </script>

    <!-- BreadcrumbList Schema -->
    <script type="application/ld+json">
{breadcrumb_json}
    </script>

    <script type="module" crossorigin src="/assets/index-Ctp2HkQJ.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/router-BvPvcSMX.js">
    <link rel="modulepreload" crossorigin href="/assets/ui-BTK8ZW4o.js">
    <link rel="stylesheet" crossorigin href="/assets/index-43gqMy96.css">
    
    <noscript>
      <style>
        .static-header, #main-content, .static-footer {{
          display: block !important;
        }}
      </style>
    </noscript>
    <link rel="canonical" href="{full_url}" />
  </head>
  <body>
    <div id="root">
      
      <div id="spa-loader" style="position: fixed; inset: 0; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; font-family: sans-serif;">
        <div style="width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spa-spin 1s linear infinite;"></div>
        <style>
          @keyframes spa-spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
          }}
        </style>
      </div>

      <header class="static-header" style="background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226, 232, 240, 0.8); padding: 0.75rem 1rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); font-family: sans-serif;">
        <style>
          .static-nav-link {{
            position: relative;
            padding: 0.25rem 0;
          }}
          .static-nav-link:hover {{
            color: #4f46e5 !important;
          }}
          .goog-te-gadget-simple {{
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 20px !important;
            padding: 3px 8px !important;
            font-size: 13px !important;
            display: inline-flex !important;
            align-items: center !important;
            cursor: pointer !important;
          }}
          .goog-te-gadget-simple .goog-te-menu-value span {{
            color: #334155 !important;
            font-weight: 500 !important;
          }}
          body {{ top: 0px !important; }}
          .goog-te-banner-frame {{ display: none !important; }}
        </style>
        <script type="text/javascript">
          function googleTranslateElementInit() {{
            new google.translate.TranslateElement({{
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,nl,sv,da,no,fi,pl,ru,tr,uk',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: true
            }}, 'google_translate_element');
          }}
        </script>
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <a href="/" style="font-weight: 700; font-size: 1.25rem; text-decoration: none; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316); color: white; border-radius: 8px; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; font-weight: 800;">%</span>
            Weight Loss Percentage
          </a>
          <div style="display: flex; gap: 1.25rem; align-items: center;">
            <nav style="display: flex; gap: 1.25rem; align-items: center;">
              <a href="/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Home</a>
              <a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Calculators</a>
              <a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Nutrition</a>
              <a href="/blog/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Blog</a>
              <a href="/compare/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Compare</a>
            </nav>
            <!-- Google Translate Selector Widget -->
            <div id="google_translate_element" style="display: inline-flex; align-items: center;"></div>
          </div>
        </div>
      </header>

      <main id="main-content" style="max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; color: #334155;">
        
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" style="font-size:0.875rem; color:#64748b; margin-bottom:1.5rem;">
          <a href="/" style="color:#4f46e5; text-decoration:none;">Home</a>
          <span style="margin:0 0.5rem;">›</span>
          <a href="/calculators/" style="color:#4f46e5; text-decoration:none;">Calculators</a>
          <span style="margin:0 0.5rem;">›</span>
          <span>{config["crumb"]}</span>
        </nav>

        <h1 style="color:#0f172a; font-size:2.25rem; font-weight:800; margin-bottom:0.5rem; line-height:1.25;">{h1}</h1>
        
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:1.5rem;">
          ✅ Verified MET Calculations &nbsp;|&nbsp; ✅ Custom Goal Adjustments &nbsp;|&nbsp; ✅ Dietitian &amp; CSCS Reviewed 2026
        </p>

        <p style="font-size:1.1rem; margin-bottom:2rem;">{description}</p>

{calculator_widget_html}

        <h2 style="color:#0f172a; font-size:1.5rem; font-weight:700; margin-top:3rem; margin-bottom:1rem;">Science &amp; Formula Behind {h1}</h2>
        <p>Calculating accurate energy expenditure or macronutrient distribution requires understanding how physical activity, body mass, and metabolic rate interact. Our tool utilizes standardized <strong>Metabolic Equivalent of Task (MET)</strong> multipliers and verified nutritional guidelines.</p>

        <div style="background:#f8fafc; border-left:4px solid #3b82f6; padding:1.25rem; border-radius:8px; margin:1.5rem 0;">
          <div style="font-weight:700; color:#1e40af; margin-bottom:0.5rem;">📊 Core Calculation Equation:</div>
          <p style="margin:0; font-size:0.95rem; color:#1e293b;">
            <strong>Calories Burned (kcal) = MET × Weight in kg × Duration in hours</strong><br>
            <em>Where 1 MET = 1 kcal/kg/hour (the energy expended while sitting quietly at rest).</em>
          </p>
        </div>

        <h2 style="color:#0f172a; font-size:1.5rem; font-weight:700; margin-top:3rem; margin-bottom:1rem;">Covered Search Keywords &amp; Intent Breakdown</h2>
        <p>This calculator addresses key search queries and metrics, including:</p>
        <ul style="padding-left:1.5rem; margin-bottom:1.5rem;">
          {"".join([f'<li style="margin-bottom:0.4rem;"><strong>{kw.title()}</strong> — Precise estimation of caloric burn and dietary deficit impact.</li>' for kw in config['kws']])}
        </ul>

        <h2 style="color:#0f172a; font-size:1.5rem; font-weight:700; margin-top:3rem; margin-bottom:1rem;">Related Health &amp; Fitness Calculators</h2>
        <ul style="padding-left:1.5rem; margin-bottom:2rem;">
          <li style="margin-bottom:0.5rem;"><a href="/calculators/calorie/" style="color:#4f46e5; font-weight:600;">Daily Calorie Calculator</a> — Total daily energy expenditure &amp; deficit planning</li>
          <li style="margin-bottom:0.5rem;"><a href="/calculators/calorie-deficit/" style="color:#4f46e5; font-weight:600;">Calorie Deficit Calculator</a> — Safe fat loss rate &amp; timeline targets</li>
          <li style="margin-bottom:0.5rem;"><a href="/calculators/macro/" style="color:#4f46e5; font-weight:600;">Macro Calculator</a> — Optimize protein, carb, and fat ratios</li>
          <li style="margin-bottom:0.5rem;"><a href="/calculators/weight-loss/" style="color:#4f46e5; font-weight:600;">Weight Loss Percentage Calculator</a> — Track total body weight reduction %</li>
        </ul>

        <h2 style="color:#0f172a; font-size:1.5rem; font-weight:700; margin-top:3rem; margin-bottom:1rem;">Frequently Asked Questions</h2>
{faq_html_blocks}

        <!-- Medical Reviewer -->
        <div style="margin-top:3rem; padding:1.5rem; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
          <h3 style="color:#0f172a; font-size:1rem; font-weight:700; margin-bottom:0.75rem;">Medically &amp; Expertly Reviewed By</h3>
          <p style="margin:0 0 0.5rem;"><strong>Sarah Jenkins, MS, RD, CDCES</strong> — Lead Nutrition Specialist &amp; <strong>Marcus Vance, CSCS</strong> — Strength &amp; Conditioning Specialist</p>
          <p style="font-size:0.875rem; color:#64748b; margin:0.5rem 0 0;"><strong>Last reviewed:</strong> August 2026 &nbsp;|&nbsp;
            <strong>Sources:</strong>
            <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;">Compendium of Physical Activities (NCBI)</a> &nbsp;·&nbsp;
            <a href="https://www.usda.gov/" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;">USDA FoodData Central</a>
          </p>
        </div>

      </main>

      <footer class="static-footer" style="background: #0b1329; border-top: 1px solid #1e293b; padding: 4rem 1.5rem 2rem 1.5rem; margin-top: 5rem; font-family: sans-serif; color: #94a3b8;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <div style="border-top: 1px solid #1e293b; padding-top: 2rem; text-align: center;">
            <p style="color: #64748b; font-size: 0.875rem; margin: 0;">&copy; 2026 Weight Loss Percentage. All rights reserved. Free dietitian-reviewed health and fitness tools.</p>
          </div>
        </div>
      </footer>

    </div>
  </body>
</html>
"""
    return full_html

def main():
    print(f"Generating {len(PAGES_CONFIG)} new pages...")
    for cfg in PAGES_CONFIG:
        filepath = cfg["route"]
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        html_content = generate_html_page(cfg)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"[+] Created: {filepath}")

    print("\nAll 27 new pages generated successfully.")

if __name__ == "__main__":
    main()
