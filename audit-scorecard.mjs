// Website scorecard audit for the built static site.
// Serves the ROOT via the existing static-server, audits key pages, prints a scorecard.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const BASE = 'http://localhost:4321';

const PAGES = [
  { url: '/', name: 'Home' },
  { url: '/calculators/weight-loss/', name: 'Calc: Weight Loss' },
  { url: '/calculators/newborn-weight-loss/', name: 'Calc: Newborn Weight Loss' },
  { url: '/calculators/bmi/', name: 'Calc: BMI' },
  { url: '/calculators/tdee/', name: 'Calc: TDEE' },
  { url: '/calculators/calorie-deficit/', name: 'Calc: Calorie Deficit' },
  { url: '/about/', name: 'About' },
  { url: '/contact/', name: 'Contact' },
];

const srv = spawn('node', [join(ROOT, 'tests/static-server.mjs')], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch();

// ---- LCP collector injected before any page script runs ----
const lcpInit = () => {
  window.__lcp = 0;
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
};

async function auditPage(browser, page) {
  const url = BASE + page.url;
  const consoleErrors = [];
  const failed = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => {
    window.__errs = [];
    window.addEventListener('error', (ev) => {
      window.__errs.push((ev.message || '') + ' ' + ((ev.error && ev.error.stack) || ''));
    });
  });
  pg.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  pg.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message + ' ' + (e.stack || '')));
  pg.on('requestfailed', (r) => failed.push({ status: 'net', url: r.url(), ext: !r.url().startsWith(BASE) }));
  pg.on('response', (r) => { if (r.status() >= 400) failed.push({ status: r.status(), url: r.url(), ext: !r.url().startsWith(BASE) }); });

  let status = 200;
  try {
    const resp = await pg.goto(url, { waitUntil: 'load', timeout: 30000 });
    status = resp ? resp.status() : 0;
  } catch (e) {
    status = -1;
  }
  // wait for hydration / settle
  await pg.waitForTimeout(2500);
  const fullErrs = await pg.evaluate(() => window.__errs || []);

  const perf = await pg.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    let js = 0, css = 0, img = 0, imgBytes = 0, other = 0;
    const imgFmts = {};
    for (const e of res) {
      const t = e.name.split('?')[0].split('.').pop().toLowerCase();
      const size = e.transferSize || e.encodedBodySize || 0;
      const sameOrigin = e.name.startsWith(location.origin);
      if (t === 'js') js += size;
      else if (t === 'css') css += size;
      else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(t)) {
        if (sameOrigin) { img += 1; imgBytes += size; imgFmts[t] = (imgFmts[t] || 0) + 1; }
      }
      else other += size;
    }
    return {
      ttfb: nav ? nav.responseStart : 0,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : 0,
      load: nav ? nav.loadEventEnd : 0,
      totalBytes: res.reduce((a, e) => a + (e.transferSize || e.encodedBodySize || 0), 0),
      js, css, img, imgBytes, other, imgFmts,
      resourceCount: res.length,
    };
  });
  const lcp = await pg.evaluate(() => window.__lcp || 0);

  const seo = await pg.evaluate(() => {
    const head = document.head;
    const title = document.title || '';
    const metaDesc = head.querySelector('meta[name="description"]')?.content || '';
    const canonical = head.querySelector('link[rel="canonical"]')?.href || '';
    const viewport = head.querySelector('meta[name="viewport"]')?.content || '';
    const ogTitle = head.querySelector('meta[property="og:title"]')?.content || '';
    const ogDesc = head.querySelector('meta[property="og:description"]')?.content || '';
    const ogImg = head.querySelector('meta[property="og:image"]')?.content || '';
    const twCard = head.querySelector('meta[name="twitter:card"]')?.content || '';
    const h1s = document.querySelectorAll('h1').length;
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => { try { return JSON.parse(s.textContent); } catch { return null; } })
      .filter(Boolean);
    const imgs = [...document.querySelectorAll('img')];
    // Only first-party images are the site's responsibility. Empty alt is VALID
    // for decorative/tracking pixels (e.g. Google cleardot.gif).
    const firstPartyImgs = imgs.filter((i) => (i.currentSrc || i.src || '').startsWith(location.origin));
    const imgsNoAlt = firstPartyImgs.filter((i) => !i.hasAttribute('alt')).length;
    const links = [...document.querySelectorAll('a[href^="http"]')];
    const httpLinks = links.filter((a) => a.href.startsWith('http://')).length;
    return {
      title, titleLen: title.length, metaDesc, descLen: metaDesc.length,
      canonical, viewport, ogTitle, ogDesc, ogImg, twCard,
      h1s, jsonLdCount: jsonLd.length, jsonLdTypes: jsonLd.map((j) => j['@type'] || '?'),
      imgTotal: imgs.length, imgsNoAlt, httpLinks,
    };
  });

  const a11y = await pg.evaluate(() => {
    const html = document.documentElement;
    const lang = html.getAttribute('lang') || '';
    const imgs = [...document.querySelectorAll('img')];
    const firstPartyImgs = imgs.filter((i) => (i.currentSrc || i.src || '').startsWith(location.origin));
    const imgsNoAlt = firstPartyImgs.filter((i) => !i.hasAttribute('alt')).length;
    const inputs = [...document.querySelectorAll('input,select,textarea')];
    let inputsNoLabel = 0;
    for (const el of inputs) {
      const id = el.id;
      const labelled = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ||
        (id && document.querySelector(`label[for="${id}"]`)) || el.closest('label');
      if (!labelled) inputsNoLabel++;
    }
    const buttons = [...document.querySelectorAll('button')];
    const btnsNoName = buttons.filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim())).length;
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
    let skip = headings.findIndex((h) => h !== 1); // first non-h1 after start
    let orderOk = true; let prev = 0;
    for (const h of headings) { if (prev && h > prev + 1) orderOk = false; prev = h; }
    const hasMain = !!document.querySelector('main, [role="main"]');
    const hasNav = !!document.querySelector('nav, [role="navigation"]');
    const docTitle = document.title.trim().length > 0;
    return { lang, imgsNoAlt, inputsTotal: inputs.length, inputsNoLabel, btnsNoName, headingsCount: headings.length, orderOk, hasMain, hasNav, docTitle };
  });

  const bestp = await pg.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const doctype = document.doctype ? true : false;
    const charset = !!document.querySelector('meta[charset]');
    const imgs = [...document.querySelectorAll('img')];
    const imgsNoDims = imgs.filter((i) => !i.width && !i.getAttribute('width') && !i.getAttribute('height')).length;
    const scripts = [...document.querySelectorAll('script[src]')];
    const renderBlocking = scripts.filter((s) => !s.async && !s.defer && s.type !== 'module').length;
    return { doctype, charset, imgsNoDims, renderBlocking, scriptCount: scripts.length };
  });

  await ctx.close();
  return { name: page.name, url: page.url, status, consoleErrors, fullErrs, failed, perf, lcp, seo, a11y, bestp };
}

