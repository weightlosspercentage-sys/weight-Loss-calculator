const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:8080/calculators/pregnancy/index.html', { waitUntil: 'networkidle' });
  
  // Scroll to the bottom to show the new clinical-review and related calculators section
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight - 1000);
  });
  
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\37215a85-c8bb-4b4e-ad1d-ac9f5e9e7487\\pregnancy-calculator-bottom.png' });
  
  await browser.close();
})();
