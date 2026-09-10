import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();

const checks = [
  { url: '/', w: 768, label: 'homepage@768' },
  { url: '/restaurants/jimmy-johns/', w: 375, label: 'jimmy@375' },
];

for (const c of checks) {
  const ctx = await browser.newContext({ viewport: { width: c.w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + c.url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - window.innerWidth;
    // Find elements that extend beyond the viewport
    const all = document.querySelectorAll('*');
    const offenders = [];
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width > window.innerWidth + 5 && r.width > 100 && r.left >= 0) {
        offenders.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 40),
          id: el.id || '',
          width: Math.round(r.width),
          vpWidth: window.innerWidth,
          style: el.getAttribute('style')?.slice(0, 100) || '',
        });
        if (offenders.length > 10) break;
      }
    }
    return { overflow, offenderCount: offenders.length, offenders: offenders.slice(0, 5) };
  });
  console.log(`\n${c.label}: overflow ${info.overflow}px, ${info.offenderCount} offenders`);
  for (const o of info.offenders) {
    console.log(`  <${o.tag}${o.cls ? '.'+o.cls : ''}${o.id ? '#'+o.id : ''}> width=${o.width}px style="${o.style}"`);
  }
  await page.close();
  await ctx.close();
}
await browser.close();