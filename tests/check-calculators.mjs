import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASE = 'http://localhost:4321';

// all calculator subdirs on disk
const dirs = readdirSync(join(ROOT, 'calculators'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
console.log(`Found ${dirs.length} calculator directories on disk\n`);

const browser = await chromium.launch();

// ---------- PHASE 1: direct full-page load of every calculator ----------
console.log('=== PHASE 1: direct load  /calculators/<name>/  ===');
const rows = [];
for (const name of dirs) {
  const page = await browser.newPage();
  let status = '?';
  try {
    const resp = await page.goto(`${BASE}/calculators/${name}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    status = resp ? resp.status() : 'no-resp';
  } catch (e) { status = 'ERR'; }
  const info = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, button').length;
    const h1 = (document.querySelector('h1')?.innerText || '').trim().slice(0, 60);
    const title = document.title.slice(0, 60);
    const bodyText = document.body.innerText.toLowerCase();
    const is404 = /404|not found|page not found/i.test(bodyText) && inputs < 2;
    return { inputs, h1, title, is404 };
  });
  rows.push({ name, status, ...info });
  await page.close();
}
// report
for (const r of rows) {
  const flag = r.status === 200 && !r.is404 && r.inputs > 0 ? 'OK ' : 'BAD';
  console.log(`  [${flag}] /calculators/${r.name}/  status=${r.status} inputs=${r.inputs} ${r.is404 ? 'IS-404-PAGE' : ''}  h1="${r.h1}"`);
}
const bad = rows.filter((r) => !(r.status === 200 && !r.is404 && r.inputs > 0));
console.log(`\n  Direct-load problems: ${bad.length}/${rows.length}`);

// ---------- PHASE 2: reproduce the nav CLICK path (homepage -> Calculators -> link) ----------
console.log('\n=== PHASE 2: click path via homepage mega-menu ===');
const navTargets = [
  ['Calculators', 'BMI'],
  ['Calculators', 'BMR'],
  ['Calculators', 'TDEE'],
  ['Calculators', 'Body Fat'],
  ['Calculators', 'Calorie Deficit'],
  ['Calculators', 'Macros'],
  ['Calculators', 'Protein'],
];
for (const [menu, item] of navTargets) {
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  // open the menu
  const opened = await page.evaluate((m) => {
    const b = [...document.querySelectorAll('nav button')].find((x) => x.innerText.trim().replace(/\s+/g, ' ') === m);
    if (b) { b.click(); return true; } return false;
  }, menu);
  await page.waitForTimeout(400);
  // click the item
  const clicked = await page.evaluate((it) => {
    const a = [...document.querySelectorAll('nav a')].find((x) => x.innerText.trim().replace(/\s+/g, ' ') === it || x.getAttribute('href')?.endsWith(it.toLowerCase().replace(/\s/g, '-')));
    if (a) { a.click(); return a.getAttribute('href'); } return null;
  }, item);
  await page.waitForTimeout(1500);
  const res = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, button').length;
    const url = location.pathname;
    const bodyText = document.body.innerText.toLowerCase();
    const is404 = /404|not found|page not found/i.test(bodyText) && inputs < 2;
    return { url, inputs, is404, h1: (document.querySelector('h1')?.innerText || '').trim().slice(0,50) };
  });
  console.log(`  ${menu} -> ${item}: clickedHref=${clicked} landed=${res.url} inputs=${res.inputs} ${res.is404 ? '*** SPA 404 ***' : 'rendered'}`);
  await page.close();
}

await browser.close();
