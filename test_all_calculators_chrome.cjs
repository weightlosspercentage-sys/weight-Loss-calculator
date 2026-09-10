const { chromium } = require('playwright');

const nutritionCalculators = [
  '/restaurants/fast-food-hub/',
  '/restaurants/taco-bell/',
  '/restaurants/chipotle/',
  '/restaurants/mcdonalds/',
  '/restaurants/subway/',
  '/restaurants/starbucks/',
  '/restaurants/dominos/',
  '/restaurants/five-guys/',
  '/restaurants/pizza-hut/',
  '/restaurants/jimmy-johns/',
  '/restaurants/wendys/',
  '/restaurants/dutch-bros/',
  '/calculators/salad-calories/',
  '/calculators/sushi-calories/',
  '/calculators/poke-bowl/',
  '/calculators/boba-tea/',
  '/calculators/indian-food/',
  '/calculators/smoothie/',
  '/calculators/beer-calories/'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log(`Starting individual testing of all ${nutritionCalculators.length} nutrition calculators...`);

  let allPassed = true;
  const results = [];

  for (let i = 0; i < nutritionCalculators.length; i++) {
    const route = nutritionCalculators[i];
    const url = `http://localhost:4321${route}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Check for any visible dropdown elements or hover dropdown content
      const dropdownCount = await page.locator('.nav-item-dropdown, .nav-dropdown-content').count();
      const visibleDropdownContent = await page.locator('.nav-dropdown-content:visible').count();

      const passed = dropdownCount === 0 || visibleDropdownContent === 0;
      if (!passed) allPassed = false;

      results.push({
        calculator: route,
        passed,
        dropdownCount,
        visibleDropdownContent
      });

      console.log(`[${i+1}/${nutritionCalculators.length}] Tested ${route} -> Dropdowns visible: ${visibleDropdownContent} (PASS: ${passed})`);
    } catch (e) {
      console.error(`Error testing ${route}:`, e.message);
      results.push({ calculator: route, passed: false, error: e.message });
      allPassed = false;
    }
  }

  console.log('\n--- ALL CALCULATORS TEST SUMMARY ---');
  console.table(results);
  console.log('OVERALL ALL CALCULATORS CLEAN:', allPassed);

  await browser.close();
})();
