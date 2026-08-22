import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\d7412226-ee78-458d-bbe5-d1e4d37b613e';

async function captureFullPageLive() {
  console.log("=== CAPTURING LIVE BROWSER FULL PAGE PREVIEWS ===");
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();

  // 1. Homepage Preview
  await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const homePath = path.join(ARTIFACT_DIR, 'live_homepage_preview.png');
  await page.screenshot({ path: homePath, fullPage: false });
  console.log(`[+] Captured Homepage: ${homePath}`);

  // 2. Calculators Hub Preview
  await page.goto('http://localhost:8080/calculators/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const hubPath = path.join(ARTIFACT_DIR, 'live_calculators_hub_preview.png');
  await page.screenshot({ path: hubPath, fullPage: false });
  console.log(`[+] Captured Calculators Hub: ${hubPath}`);

  // 3. Rucking Calculator with Interactive Result
  await page.goto('http://localhost:8080/calculators/rucking/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#calc-weight', { timeout: 5000 });
  await page.fill('#calc-weight', '200');
  await page.fill('#calc-duration', '60');
  await page.selectOption('#calc-intensity', 'vigorous');
  await page.click('#calc-btn');
  await page.waitForTimeout(500);

  const ruckingPath = path.join(ARTIFACT_DIR, 'live_rucking_full_page.png');
  await page.screenshot({ path: ruckingPath, fullPage: false });
  console.log(`[+] Captured Rucking Calculator: ${ruckingPath}`);

  await browser.close();
}

captureFullPageLive().catch(console.error);
