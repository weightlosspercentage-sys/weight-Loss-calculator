// True A/B scorecard: intercepts the bundle request and serves the pre-patch
// backup for "BEFORE", the live file for "AFTER". No files are modified.
// AdSense is blocked so slots keep their reserved layout (simulates a filled ad),
// otherwise Google collapses unfilled slots on localhost and nothing is measurable.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUNDLE = 'assets/index-Ctp2HkQJ.js';
const BEFORE = await readFile(join(ROOT, BUNDLE + '.pre_adlabel_patch.bak'), 'utf8');
const AFTER = await readFile(join(ROOT, BUNDLE), 'utf8');
const BASE = 'http://localhost:4321';

const PAGES = ['/calculators/newborn-weight-loss/', '/calculators/bmr/', '/'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();

async function measure(variantSrc, vp, url) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.name));

  // serve the chosen bundle variant
  await page.route(`**/${BUNDLE}`, (r) =>
    r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: variantSrc })
  );
  // block ad network so reserved layout is observable
  await page.route('**://*.googlesyndication.com/**', (r) => r.abort());
  await page.route('**://*.doubleclick.net/**', (r) => r.abort());
  await page.route('**://*.google-analytics.com/**', (r) => r.abort());

  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 170));
    }
  });
  await page.waitForTimeout(900);

  const m = await page.evaluate(() => {
    const ins = Array.from(document.querySelectorAll('ins.adsbygoogle'));
    const manual = ins.filter((e) => e.getAttribute('data-ad-slot'));
    const labels = Array.from(document.querySelectorAll('p')).filter(
      (p) => p.textContent.trim() === 'Advertisement'
    );
    // AdSlot wrappers = elements reserving 250/268/280/298px
    const wrappers = Array.from(document.querySelectorAll('div')).filter((d) => {
      const h = parseInt(getComputedStyle(d).minHeight) || 0;
      return [250, 268, 280, 298].includes(h);
    });
    const reservedPx = wrappers.reduce((a, d) => a + (parseInt(getComputedStyle(d).minHeight) || 0), 0);
    const visibleLabels = labels.filter((l) => {
      const r = l.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    return {
      insTotal: ins.length,
      manual: manual.length,
      slots: [...new Set(manual.map((e) => e.getAttribute('data-ad-slot')))].sort().join(','),
      autoAds: ins.length - manual.length,
      wrappers: wrappers.length,
      reservedPx,
      labels: labels.length,
      visibleLabels: visibleLabels.length,
      labelFontSize: labels[0] ? getComputedStyle(labels[0]).fontSize : '-',
    };
  });
  await page.close();
  return { ...m, errors: [...new Set(errors)].join(',') || 'none' };
}

const rows = [];
for (const vp of VIEWPORTS) {
  for (const url of PAGES) {
    const b = await measure(BEFORE, vp, url);
    const a = await measure(AFTER, vp, url);
    rows.push({ vp: vp.name, url, b, a });
  }
}
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
console.log('\n' + '='.repeat(104));
console.log('AD SLOT SCORECARD  —  BEFORE vs AFTER   (AdSense blocked so reserved layout is measurable)');
console.log('='.repeat(104));
console.log(
  pad('PAGE', 34) + pad('VIEW', 9) + pad('MANUAL', 9) + pad('AUTO', 7) + pad('LABELS', 9) + pad('RESERVED px', 13) + 'FONT'
);
console.log('-'.repeat(104));
for (const r of rows) {
  const f = (o) => pad(o.manual, 9) + pad(o.autoAds, 7) + pad(`${o.visibleLabels}/${o.wrappers}`, 9) + pad(o.reservedPx, 13) + o.labelFontSize;
  console.log(pad(r.url, 34) + pad(r.vp, 9) + 'BEFORE   ' + f(r.b));
  console.log(pad('', 34) + pad('', 9) + 'AFTER    ' + f(r.a));
  console.log('-'.repeat(104));
}

console.log('\nSLOT IDS (unchanged check)');
for (const r of rows) {
  const same = r.b.slots === r.a.slots ? 'IDENTICAL' : 'CHANGED!';
  console.log(`  ${pad(r.url, 34)} ${pad(r.vp, 8)} before[${r.b.slots || '-'}] after[${r.a.slots || '-'}] -> ${same}`);
}

console.log('\nJS ERRORS');
for (const r of rows) {
  console.log(`  ${pad(r.url, 34)} ${pad(r.vp, 8)} before=${r.b.errors}  after=${r.a.errors}`);
}
