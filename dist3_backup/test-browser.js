const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to local site...');
  await page.goto('http://localhost:4321', { timeout: 10000 }).catch(e => console.log('Localhost not running, testing live site or file...'));
  
  // If localhost fails, we could serve the dist folder or just test the HTML file directly
  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/dist/index.html');
  
  const title = await page.title();
  console.log('Page Title:', title);
  
  // Check if gradient is there (by evaluating some styles)
  const isGradient = await page.evaluate(() => {
    const header = document.querySelector('h1');
    return header ? window.getComputedStyle(header).background : null;
  });
  console.log('H1 Background Style:', isGradient);
  
  await browser.close();
  console.log('Test completed successfully.');
})();
