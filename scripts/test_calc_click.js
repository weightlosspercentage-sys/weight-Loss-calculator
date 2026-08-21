import { chromium } from 'playwright';

async function debugCalc() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/calculators/rucking/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const initialVal = await page.$eval('#result-val', el => el.textContent).catch(() => 'NOT FOUND');
  console.log("Initial Result Val:", initialVal);

  const btn = await page.$('#calc-btn');
  console.log("Calc Btn exists:", !!btn);

  await btn.click();
  await page.waitForTimeout(200);

  const clickedVal = await page.$eval('#result-val', el => el.textContent).catch(() => 'NOT FOUND');
  console.log("Val after click:", clickedVal);

  await page.fill('#calc-weight', '200');
  await page.fill('#calc-duration', '60');
  await page.selectOption('#calc-intensity', 'vigorous');

  await btn.click();
  await page.waitForTimeout(200);

  const updatedVal = await page.$eval('#result-val', el => el.textContent).catch(() => 'NOT FOUND');
  const updatedDesc = await page.$eval('#result-desc', el => el.textContent).catch(() => 'NOT FOUND');
  console.log("Val after typing & click:", updatedVal);
  console.log("Desc after typing & click:", updatedDesc);

  await browser.close();
}

debugCalc().catch(console.error);
