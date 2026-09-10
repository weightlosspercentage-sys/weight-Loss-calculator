import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';

const urls = [
  '/restaurants/jimmy-johns/',
  '/calculators/bmi/',
  '/calculators/walking/',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const u of urls) {
  const page = await ctx.newPage();
  await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    // Find the google translate widget
    const gt = document.querySelector('#google_translate_element');
    const gtSimple = document.querySelector('.goog-te-gadget-simple');
    const header = document.querySelector('header');
    const navBar = header ? header.querySelector('div[style*="flex"]') : null;
    const res = {
      url: location.pathname,
      hasGTContainer: !!gt,
      hasGTSimple: !!gtSimple,
      gtRect: gt ? (() => { const r = gt.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), width: Math.round(r.width) }; })() : null,
      gtSimpleRect: gtSimple ? (() => { const r = gtSimple.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) }; })() : null,
      headerRect: header ? (() => { const r = header.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) }; })() : null,
      // what content follows the nav
    };
    return res;
  });
  console.log(JSON.stringify(info));
  await page.close();
}
await browser.close();
console.log('DONE');