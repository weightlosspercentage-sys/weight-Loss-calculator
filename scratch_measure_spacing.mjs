import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';

const urls = [
  '/restaurants/jimmy-johns/',
  '/calculators/bmi/',
  '/calculators/walking/',
  '/calculators/newborn-weight-loss/',
  '/',
  '/category/',
  '/glossary/',
  '/compare/',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const u of urls) {
  const page = await ctx.newPage();
  await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const layout = await page.evaluate(() => {
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const h = header ? header.getBoundingClientRect() : null;
    const m = main ? main.getBoundingClientRect() : null;
    // Google translate widget
    const gt = document.querySelector('#google_translate_element, .goog-te-gadget');
    return {
      url: location.pathname,
      headerBottom: h ? Math.round(h.bottom) : null,
      headerHeight: h ? Math.round(h.height) : null,
      mainTop: m ? Math.round(m.top) : null,
      gap: (h && m) ? Math.round(m.top - h.bottom) : null,
      hasTranslate: !!gt,
      bodyPaddingTop: document.body.style.paddingTop,
      docScrollH: document.body.scrollHeight,
    };
  });
  console.log(JSON.stringify(layout));
  await page.close();
}
await browser.close();
console.log('DONE');