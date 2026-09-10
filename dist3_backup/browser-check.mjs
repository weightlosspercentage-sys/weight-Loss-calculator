// Real-browser walkthrough: loads the local site, exercises every calculator's
// options, checks the nav, captures console errors and screenshots.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const BASE = 'http://localhost:4321';
const OUT = join(ROOT, 'browser-check-report.txt');

function calcUrls() {
  const base = join(ROOT, 'calculators');
  const out = [];
  for (const d of readdirSync(base, { withFileTypes: true })) {
    if (d.isDirectory()) {
      const idx = join(base, d.name, 'index.html');
      if (statSync(idx).isFile()) out.push('/calculators/' + d.name + '/');
    }
  }
  return out;
}

const srv = spawn('node', [join(ROOT, 'tests/static-server.mjs')], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const browser = await chromium.launch();

const log = [];
const note = (s) => { log.push(s); console.log(s); };

// ---- Homepage nav / options check ----
note('=== HOMEPAGE OPTIONS / NAV ===');
{
  const pg = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await pg.route('**/*', (r) => { const u = r.request().url(); (u.startsWith(BASE) ? r.continue() : r.abort()); });
  const errs = [];
  pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|adsbygoogle|TagError/i.test(m.text())) errs.push('console: ' + m.text()); });
  try {
    await pg.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(1500);
    // nav links present
    const navCount = await pg.locator('nav a, header a').count();
    note(`  nav/header links: ${navCount}`);
    // footer region switcher
    const regionLinks = await pg.locator('footer a', { hasText: /English|中文|Русский/ }).count();
    note(`  footer region/language links: ${regionLinks}`);
    await pg.screenshot({ path: join(ROOT, 'shot-home-desktop.png'), fullPage: false });

    // mobile menu toggle (needs a mobile viewport)
    const mpg = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mpg.route('**/*', (r) => { const u = r.request().url(); (u.startsWith(BASE) ? r.continue() : r.abort()); });
    await mpg.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await mpg.waitForTimeout(1200);
    const menuBtn = mpg.locator('button.md\\:hidden');
    let menuWorks = 'n/a';
    if (await menuBtn.count()) {
      try {
        await menuBtn.first().click({ timeout: 5000 });
        await mpg.waitForTimeout(600);
        menuWorks = (await mpg.locator('nav a, [role="navigation"] a').count()) > 0 ? 'opens' : 'no-links';
      } catch (e) { menuWorks = 'click-failed'; }
    }
    note(`  mobile menu button: ${menuWorks}`);
    await mpg.screenshot({ path: join(ROOT, 'shot-home-mobile.png'), fullPage: false });
    await mpg.close();
    note(`  console/page errors on home: ${errs.length ? errs.join('; ') : 'none'}`);
  } catch (e) {
    note('  homepage check error: ' + e.message);
  }
  await pg.close();
}

