import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function captureFullTop() {
  const server = spawn('python', ['-m', 'http.server', '8087'], { cwd: process.cwd() });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 750 } });

  await page.goto('http://localhost:8087/calculators/rucking/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const targetPath = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\d7412226-ee78-458d-bbe5-d1e4d37b613e\\google_translate_full.png';
  await page.screenshot({ path: targetPath, fullPage: false });

  console.log(`[+] Full top screenshot saved to: ${targetPath}`);

  await browser.close();
  server.kill();
}

captureFullTop().catch(console.error);
