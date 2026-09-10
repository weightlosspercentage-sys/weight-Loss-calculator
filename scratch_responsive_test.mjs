import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const OUT = 'C:/Users/asus/AppData/Local/Temp/opencode';

const browser = await chromium.launch();
const sizes = [
  { w: 375, h: 667, label: 'mobile-375' },
  { w: 768, h: 1024, label: 'tablet-768' },
  { w: 1280, h: 800, label: 'desktop-1280' },
];

const pages = ['/', '/calculators/bmi/', '/restaurants/jimmy-johns/'];

for (const p of pages) {
  for (const s of sizes) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const name = p.replace(/\//g, '_').replace(/^_/, '') || 'home';
    const file = `${OUT}/${name}_${s.label}.png`;
    await page.screenshot({ path: file, fullPage: false });
    console.log(`Saved ${name} ${s.label} -> ${file}`);
    await page.close();
    await ctx.close();
  }
}
await browser.close();
console.log('DONE');