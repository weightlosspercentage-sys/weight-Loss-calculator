// Navigation audit against the REACT-RENDERED DOM of the root static site.
// React mounts into #root and replaces the static fallback, so all assertions
// must run after hydration and target <nav>, not the static <header>.
import { test, expect } from '@playwright/test';

const SETTLE = 2500;

// This site has TWO page architectures:
//   Type A: React-driven (loads /assets/index-*.js) - React replaces #root
//   Type B: pure static HTML (no bundle) - static header/nav renders as-is
// So wait for navigation links to exist, not for a React-specific selector.
async function ready(page, path = '/') {
  const resp = await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => document.querySelectorAll('nav a[href], header a[href]').length > 3,
    undefined,
    { timeout: 15000 }
  );
  await page.waitForTimeout(SETTLE);
  return resp;
}

test('homepage hydrates and primary nav renders', async ({ page }) => {
  const resp = await ready(page, '/');
  expect(resp.status()).toBeLessThan(400);

  const mainNav = page.locator('nav').first();
  await expect(mainNav).toBeVisible();

  const links = await mainNav.locator('a[href]').count();
  console.log(`primary nav renders ${links} links`);
  expect(links).toBeGreaterThan(20);
});

test('every primary nav destination resolves', async ({ page }, testInfo) => {
  await ready(page, '/');

  const hrefs = await page.locator('nav').first().locator('a[href]').evaluateAll((as) =>
    as.map((a) => a.getAttribute('href'))
  );
  const targets = [...new Set(hrefs)].filter((h) => h && h.startsWith('/') && !h.startsWith('//')).sort();

  console.log(`\nchecking ${targets.length} unique primary-nav destinations`);

  const results = [];
  for (const href of targets) {
    const r = await page.request.get(href).catch((e) => ({ status: () => 0, _e: e.message }));
    results.push({ href, status: r.status() });
  }

  const bad = results.filter((r) => r.status === 0 || r.status >= 400);
  console.log(`OK ${results.length - bad.length}/${results.length}`);
  for (const b of bad) console.log(`  BROKEN ${b.status} ${b.href}`);

  await testInfo.attach('primary-nav.json', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  expect(bad.map((b) => `${b.status} ${b.href}`)).toEqual([]);
});

test('footer nav destinations resolve', async ({ page }) => {
  await ready(page, '/');
  const hrefs = await page.locator('footer a[href]').evaluateAll((as) =>
    as.map((a) => a.getAttribute('href'))
  );
  const targets = [...new Set(hrefs)].filter((h) => h && h.startsWith('/') && !h.startsWith('//')).sort();
  console.log(`\nchecking ${targets.length} footer destinations`);

  const bad = [];
  for (const href of targets) {
    const r = await page.request.get(href);
    if (r.status() >= 400) bad.push(`${r.status()} ${href}`);
  }
  for (const b of bad) console.log(`  BROKEN ${b}`);
  expect(bad).toEqual([]);
});

test('dropdown triggers open their menus', async ({ page }) => {
  await ready(page, '/');
  for (const name of ['Calculators', 'Nutrition']) {
    const btn = page.getByRole('button', { name, exact: true }).first();
    await expect(btn, `"${name}" trigger exists`).toBeVisible();
    await btn.hover();
    await page.waitForTimeout(400);
    const opened = await page.evaluate(() => {
      // count anchors that are currently visible in the sticky nav
      const nav = document.querySelector('nav');
      return Array.from(nav.querySelectorAll('a[href]')).filter((a) => {
        const b = a.getBoundingClientRect();
        return b.width > 0 && b.height > 0;
      }).length;
    });
    console.log(`"${name}" hover -> ${opened} visible nav links`);
    expect(opened).toBeGreaterThan(5);
  }
});

test('nav bar persists when navigating between pages', async ({ page }) => {
  const routes = ['/', '/calculators/', '/blog/', '/compare/', '/glossary/', '/about/', '/contact/', '/nutrition/'];
  for (const r of routes) {
    const resp = await ready(page, r);
    expect(resp.status(), `${r} status`).toBeLessThan(400);
    const info = await page.evaluate(() => ({
      navLinks: document.querySelectorAll('nav a[href], header a[href]').length,
      react: !!document.querySelector('#root > div'),
      h1: document.querySelector('h1')?.innerText?.trim() || '(no h1)',
    }));
    console.log(
      `${r.padEnd(16)} HTTP ${resp.status()}  navLinks=${String(info.navLinks).padEnd(3)} react=${info.react ? 'Y' : 'n'}  h1="${info.h1.slice(0, 38)}"`
    );
    expect(info.navLinks, `${r} should render nav`).toBeGreaterThan(5);
  }
});

test('clicking a nav link actually navigates', async ({ page }) => {
  await ready(page, '/');
  const link = page.locator('nav').first().locator('a[href="/blog/"]').first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  console.log(`clicked Blog -> ${page.url()}`);
  expect(page.url()).toContain('/blog');
});
