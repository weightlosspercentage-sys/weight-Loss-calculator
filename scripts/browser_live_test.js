import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\d7412226-ee78-458d-bbe5-d1e4d37b613e';

async function runLiveBrowserTest() {
  console.log("=== STARTING LIVE BROWSER INTERACTION TEST ===");
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  // Test 1: Rucking Calculator Interaction
  const url1 = 'http://localhost:8080/calculators/rucking/index.html';
  console.log(`Navigating to ${url1}...`);
  await page.goto(url1, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Fill inputs
  await page.fill('#calc-weight', '190');
  await page.fill('#calc-duration', '45');
  await page.selectOption('#calc-intensity', 'vigorous');

  // Click calculate button
  await page.click('#calc-btn');
  await page.waitForTimeout(500);

  const res1 = await page.$eval('#result-val', el => el.textContent).catch(() => 'N/A');
  const desc1 = await page.$eval('#result-desc', el => el.textContent).catch(() => 'N/A');
  console.log(`[+] Rucking Test Output: ${res1} | ${desc1}`);

  const imgPath1 = path.join(ARTIFACT_DIR, 'rucking_calculator_test.png');
  await page.screenshot({ path: imgPath1, fullPage: false });
  console.log(`[+] Saved screenshot 1: ${imgPath1}`);

  // Test 2: Taco Bell Nutrition Calculator Interaction
  const url2 = 'http://localhost:8080/restaurants/taco-bell/index.html';
  console.log(`Navigating to ${url2}...`);
  await page.goto(url2, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Fill inputs
  await page.fill('#calc-weight', '175');
  await page.fill('#calc-duration', '40');
  await page.selectOption('#calc-intensity', 'moderate');

  // Click calculate button
  await page.click('#calc-btn');
  await page.waitForTimeout(500);

  const res2 = await page.$eval('#result-val', el => el.textContent).catch(() => 'N/A');
  const desc2 = await page.$eval('#result-desc', el => el.textContent).catch(() => 'N/A');
  console.log(`[+] Taco Bell Test Output: ${res2} | ${desc2}`);

  const imgPath2 = path.join(ARTIFACT_DIR, 'taco_bell_calculator_test.png');
  await page.screenshot({ path: imgPath2, fullPage: false });
  console.log(`[+] Saved screenshot 2: ${imgPath2}`);

  await browser.close();
}

runLiveBrowserTest().catch(console.error);
