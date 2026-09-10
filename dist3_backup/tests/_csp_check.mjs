import { chromium } from 'playwright';
const LIVE = 'https://www.weightlosspercentage.com';
const browser = await chromium.launch();
const page = await browser.newPage();
const errs = new Set();
page.on('console', m => { if (m.type()==='error' && /violates the following Content Security Policy/.test(m.text())) {
  // extract the violated host from the URL in the message
  const u = m.text().match(/https?:\/\/[a-z0-9.\-]+/i);
  if (u) errs.add(u[0]);
}});
await page.goto(LIVE+'/calculators/bmr/',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(8000);
console.log('Blocked hosts still violating CSP:');
console.log([...errs].join('\n'));
console.log('count='+errs.size);
await browser.close();
