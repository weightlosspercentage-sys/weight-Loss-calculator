import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const SCREENSHOT_DIR = 'D:/projects/Weight Loss Percentage/Live/Weight Loss Percentage- Upload 1/dist3';

// ── Expected links from the React-rendered SPA nav ──
const SPA_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Calculators', href: '/calculators/' },
  { label: 'Nutrition & Restaurants', href: '/restaurants/fast-food-hub/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Glossary', href: '/glossary/' },
];

const CALC_DROPDOWN_LINKS = [
  '/calculators/', '/calculators/weight-loss/', '/calculators/body-fat/',
  '/calculators/bmi/', '/calculators/tdee/', '/calculators/bmr/',
  '/calculators/macro/', '/calculators/calorie/', '/calculators/protein/',
  '/calculators/water-intake/', '/calculators/walking/', '/calculators/cycling/',
  '/calculators/rowing/', '/calculators/elliptical/', '/calculators/stairmaster/',
  '/calculators/rucking/', '/calculators/hiit-bodyweight/', '/calculators/fitness/',
  '/calculators/body-recomposition/', '/calculators/pcos-calorie/',
  '/calculators/intermittent-fasting/', '/calculators/carnivore-diet/',
  '/calculators/keto/', '/calculators/unit-converters/',
  '/calculators/glp1-weight-loss/', '/calculators/bariatric-surgery-weight-loss/',
  '/calculators/postpartum-weight-loss/', '/calculators/newborn-weight-loss/',
  '/calculators/peptide-dosage/', '/calculators/biggest-loser/',
  '/calculators/baby-weight-loss/', '/calculators/infant-weight-loss/',
  '/calculators/dog-weight-loss/', '/calculators/pregnancy/',
];

