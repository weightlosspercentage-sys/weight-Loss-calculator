import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test direct HTML route
  await page.goto('http://localhost:8080/calculators/rucking/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  console.log("Direct HTML URL:", page.url());
  console.log("Direct HTML Title:", await page.title());
  
  const content = await page.content();
  console.log("Has google_translate_element in HTML:", content.includes('google_translate_element'));
  console.log("Has goog-te-combo in HTML:", content.includes('goog-te-combo'));
  
  // Check if Google Translate initialized
  const translateBox = await page.$('#google_translate_element');
  console.log("Translate Box Element exists:", !!translateBox);
  
  await browser.close();
}

test();
