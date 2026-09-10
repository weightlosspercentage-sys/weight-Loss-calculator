import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const sizes = [375, 768, 1280];
const pages = ['/', '/calculators/bmi/', '/restaurants/jimmy-johns/'];

for (const p of pages) {
  for (const w of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        viewportW: window.innerWidth,
        scrollW: doc.scrollWidth,
        hasHorizontalScroll: doc.scrollWidth > window.innerWidth + 1,
        overflowAmt: doc.scrollWidth - window.innerWidth,
        mobileMenuBtn: !!Array.from(document.querySelectorAll('button')).find(b => /menu|hamburger|☰|open/i.test(b.innerText || b.getAttribute('aria-label') || '')),
        stickyNav: !!document.querySelector('nav.sticky, header.static-header, [class*="sticky"]'),
        fontSize: getComputedStyle(document.body).fontSize,
      };
    });
    console.log(`${p} @ ${w}px | viewport=${r.viewportW} scrollW=${r.scrollW} overflow=${r.hasHorizontalScroll} (+${r.overflowAmt}px) | mobileMenu=${r.mobileMenuBtn} stickyNav=${r.stickyNav}`);
    await page.close();
    await ctx.close();
  }
}
await browser.close();
console.log('DONE');