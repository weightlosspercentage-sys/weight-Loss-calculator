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
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'bmi': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'tdee': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'bmr': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'calorie-deficit': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Daily Calorie Calculator', href: '/calculators/calorie/', description: 'Determine maintenance, surplus, and fat loss intake goals.', badge: 'Baseline', badgeColor: 'teal' }
  ],
  'calorie': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'body-fat': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'biggest-loser': [
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Fat Loss Calculator', href: '/calculators/fat-loss/', description: 'Project date when target fat loss is achieved.', badge: 'Goal', badgeColor: 'orange' },
    { title: 'BMI Calculator', href: '/calculators/bmi/', description: 'Check WHO BMI category alongside fat %.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'TDEE Calculator', href: '/calculators/tdee/', description: 'Find calories burned per day.', badge: 'Metabolism', badgeColor: 'indigo' },
    { title: 'BMR Calculator', href: '/calculators/bmr/', description: 'Calculate calories burned at complete rest.', badge: 'Basal', badgeColor: 'purple' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'walking': [
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'cycling': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'rowing': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'stairmaster': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/', description: 'Zero-impact cardio trainer calorie expenditure estimation.', badge: 'Cardio', badgeColor: 'green' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'elliptical': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'rucking': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'hiit-bodyweight': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'fitness': [
    { title: 'Walking Calorie Calculator', href: '/calculators/walking/', description: 'Calculate fat calories burned from daily step counts.', badge: 'Cardio', badgeColor: 'teal' },
    { title: 'Cycling Calorie Calculator', href: '/calculators/cycling/', description: 'Compare calorie burn between walking vs cycling.', badge: 'Cardio', badgeColor: 'indigo' },
    { title: 'Rowing Calorie Calculator', href: '/calculators/rowing/', description: 'Concept2 and water rower calorie burn by split pace & watts.', badge: 'Cardio', badgeColor: 'blue' },
    { title: 'StairMaster Calorie', href: '/calculators/stairmaster/', description: 'Calculate calories burned on stair climber.', badge: 'Glutes/Legs', badgeColor: 'orange' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'macro': [
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Intermittent Fasting Calculator', href: '/calculators/intermittent-fasting/', description: 'Structure fasting windows around metabolic rate.', badge: 'Diet', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'protein': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Intermittent Fasting Calculator', href: '/calculators/intermittent-fasting/', description: 'Structure fasting windows around metabolic rate.', badge: 'Diet', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'water-intake': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Intermittent Fasting Calculator', href: '/calculators/intermittent-fasting/', description: 'Structure fasting windows around metabolic rate.', badge: 'Diet', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'pcos-calorie': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'Intermittent Fasting Calculator', href: '/calculators/intermittent-fasting/', description: 'Structure fasting windows around metabolic rate.', badge: 'Diet', badgeColor: 'indigo' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'intermittent-fasting': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'carnivore-diet': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'keto': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'unit-converters': [
    { title: 'Macro Calculator', href: '/calculators/macro/', description: 'Optimize your daily Protein, Carbs, and Fats split.', badge: 'Nutrition', badgeColor: 'green' },
    { title: 'Protein Calculator', href: '/calculators/protein/', description: 'Calculate optimal daily protein grams.', badge: 'Nutrition', badgeColor: 'purple' },
    { title: 'Water Intake Calculator', href: '/calculators/water-intake/', description: 'Hydration needs matched to daily energy burn.', badge: 'Hydration', badgeColor: 'teal' },
    { title: 'PCOS Calorie & Deficit', href: '/calculators/pcos-calorie/', description: 'Calorie and low-glycemic carb adjustments for insulin resistance.', badge: 'Health', badgeColor: 'pink' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'glp1-weight-loss': [
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', description: 'Track normal newborn weight drop after birth.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'bariatric-surgery-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', description: 'Track normal newborn weight drop after birth.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'postpartum-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', description: 'Track normal newborn weight drop after birth.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'pregnancy': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', description: 'Track normal newborn weight drop after birth.', badge: 'Pediatric', badgeColor: 'teal' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'newborn-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'infant-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'baby-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'dog-weight-loss': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'peptide-dosage': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'body-recomposition': [
    { title: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/', description: 'Project weight loss on Semaglutide, Tirzepatide & Wegovy.', badge: 'Clinical', badgeColor: 'purple' },
    { title: 'Bariatric Surgery Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/', description: 'Gastric bypass and sleeve gastrectomy timeline.', badge: 'Clinical', badgeColor: 'blue' },
    { title: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/', description: 'Safe weight loss timeline after pregnancy.', badge: 'Maternal', badgeColor: 'pink' },
    { title: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/', description: 'Healthy weight gain targets by trimester.', badge: 'Maternal', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'boba-tea': [
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Beer Calorie Calculator', href: '/calculators/beer-calories/', description: 'ABV and carb impact on beer calories.', badge: 'Drink', badgeColor: 'amber' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'poke-bowl': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Beer Calorie Calculator', href: '/calculators/beer-calories/', description: 'ABV and carb impact on beer calories.', badge: 'Drink', badgeColor: 'amber' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'salad-calories': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Beer Calorie Calculator', href: '/calculators/beer-calories/', description: 'ABV and carb impact on beer calories.', badge: 'Drink', badgeColor: 'amber' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'sushi-calories': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Beer Calorie Calculator', href: '/calculators/beer-calories/', description: 'ABV and carb impact on beer calories.', badge: 'Drink', badgeColor: 'amber' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'beer-calories': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'indian-food': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
  ],
  'smoothie': [
    { title: 'Boba Tea Calorie Calculator', href: '/calculators/boba-tea/', description: 'Estimate calories in milk tea and tapioca pearls.', badge: 'Food', badgeColor: 'orange' },
    { title: 'Poke Bowl Calorie Calculator', href: '/calculators/poke-bowl/', description: 'Calculate nutrition for custom poke bowls.', badge: 'Food', badgeColor: 'teal' },
    { title: 'Salad Calorie Calculator', href: '/calculators/salad-calories/', description: 'Dressings, toppings, and greens calorie counter.', badge: 'Food', badgeColor: 'green' },
    { title: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/', description: 'Calories in rolls, nigiri, and sashimi.', badge: 'Food', badgeColor: 'rose' },
    { title: 'Weight Loss Percentage', href: '/calculators/weight-loss/', description: 'Calculate total % of starting weight lost.', badge: 'Milestone', badgeColor: 'amber' },
    { title: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/', description: 'Plan a healthy calorie reduction target.', badge: 'Diet', badgeColor: 'green' }
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
  const cleanSlug = slug.replace(/^\/calculators\//, '').replace(/\/$/, '').toLowerCase();
  return relatedCalculatorsMap[cleanSlug] || relatedCalculatorsMap['default'];
}