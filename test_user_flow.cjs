const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Loading homepage: http://localhost:4321/ ...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  console.log('2. Clicking visible Nutrition link in header...');
  const nutritionLink = page.locator('a[href="/nutrition/"]:visible').first();
  await nutritionLink.click();
  await page.waitForTimeout(2000); // Allow navigation

  console.log('3. Current URL after click:', page.url());

  const headingVisible = await page.locator('h2:has-text("Fast Food & Restaurant Nutrition Calculators")').isVisible();
  const tacoBellVisible = await page.locator('a[href="/restaurants/taco-bell/"]').isVisible();
  const saladVisible = await page.locator('a[href="/calculators/salad-calories/"]').isVisible();

  console.log('Results on Nutrition page after user click:');
  console.log('- Fast Food Heading Visible:', headingVisible);
  console.log('- Taco Bell Link Visible:', tacoBellVisible);
  console.log('- Salad Link Visible:', saladVisible);

  await page.screenshot({ path: 'after_user_click_nutrition.png', fullPage: true });
  console.log('Saved screenshot to after_user_click_nutrition.png');

  await browser.close();
})();
