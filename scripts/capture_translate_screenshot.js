import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function captureScreenshot() {
  console.log("Starting server on port 8086...");
  const server = spawn('python', ['-m', 'http.server', '8086'], { cwd: process.cwd() });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const url = 'http://localhost:8086/calculators/rucking/index.html';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait 3 seconds for Google Translate initialization
  await page.waitForTimeout(3000);

  // Target header or google_translate_element
  const header = await page.$('.static-header');
  const targetPath = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\d7412226-ee78-458d-bbe5-d1e4d37b613e\\google_translate_header.png';
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (header) {
    await header.screenshot({ path: targetPath });
    console.log(`[+] Header screenshot saved to: ${targetPath}`);
  } else {
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`[+] Page screenshot saved to: ${targetPath}`);
  }

  await browser.close();
  server.kill();
}

captureScreenshot().catch(console.error);
