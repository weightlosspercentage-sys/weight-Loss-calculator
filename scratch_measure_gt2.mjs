import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const urls = ['/restaurants/jimmy-johns/', '/calculators/walking/', '/restaurants/mcdonalds/', '/calculators/keto/', '/restaurants/starbucks/'];

for (const u of urls) {
  const page = await ctx.newPage();
  await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const gt = document.querySelector('#google_translate_element');
    const widget = document.querySelector('.goog-te-gadget-simple');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const hRect = header ? header.getBoundingClientRect() : null;
    const mRect = main ? main.getBoundingClientRect() : null;
    const wRect = widget ? widget.getBoundingClientRect() : null;
    // check overlap: does widget extend past header bottom?
    return {
      url: location.pathname,
      widgetHtml: widget ? widget.innerHTML.replace(/\s+/g, ' ').slice(0, 250) : null,
      widgetHeight: wRect ? Math.round(wRect.height) : null,
      headerBottom: hRect ? Math.round(hRect.bottom) : null,
      mainTop: mRect ? Math.round(mRect.top) : null,
      widgetExtendsPastHeader: (wRect && hRect) ? (wRect.bottom > hRect.bottom) : null,
      overlapWithMain: (wRect && mRect) ? (wRect.bottom > mRect.top && wRect.top < mRect.bottom) : null,
      mainPaddingTop: main ? getComputedStyle(main).paddingTop : null,
      mainMarginTop: main ? getComputedStyle(main).marginTop : null,
    };
  });
  console.log(JSON.stringify(info));
  await page.close();
}
await browser.close();
console.log('DONE');