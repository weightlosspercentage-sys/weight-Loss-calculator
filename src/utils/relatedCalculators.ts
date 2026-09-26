export interface RelatedCalculator {
  title: string;
  href: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

export const relatedCalculatorsMap: Record<string, RelatedCalculator[]> = {
  'weight-loss': [
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'fat-loss': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Body Fat % Calculator', href: '/calculators/body-fat/', description: 'Calculate lean mass vs. fat mass percentage.', badge: 'Body Comp', badgeColor: 'teal' }
  ],
  'bmi': [
    { title: 'Body Fat % Calculator', href: '/calculators/body-fat/', description: 'Assess body composition alongside standard BMI.', badge: 'Body Comp', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total daily energy expenditure.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all 35+ health and body metric tools.', badge: 'Directory', badgeColor: 'blue' }
  ],
  'tdee': [
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate baseline calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a daily calorie deficit target from TDEE.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Calculate calorie intake for loss, maintenance, or gain.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside energy burn.', badge: 'Clinical', badgeColor: 'blue' }
  ],
  'bmr': [
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Factor daily activity to find total calories burned.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan safe calorie reduction below expenditure.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Maintenance and fat loss daily intake targets.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Body Fat % Calculator', href: '/calculators/body-fat/', description: 'Assess body composition & lean mass.', badge: 'Body Comp', badgeColor: 'teal' }
  ],
  'calorie-deficit': [
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' }
  ],
  'calorie': [
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'orange' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' }
  ],
  'body-fat': [
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Compare body fat percentage against BMI category.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Body Recomposition', href: '/calculators/body-recomposition/', description: 'Target simultaneous fat loss and muscle gain.', badge: 'Fitness', badgeColor: 'orange' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'biggest-loser': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all 35+ health and body metric tools.', badge: 'Directory', badgeColor: 'blue' }
  ],
  'walking': [
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned including cardio exercise.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'cycling': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'rowing': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'stairmaster': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'elliptical': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'rucking': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'hiit-bodyweight': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'fitness': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'macro': [
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Keto Calculator', href: '/calculators/keto/', description: 'Target ketogenic macro ratios for fat adaptation.', badge: 'Diet', badgeColor: 'teal' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'blue' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'protein': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily protein intake.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'Body Recomposition', href: '/calculators/body-recomposition/', description: 'Target simultaneous fat loss and muscle gain.', badge: 'Fitness', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'water-intake': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all 35+ health and body metric tools.', badge: 'Directory', badgeColor: 'blue' }
  ],
  'pcos-calorie': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Low-glycemic carb adjustments for insulin resistance.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Safe deficit planning for hormonal balance.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find baseline energy expenditure.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams for satiety.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Hormonal and postpartum recovery timelines.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'intermittent-fasting': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Structure fasting feeding windows with balanced macros.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Keto Calculator', href: '/calculators/keto/', description: 'Combine fasting with low-carb metabolic adaptation.', badge: 'Diet', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Preserve muscle during fasting windows.', badge: 'Nutrition', badgeColor: 'purple' }
  ],
  'carnivore-diet': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'High-fat, zero-carb daily split calculation.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate protein intake from animal sources.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Keto Calculator', href: '/calculators/keto/', description: 'Compare carnivore vs standard ketogenic ratios.', badge: 'Diet', badgeColor: 'teal' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'keto': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize fat-to-carb ketogenic ratios.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan safe fat loss deficit on keto.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Moderate protein targets to sustain ketosis.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Intermittent Fasting Calculator', href: '/calculators/intermittent-fasting/', description: 'Combine fasting with keto fat burning.', badge: 'Diet', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'unit-converters': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all 35+ health and body metric tools.', badge: 'Directory', badgeColor: 'blue' }
  ],
  'glp1-weight-loss': [
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Clinical timeline comparison with surgical benchmarks.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Track percentage of baseline body weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Monitor BMI category improvements over treatment.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Prevent lean muscle wasting during rapid medication weight drop.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan adequate nutrient-dense daily calorie intake.', badge: 'Diet', badgeColor: 'green' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all 35+ clinical and health calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'bariatric-surgery-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Compare surgical timeline to Semaglutide/Tirzepatide.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Track excess weight loss (EWL) percentage.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Monitor clinical BMI transition toward healthy weight.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Essential post-op daily protein requirements.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Sip-volume hydration guidelines post-bariatric surgery.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all clinical and health calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'postpartum-weight-loss': [
    { title: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', description: 'Track infant feeding and normal birth weight recovery.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Gestational weight guidelines and baseline comparison.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Safe postpartum calorie targets factoring lactation.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of postpartum weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Optimal daily protein for tissue healing and nursing.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all clinical and health calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'pregnancy': [
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe recovery and gradual weight loss timeline after delivery.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', description: 'Understand normal birth weight drop in the first 14 days.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Pre-pregnancy BMI category to determine IOM weight gain targets.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Trimester-by-trimester calorie addition estimates.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Gestational protein needs for fetal growth.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all maternal and health calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'newborn-weight-loss': [
    { title: 'Infant Weight Loss Calculator', href: '/calculators/infant-weight-loss/', description: 'Track percent weight loss for older infants (1–12 months).', badge: 'Pediatric', badgeColor: 'rose' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe maternal weight recovery timeline after birth.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'ACOG trimester-by-trimester healthy weight targets.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Standard body weight percentage calculator.', badge: 'Core Tool', badgeColor: 'amber' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Metabolic guidance for insulin sensitivity.', badge: 'Health', badgeColor: 'purple' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore our full directory of 35+ free calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'infant-weight-loss': [
    { title: 'Newborn Weight Loss Calculator', href: '/calculators/newborn-weight-loss/', description: 'Track percentage weight loss from birth weight.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Baby Weight Loss Calculator', href: '/calculators/baby-weight-loss/', description: 'Percent weight change tracker for babies beyond the newborn stage.', badge: 'Pediatric', badgeColor: 'rose' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe maternal weight recovery timeline after birth.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'ACOG trimester-by-trimester healthy weight targets.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Standard body weight percentage calculator.', badge: 'Core Tool', badgeColor: 'amber' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore our full directory of 35+ free calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'baby-weight-loss': [
    { title: 'Newborn Weight Loss Calculator', href: '/calculators/newborn-weight-loss/', description: 'Track percentage weight loss from birth weight.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Baby Weight Loss Calculator', href: '/calculators/baby-weight-loss/', description: 'Percent weight change tracker for babies beyond the newborn stage.', badge: 'Pediatric', badgeColor: 'rose' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe maternal weight recovery timeline after birth.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'ACOG trimester-by-trimester healthy weight targets.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Standard body weight percentage calculator.', badge: 'Core Tool', badgeColor: 'amber' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore our full directory of 35+ free calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'dog-weight-loss': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate percentage of body weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate calories burned during dog walks.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Human calorie planning and daily deficits.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find human total daily energy expenditure.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category for humans.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all clinical and health calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'peptide-dosage': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Monitor clinical BMI transition over treatment.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'All Calculators Hub', href: '/calculators/', description: 'Explore all clinical and health calculators.', badge: 'Directory', badgeColor: 'indigo' }
  ],
  'body-recomposition': [
    { title: 'Body Fat % Calculator', href: '/calculators/body-fat/', description: 'Assess lean mass vs fat mass change.', badge: 'Body Comp', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize Protein, Carb, and Fat splits for recomp.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'High-protein targets to build muscle in a deficit.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Calculate maintenance calories accurately.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Track overall body weight change.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a slight deficit to preserve muscle mass.', badge: 'Diet', badgeColor: 'green' }
  ],
  'fast-food-hub': [
    { title: 'Subway Calculator', href: '/restaurants/subway/', description: 'Calculate calories and macros for custom Subway subs.', badge: 'Dining', badgeColor: 'green' },
    { title: 'McDonald\'s Calculator', href: '/restaurants/mcdonalds/', description: 'Nutrition calculator for McDonald\'s burgers and meals.', badge: 'Dining', badgeColor: 'amber' },
    { title: 'Chipotle Calculator', href: '/restaurants/chipotle/', description: 'Custom burrito bowl, tacos, and salad nutrition.', badge: 'Dining', badgeColor: 'orange' },
    { title: 'Taco Bell Calculator', href: '/restaurants/taco-bell/', description: 'Fresco style and customizable Mexican dining calculator.', badge: 'Dining', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Fit fast-food meals into your daily calorie budget.', badge: 'Diet', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Track protein and carb targets when eating out.', badge: 'Nutrition', badgeColor: 'blue' }
  ],
  'subway': [
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Browse nutrition calculators for all top restaurant chains.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'McDonald\'s Calculator', href: '/restaurants/mcdonalds/', description: 'Compare nutrition with McDonald\'s menu items.', badge: 'Dining', badgeColor: 'amber' },
    { title: 'Chipotle Calculator', href: '/restaurants/chipotle/', description: 'Compare sandwich macros to customizable burrito bowls.', badge: 'Dining', badgeColor: 'orange' },
    { title: 'Taco Bell Calculator', href: '/restaurants/taco-bell/', description: 'Healthy swaps and custom taco nutrition calculator.', badge: 'Dining', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Fit your Subway order into a daily calorie deficit.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Balance bread carbs with lean protein choices.', badge: 'Nutrition', badgeColor: 'teal' }
  ],
  'mcdonalds': [
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Browse nutrition calculators for all top restaurant chains.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Subway Calculator', href: '/restaurants/subway/', description: 'Compare burger calories with custom deli subs.', badge: 'Dining', badgeColor: 'green' },
    { title: 'Chipotle Calculator', href: '/restaurants/chipotle/', description: 'Explore high-protein bowls vs fast-food burgers.', badge: 'Dining', badgeColor: 'orange' },
    { title: 'Taco Bell Calculator', href: '/restaurants/taco-bell/', description: 'Lower-calorie alternatives and fresco style menu options.', badge: 'Dining', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Fit McDonald\'s favorites into your daily calorie target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Five Guys Calculator', href: '/restaurants/five-guys/', description: 'Compare burger, bun, and fry nutrition facts.', badge: 'Dining', badgeColor: 'rose' }
  ],
  'chipotle': [
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Browse nutrition calculators for all top restaurant chains.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Subway Calculator', href: '/restaurants/subway/', description: 'Compare burrito bowls with sub sandwiches.', badge: 'Dining', badgeColor: 'green' },
    { title: 'Taco Bell Calculator', href: '/restaurants/taco-bell/', description: 'Mexican dining nutrition and lower-calorie swaps.', badge: 'Dining', badgeColor: 'purple' },
    { title: 'McDonald\'s Calculator', href: '/restaurants/mcdonalds/', description: 'Compare macros with fast-food staples.', badge: 'Dining', badgeColor: 'amber' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize protein and fat balance in your burrito bowl.', badge: 'Nutrition', badgeColor: 'teal' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan your daily calories around dining out.', badge: 'Diet', badgeColor: 'green' }
  ],
  'taco-bell': [
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Browse nutrition calculators for all top restaurant chains.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Chipotle Calculator', href: '/restaurants/chipotle/', description: 'Compare fresco style tacos to burrito bowls.', badge: 'Dining', badgeColor: 'orange' },
    { title: 'Subway Calculator', href: '/restaurants/subway/', description: 'Compare fast-food Mexican options with subs.', badge: 'Dining', badgeColor: 'green' },
    { title: 'McDonald\'s Calculator', href: '/restaurants/mcdonalds/', description: 'Calorie comparison with traditional fast-food meals.', badge: 'Dining', badgeColor: 'amber' },
    { title: 'Keto Calculator', href: '/calculators/keto/', description: 'Build keto-friendly, low-carb options at Taco Bell.', badge: 'Diet', badgeColor: 'teal' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Fit Taco Bell orders into your daily calorie plan.', badge: 'Diet', badgeColor: 'green' }
  ],
  'five-guys': [
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Browse nutrition calculators for all top restaurant chains.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'McDonald\'s Calculator', href: '/restaurants/mcdonalds/', description: 'Compare burger and fry calories with McDonald\'s.', badge: 'Dining', badgeColor: 'amber' },
    { title: 'Subway Calculator', href: '/restaurants/subway/', description: 'Healthier sub alternatives to fast-food burgers.', badge: 'Dining', badgeColor: 'green' },
    { title: 'Chipotle Calculator', href: '/restaurants/chipotle/', description: 'High-protein bowls vs burger meals.', badge: 'Dining', badgeColor: 'orange' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Calculate daily deficit factoring in dining out.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Track fat, carb, and protein intake.', badge: 'Nutrition', badgeColor: 'teal' }
  ],
  'boba-tea': [
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Smoothie Calorie Calculator', href: '/calculators/smoothie/', description: 'Fruit, protein powder, and dairy smoothie calories.', badge: 'Drink', badgeColor: 'orange' },
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Explore restaurant and dining nutrition calculators.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Fit specialty drinks into your daily calorie plan.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'poke-bowl': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize protein and carb ratios for poke bowls.', badge: 'Nutrition', badgeColor: 'teal' },
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Explore dining and restaurant nutrition calculators.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy daily calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'salad-calories': [
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Track greens, lean proteins, and dressing fats.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Explore restaurant salad nutrition calculators.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Calculate daily calories to lose weight.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'sushi-calories': [
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Track fish protein and rice carb ratios.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Explore restaurant dining nutrition calculators.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'beer-calories': [
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine daily calorie maintenance and budget.', badge: 'Baseline', badgeColor: 'teal' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Factor alcohol calories and carbs into daily macros.', badge: 'Nutrition', badgeColor: 'orange' },
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Explore dining and restaurant nutrition calculators.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'indian-food': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Balance lentils, rice, roti, and curry fats.', badge: 'Nutrition', badgeColor: 'orange' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Ensure adequate vegetarian and paneer protein.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/', description: 'Explore restaurant and dining nutrition calculators.', badge: 'Directory', badgeColor: 'blue' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find total calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'smoothie': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in sweet teas and smoothies.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate protein powder scoops for smoothies.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Track fruit carbs and yogurt fats.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan healthy liquid calorie budgets.', badge: 'Diet', badgeColor: 'green' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' }
  ],
  'default': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ]
};

export function getRelatedCalculators(slug: string): RelatedCalculator[] {
  let s = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
  // Strip locale or regional prefix if present (e.g. es, ja, uk, us, etc.)
  s = s.replace(/^(en|es|ja|fr|de|pt|ko|it|zh|ru|uk|ca|au|nz|cn|sg|ae|us)\//, '');
  const cleanSlug = s.replace(/^(calculators|restaurants)\//, '');
  const list = relatedCalculatorsMap[cleanSlug] || relatedCalculatorsMap['default'];
  // Ensure no self-links exist
  const filtered = list.filter(item => {
    let itemS = item.href.replace(/^\/+|\/+$/g, '').toLowerCase();
    itemS = itemS.replace(/^(en|es|ja|fr|de|pt|ko|it|zh|ru|uk|ca|au|nz|cn|sg|ae|us)\//, '');
    const itemSlug = itemS.replace(/^(calculators|restaurants)\//, '');
    return itemSlug !== cleanSlug;
  });
  // Every tool page should surface the pillar hub so authority flows back to /calculators/
  if (!filtered.some(item => item.href === '/calculators/')) {
    filtered.push({ title: 'All 44+ Calculators', href: '/calculators/', description: 'Browse the full directory of free health, fitness and weight-loss tools.', badge: 'Directory', badgeColor: 'blue' });
  }
  return filtered;
}