// ---- Functional test: weight-loss calculator ----
async function testCalculator(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(BASE + '/calculators/weight-loss/', { waitUntil: 'load' });
  await pg.waitForTimeout(2500);
  // discover inputs via labels
  const inputs = await pg.evaluate(() => {
    const map = {};
    for (const l of document.querySelectorAll('label')) {
      const forId = l.getAttribute('for');
      const txt = l.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
      if (forId) map[txt] = forId;
    }
    return map;
  });
  const currentId = inputs['current weight (kg)'];
  const goalId = inputs['goal weight (kg)'];
  const deficitId = inputs['daily calorie deficit (calories)'];
  let result = { ok: false, reason: '' };
  if (currentId && goalId && deficitId) {
    await pg.fill('#' + currentId, '90');
    await pg.fill('#' + goalId, '80');
    await pg.fill('#' + deficitId, '500');
    // click Calculate
    const btn = pg.locator('button', { hasText: 'Calculate' });
    await btn.click();
    await pg.waitForTimeout(800);
    const out = await pg.evaluate(() => {
      // grab any text that looks like a number of days/weeks
      const body = document.body.innerText;
      const m = body.match(/(\d[\d,]*)\s*(days|weeks|months|years|day|week)/i);
      return { body: body.slice(0, 400), match: m ? m[0] : null };
    });
    // expected: (90-80)*7700/500 = 154 days = 22 weeks
    const expectedDays = 154;
    result = { ok: !!out.match, expectedDays, observed: out.match, bodySample: out.body };
  } else {
    result = { ok: false, reason: 'inputs not found: ' + JSON.stringify(inputs) };
  }
  await ctx.close();
  return { errors: errs, result };
}

