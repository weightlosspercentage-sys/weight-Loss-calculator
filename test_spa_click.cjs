const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4321/ ...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  console.log('Clicking Nutrition link...');
  await page.click('.md\\:flex a[href="/nutrition/"]');
  await page.waitForTimeout(2000); // Wait for React render

  console.log('URL after click:', page.url());

  const hasFastFood = await page.locator('text=Fast Food & Restaurant Nutrition Calculators').count();
  const hasTacoBell = await page.locator('text=Taco Bell Calorie Calculator').count();

  console.log('After SPA click:');
  console.log('- Fast Food heading count:', hasFastFood);
  console.log('- Taco Bell link count:', hasTacoBell);

  await page.screenshot({ path: 'spa_click_nutrition_screenshot.png', fullPage: true });

  await browser.close();
})();
