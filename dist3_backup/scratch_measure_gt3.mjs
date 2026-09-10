import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const urls = ['/restaurants/jimmy-johns/', '/calculators/walking/', '/restaurants/mcdonalds/', '/calculators/bmi/'];

for (const u of urls) {
  const page = await ctx.newPage();
  await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const gt = document.querySelector('.goog-te-gadget-simple');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    // Check computed styles that affect widget height
    const wc = gt ? getComputedStyle(gt) : null;
    return {
      url: location.pathname,
      hasReact: document.documentElement.className,
      widgetComputed: wc ? { height: wc.height, padding: wc.padding, display: wc.display, alignItems: wc.alignItems, lineHeight: wc.lineHeight, flexDirection: wc.flexDirection } : null,
      widgetInnerSpans: gt ? Array.from(gt.querySelectorAll('span')).map(s => s.outerHTML.slice(0,80)) : null,
      headerOverflow: header ? getComputedStyle(header).overflow : null,
      navWrap: (() => { const d = header ? header.querySelector('div[style*="flex-wrap"]') : null; return d ? getComputedStyle(d).flexWrap : null; })(),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.close();
}
await browser.close();
console.log('DONE');