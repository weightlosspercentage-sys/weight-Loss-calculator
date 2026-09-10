const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4321/nutrition/...');
  await page.goto('http://localhost:4321/nutrition/', { waitUntil: 'networkidle' });

  // Take screenshot of desktop nutrition hub
  const screenshotPathDesktop = path.join(__dirname, 'nutrition_desktop_test.png');
  await page.screenshot({ path: screenshotPathDesktop, fullPage: true });
  console.log('Saved desktop screenshot:', screenshotPathDesktop);

  // Check presence of calculator links
  const fastFoodHeading = await page.locator('h2:has-text("Fast Food & Restaurant Nutrition Calculators")').isVisible();
  const foodHeading = await page.locator('h2:has-text("Food & Specialty Meal Calculators")').isVisible();
  
  const tacoBellLink = await page.locator('a[href="/restaurants/taco-bell/"]').isVisible();
  const saladLink = await page.locator('a[href="/calculators/salad-calories/"]').isVisible();
  const fastFoodHubLink = await page.locator('a[href="/restaurants/fast-food-hub/"]').isVisible();

  console.log('Test Results:');
  console.log('- Fast Food Heading Visible:', fastFoodHeading);
  console.log('- Food Heading Visible:', foodHeading);
  console.log('- Taco Bell Link Visible:', tacoBellLink);
  console.log('- Salad Link Visible:', saladLink);
  console.log('- Fast Food Hub Link Visible:', fastFoodHubLink);

  // Test mobile view
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4321/nutrition/', { waitUntil: 'networkidle' });
  const screenshotPathMobile = path.join(__dirname, 'nutrition_mobile_test.png');
  await mobilePage.screenshot({ path: screenshotPathMobile, fullPage: true });
  console.log('Saved mobile screenshot:', screenshotPathMobile);

  await browser.close();
})();
