const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Navigating to homepage: http://localhost:4321/ ...');
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });

  console.log('2. Clicking desktop header "Nutrition" link...');
  const nutritionLink = page.locator('.md\\:flex a[href="/nutrition/"]').first();
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    nutritionLink.click()
  ]);

  console.log('Current URL after click:', page.url());

  // Check presence of fast food and food calculator headings & links
  const fastFoodHeading = await page.locator('h2:has-text("Fast Food & Restaurant Nutrition Calculators")').isVisible();
  const foodHeading = await page.locator('h2:has-text("Food & Specialty Meal Calculators")').isVisible();
  
  const tacoBellLink = await page.locator('a[href="/restaurants/taco-bell/"]').isVisible();
  const saladLink = await page.locator('a[href="/calculators/salad-calories/"]').isVisible();
  const fastFoodHubLink = await page.locator('a[href="/restaurants/fast-food-hub/"]').isVisible();

  console.log('Verification Results:');
  console.log('- Fast Food Heading Visible:', fastFoodHeading);
  console.log('- Food Heading Visible:', foodHeading);
  console.log('- Taco Bell Link Visible:', tacoBellLink);
  console.log('- Salad Link Visible:', saladLink);
  console.log('- Fast Food Hub Link Visible:', fastFoodHubLink);

  const screenshotPathNav = path.join(__dirname, 'nutrition_nav_flow_test.png');
  await page.screenshot({ path: screenshotPathNav, fullPage: true });
  console.log('Saved navigation screenshot:', screenshotPathNav);

  await browser.close();
})();