const RESTAURANT_DROPDOWN_LINKS = [
  '/restaurants/fast-food-hub/', '/restaurants/taco-bell/', '/restaurants/dutch-bros/',
  '/restaurants/dominos/', '/restaurants/five-guys/', '/restaurants/pizza-hut/',
  '/restaurants/jimmy-johns/', '/restaurants/wendys/', '/restaurants/chipotle/',
  '/restaurants/starbucks/', '/restaurants/mcdonalds/', '/restaurants/subway/',
  '/calculators/boba-tea/', '/calculators/poke-bowl/', '/calculators/salad-calories/',
  '/calculators/sushi-calories/', '/calculators/beer-calories/',
  '/calculators/indian-food/', '/calculators/smoothie/',
];

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }
async function shot(page, name) {
  const file = `${SCREENSHOT_DIR}/nav-audit-${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
}

let totalPass = 0, totalFail = 0;
const failures = [];

const browser = await chromium.launch({ headless: false, slowMo: 50 });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ════════════════════════════════════════════════════════════════
// PHASE 1: Desktop — Homepage nav link presence
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 1: Desktop — Top Nav Link Presence');
console.log('═'.repeat(70));

await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await shot(page, '01-homepage');

// On SPA pages, React renders the nav. Check ALL links on the page.
const allHrefs = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'))
);

for (const item of SPA_NAV_LINKS) {
  const found = allHrefs.some(h => h === item.href || h === item.href.replace(/\/$/, ''));
  if (found) { pass(`Top nav "${item.label}" → ${item.href}`); totalPass++; }
  else { fail(`Top nav "${item.label}" → ${item.href} NOT FOUND`); totalFail++; failures.push(item); }
}

// ════════════════════════════════════════════════════════════════
// PHASE 2: Desktop — Hover Calculators dropdown
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 2: Desktop — Calculators Dropdown');
console.log('═'.repeat(70));

// Try to hover over the Calculators nav link (works for both static and React headers)
const calcLink = page.locator('a[href="/calculators/"]').first();
if (await calcLink.count() > 0) {
  const box = await calcLink.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(500);
    await shot(page, '02-calc-dropdown');

    // Collect all visible links that appeared
    const visibleLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const rect = a.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          links.push(a.getAttribute('href'));
        }
      });
      return [...new Set(links)];
    });

    let calcFound = 0, calcMissing = 0;
    for (const href of CALC_DROPDOWN_LINKS) {
      if (visibleLinks.includes(href) || visibleLinks.includes(href.replace(/\/$/, ''))) {
        calcFound++;
      } else {
        calcMissing++;
        fail(`  Calc dropdown missing: ${href}`);
        totalFail++;
      }
    }
    if (calcMissing === 0) { pass(`All ${calcFound} calculator dropdown links visible`); totalPass++; }
    else { info(`${calcFound}/${CALC_DROPDOWN_LINKS.length} calculator links found`); }
  }
} else {
  fail('No <a href="/calculators/"> element found');
  totalFail++;
}

// ════════════════════════════════════════════════════════════════
// PHASE 3: Desktop — Hover Restaurants dropdown
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 3: Desktop — Restaurants Dropdown');
console.log('═'.repeat(70));

const restLink = page.locator('a[href="/restaurants/fast-food-hub/"], a[href="/nutrition/"]').first();
if (await restLink.count() > 0) {
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
  const box = await restLink.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(500);
    await shot(page, '03-rest-dropdown');

    const visibleLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const rect = a.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          links.push(a.getAttribute('href'));
        }
      });
      return [...new Set(links)];
    });

    let restFound = 0, restMissing = 0;
    for (const href of RESTAURANT_DROPDOWN_LINKS) {
      if (visibleLinks.includes(href) || visibleLinks.includes(href.replace(/\/$/, ''))) {
        restFound++;
      } else {
        restMissing++;
        fail(`  Rest dropdown missing: ${href}`);
        totalFail++;
      }
    }
    if (restMissing === 0) { pass(`All ${restFound} restaurant dropdown links visible`); totalPass++; }
    else { info(`${restFound}/${RESTAURANT_DROPDOWN_LINKS.length} restaurant links found`); }
  }
} else {
  fail('No restaurant nav link element found');
  totalFail++;
}

// ════════════════════════════════════════════════════════════════
// PHASE 4: Desktop — Click every calculator & verify
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 4: Desktop — Click Each Calculator & Verify Page Loads');
console.log('═'.repeat(70));

const ALL_CALC_HREFS = [
  '/calculators/weight-loss/', '/calculators/body-fat/', '/calculators/bmi/',
  '/calculators/tdee/', '/calculators/bmr/', '/calculators/macro/',
  '/calculators/calorie/', '/calculators/protein/', '/calculators/water-intake/',
  '/calculators/walking/', '/calculators/cycling/', '/calculators/rowing/',
  '/calculators/elliptical/', '/calculators/stairmaster/', '/calculators/rucking/',
  '/calculators/hiit-bodyweight/', '/calculators/fitness/', '/calculators/body-recomposition/',
  '/calculators/pcos-calorie/', '/calculators/intermittent-fasting/', '/calculators/carnivore-diet/',
  '/calculators/keto/', '/calculators/unit-converters/',
  '/calculators/glp1-weight-loss/', '/calculators/bariatric-surgery-weight-loss/',
  '/calculators/postpartum-weight-loss/', '/calculators/newborn-weight-loss/',
  '/calculators/peptide-dosage/', '/calculators/biggest-loser/',
  '/calculators/baby-weight-loss/', '/calculators/infant-weight-loss/',
  '/calculators/dog-weight-loss/', '/calculators/pregnancy/',
  '/calculators/boba-tea/', '/calculators/poke-bowl/',
  '/calculators/salad-calories/', '/calculators/sushi-calories/',
  '/calculators/beer-calories/', '/calculators/indian-food/', '/calculators/smoothie/',
];

let calcPagePass = 0, calcPageFail = 0;
for (const href of ALL_CALC_HREFS) {
  const url = BASE + href;
  let status = 0, h1 = '', inputs = 0, is404 = false;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    status = resp ? resp.status() : 0;
    const info = await page.evaluate(() => {
      const h1El = document.querySelector('h1');
      const inputCount = document.querySelectorAll('input, select').length;
      const bodyText = document.body.innerText.toLowerCase();
      const notFound = /404|not found|page not found/i.test(bodyText) && inputCount < 2;
      return { h1: h1El ? h1El.innerText.trim().slice(0, 60) : '', inputs: inputCount, is404: notFound };
    });
    h1 = info.h1; inputs = info.inputs; is404 = info.is404;
  } catch (e) { status = 'ERR'; }

  if (status === 200 && !is404 && inputs > 0) {
    pass(`${href} → OK (inputs=${inputs})`); totalPass++; calcPagePass++;
  } else if (status === 200 && !is404) {
    pass(`${href} → OK (info page, inputs=${inputs})`); totalPass++; calcPagePass++;
  } else {
    fail(`${href} → status=${status} inputs=${inputs} is404=${is404} h1="${h1}"`);
    totalFail++; calcPageFail++; failures.push({ href, status, inputs, is404, h1 });
  }
}

// ════════════════════════════════════════════════════════════════
// PHASE 5: Desktop — Click restaurant links
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 5: Desktop — Click Each Restaurant Link & Verify');
console.log('═'.repeat(70));

const ALL_REST_HREFS = [
  '/restaurants/fast-food-hub/', '/restaurants/taco-bell/', '/restaurants/dutch-bros/',
  '/restaurants/dominos/', '/restaurants/five-guys/', '/restaurants/pizza-hut/',
  '/restaurants/jimmy-johns/', '/restaurants/wendys/', '/restaurants/chipotle/',
  '/restaurants/starbucks/', '/restaurants/mcdonalds/', '/restaurants/subway/',
];

let restPagePass = 0, restPageFail = 0;
for (const href of ALL_REST_HREFS) {
  const url = BASE + href;
  let status = 0, h1 = '', inputs = 0, is404 = false;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    status = resp ? resp.status() : 0;
    const info = await page.evaluate(() => {
      const h1El = document.querySelector('h1');
      const inputCount = document.querySelectorAll('input, select').length;
      const bodyText = document.body.innerText.toLowerCase();
      const notFound = /404|not found|page not found/i.test(bodyText) && inputCount < 2;
      return { h1: h1El ? h1El.innerText.trim().slice(0, 60) : '', inputs: inputCount, is404: notFound };
    });
    h1 = info.h1; inputs = info.inputs; is404 = info.is404;
  } catch (e) { status = 'ERR'; }

  if (status === 200 && !is404) {
    pass(`${href} → OK (inputs=${inputs})`); totalPass++; restPagePass++;
  } else {
    fail(`${href} → status=${status} inputs=${inputs} is404=${is404} h1="${h1}"`);
    totalFail++; restPageFail++; failures.push({ href, status, inputs, is404, h1 });
  }
}

// ════════════════════════════════════════════════════════════════
// PHASE 6: Desktop — Click top-level pages
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 6: Desktop — Top-Level Pages');
console.log('═'.repeat(70));

for (const { label, href } of [
  { label: 'Home', href: '/' }, { label: 'Compare', href: '/compare/' },
  { label: 'Blog', href: '/blog/' }, { label: 'Glossary', href: '/glossary/' },
  { label: 'Nutrition', href: '/nutrition/' }, { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
]) {
  let status = 0, title = '';
  try {
    const resp = await page.goto(BASE + href, { waitUntil: 'domcontentloaded', timeout: 15000 });
    status = resp ? resp.status() : 0;
    title = await page.title();
  } catch (e) { status = 'ERR'; }

  if (status === 200 && title.length > 0) {
    pass(`${label} (${href}) → OK title="${title.slice(0, 50)}"`); totalPass++;
  } else {
    fail(`${label} (${href}) → status=${status}`); totalFail++; failures.push({ label, href });
  }
}

// ════════════════════════════════════════════════════════════════
// PHASE 7: Mobile — Test responsive hamburger menu
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 7: Mobile — Hamburger Menu');
console.log('═'.repeat(70));

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1000);
await shot(page, '04-mobile-home');

// On SPA pages, React renders its own mobile menu. Check for any hamburger button.
const hamburgerSelectors = [
  '#mobile-menu-btn',
  'button[aria-label*="menu" i]',
  'button[aria-label*="navigation" i]',
  '.hamburger',
  'button.md\\:hidden',
];

let hamburgerFound = false;
for (const sel of hamburgerSelectors) {
  const count = await page.locator(sel).count();
  if (count > 0) {
    const visible = await page.locator(sel).first().isVisible();
    if (visible) {
      pass(`Mobile hamburger found: ${sel}`);
      totalPass++;
      hamburgerFound = true;

      try {
        await page.locator(sel).first().click({ force: true });
        await page.waitForTimeout(600);
        await shot(page, '05-mobile-menu-open');

        const mobileLinks = await page.evaluate(() => {
          const links = [];
          document.querySelectorAll('a[href]').forEach(a => {
            const rect = a.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              links.push({ href: a.getAttribute('href'), text: a.innerText.trim().slice(0, 40) });
            }
          });
          return links;
        });
        info(`Mobile view has ${mobileLinks.length} visible links`);

        // Verify key links are visible on mobile
        const mobileNavHrefs = mobileLinks.map(l => l.href);
        const expectedMobile = ['/', '/calculators/', '/compare/', '/blog/'];
        let mobileNavPass = 0;
        for (const h of expectedMobile) {
          if (mobileNavHrefs.includes(h)) { mobileNavPass++; }
          else { fail(`Mobile nav missing: ${h}`); totalFail++; }
        }
        if (mobileNavPass === expectedMobile.length) {
          pass(`All ${mobileNavPass} key mobile nav links present`);
          totalPass++;
        }
      } catch (e) {
        fail(`Mobile menu interaction error: ${e.message}`);
        totalFail++;
      }
      break;
    }
  }
}

if (!hamburgerFound) {
  fail('No visible mobile hamburger button found');
  totalFail++;
  failures.push({ label: 'mobile-hamburger' });
}

// ════════════════════════════════════════════════════════════════
// PHASE 8: SPA Nav Guard — Static routes load correctly
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('PHASE 8: Static Page Header Visibility');
console.log('═'.repeat(70));

await page.setViewportSize({ width: 1440, height: 900 });
const staticPages = ['/restaurants/subway/', '/restaurants/mcdonalds/', '/about/', '/contact/'];
for (const href of staticPages) {
  await page.goto(BASE + href, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(500);

  const hasHeader = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return false;
    const rect = header.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (hasHeader) { pass(`Header visible on ${href}`); totalPass++; }
  else { info(`Header hidden (React SPA mode) on ${href} — expected for SPA pages`); }
}

await shot(page, '06-final');

// ════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('FINAL RESULTS');
console.log('═'.repeat(70));
console.log(`  ✅ Passed: ${totalPass}`);
console.log(`  ❌ Failed: ${totalFail}`);
console.log(`  Total:   ${totalPass + totalFail}`);

if (failures.length > 0) {
  console.log('\n  Failures:');
  for (const f of failures) {
    console.log(`    - ${f.label || f.href || f.error || JSON.stringify(f)}`);
  }
}

await browser.close();
console.log('\n✅ Navigation audit complete');
