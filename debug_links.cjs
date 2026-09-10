const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href'),
      className: a.className,
      outerHTML: a.outerHTML
    }));
  });

  console.log('Found links on homepage:', JSON.stringify(links.filter(l => l.href && l.href.includes('nutrition')), null, 2));

  await browser.close();
})();
