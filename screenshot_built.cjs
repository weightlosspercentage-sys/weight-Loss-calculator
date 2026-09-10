const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log('Navigating to http://localhost:8080/restaurants/dutch-bros/');
  await page.goto('http://localhost:8080/restaurants/dutch-bros/', { waitUntil: 'networkidle' });
  
  // Scroll to the bottom to show the footer
  console.log('Scrolling to bottom...');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await page.waitForTimeout(1000); // Give rendering a moment
  
  const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\37215a85-c8bb-4b4e-ad1d-ac9f5e9e7487';
  const savePath = path.join(artifactDir, 'dutch-bros-footer.png');
  console.log(`Saving screenshot to ${savePath}`);
  
  await page.screenshot({ path: savePath });
  
  await browser.close();
  console.log('Done!');
})();