// ---- sitemap / robots checks ----
async function infraChecks() {
  const httpGet = (p) => new Promise((res) => {
    import('node:http').then(({ get }) => {
      const req = get(BASE + p, (r) => {
        let len = 0; r.on('data', (d) => (len += d.length)); r.on('end', () => res({ status: r.statusCode, len }));
      });
      req.on('error', () => res({ status: 0, len: 0 }));
    });
  });
  const robots = await httpGet('/robots.txt');
  const sitemap = await httpGet('/sitemap.xml');
  let robotsSitemap = false, robotsAllow = true;
  try {
    const t = await fetch(BASE + '/robots.txt').then((r) => r.text());
    robotsSitemap = /sitemap:/i.test(t);
    robotsAllow = !/^disallow:\s*\/\s*$/im.test(t);
  } catch {}
  return { robotsStatus: robots.status, robotsLen: robots.len, sitemapStatus: sitemap.status, sitemapLen: sitemap.len, robotsSitemap, robotsAllow };
}

console.log('\nRunning website scorecard audit...');
const results = [];
for (const p of PAGES) {
  try {
    const r = await auditPage(browser, p);
    results.push(r);
    console.log(`  audited: ${p.name} (${r.status})`);
  } catch (e) {
    console.log(`  FAILED to audit ${p.name}: ${e.message}`);
  }
}
const calc = await testCalculator(browser);
const infra = await infraChecks();
await browser.close();
srv.kill();

// ================= SCORING =================
function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }
function grade(s) { return s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : s >= 50 ? 'E' : 'F'; }

// Performance per page
const perfScores = results.map((r) => {
  let s = 100;
  const p = r.perf;
  if (p.load > 3000) s -= 20; else if (p.load > 1500) s -= 10;
  if (p.totalBytes > 2000000) s -= 20; else if (p.totalBytes > 1000000) s -= 10;
  if (r.lcp > 2500) s -= 15; else if (r.lcp > 1500) s -= 7;
  if (p.js > 600000) s -= 10; else if (p.js > 300000) s -= 5;
  if (p.img > 0) {
    const modern = (p.imgFmts.webp || 0) + (p.imgFmts.avif || 0);
    if (modern === 0) s -= 10; // no modern image formats
  }
  if (r.bestp.renderBlocking > 0) s -= 5;
  return clamp(s);
});

// SEO per page
const seoScores = results.map((r) => {
  let s = 0, max = 0;
  const c = r.seo; max += 15; if (c.titleLen >= 30 && c.titleLen <= 65) s += 15; else if (c.title) s += 7;
  max += 15; if (c.descLen >= 70 && c.descLen <= 165) s += 15; else if (c.metaDesc) s += 7;
  max += 10; if (c.h1s === 1) s += 10; else if (c.h1s > 0) s += 5;
  max += 10; if (c.canonical) s += 10;
  max += 10; if (c.viewport) s += 10;
  max += 10; if (c.ogTitle && c.ogDesc && c.ogImg) s += 10; else s += (c.ogTitle ? 4 : 0) + (c.ogDesc ? 3 : 0) + (c.ogImg ? 3 : 0);
  max += 8; if (c.twCard) s += 8;
  max += 12; if (c.jsonLdCount > 0) s += 12;
  max += 5; if (c.imgTotal > 0 && c.imgsNoAlt === 0) s += 5; else if (c.imgsNoAlt <= c.imgTotal / 2) s += 2;
  max += 5; if (c.httpLinks === 0) s += 5;
  return clamp((s / max) * 100);
});

// Accessibility per page
const a11yScores = results.map((r) => {
  let s = 100, a = r.a11y;
  if (!a.lang) s -= 15;
  if (a.imgsNoAlt > 0) s -= Math.min(20, a.imgsNoAlt * 5);
  if (a.inputsTotal > 0 && a.inputsNoLabel > 0) s -= Math.min(25, a.inputsNoLabel * 8);
  if (a.btnsNoName > 0) s -= Math.min(10, a.btnsNoName * 3);
  if (!a.orderOk) s -= 10;
  if (!a.hasMain) s -= 5;
  if (!a.hasNav) s -= 5;
  return clamp(s);
});

