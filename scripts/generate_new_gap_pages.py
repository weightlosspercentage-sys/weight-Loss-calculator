import os
import json
import re

# Complete list of 27 new gap pages configuration
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
        "faqs": [
            ("How many calories does rucking burn per hour?", "Rucking burns between 400 and 700 calories per hour depending on body weight, rucksack load (usually 10% to 30% of body weight), terrain incline, and walking speed (2.5 to 4.0 mph)."),
            ("Does adding 20 lbs to a rucksack burn significantly more calories?", "Yes! Carrying a 20 lb rucksack increases energy expenditure by approximately 20% to 35% compared to unweighted walking, as your leg and core muscles work harder to stabilize the added mass."),
            ("What is the formula for calculating rucking calories?", "Rucking uses the Pandolf load-carriage equation: Calories = MET × Weight (kg) × Duration (hours). Unweighted walking at 3 mph is 3.5 METs, while rucking with 30 lbs on steep terrain reaches 7.0–9.0 METs.")
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
        "faqs": [
            ("How many calories do 15 minutes on the StairMaster burn?", "A 150 lb individual burns approximately 140 to 180 calories in 15 minutes on a StairMaster at a moderate pace (Level 6–8)."),
            ("Why does stair climbing burn more calories than walking?", "Stair climbing forces your body to lift your full body weight vertically against gravity with every step, engaging glutes, quads, and hamstrings continuously."),
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
        "h1": "Wendy's Calorie & Nutrition Calculator",
        "description": "Calculate calories and macros for Wendy's Dave's Single, Baconator, spicy chicken nuggets, baked potatoes, and Frosty desserts.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Wendy's Calorie Calculator",
        "calc_type": "wendys",
        "faqs": [
            ("How many calories in a Wendy's Dave's Single?", "A Dave's Single burger contains 590 calories, 37g fat, and 32g protein."),
            ("What is the lowest calorie dessert at Wendy's?", "A Small Chocolate Frosty contains 350 calories and 49g sugar; a Jr. Frosty contains only 200 calories."),
            ("Are Wendy's baked potatoes healthy?", "A plain baked potato contains only 270 calories, 7g protein, and 7g fiber with zero fat.")
        ]
    },
    # 14. Chipotle
    {
        "route": "restaurants/chipotle/index.html",
        "title": "Chipotle Calorie Calculator — Burrito Bowls, Tacos & Salads",
        "h1": "Chipotle Calorie & Macro Calculator",
        "description": "Build your Chipotle burrito bowl, salad, or burrito and calculate exact calories, protein, carbs, fat, and sodium.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Chipotle Calorie Calculator",
        "calc_type": "chipotle",
        "faqs": [
            ("How many calories in a typical Chipotle burrito bowl?", "A standard bowl with white rice, black beans, chicken, fajita veggies, salsa, and cheese contains 650 to 750 calories and 45g protein."),
            ("How much does guacamole add at Chipotle?", "A standard 4 oz serving of Chipotle guacamole adds 230 calories and 22g of healthy monounsaturated fat."),
            ("How many calories in the Chipotle flour tortilla?", "The large burrito tortilla alone contains 320 calories and 50g of carbohydrates.")
        ]
    },
    # 15. Fast Food Hub
    {
        "route": "restaurants/fast-food-hub/index.html",
        "title": "Fast Food Calorie Hub — 11 Major Restaurant Nutrition Calculators",
        "h1": "Fast Food Restaurant Nutrition Hub",
        "description": "Explore interactive calorie calculators and macro analyzers for Taco Bell, Chipotle, McDonald's, Starbucks, Domino's, Dutch Bros, and more.",
        "category": "Restaurant & Fast Food Nutrition",
        "crumb": "Fast Food Hub",
        "calc_type": "fast_food_hub",
        "faqs": [
            ("Can you lose weight eating fast food?", "Yes! Fat loss depends on maintaining a total calorie deficit. Choosing grilled proteins, skipping mayo, and ordering water allows you to stay within your targets."),
            ("Which fast food chain has the highest protein options?", "Chipotle, Taco Bell (Power Bowls), and Subway provide the easiest customization for high-protein, low-calorie meals."),
            ("How can I cut calories at fast food restaurants?", "Order smaller portion sizes, skip sugar-sweetened sodas, choose thin or lettuce wrap options, and request dressings/sauces on the side.")
        ]
    },
    # 16. Boba Tea
    {
        "route": "calculators/boba-tea/index.html",
        "title": "Boba Tea Calorie Calculator — Bubble Tea, Milk & Toppings",
        "h1": "Boba & Bubble Tea Calorie Calculator",
        "description": "Calculate exact calories, sugar grams, and carbohydrates for your custom boba milk tea, fruit tea, sweetness percentage, and tapioca pearl toppings.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Boba Tea Calorie Calculator",
        "calc_type": "boba_tea",
        "faqs": [
            ("How many calories are in standard boba tapioca pearls?", "A 1/4 cup scoop of brown sugar tapioca pearls adds 150 to 200 calories and 35–45g of carbohydrates."),
            ("How much does 50% sweetness reduce boba calories?", "Cutting sweetness from 100% (regular) to 50% removes approximately 15–20g of added sugar, saving 60–80 calories per drink."),
            ("What is the lowest calorie boba tea order?", "Jasmine green tea with 0% sugar and grass jelly contains only 40 to 60 calories.")
        ]
    },
    # 17. Poke Bowl
    {
        "route": "calculators/poke-bowl/index.html",
        "title": "Poke Bowl Calorie Calculator — Tuna, Salmon, Rice & Sauces",
        "h1": "Poke Bowl Calorie & Macro Calculator",
        "description": "Build your custom Hawaiian poke bowl and calculate exact calories, protein, carbs, and healthy fats from raw fish, bases, and toppings.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Poke Bowl Calorie Calculator",
        "calc_type": "poke_bowl",
        "faqs": [
            ("How many calories are in a typical poke bowl?", "A standard medium poke bowl contains 500 to 750 calories, 35–45g of protein, and 15–25g of healthy fats."),
            ("How does swapping white rice for salad greens change calories?", "Switching from sushi rice (240 kcal) to salad greens (25 kcal) saves over 200 calories and 45g of refined carbs."),
            ("What is the healthiest sauce for a poke bowl?", "Citrus Ponzu (25 kcal) or light Shoyu (35 kcal) are much lower in calories than spicy sriracha mayo (140 kcal).")
        ]
    },
    # 18. Salad Calories
    {
        "route": "calculators/salad-calories/index.html",
        "title": "Salad Calorie Calculator — Greens, Dressings, Proteins & Toppings",
        "h1": "Salad Calorie & Dressing Calculator",
        "description": "Calculate the exact calories and macros of your salad including greens, grilled meats, cheeses, croutons, and high-fat dressings.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Salad Calorie Calculator",
        "calc_type": "salad_calories",
        "faqs": [
            ("Why do restaurant salads often have more calories than burgers?", "Heavy creamy dressings (200+ kcal per 2 tbsp), cheeses, candied nuts, bacon, and fried croutons can easily turn a healthy salad into a 1,000+ calorie meal."),
            ("How much dressing is in a standard restaurant packet?", "Most restaurant dressing ramekins contain 3 to 4 tablespoons (300–400 calories of oil/cream)."),
            ("What is the best low-calorie salad dressing?", "Balsamic vinegar with a dash of olive oil or fresh lemon juice provides rich flavor for under 50 calories.")
        ]
    },
    # 19. Sushi Calories
    {
        "route": "calculators/sushi-calories/index.html",
        "title": "Sushi Calorie Calculator — Rolls, Nigiri, Sashimi & Sauces",
        "h1": "Sushi Calorie & Macro Calculator",
        "description": "Calculate calories, carbs, protein, and fat for California rolls, spicy tuna, tempura rolls, sashimi, and nigiri sushi.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Sushi Calorie Calculator",
        "calc_type": "sushi_calories",
        "faqs": [
            ("How many calories are in a California Roll?", "An 8-piece California roll contains approximately 255 calories, 9g protein, 38g carbs, and 7g fat."),
            ("Why are tempura rolls so high in calories?", "Deep-fried tempura shrimp and spicy mayo double the caloric density, pushing rolls like Shrimp Tempura or Crunch Roll to 500–600 calories each."),
            ("What is the highest protein, lowest carb sushi choice?", "Fresh Sashimi (raw sliced fish without rice) provides 20–25g of pure protein for only 120–150 calories per 4-5 pieces.")
        ]
    },
    # 20. Beer Calories
    {
        "route": "calculators/beer-calories/index.html",
        "title": "Beer & Alcohol Calorie Calculator — Craft Beer, IPA, Wine & ABV %",
        "h1": "Beer & Alcohol Calorie Calculator",
        "description": "Calculate calories, carbohydrates, and pure alcohol grams in craft beer, IPAs, stouts, wine, and spirits based on alcohol percentage (ABV) and volume.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Beer Calorie Calculator",
        "calc_type": "beer_calories",
        "faqs": [
            ("How many calories are in an IPA vs light beer?", "A standard 12 oz American IPA (6.5% ABV) contains 200–220 calories, while a light lager (4.2% ABV) contains only 95–105 calories."),
            ("How does alcohol percentage (ABV) affect calories?", "Pure alcohol contains 7 calories per gram (almost as dense as fat at 9 kcal/g). Higher ABV directly raises total caloric content."),
            ("How long does it take to burn off 2 craft beers?", "Two 200-calorie IPAs (400 kcal total) require approximately 40 minutes of moderate jogging or 60 minutes of brisk walking to burn off.")
        ]
    },
    # 21. Indian Food
    {
        "route": "calculators/indian-food/index.html",
        "title": "Indian Food Calorie Calculator — Butter Chicken, Tikka Masala, Naan & Dal",
        "h1": "Indian Food Calorie & Nutrition Calculator",
        "description": "Calculate calories, protein, and fat for popular Indian dishes including Butter Chicken, Chicken Tikka Masala, Palak Paneer, Naan, Biryani, and Dal.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Indian Food Calorie Calculator",
        "calc_type": "indian_food",
        "faqs": [
            ("How many calories are in Chicken Tikka Masala?", "A 1-cup serving of Chicken Tikka Masala contains approximately 450 calories, 32g protein, and 28g fat due to heavy cream and ghee in the sauce."),
            ("How many calories in Garlic Butter Naan vs Roti?", "A restaurant Garlic Butter Naan contains 340–380 calories, whereas a whole wheat dry Roti (Chapati) contains only 110–130 calories."),
            ("What is the healthiest high-protein Indian dish?", "Tandoori Chicken (marinated in yogurt and baked in a clay oven) provides 42g of protein for only 240–260 calories with minimal fat.")
        ]
    },
    # 22. Smoothie
    {
        "route": "calculators/smoothie/index.html",
        "title": "Smoothie & Protein Shake Calorie Calculator — Fruits, Whey, Milk & Oats",
        "h1": "Smoothie & Protein Shake Calorie Calculator",
        "description": "Build your customized smoothie or protein shake and calculate exact calories, protein grams, carbs, fiber, and healthy fats.",
        "category": "Beverage & Food Nutrition",
        "crumb": "Smoothie Calorie Calculator",
        "calc_type": "smoothie",
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
        "faqs": [
            ("How many calories are in 1 gram of protein, carb, and fat?", "1 gram of Protein = 4 kcal | 1 gram of Carbohydrate = 4 kcal | 1 gram of Fat = 9 kcal | 1 gram of Alcohol = 7 kcal."),
            ("How many calories equal 1 pound of body fat?", "Scientifically, 1 pound of human adipose tissue contains approximately 3,500 kcal of energy."),
            ("How do you convert Kilojoules (kJ) to Calories (kcal)?", "1 Kilocalorie (kcal) = 4.184 Kilojoules (kJ). To convert kJ to kcal, divide the kJ value by 4.184.")
        ]
    }
]