// ---- Every calculator: fill options, click Calculate, check result ----
note('\n=== CALCULATOR OPTIONS CHECK (' + calcUrls().length + ' pages) ===');
const rows = [];
for (const url of calcUrls()) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await ctx.newPage();
  await pg.route('**/*', (r) => { const u = r.request().url(); (u.startsWith(BASE) ? r.continue() : r.abort()); });
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|adsbygoogle|TagError/i.test(m.text())) errs.push(m.text()); });
  let status = 0;
  try {
    const resp = await pg.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    status = resp ? resp.status() : 0;
  } catch { status = -1; }
  await pg.waitForTimeout(1500); // let the island hydrate
  try {
  const ctrl = await pg.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')];
    const selects = [...document.querySelectorAll('select')];
    const btns = [...document.querySelectorAll('button')].map((b) => b.textContent.trim());
    return { inputCount: inputs.length, selectCount: selects.length, hasCalculate: btns.some((t) => /calculate/i.test(t)) };
  });

  let filled = 0, clicked = false;
  if (ctrl.inputCount || ctrl.selectCount) {
    // fill number/text inputs with plausible values
    const nums = await pg.locator('input[type="number"]').count();
    for (let i = 0; i < nums; i++) {
      try { await pg.locator('input[type="number"]').nth(i).fill(String([70, 90, 80, 500, 65, 1.75, 30, 25][i % 8])); filled++; } catch {}
    }
    const texts = await pg.locator('input:not([type="number"]):not([type="hidden"]):not([type="submit"]):not([type="button"])').count();
    for (let i = 0; i < texts; i++) {
      try { await pg.locator('input:not([type="number"]):not([type="hidden"]):not([type="submit"]):not([type="button"])').nth(i).fill('70'); filled++; } catch {}
    }
    // pick first option in any select (unit chooser)
    const selCount = await pg.locator('select').count();
    for (let i = 0; i < selCount; i++) {
      try { const opts = pg.locator('select').nth(i).locator('option'); const c = await opts.count(); if (c > 1) await pg.locator('select').nth(i).selectOption({ index: 1 }); } catch {}
    }
    const calcBtn = pg.locator('button', { hasText: /calculate/i });
    if (await calcBtn.count()) { try { await calcBtn.first().click(); clicked = true; } catch {} }
  }
  await pg.waitForTimeout(700);

  // Did a result appear? Look for common result containers / numeric output.
  const result = await pg.evaluate(() => {
    const cand = [...document.querySelectorAll('[class*="result" i], [id*="result" i], [class*="answer" i], [class*="output" i]')]
      .map((e) => e.textContent.trim()).filter((t) => t && /\d/.test(t));
    if (cand.length) return cand.slice(0, 2).join(' | ').slice(0, 200);
    // fallback: any element whose text looks like a computed answer
    const all = [...document.querySelectorAll('p,div,span')].map((e) => e.textContent.trim()).filter((t) => /(\d[\d.,]*\s*(kg|lb|lbs|lbs?|cal|calories|%|weeks?|days?|months?|years?|cm|in|BMI|bmi))\b/i.test(t));
    return all.length ? all.slice(0, 2).join(' | ').slice(0, 200) : '(no numeric output detected)';
  });

  const ok = ctrl.hasCalculate ? (result && !/no numeric output/i.test(result)) : true;
  rows.push({ url, status, inputs: ctrl.inputCount, selects: ctrl.selectCount, filled, clicked, ok, result, errs: errs.slice(0, 3) });
  note(`  ${url.padEnd(34)} HTTP ${status}  inputs:${ctrl.inputCount} sel:${ctrl.selectCount} calcBtn:${ctrl.hasCalculate} -> ${ok ? 'OK' : 'NO RESULT'}  ${errs.length ? 'ERR:' + errs.join(';') : ''}`);
  if (!ok) note(`       result sample: ${result}`);
  } catch (e) {
    note(`  ${url} ERROR: ${e.message}`);
    rows.push({ url, status, errs: [e.message] });
  }
  await ctx.close();
}

// ---- Summary ----
const withCalc = rows.filter((r) => r.clicked);
const okCalc = withCalc.filter((r) => /OK/.test(r.ok === true ? 'OK' : '') || (r.result && !/no numeric output/i.test(r.result)));
note('\n=== SUMMARY ===');
note(`  Calculators checked: ${rows.length}`);
note(`  Calculators with a Calculate button: ${withCalc.length}`);
note(`  Calculators that produced a result: ${withCalc.filter((r) => !/no numeric output/i.test(r.result)).length}`);
note(`  Pages with console/page errors (non-ad): ${rows.filter((r) => r.errs.length).length}`);
const errPages = rows.filter((r) => r.errs.length);
if (errPages.length) errPages.forEach((r) => note(`    - ${r.url}: ${r.errs.join('; ')}`));

await writeFile(OUT, log.join('\n'), 'utf8');
await browser.close();
srv.kill();
note('\nReport saved to browser-check-report.txt');
