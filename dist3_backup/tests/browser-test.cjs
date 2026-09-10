const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const tests = [
    'https://www.weightlosspercentage.com/calculators/bmi',
    'https://www.weightlosspercentage.com/calculators/tdee',
    'https://www.weightlosspercentage.com/nutrition',
    'https://www.weightlosspercentage.com/restaurants/mcdonalds',
  ];
  for (const url of tests) {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => null);
    const finalUrl = page.url();
    const title = await page.title();
    const bodyText = (await page.textContent('body')) || '';
    const is404 = /\b404\b|not found|page not found/i.test(bodyText) && !/calculator|nutrition|restaurant/i.test(title);
    const hasCalc = /calculator|nutrition|restaurant|bmi|tdee/i.test(bodyText + ' ' + title);
    console.log(`\nURL: ${url}`);
    console.log(`  final: ${finalUrl}`);
    console.log(`  status: ${resp ? resp.status() : 'n/a'}`);
    console.log(`  title:  ${title}`);
    console.log(`  404 page? ${is404}   has content? ${hasCalc}`);
    const file = 'tests/browser-' + url.split('/').filter(Boolean).pop() + '.png';
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  screenshot: ${file}`);
  }
  await browser.close();
})();
