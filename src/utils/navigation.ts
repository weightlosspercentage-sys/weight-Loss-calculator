export interface NavItem {
  label: string;
  href: string;
  isSpecial?: boolean;
}

export interface NavDropdown {
  label: string;
  items: NavItem[];
}

export const calculatorsDropdown: NavItem[] = [
  { label: 'All Calculators Hub', href: '/calculators/' },
  { label: 'Weight Loss Calculator', href: '/calculators/weight-loss/' },
  { label: 'Body Fat % Calculator', href: '/calculators/body-fat/' },
  { label: 'BMI Calculator', href: '/calculators/bmi/' },
  { label: 'TDEE Calculator', href: '/calculators/tdee/' },
  { label: 'BMR Calculator', href: '/calculators/bmr/' },
  { label: 'Macro Calculator', href: '/calculators/macro/' },
  { label: 'Calorie Deficit Calculator', href: '/calculators/calorie-deficit/' },
  { label: 'Calorie Calculator', href: '/calculators/calorie/' },
  { label: 'Fat Loss Calculator', href: '/calculators/fat-loss/' },
  { label: 'Protein Calculator', href: '/calculators/protein/' },
  { label: 'Water Intake Calculator', href: '/calculators/water-intake/' },
  { label: 'Walking Calorie Calculator', href: '/calculators/walking/' },
  { label: 'Cycling Calorie Calculator', href: '/calculators/cycling/' },
  { label: 'Rowing Calorie Calculator', href: '/calculators/rowing/' },
  { label: 'Elliptical Calorie Calculator', href: '/calculators/elliptical/' },
  { label: 'StairMaster Calorie Calculator', href: '/calculators/stairmaster/' },
  { label: 'Rucking Calorie Calculator', href: '/calculators/rucking/' },
  { label: 'HIIT & Bodyweight Calorie', href: '/calculators/hiit-bodyweight/' },
  { label: 'Fitness & Cardio Calculator', href: '/calculators/fitness/' },
  { label: 'Body Recomposition Calculator', href: '/calculators/body-recomposition/' },
  { label: 'PCOS Calorie Calculator', href: '/calculators/pcos-calorie/' },
  { label: 'Intermittent Fasting Calculator', href: '/calculators/intermittent-fasting/' },
  { label: 'Carnivore Diet Calculator', href: '/calculators/carnivore-diet/' },
  { label: 'Keto Calculator', href: '/calculators/keto/' },
  { label: 'Unit Converters (g to kcal)', href: '/calculators/unit-converters/' },
  { label: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/' },
  { label: 'Bariatric Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/' },
  { label: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/' },
  { label: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', isSpecial: true },
  { label: 'Infant Weight Loss', href: '/calculators/infant-weight-loss/' },
  { label: 'Baby Weight Loss', href: '/calculators/baby-weight-loss/' },
  { label: 'Pregnancy Weight Gain', href: '/calculators/pregnancy/' },
  { label: 'Dog Weight Loss', href: '/calculators/dog-weight-loss/' },
  { label: 'Peptide Dosage', href: '/calculators/peptide-dosage/' },
  { label: 'Biggest Loser Calculator', href: '/calculators/biggest-loser/' }
];

export const restaurantsDropdown: NavItem[] = [
  { label: 'All Fast Food Hub', href: '/restaurants/fast-food-hub/' },
  { label: 'Taco Bell Calculator', href: '/restaurants/taco-bell/' },
  { label: 'Dutch Bros Calculator', href: '/restaurants/dutch-bros/' },
  { label: 'Domino\'s Calculator', href: '/restaurants/dominos/' },
  { label: 'Five Guys Calculator', href: '/restaurants/five-guys/' },
  { label: 'Pizza Hut Calculator', href: '/restaurants/pizza-hut/' },
  { label: 'Jimmy John\'s Calculator', href: '/restaurants/jimmy-johns/' },
  { label: 'Wendy\'s Calculator', href: '/restaurants/wendys/' },
  { label: 'Chipotle Calculator', href: '/restaurants/chipotle/' },
  { label: 'Starbucks Calculator', href: '/restaurants/starbucks/' },
  { label: 'McDonald\'s Calculator', href: '/restaurants/mcdonalds/' },
  { label: 'Subway Calculator', href: '/restaurants/subway/' },
  { label: 'Boba Tea Calculator', href: '/calculators/boba-tea/' },
  { label: 'Poke Bowl Calculator', href: '/calculators/poke-bowl/' },
  { label: 'Salad Calorie Calculator', href: '/calculators/salad-calories/' },
  { label: 'Sushi Calorie Calculator', href: '/calculators/sushi-calories/' },
  { label: 'Beer Calorie Calculator', href: '/calculators/beer-calories/' },
  { label: 'Indian Food Calculator', href: '/calculators/indian-food/' },
  { label: 'Smoothie Calorie Calculator', href: '/calculators/smoothie/' }
];

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Calculators', href: '/calculators/' },
  { label: 'Nutrition', href: '/nutrition/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Glossary', href: '/glossary/' }
];

export function getRegionFromPath(path: string): string {
  const cleanPath = path.replace(/^\//, '');
  const parts = cleanPath.split('/');
  const prefix = parts[0];
  if (['uk', 'ca', 'au', 'nz', 'zh', 'ru', 'us'].includes(prefix)) {
    return prefix;
  }
  return '';
}

export function getLocalizedHref(href: string, region: string): string {
  // Empty region or 'us' = no prefix (default/US paths)
  if (!region || region === 'us' || !href.startsWith('/')) {
    return href;
  }
  return `/${region}${href}`;
}
