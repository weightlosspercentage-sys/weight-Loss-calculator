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
  { label: 'Newborn Weight Loss', href: '/calculators/newborn-weight-loss/', isSpecial: true },
  { label: 'GLP-1 Weight Loss', href: '/calculators/glp1-weight-loss/' },
  { label: 'Dog Weight Loss', href: '/calculators/dog-weight-loss/' },
  { label: 'Peptide Dosage', href: '/calculators/peptide-dosage/' },
  { label: 'Bariatric Weight Loss', href: '/calculators/bariatric-surgery-weight-loss/' },
  { label: 'Postpartum Weight Loss', href: '/calculators/postpartum-weight-loss/' },
  { label: 'BMI Calculator', href: '/calculators/bmi/' },
  { label: 'TDEE Calculator', href: '/calculators/tdee/' },
  { label: 'BMR Calculator', href: '/calculators/bmr/' },
  { label: 'Macro Calculator', href: '/calculators/macro/' },
  { label: 'Calorie Calculator', href: '/calculators/calorie/' },
  { label: 'Body Fat Calculator', href: '/calculators/body-fat/' },
  { label: 'Protein Calculator', href: '/calculators/protein/' },
  { label: 'Water Intake Calculator', href: '/calculators/water-intake/' },
  { label: 'Weight Loss Calculator', href: '/calculators/weight-loss/' },
  { label: 'Keto Calculator', href: '/calculators/keto/' }
];

export const restaurantsDropdown: NavItem[] = [
  { label: 'Subway Nutrition', href: '/restaurants/subway/' },
  { label: 'McDonald\'s Nutrition', href: '/restaurants/mcdonalds/' },
  { label: 'Starbucks Nutrition', href: '/restaurants/starbucks/' }
];

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Calculators', dropdown: calculatorsDropdown },
  { label: 'Restaurants', dropdown: restaurantsDropdown },
  { label: 'Nutrition', href: '/nutrition/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'All Tools', href: '/calculators/' }
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
