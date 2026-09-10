import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 768, height: 800 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(1500);
const info = await page.evaluate(() => {
  // Find all elements that extend past viewport left or right
  const vp = window.innerWidth;
  const all = document.querySelectorAll('*');
  const candidates = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.left < -5 || r.right > vp + 5) {
      candidates.push({
        tag: el.tagName, cls: String(el.className).slice(0, 30), id: el.id || '',
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        style: (el.getAttribute('style') || '').slice(0, 60),
      });
    }
  }
  return { vp, count: candidates.length, items: candidates.slice(0, 10) };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();