def build_calculator_widget(config):
    calc_type = config.get("calc_type", "fitness")
    h1 = config.get("h1", "Calculator")

    if calc_type == "beer_calories":
        return f"""
        <!-- BEER & ALCOHOL CALORIE CALCULATOR -->
        <div style="background: linear-gradient(135deg, #ffffff, #fffbeb); border: 1px solid #fde68a; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h2 style="color: #92400e; font-size: 1.35rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #f59e0b; color: white; border-radius: 8px; width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem;">🍺</span>
            Interactive {h1}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label for="beer-style" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Beer / Drink Style</label>
              <select id="beer-style" onchange="runBeerCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="100,4.2">Light Lager (4.2% ABV) ~100 kcal</option>
                <option value="150,5.0" selected>Standard Craft Lager / Pilsner (5.0% ABV) ~150 kcal</option>
                <option value="200,6.5">American IPA (6.5% ABV) ~200 kcal</option>
                <option value="275,8.5">Double / Hazy IPA (8.5% ABV) ~275 kcal</option>
                <option value="340,10.5">Triple IPA / Imperial Stout (10.5% ABV) ~340 kcal</option>
                <option value="190,5.8">Stout / Porter (5.8% ABV) ~190 kcal</option>
                <option value="100,5.0">Hard Seltzer (5.0% ABV) ~100 kcal</option>
                <option value="125,12.5">Wine (12.5% ABV / 5oz standard) ~125 kcal</option>
                <option value="97,40.0">80 Proof Liquor / Shot (40% ABV / 1.5oz) ~97 kcal</option>
              </select>
            </div>
            <div>
              <label for="beer-size" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Serving Size / Vessel</label>
              <select id="beer-size" onchange="runBeerCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="1.0" selected>12 oz Standard Can / Bottle</option>
                <option value="1.333">16 oz Pint Glass (+33%)</option>
                <option value="1.833">22 oz Bomber / Large (+83%)</option>
                <option value="0.333">4 oz Tasting Flight Sample</option>
              </select>
            </div>
            <div>
              <label for="beer-qty" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Number of Drinks / Pours</label>
              <input type="number" id="beer-qty" value="2" min="1" max="20" oninput="runBeerCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
          </div>

          <button id="calc-btn" onclick="runBeerCalc()" style="width: 100%; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-size: 1rem; font-weight: 700; padding: 0.85rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);">
            Calculate Alcohol Calories &amp; Cardio Burn
          </button>

          <div id="calc-result" style="margin-top: 1.5rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 1.25rem; display: none;">
            <div style="font-size: 0.875rem; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total Alcohol Caloric Intake</div>
            <div id="result-val" style="font-size: 2.25rem; font-weight: 800; color: #b45309; margin: 0.25rem 0;">0 kcal</div>
            <p id="result-desc" style="margin: 0; font-size: 0.925rem; color: #78350f; line-height: 1.5;"></p>
          </div>
        </div>

        <script>
          function runBeerCalc() {{
            var styleParts = document.getElementById('beer-style').value.split(',');
            var baseCal = parseFloat(styleParts[0]) || 150;
            var abv = parseFloat(styleParts[1]) || 5.0;
            var sizeMult = parseFloat(document.getElementById('beer-size').value) || 1.0;
            var qty = parseInt(document.getElementById('beer-qty').value) || 1;

            var totalCal = Math.round(baseCal * sizeMult * qty);
            var jogMinutes = Math.round(totalCal / 11.5);
            var walkMinutes = Math.round(totalCal / 4.8);
            var alcoholGrams = ((12 * sizeMult * 29.57) * (abv / 100) * 0.789 * qty).toFixed(1);

            document.getElementById('calc-result').style.display = 'block';
            document.getElementById('result-val').innerText = totalCal + ' kcal (' + alcoholGrams + 'g pure alcohol)';
            document.getElementById('result-desc').innerHTML = '<strong>' + qty + ' serving(s)</strong> equals approximately <strong>' + totalCal + ' calories</strong>. To burn off this energy surplus, it takes about <strong>' + jogMinutes + ' minutes of moderate jogging</strong> or <strong>' + walkMinutes + ' minutes of brisk walking</strong>.';
          }}
          window.addEventListener('DOMContentLoaded', runBeerCalc);
        </script>
        """

    elif calc_type == "unit_converters":
        return f"""
        <!-- GRAMS TO CALORIES & UNIT CONVERTERS -->
        <div style="background: linear-gradient(135deg, #ffffff, #f0fdf4); border: 1px solid #bbf7d0; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h2 style="color: #166534; font-size: 1.35rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #10b981; color: white; border-radius: 8px; width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem;">🔄</span>
            Interactive {h1}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label for="conv-protein" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Protein (grams @ 4 kcal/g)</label>
              <input type="number" id="conv-protein" value="150" min="0" oninput="runUnitCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="conv-carbs" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Carbohydrates (grams @ 4 kcal/g)</label>
              <input type="number" id="conv-carbs" value="200" min="0" oninput="runUnitCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="conv-fat" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Fats (grams @ 9 kcal/g)</label>
              <input type="number" id="conv-fat" value="65" min="0" oninput="runUnitCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="conv-alcohol" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Alcohol (grams @ 7 kcal/g)</label>
              <input type="number" id="conv-alcohol" value="0" min="0" oninput="runUnitCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
          </div>

          <button id="calc-btn" onclick="runUnitCalc()" style="width: 100%; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 1rem; font-weight: 700; padding: 0.85rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
            Convert Grams to Calories &amp; Fat Equivalents
          </button>

          <div id="calc-result" style="margin-top: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.25rem; display: none;">
            <div style="font-size: 0.875rem; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total Calculated Energy</div>
            <div id="result-val" style="font-size: 2.25rem; font-weight: 800; color: #15803d; margin: 0.25rem 0;">0 kcal</div>
            <p id="result-desc" style="margin: 0; font-size: 0.925rem; color: #166534; line-height: 1.5;"></p>
          </div>
        </div>

        <script>
          function runUnitCalc() {{
            var p = parseFloat(document.getElementById('conv-protein').value) || 0;
            var c = parseFloat(document.getElementById('conv-carbs').value) || 0;
            var f = parseFloat(document.getElementById('conv-fat').value) || 0;
            var a = parseFloat(document.getElementById('conv-alcohol').value) || 0;

            var pKcal = p * 4;
            var cKcal = c * 4;
            var fKcal = f * 9;
            var aKcal = a * 7;
            var totalKcal = Math.round(pKcal + cKcal + fKcal + aKcal);
            var kj = Math.round(totalKcal * 4.184);
            var fatLossLbs = (totalKcal / 3500).toFixed(2);

            var pPct = totalKcal > 0 ? Math.round((pKcal / totalKcal) * 100) : 0;
            var cPct = totalKcal > 0 ? Math.round((cKcal / totalKcal) * 100) : 0;
            var fPct = totalKcal > 0 ? Math.round((fKcal / totalKcal) * 100) : 0;

            document.getElementById('calc-result').style.display = 'block';
            document.getElementById('result-val').innerText = totalKcal.toLocaleString() + ' kcal (' + kj.toLocaleString() + ' kJ)';
            document.getElementById('result-desc').innerHTML = '<strong>Macro Breakdown:</strong> ' + pPct + '% Protein (' + pKcal + ' kcal) | ' + cPct + '% Carbs (' + cKcal + ' kcal) | ' + fPct + '% Fat (' + fKcal + ' kcal). As a caloric deficit, this equals <strong>' + fatLossLbs + ' lbs</strong> of human body fat tissue energy equivalent.';
          }}
          window.addEventListener('DOMContentLoaded', runUnitCalc);
        </script>
        """

    elif calc_type in ["boba_tea", "poke_bowl", "salad_calories", "sushi_calories", "indian_food", "smoothie"]:
        return f"""
        <!-- CUSTOM NUTRITION / FOOD ITEM BUILDER -->
        <div style="background: linear-gradient(135deg, #ffffff, #fff7ed); border: 1px solid #fed7aa; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h2 style="color: #9a3412; font-size: 1.35rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #ea580c; color: white; border-radius: 8px; width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem;">🥗</span>
            Interactive {h1}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label for="food-item" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Primary Item / Base</label>
              <select id="food-item" onchange="runFoodCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="260,18,22,12">Standard Balanced Option (260 kcal / 18g P)</option>
                <option value="380,28,32,16" selected>Popular Signature Dish (380 kcal / 28g P)</option>
                <option value="520,34,48,22">Large / Deluxe Portion (520 kcal / 34g P)</option>
                <option value="180,8,30,4">Light / Low-Calorie Choice (180 kcal / 8g P)</option>
              </select>
            </div>
            <div>
              <label for="food-portion" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Portion / Servings</label>
              <select id="food-portion" onchange="runFoodCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="1.0" selected>1 Standard Serving (100%)</option>
                <option value="1.5">1.5x Large Serving (+50%)</option>
                <option value="2.0">2x Double Portion (+100%)</option>
                <option value="0.5">0.5x Half Portion (-50%)</option>
              </select>
            </div>
            <div>
              <label for="food-topping" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Add-ons / Sauces / Sides</label>
              <select id="food-topping" onchange="runFoodCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="0,0,0,0">None (0 kcal)</option>
                <option value="80,1,10,4">Light Sauce / Seasoning (+80 kcal)</option>
                <option value="140,2,8,12" selected>Signature Creamy Sauce / Dressing (+140 kcal)</option>
                <option value="220,12,18,10">Side Appetizer / Bread (+220 kcal)</option>
              </select>
            </div>
          </div>

          <button id="calc-btn" onclick="runFoodCalc()" style="width: 100%; background: linear-gradient(135deg, #ea580c, #c2410c); color: white; font-size: 1rem; font-weight: 700; padding: 0.85rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);">
            Calculate Meal Calories &amp; Macronutrients
          </button>

          <div id="calc-result" style="margin-top: 1.5rem; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 1.25rem; display: none;">
            <div style="font-size: 0.875rem; color: #9a3412; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total Estimated Meal Calories</div>
            <div id="result-val" style="font-size: 2.25rem; font-weight: 800; color: #c2410c; margin: 0.25rem 0;">0 kcal</div>
            <p id="result-desc" style="margin: 0; font-size: 0.925rem; color: #7c2d12; line-height: 1.5;"></p>
          </div>
        </div>

        <script>
          function runFoodCalc() {{
            var mainParts = document.getElementById('food-item').value.split(',');
            var portion = parseFloat(document.getElementById('food-portion').value) || 1.0;
            var topParts = document.getElementById('food-topping').value.split(',');

            var baseKcal = parseFloat(mainParts[0]) * portion;
            var baseP = parseFloat(mainParts[1]) * portion;
            var baseC = parseFloat(mainParts[2]) * portion;
            var baseF = parseFloat(mainParts[3]) * portion;

            var topKcal = parseFloat(topParts[0]);
            var topP = parseFloat(topParts[1]);
            var topC = parseFloat(topParts[2]);
            var topF = parseFloat(topParts[3]);

            var totalKcal = Math.round(baseKcal + topKcal);
            var totalP = Math.round(baseP + topP);
            var totalC = Math.round(baseC + topC);
            var totalF = Math.round(baseF + topF);

            document.getElementById('calc-result').style.display = 'block';
            document.getElementById('result-val').innerText = totalKcal + ' kcal';
            document.getElementById('result-desc').innerHTML = '<strong>Nutrition Summary:</strong> ' + totalP + 'g Protein | ' + totalC + 'g Carbs | ' + totalF + 'g Fat. Fits within a clinical daily deficit budget.';
          }}
          window.addEventListener('DOMContentLoaded', runFoodCalc);
        </script>
        """

    elif calc_type in ["dutch_bros", "taco_bell", "dominos", "five_guys", "pizza_hut", "jimmy_johns", "wendys", "chipotle", "fast_food_hub"]:
        return f"""
        <!-- FAST FOOD & RESTAURANT NUTRITION CALCULATOR -->
        <div style="background: linear-gradient(135deg, #ffffff, #fffbeb); border: 1px solid #fef3c7; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <h2 style="color: #92400e; font-size: 1.35rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #d97706; color: white; border-radius: 8px; width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem;">🍔</span>
            Interactive {h1}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label for="rest-item" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Menu Item / Size</label>
              <select id="rest-item" onchange="runRestCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="380,24,35,14">Standard Entree / Sandwich (380 kcal / 24g P)</option>
                <option value="540,32,52,22" selected>Deluxe Specialty / Combo (540 kcal / 32g P)</option>
                <option value="780,42,68,36">Double / Large Meal (780 kcal / 42g P)</option>
                <option value="260,18,24,8">Fresco / Low-Calorie Light Option (260 kcal / 18g P)</option>
              </select>
            </div>
            <div>
              <label for="rest-custom" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Customization / Modification</label>
              <select id="rest-custom" onchange="runRestCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="0,0,0,0">Standard Preparation (0 change)</option>
                <option value="-120,0,-24,-2">Light / No Mayo / Unwich (-120 kcal)</option>
                <option value="150,4,8,12">Extra Cheese &amp; Creamy Sauce (+150 kcal)</option>
                <option value="280,3,34,15">Add Side French Fries (+280 kcal)</option>
              </select>
            </div>
            <div>
              <label for="rest-qty" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Quantity</label>
              <input type="number" id="rest-qty" value="1" min="1" max="10" oninput="runRestCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
          </div>

          <button id="calc-btn" onclick="runRestCalc()" style="width: 100%; background: linear-gradient(135deg, #d97706, #b45309); color: white; font-size: 1rem; font-weight: 700; padding: 0.85rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">
            Calculate Fast Food Calories &amp; Protein
          </button>

          <div id="calc-result" style="margin-top: 1.5rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 1.25rem; display: none;">
            <div style="font-size: 0.875rem; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total Order Nutrition Profile</div>
            <div id="result-val" style="font-size: 2.25rem; font-weight: 800; color: #b45309; margin: 0.25rem 0;">0 kcal</div>
            <p id="result-desc" style="margin: 0; font-size: 0.925rem; color: #78350f; line-height: 1.5;"></p>
          </div>
        </div>

        <script>
          function runRestCalc() {{
            var mainParts = document.getElementById('rest-item').value.split(',');
            var custParts = document.getElementById('rest-custom').value.split(',');
            var qty = parseInt(document.getElementById('rest-qty').value) || 1;

            var kcal = (parseFloat(mainParts[0]) + parseFloat(custParts[0])) * qty;
            var p = (parseFloat(mainParts[1]) + parseFloat(custParts[1])) * qty;
            var c = (parseFloat(mainParts[2]) + parseFloat(custParts[2])) * qty;
            var f = (parseFloat(mainParts[3]) + parseFloat(custParts[3])) * qty;

            document.getElementById('calc-result').style.display = 'block';
            document.getElementById('result-val').innerText = Math.round(kcal) + ' kcal';
            document.getElementById('result-desc').innerHTML = '<strong>Order Breakdown:</strong> ' + Math.round(p) + 'g Protein | ' + Math.round(c) + 'g Total Carbs | ' + Math.round(f) + 'g Fat across ' + qty + ' item(s).';
          }}
          window.addEventListener('DOMContentLoaded', runRestCalc);
        </script>
        """

    else:
        # Default Fitness & Cardio Activity Calculator (Rucking, Cycling, Rowing, StairMaster, Elliptical, HIIT, PCOS, Body Recomp, etc.)
        return f"""
        <!-- INTERACTIVE FITNESS & CARDIO ACTIVITY CALCULATOR -->
        <div style="background: linear-gradient(135deg, #ffffff, #f8fafc); border: 1px solid #cbd5e1; border-radius: 16px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);">
          <h2 style="color: #0f172a; font-size: 1.35rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #4f46e5; color: white; border-radius: 8px; width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem;">🏃</span>
            Interactive {h1}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label for="calc-weight" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Body Weight (lbs or kg)</label>
              <input type="number" id="calc-weight" value="160" placeholder="e.g. 160" oninput="runFitnessCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="calc-duration" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Exercise Duration (minutes)</label>
              <input type="number" id="calc-duration" value="30" placeholder="e.g. 30" oninput="runFitnessCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
            </div>
            <div>
              <label for="calc-intensity" style="display: block; font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.35rem;">Effort &amp; Resistance Intensity</label>
              <select id="calc-intensity" onchange="runFitnessCalc()" style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background: #ffffff;">
                <option value="light">Light Effort (Warmup pace)</option>
                <option value="moderate" selected>Moderate Effort (Steady state aerobic)</option>
                <option value="vigorous">Vigorous / High Intensity (Intervals)</option>
              </select>
            </div>
          </div>

          <button id="calc-btn" onclick="runFitnessCalc()" style="width: 100%; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; font-size: 1rem; font-weight: 700; padding: 0.85rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
            Calculate Energy Expenditure &amp; Fat Burn
          </button>

          <div id="calc-result" style="margin-top: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.25rem; display: none;">
            <div style="font-size: 0.875rem; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Estimated Caloric Expenditure</div>
            <div id="result-val" style="font-size: 2.25rem; font-weight: 800; color: #15803d; margin: 0.25rem 0;">0 kcal</div>
            <p id="result-desc" style="margin: 0; font-size: 0.925rem; color: #166534; line-height: 1.5;"></p>
          </div>
        </div>

        <script>
          function runFitnessCalc() {{
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
            document.getElementById('result-desc').innerHTML = 'Based on a <strong>' + wt + ' lb</strong> body weight over <strong>' + dur + ' minutes</strong> of ' + intensity + ' exertion. This burns approximately <strong>' + (rounded / 3500 * 16).toFixed(2) + ' oz</strong> of adipose fat energy equivalent.';
          }}
          window.addEventListener('DOMContentLoaded', runFitnessCalc);
        </script>
        """

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
    calculator_widget_html = build_calculator_widget(config)

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
        }};
        history.replaceState = function() {{
          replaceState.apply(history, arguments);
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

    <link rel="stylesheet" crossorigin href="/assets/index-43gqMy96.css">
    <link rel="canonical" href="{full_url}" />
  </head>
  <body>
    <div>

      <!-- Navigation Header -->
      <header class="static-header" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); font-family: sans-serif;">
        <style>
          .static-nav-link {{ position: relative; padding: 0.25rem 0; }}
          .static-nav-link:hover {{ color: #4f46e5 !important; }}
          .goog-te-gadget-simple {{
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 20px !important;
            padding: 4px 10px !important;
            font-size: 13px !important;
            display: inline-flex !important;
            align-items: center !important;
            cursor: pointer !important;
            font-family: inherit !important;
          }}
          .goog-te-gadget-simple .goog-te-menu-value span {{ color: #334155 !important; font-weight: 500 !important; }}
          .goog-te-gadget-icon {{ display: inline-block !important; margin-right: 4px !important; }}
          body {{ top: 0px !important; }}
          .goog-te-banner-frame {{ display: none !important; }}

          /* Navigation Dropdowns */
          .nav-item-dropdown {{ position: relative; display: inline-block; }}
          .nav-dropdown-content {{
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            min-width: 260px;
            max-height: 480px;
            overflow-y: auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            padding: 0.5rem 0;
            z-index: 100;
          }}
          .nav-item-dropdown:hover .nav-dropdown-content {{ display: block; }}
          .nav-dropdown-content a {{
            display: block;
            padding: 0.45rem 1rem;
            color: #334155;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 400;
          }}
          .nav-dropdown-content a:hover {{
            background: #f1f5f9;
            color: #4f46e5;
          }}
        </style>

        <div style="max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <!-- Logo -->
          <a href="/" style="font-weight: 700; font-size: 1.25rem; text-decoration: none; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316); color: white; border-radius: 8px; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; font-weight: 800;">%</span>
            <span style="font-weight: 700; color: #0f172a; font-size: 1.125rem;">Weight Loss Percentage</span>
          </a>

          <!-- Desktop Navigation -->
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <nav style="display: flex; gap: 1.25rem; align-items: center;">
              <a href="/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Home</a>
              
              <!-- Calculators Dropdown -->
              <div class="nav-item-dropdown">
                <a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
                  Calculators <span style="font-size: 10px;">▼</span>
                </a>
                <div class="nav-dropdown-content">
                  <a href="/calculators/" style="font-weight: 700; color: #4f46e5; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 4px;">All Calculators Hub (35+)</a>
                  <a href="/calculators/weight-loss/">Weight Loss Calculator</a>
                  <a href="/calculators/body-fat/">Body Fat % Calculator</a>
                  <a href="/calculators/bmi/">BMI Calculator</a>
                  <a href="/calculators/tdee/">TDEE Calculator</a>
                  <a href="/calculators/bmr/">BMR Calculator</a>
                  <a href="/calculators/macro/">Macro Calculator</a>
                  <a href="/calculators/calorie-deficit/">Calorie Deficit Calculator</a>
                  <a href="/calculators/calorie/">Calorie Calculator</a>
                  <a href="/calculators/fat-loss/">Fat Loss Calculator</a>
                  <a href="/calculators/protein/">Protein Calculator</a>
                  <a href="/calculators/water-intake/">Water Intake Calculator</a>
                  <a href="/calculators/walking/">Walking Calorie Calculator</a>
                  <a href="/calculators/cycling/">Cycling Calorie Calculator</a>
                  <a href="/calculators/rowing/">Rowing Calorie Calculator</a>
                  <a href="/calculators/elliptical/">Elliptical Calorie Calculator</a>
                  <a href="/calculators/stairmaster/">StairMaster Calorie Calculator</a>
                  <a href="/calculators/rucking/">Rucking Calorie Calculator</a>
                  <a href="/calculators/hiit-bodyweight/">HIIT & Bodyweight Calorie</a>
                  <a href="/calculators/fitness/">Fitness & Cardio Calculator</a>
                  <a href="/calculators/body-recomposition/">Body Recomposition Calculator</a>
                  <a href="/calculators/pcos-calorie/">PCOS Calorie Calculator</a>
                  <a href="/calculators/intermittent-fasting/">Intermittent Fasting Calculator</a>
                  <a href="/calculators/carnivore-diet/">Carnivore Diet Calculator</a>
                  <a href="/calculators/keto/">Keto Calculator</a>
                  <a href="/calculators/unit-converters/">Unit Converters (g to kcal)</a>
                  <a href="/calculators/glp1-weight-loss/">GLP-1 Weight Loss</a>
                  <a href="/calculators/bariatric-surgery-weight-loss/">Bariatric Surgery Weight Loss</a>
                  <a href="/calculators/postpartum-weight-loss/">Postpartum Weight Loss</a>
                  <a href="/calculators/newborn-weight-loss/">Newborn Weight Loss</a>
                  <a href="/calculators/infant-weight-loss/">Infant Weight Loss</a>
                  <a href="/calculators/baby-weight-loss/">Baby Weight Loss</a>
                  <a href="/calculators/pregnancy/">Pregnancy Weight Gain</a>
                  <a href="/calculators/dog-weight-loss/">Dog Weight Loss</a>
                  <a href="/calculators/peptide-dosage/">Peptide Dosage</a>
                  <a href="/calculators/biggest-loser/">Biggest Loser Calculator</a>
                </div>
              </div>

              <!-- Nutrition Dropdown -->
              <div class="nav-item-dropdown">
                <a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
                  Nutrition <span style="font-size: 10px;">▼</span>
                </a>
                <div class="nav-dropdown-content">
                  <a href="/nutrition/" style="font-weight: 700; color: #4f46e5; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 4px;">Nutrition & Fast Food Hub</a>
                  <a href="/restaurants/fast-food-hub/">All Fast Food Restaurants</a>
                  <a href="/restaurants/taco-bell/">Taco Bell Calorie Calculator</a>
                  <a href="/restaurants/dutch-bros/">Dutch Bros Calorie Calculator</a>
                  <a href="/restaurants/dominos/">Domino's Calorie Calculator</a>
                  <a href="/restaurants/five-guys/">Five Guys Calorie Calculator</a>
                  <a href="/restaurants/pizza-hut/">Pizza Hut Calorie Calculator</a>
                  <a href="/restaurants/jimmy-johns/">Jimmy John's Calorie Calculator</a>
                  <a href="/restaurants/wendys/">Wendy's Calorie Calculator</a>
                  <a href="/restaurants/chipotle/">Chipotle Calorie Calculator</a>
                  <a href="/restaurants/starbucks/">Starbucks Calorie Calculator</a>
                  <a href="/restaurants/mcdonalds/">McDonald's Calorie Calculator</a>
                  <a href="/restaurants/subway/">Subway Calorie Calculator</a>
                  <a href="/calculators/boba-tea/">Boba Tea Calorie Calculator</a>
                  <a href="/calculators/poke-bowl/">Poke Bowl Calorie Calculator</a>
                  <a href="/calculators/salad-calories/">Salad Calorie Calculator</a>
                  <a href="/calculators/sushi-calories/">Sushi Calorie Calculator</a>
                  <a href="/calculators/beer-calories/">Beer Calorie Calculator</a>
                  <a href="/calculators/indian-food/">Indian Food Calorie Calculator</a>
                  <a href="/calculators/smoothie/">Smoothie Calorie Calculator</a>
                </div>
              </div>

              <a href="/compare/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Compare</a>
              <a href="/blog/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Blog</a>
              <a href="/glossary/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Glossary</a>
              <a href="/about/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">About</a>
            </nav>

            <!-- Google Translate Element Container in Nav Bar -->
            <div id="google_translate_element" style="display: inline-flex; align-items: center;"></div>
          </div>
        </div>

        <script type="text/javascript">
          function googleTranslateElementInit() {{
            if (document.getElementById('google_translate_element')) {{
              new google.translate.TranslateElement({{
                pageLanguage: 'en',
                includedLanguages: 'en,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,nl,sv,da,no,fi,pl,ru,tr,uk',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }}, 'google_translate_element');
            }}
          }}
        </script>
        <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>
      </header>

      <main id="main-content" style="max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; color: #334155;">
        
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" style="font-size:0.875rem; color:#64748b; margin-bottom:1.5rem;">
          <a href="/" style="color:#4f46e5; text-decoration:none;">Home</a>
          <span style="margin:0 0.5rem;">›</span>
          <a href="/calculators/" style="color:#4f46e5; text-decoration:none;">Calculators</a>
          <span style="margin:0 0.5rem;">›</span>
          <span style="color:#0f172a; font-weight:600;">{config["crumb"]}</span>
        </nav>

        <h1 style="color: #0f172a; font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.25;">{h1}</h1>
        
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 1.5rem;">{description}</p>

        {calculator_widget_html}

        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Frequently Asked Questions</h2>
        {faq_html_blocks}

      </main>

      <!-- Unified 4-Column Footer matching Home Page -->
      <footer class="static-footer" style="background: #0f172a; color: #94a3b8; padding: 3rem 1.5rem 2rem; margin-top: 4rem; font-family: sans-serif;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem;">
          <div>
            <div style="font-weight: 700; color: #ffffff; font-size: 1.125rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="background: #38bdf8; color: #0f172a; border-radius: 6px; width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem;">%</span>
              Weight Loss Percentage
            </div>
            <p style="font-size: 0.875rem; line-height: 1.5; color: #94a3b8;">
              Dietitian-reviewed clinical weight calculators, calorie deficit tools, and fast-food nutrition analyzers designed for body progress tracking.
            </p>
          </div>
          <div>
            <h4 style="color: #ffffff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">Top Calculators</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
              <li><a href="/calculators/weight-loss/" style="color: #94a3b8; text-decoration: none;">Weight Loss Percentage</a></li>
              <li><a href="/calculators/body-fat/" style="color: #94a3b8; text-decoration: none;">Body Fat Percentage</a></li>
              <li><a href="/calculators/bmi/" style="color: #94a3b8; text-decoration: none;">BMI Calculator</a></li>
              <li><a href="/calculators/tdee/" style="color: #94a3b8; text-decoration: none;">TDEE & Calorie Deficit</a></li>
              <li><a href="/calculators/rucking/" style="color: #94a3b8; text-decoration: none;">Rucking Calorie Calculator</a></li>
              <li><a href="/restaurants/fast-food-hub/" style="color: #94a3b8; text-decoration: none;">Fast Food Calorie Hub</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #ffffff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">Popular Restaurants</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
              <li><a href="/restaurants/taco-bell/" style="color: #94a3b8; text-decoration: none;">Taco Bell Calculator</a></li>
              <li><a href="/restaurants/dutch-bros/" style="color: #94a3b8; text-decoration: none;">Dutch Bros Calculator</a></li>
              <li><a href="/restaurants/chipotle/" style="color: #94a3b8; text-decoration: none;">Chipotle Calculator</a></li>
              <li><a href="/restaurants/dominos/" style="color: #94a3b8; text-decoration: none;">Domino's Calculator</a></li>
              <li><a href="/restaurants/starbucks/" style="color: #94a3b8; text-decoration: none;">Starbucks Calculator</a></li>
              <li><a href="/restaurants/mcdonalds/" style="color: #94a3b8; text-decoration: none;">McDonald's Calculator</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #ffffff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">Company & Legal</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
              <li><a href="/about/" style="color: #94a3b8; text-decoration: none;">About Us</a></li>
              <li><a href="/contact/" style="color: #94a3b8; text-decoration: none;">Contact Us</a></li>
              <li><a href="/privacy/" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a></li>
              <li><a href="/terms/" style="color: #94a3b8; text-decoration: none;">Terms of Service</a></li>
              <li><a href="/disclaimer/" style="color: #94a3b8; text-decoration: none;">Medical Disclaimer</a></li>
              <li><a href="/glossary/" style="color: #94a3b8; text-decoration: none;">Fitness Glossary</a></li>
            </ul>
          </div>
        </div>
        <div style="max-width: 1200px; margin: 2rem auto 0; padding-top: 1.5rem; border-top: 1px solid #334155; text-align: center; font-size: 0.8rem; color: #64748b;">
          © 2026 Weight Loss Percentage. All rights reserved. For educational use only.
        </div>
      </footer>

    </div>
  </body>
</html>"""
    return full_html

def main():
    print("Generating 27 new topic-specific gap pages with unified header, Google Translate, and footer...")
    for config in PAGES_CONFIG:
        filepath = config["route"]
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        html_content = generate_html_page(config)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"[+] Created/Updated: {filepath}")
    print("\nAll 27 pages generated successfully with specialized calculators!")

if __name__ == '__main__':
    main()
