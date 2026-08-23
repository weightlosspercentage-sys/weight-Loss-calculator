import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to live site: https://www.weightlosspercentage.com/');
  await page.goto('https://www.weightlosspercentage.com/', { waitUntil: 'networkidle', timeout: 30000 });

  // Get all links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.textContent.trim());
  });

  const missingCalculators = ['Newborn Weight Loss', 'GLP-1 Weight Loss', 'Dog Weight Loss', 'Peptide Dosage'];
  const missingRestaurants = ['Taco Bell', 'Dutch Bros', 'Domino\'s', 'Five Guys'];

  console.log('\n--- Calculators Check ---');
  for (const calc of missingCalculators) {
    const found = links.some(l => l.includes(calc));
    console.log(`${found ? '✅ FOUND' : '❌ MISSING'} - ${calc}`);
  }

  console.log('\n--- Restaurants Check ---');
  for (const rest of missingRestaurants) {
    const found = links.some(l => l.includes(rest));
    console.log(`${found ? '✅ FOUND' : '❌ MISSING'} - ${rest}`);
  }

  // Count total items under "nav-dropdown-content" if it exists
  const dropdownContentCounts = await page.evaluate(() => {
    const dropdowns = document.querySelectorAll('.nav-dropdown-content');
    if (dropdowns.length >= 2) {
      return {
        calculators: dropdowns[0].querySelectorAll('a').length,
        restaurants: dropdowns[1].querySelectorAll('a').length
      };
    }
    return { calculators: 0, restaurants: 0 };
  });

  console.log('\n--- Dropdown Item Counts ---');
  console.log(`Calculators Dropdown Items: ${dropdownContentCounts.calculators || 'Not found via class'}`);
  console.log(`Restaurants Dropdown Items: ${dropdownContentCounts.restaurants || 'Not found via class'}`);

  await browser.close();
}

main().catch(console.error);

