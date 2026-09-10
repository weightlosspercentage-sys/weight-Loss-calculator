import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await p.waitForTimeout(2000);
// click the Calculators trigger to open the mega-menu
await p.evaluate(() => {
  const btn = [...document.querySelectorAll('nav button')].find(x => x.innerText.trim().replace(/\s+/g,' ') === 'Calculators');
  btn && btn.click();
});
await p.waitForTimeout(700);
await p.screenshot({ path: 'tests/local-nav-menu.png' });
await b.close();
console.log('saved tests/local-nav-menu.png');
