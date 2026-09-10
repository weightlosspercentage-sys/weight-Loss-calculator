import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const urls = ['/restaurants/jimmy-johns/', '/calculators/walking/'];

for (const u of urls) {
  const page = await ctx.newPage();
  await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const widget = document.querySelector('.goog-te-gadget-simple');
    const chain = [];
    let el = widget;
    let depth = 0;
    while (el && depth < 6) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      chain.push({
        tag: el.tagName,
        cls: (el.className && String(el.className).slice(0, 40)) || '',
        id: el.id || '',
        height: Math.round(r.height),
        display: cs.display,
        alignItems: cs.alignItems,
        alignSelf: cs.alignSelf,
        justifyContents: cs.justifyContent,
        flex: cs.flex,
      });
      el = el.parentElement;
      depth++;
    }
    return { url: location.pathname, chain };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.close();
}
await browser.close();
console.log('DONE');