const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set a nice viewport for screenshots
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Navigating to http://localhost:4322');
  await page.goto('http://localhost:4322');
  
  // Wait for React to hydrate
  await page.waitForTimeout(1000);

  const artifactsDir = 'C:/Users/asus/.gemini/antigravity/brain/57e69c2a-6bdd-41dd-9a70-87e2bd00f4e7';
  
  console.log('Taking first screenshot...');
  const beforePath = path.join(artifactsDir, 'calculator_before.png');
  await page.screenshot({ path: beforePath, fullPage: true });

  console.log('Filling out form...');
  const inputs = page.locator('input[type="number"], input[type="text"]');
  await inputs.nth(0).fill('200');
  await inputs.nth(1).fill('180');
  
  const btn = page.locator('button', { hasText: /Calculate/i });
  if (await btn.count() > 0) {
    await btn.first().click();
  }

  // Wait for the calculation result to appear
  await page.waitForTimeout(1000);

  console.log('Taking second screenshot...');
  const afterPath = path.join(artifactsDir, 'calculator_after.png');
  await page.screenshot({ path: afterPath, fullPage: true });

  await browser.close();
  console.log('Done!');
})();