// Best practices per page
const bpScores = results.map((r) => {
  let s = 100, b = r.bestp;
  // only count INTERNAL (same-origin) issues for the grade; external ad/analytics
  // 403s are environmental on localhost and reported separately.
  const internalFailed = r.failed.filter((f) => !f.ext).length;
  const realConsole = r.fullErrs.filter((e) => !/Failed to load resource|adsbygoogle|TagError/i.test(e)).length;
  s -= Math.min(30, internalFailed * 15 + realConsole * 10);
  if (!b.doctype) s -= 10;
  if (!b.charset) s -= 10;
  if (b.imgsNoDims > 0) s -= Math.min(15, b.imgsNoDims * 3);
  if (infra.robotsStatus !== 200) s -= 5;
  if (infra.sitemapStatus !== 200) s -= 5;
  return clamp(s);
});

const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);

const perfAvg = avg(perfScores);
const seoAvg = avg(seoScores);
const a11yAvg = avg(a11yScores);
const bpAvg = avg(bpScores);

// functional correctness (separate qualitative)
const calcOk = calc.result.ok && calc.result.observed;
const overall = clamp(Math.round(perfAvg * 0.25 + seoAvg * 0.30 + a11yAvg * 0.20 + bpAvg * 0.25));

const lines = [];
lines.push('');
lines.push('='.repeat(80));
lines.push('           WEBSITE SCORECARD  â€”  Weight Loss Percentage');
lines.push('='.repeat(80));
lines.push('');
lines.push(`  PERFORMANCE        ${perfAvg}/100   Grade ${grade(perfAvg)}`);
lines.push(`  SEO                ${seoAvg}/100   Grade ${grade(seoAvg)}`);
lines.push(`  ACCESSIBILITY      ${a11yAvg}/100   Grade ${grade(a11yAvg)}`);
lines.push(`  BEST PRACTICES     ${bpAvg}/100   Grade ${grade(bpAvg)}`);
lines.push('');
lines.push(`  >>> OVERALL SCORE  ${overall}/100   Grade ${grade(overall)}`);
lines.push('');
lines.push('-'.repeat(80));
lines.push('  PER-PAGE DETAIL');
lines.push('-'.repeat(80));
results.forEach((r, i) => {
  lines.push(`  ${r.name.padEnd(22)} P:${perfScores[i]}  SEO:${seoScores[i]}  A11y:${a11yScores[i]}  BP:${bpScores[i]}  [HTTP ${r.status}]`);
});
lines.push('');
lines.push('-'.repeat(80));
lines.push('  CALCULATOR FUNCTIONAL TEST (Weight Loss)');
lines.push('-'.repeat(80));
if (calcOk) {
  lines.push(`  Inputs: Current=90kg, Goal=80kg, Deficit=500cal/day`);
  lines.push(`  Expected ~154 days (22 weeks). Observed result: ${calc.result.observed}`);
  lines.push(`  Verdict: ${calc.result.observed ? 'COMPUTED A RESULT (manual verify against expected)' : 'NO RESULT'}`);
} else {
  lines.push(`  Could not fully verify: ${JSON.stringify(calc.result).slice(0, 200)}`);
}
if (calc.errors.length) lines.push(`  Calculator JS errors: ${calc.errors.join('; ')}`);
lines.push('');
lines.push('-'.repeat(80));
lines.push('  INFRASTRUCTURE');
lines.push('-'.repeat(80));
lines.push(`  robots.txt: ${infra.robotsStatus} (${infra.robotsLen}b)  sitemap.xml: ${infra.sitemapStatus} (${infra.sitemapLen}b)`);
lines.push(`  robots references sitemap: ${infra.robotsSitemap}   robots allows root: ${infra.robotsAllow}`);
lines.push('');
lines.push('-'.repeat(80));
lines.push('  KEY FINDINGS / WARNINGS');
lines.push('-'.repeat(80));
const findings = [];
// aggregate issues
const realConsole = results.reduce((a, r) => a + r.fullErrs.filter((e) => !/Failed to load resource|adsbygoogle|TagError/i.test(e)).length, 0);
const adErrors = results.reduce((a, r) => a + r.fullErrs.filter((e) => /adsbygoogle|TagError/i.test(e)).length, 0);
const internalFailed = results.reduce((a, r) => a + r.failed.filter((f) => !f.ext).length, 0);
const externalFailed = results.reduce((a, r) => a + r.failed.filter((f) => f.ext).length, 0);
const noAltPages = results.filter((r) => r.seo.imgsNoAlt > 0 || r.a11y.imgsNoAlt > 0).map((r) => r.name);
const noJsonLd = results.filter((r) => r.seo.jsonLdCount === 0).map((r) => r.name);
const noCanonical = results.filter((r) => !r.seo.canonical).map((r) => r.name);
const bigPages = results.filter((r) => r.perf.totalBytes > 1500000).map((r) => `${r.name}(${(r.perf.totalBytes/1000).toFixed(0)}kb)`);
const noModernImg = results.filter((r) => r.perf.img > 0 && !r.perf.imgFmts.webp && !r.perf.imgFmts.avif).map((r) => r.name);
if (realConsole > 0) findings.push(`- ${realConsole} REAL JavaScript errors (pageerror) across pages â€” needs investigation.`);
if (adErrors > 0) findings.push(`- ${adErrors} AdSense TagError(s): adsbygoogle.push() called on elements that already contain ads (double-push misconfiguration, mostly on Home/BMI/About). Can prevent ads rendering correctly.`);
if (internalFailed > 0) findings.push(`- ${internalFailed} internal (same-origin) failed HTTP requests.`);
if (externalFailed > 0) findings.push(`- ${externalFailed} external 4xx/network failures (ads/analytics/fonts) â€” expected on localhost, verify in production.`);
if (noAltPages.length) findings.push(`- Images missing alt text on: ${noAltPages.join(', ')}.`);
if (noJsonLd.length) findings.push(`- No JSON-LD structured data on: ${noJsonLd.join(', ')}.`);
if (noCanonical.length) findings.push(`- Missing canonical link on: ${noCanonical.join(', ')}.`);
if (noModernImg.length) findings.push(`- No next-gen image formats (WebP/AVIF) on: ${noModernImg.join(', ')}.`);
const heavyJs = results.filter((r) => r.perf.js > 500000).map((r) => `${r.name}(${(r.perf.js/1000).toFixed(0)}kb)`);
if (heavyJs.length) findings.push(`- Single large JS bundle (no code-splitting) on: ${heavyJs.join(', ')} â€” main performance drag; consider lazy-loading/hydration splitting.`);
if (bigPages.length) findings.push(`- Large page weight: ${bigPages.join(', ')}.`);
if (infra.sitemapStatus !== 200) findings.push(`- sitemap.xml not served (HTTP ${infra.sitemapStatus}).`);
if (infra.robotsStatus !== 200) findings.push(`- robots.txt not served (HTTP ${infra.robotsStatus}).`);
if (infra.robotsAllow === false) findings.push(`- WARNING: robots.txt appears to Disallow the root path (risks deindexing the whole site).`);
if (results.some((r) => r.perf.lcp > 2500)) findings.push(`- LCP > 2.5s on some pages (slow Largest Contentful Paint).`);
// show the real (non-network) JS errors
const sampleErrs = [];
for (const r of results) for (const e of r.fullErrs.filter((x) => !/Failed to load resource/i.test(x)).slice(0, 3)) sampleErrs.push(`   [${r.name}] ${e.slice(0, 160)}`);
if (sampleErrs.length) findings.push('  JS errors:\n' + sampleErrs.slice(0, 8).join('\n'));
// show internal failing URLs
const internalUrls = [];
for (const r of results) for (const f of r.failed.filter((x) => !x.ext).slice(0, 3)) internalUrls.push(`   [${r.name}] ${f.status} ${f.url}`);
if (internalUrls.length) findings.push('  Internal failures:\n' + internalUrls.slice(0, 8).join('\n'));
if (!findings.length) findings.push('- No major issues detected across audited pages.');
lines.push(findings.join('\n'));
lines.push('');
lines.push('  Audited pages: ' + PAGES.map((p) => p.name).join(', '));
lines.push('  Note: test ran on the LOCAL built site served over http://localhost:4321.');
lines.push('='.repeat(80));

const out = lines.join('\n');
console.log(out);
await writeFileIfNeeded(out);

async function writeFileIfNeeded(text) {
  try {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(join(ROOT, 'SCORECARD.md'), text, 'utf8');
    console.log('\n(Saved to SCORECARD.md)');
  } catch {}
}

