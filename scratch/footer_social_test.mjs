import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const server = spawn('npm', ['run', 'preview'], { cwd: dirname(__dirname), shell: true });
let baseUrl = null;
server.stdout.on('data', d => {
  process.stdout.write('[srv] ' + d);
  const m = String(d).match(/https?:\/\/127\.0\.0\.1:(\d+)\/?/);
  if (m && !baseUrl) baseUrl = 'http://127.0.0.1:' + m[1];
});
server.stderr.on('data', d => process.stderr.write('[srv] ' + d));

async function waitForServer(ms = 120000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (baseUrl) {
      try { const r = await fetch(baseUrl + '/'); if (r.ok) return true; } catch {}
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

let failed = false;
try {
  if (!(await waitForServer())) throw new Error('preview server never started');
  const page_url = baseUrl + '/';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(page_url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('contentinfo').first().scrollIntoViewIfNeeded().catch(() => {});
  await page.mouse.wheel(0, 5000);
  await page.waitForTimeout(1500);

  const links = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('a[href]')].filter(a =>
      /facebook\.com|instagram\.com|linkedin\.com|x\.com|twitter\.com|youtube\.com|tiktok\.com|pinterest\.com/.test(a.href));
    const chain = (el) => {
      const out = [];
      for (let n = el; n && n.tagName !== 'BODY'; n = n.parentElement) {
        const cs = getComputedStyle(n);
        out.push({
          sel: n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).trim().split(/\s+/).join('.') : ''),
          display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
          h: n.getBoundingClientRect().height,
        });
      }
      return out;
    };
    return anchors.map(a => ({
      href: a.href,
      label: a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40),
      visible: !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length),
      inFooter: !!a.closest('footer') || !!a.closest('[class*="footer" i]'),
      chain: chain(a),
    }));
  });

  const allSocial = links;
  const staticFooterAnchors = allSocial.filter(l => l.chain.some(c => c.sel.includes('static-footer')));
  const visibleFooters = await page.evaluate(() => {
    const fs = [...document.querySelectorAll('footer')];
    return fs.map(f => {
      const cs = getComputedStyle(f);
      const r = f.getBoundingClientRect();
      return { cls: f.className || '(none)', display: cs.display, h: r.height, w: r.width };
    }).filter(f => f.display !== 'none' && f.h > 5);
  });
  const socialInVisibleFooters = await page.evaluate(() => {
    const out = [];
    for (const f of document.querySelectorAll('footer')) {
      if (getComputedStyle(f).display === 'none') continue;
      const anchors = [...f.querySelectorAll('a[href]')].filter(a =>
        /facebook\.com|instagram\.com|linkedin\.com|x\.com|twitter\.com|youtube\.com|tiktok\.com|pinterest\.com/.test(a.href));
      if (anchors.length) out.push({ footerCls: f.className || '(none)', anchors: anchors.map(a => ({ label: a.getAttribute('aria-label') || a.textContent.trim().slice(0,30), href: a.href })) });
    }
    return out;
  });

  console.log('ALL social anchors on homepage:', allSocial.length);
  console.log('Inside static-footer (hidden):', staticFooterAnchors.length);
  console.log('Visible <footer> elements:', JSON.stringify(visibleFooters));
  console.log('Social anchors inside VISIBLE footers:', socialInVisibleFooters.length);
  for (const f of socialInVisibleFooters) for (const a of f.anchors) console.log(`  [${f.footerCls}] "${a.label}" ${a.href}`);

  const verdict = socialInVisibleFooters.some(f => f.anchors.length >= 4);
  console.log(verdict ? 'PASS: visible homepage footer contains social media links'
                      : 'FAIL: visible homepage footer is MISSING social media links');
  if (!verdict) failed = true;

  await page.screenshot({ path: 'scratch/footer_social_homepage.png', fullPage: true });
  await browser.close();
} catch (e) {
  console.error('ERROR:', e.message); failed = true;
} finally {
  server.kill('SIGTERM');
  process.exit(failed ? 1 : 0);
}
