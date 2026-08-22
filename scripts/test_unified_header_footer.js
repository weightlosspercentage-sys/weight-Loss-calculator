import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\d7412226-ee78-458d-bbe5-d1e4d37b613e';

async function testUnifiedHeaderFooter() {
  console.log("=== TESTING UNIFIED HEADER, NAVIGATION DROPDOWNS, GOOGLE TRANSLATE & FOOTER ===");
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();

  // Test 1: Rucking Page Header, Dropdown & Translate
  await page.goto('http://localhost:8080/calculators/rucking/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Allow Google Translate script to finish init

  // Check translate element
  const translateCount = await page.locator('#google_translate_element .goog-te-gadget-simple').count();
  console.log(`[+] Google Translate Widget Count on Rucking Page: ${translateCount}`);

  // Hover over Calculators dropdown
  const calcDropdown = page.locator('.nav-item-dropdown').first();
  await calcDropdown.hover();
  await page.waitForTimeout(500);

  const screenshot1 = path.join(ARTIFACT_DIR, 'unified_header_dropdown_test.png');
  await page.screenshot({ path: screenshot1, fullPage: false });
  console.log(`[+] Captured Header Dropdown Test: ${screenshot1}`);

  // Test 2: Footer Verification
  const footer = page.locator('.static-footer');
  const footerCount = await footer.count();
  console.log(`[+] Footer Count: ${footerCount}`);

  const screenshot2 = path.join(ARTIFACT_DIR, 'unified_footer_test.png');
  await footer.screenshot({ path: screenshot2 });
  console.log(`[+] Captured Footer Test: ${screenshot2}`);

  await browser.close();
}

testUnifiedHeaderFooter().catch(console.error);
