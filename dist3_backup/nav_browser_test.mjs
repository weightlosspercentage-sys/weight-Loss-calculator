import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const OUT  = 'D:/projects/Weight Loss Percentage/Live/Weight Loss Percentage- Upload 1/dist3';

async function shot(page, name) {
  const file = `${OUT}/ss_${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`SCREENSHOT: ${file}`);
  return file;
}

// Get all hrefs from all <a> tags on the page
async function getNavHrefs(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'))
  );
}

async function checkLinks(hrefs, expected, label) {
  let pass = 0, fail = 0;
  const missing = [];
  for (const item of expected) {
    if (hrefs.includes(item.href)) { pass++; }
    else { fail++; missing.push(item); }
  }
  const icon = fail === 0 ? '✅' : '❌';
  console.log(`  ${icon} ${label}: ${pass}/${expected.length} found${fail > 0 ? ` — MISSING: ${missing.map(m=>m.href).join(', ')}` : ''}`);
  return { pass, fail };
}

// Hover using CDP mouse moves (bypasses visibility checks)
async function forceHoverByCDPCoords(page, selector) {
  const el = page.locator(selector).first();
  const box = await el.boundingBox();
  if (!box) { console.log(`  ⚠️  No bounding box for "${selector}"`); return; }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

const EXPECTED_CALC = [
  '/calculators/', '/calculators/weight-loss/', '/calculators/body-fat/', '/calculators/bmi/',
  '/calculators/tdee/', '/calculators/bmr/', '/calculators/macro/', '/calculators/calorie-deficit/',
  '/calculators/calorie/', '/calculators/fat-loss/', '/calculators/protein/', '/calculators/water-intake/',
  '/calculators/walking/', '/calculators/cycling/', '/calculators/rowing/', '/calculators/elliptical/',
  '/calculators/stairmaster/', '/calculators/rucking/', '/calculators/hiit-bodyweight/',
  '/calculators/fitness/', '/calculators/body-recomposition/', '/calculators/pcos-calorie/',
  '/calculators/intermittent-fasting/', '/calculators/carnivore-diet/', '/calculators/keto/',
  '/calculators/unit-converters/', '/calculators/glp1-weight-loss/', '/calculators/bariatric-surgery-weight-loss/',
  '/calculators/postpartum-weight-loss/', '/calculators/newborn-weight-loss/', '/calculators/infant-weight-loss/',
  '/calculators/baby-weight-loss/', '/calculators/pregnancy/', '/calculators/dog-weight-loss/',
  '/calculators/peptide-dosage/', '/calculators/biggest-loser/',
].map(href => ({ href }));

const EXPECTED_REST = [
  '/restaurants/fast-food-hub/', '/restaurants/taco-bell/', '/restaurants/dutch-bros/',
  '/restaurants/dominos/', '/restaurants/five-guys/', '/restaurants/pizza-hut/',
  '/restaurants/jimmy-johns/', '/restaurants/wendys/', '/restaurants/chipotle/',
  '/restaurants/starbucks/', '/restaurants/mcdonalds/', '/restaurants/subway/',
  '/calculators/boba-tea/', '/calculators/poke-bowl/', '/calculators/salad-calories/',
  '/calculators/sushi-calories/', '/calculators/beer-calories/', '/calculators/indian-food/',
  '/calculators/smoothie/',
].map(href => ({ href }));

const PAGES = [
  { name: 'Homepage',          url: '/' },
  { name: 'BMI Calculator',    url: '/calculators/bmi/' },
  { name: 'Weight Loss Calc',  url: '/calculators/weight-loss/' },
  { name: 'Subway',            url: '/restaurants/subway/' },
];

async function testPage(page, name, url) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Page: ${name}  (${url})`);
  console.log('─'.repeat(60));

  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(600);

  const slug = name.replace(/\s+/g, '_').toLowerCase();
  await shot(page, `${slug}_1_loaded`);

  // Try hover on Calculators nav link
  try {
    await forceHoverByCDPCoords(page, 'a[href="/calculators/"]');
    await page.waitForTimeout(600);
    await shot(page, `${slug}_2_calc_hover`);
  } catch(e) { console.log('  ⚠️  Calc hover failed:', e.message); }

  // Move away and try Restaurants
  await page.mouse.move(10, 10);
  await page.waitForTimeout(200);
  try {
    // Try common hrefs for the restaurants parent link
    for (const sel of ['a[href="/restaurants/fast-food-hub/"]', 'a[href="/nutrition/"]', 'a:text("Nutrition")']) {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        await forceHoverByCDPCoords(page, sel);
        break;
      }
    }
    await page.waitForTimeout(600);
    await shot(page, `${slug}_3_rest_hover`);
  } catch(e) { console.log('  ⚠️  Rest hover failed:', e.message); }

  // Link presence check
  const hrefs = await getNavHrefs(page);
  await checkLinks(hrefs, EXPECTED_CALC, 'Calculators');
  await checkLinks(hrefs, EXPECTED_REST, 'Restaurants');
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const ctx     = await browser.newContext({ viewport: { width: 1400, height: 800 } });
  const page    = await ctx.newPage();

  for (const { name, url } of PAGES) {
    try { await testPage(page, name, url); }
    catch(e) { console.log(`\n⚠️  Error on ${name}: ${e.message}`); }
  }

  // Mobile test
  console.log(`\n${'─'.repeat(60)}\nMobile Menu Test\n${'─'.repeat(60)}`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(500);
  await shot(page, 'mobile_01_loaded');

  try {
    await page.locator('#mobile-menu-btn').click({ force: true });
    await page.waitForTimeout(700);
    await shot(page, 'mobile_02_open');

    const summary = page.locator('summary').filter({ hasText: /Calculators/ }).first();
    if (await summary.count() > 0) {
      await summary.click({ force: true });
      await page.waitForTimeout(500);
      await shot(page, 'mobile_03_calc_expanded');
    }

    const summary2 = page.locator('summary').filter({ hasText: /Nutrition|Restaurants/ }).first();
    if (await summary2.count() > 0) {
      await summary2.click({ force: true });
      await page.waitForTimeout(500);
      await shot(page, 'mobile_04_rest_expanded');
    }
  } catch(e) { console.log('Mobile menu error:', e.message); }

  await browser.close();
  console.log('\n✅ All done — screenshots saved to dist3/');
}

main().catch(err => { console.error(err); process.exit(1); });
