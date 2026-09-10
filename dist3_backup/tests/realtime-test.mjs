// Real-time browser test: loads the LIVE site (real AdSense fills) and localhost,
// asserts the "Advertisement" label + ad fill status, captures console errors + screenshots.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

function startServer() {
  const p = spawn('node', ['tests/static-server.mjs'], { stdio: 'ignore' });
  return p;
}

const LIVE = 'https://www.weightlosspercentage.com';
const LOCAL = 'http://localhost:4321';
const PAGES = ['/calculators/newborn-weight-loss/', '/calculators/bmr/'];

const browser = await chromium.launch();
const results = [];

async function audit(page, base, url, vp, label) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.name + ': ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(base + url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // let AdSense attempt to fill
  await page.waitForTimeout(6000);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);

  const m = await page.evaluate(() => {
    const ins = Array.from(document.querySelectorAll('ins.adsbygoogle'));
    const labels = Array.from(document.querySelectorAll('p'))
      .filter((p) => p.textContent.trim() === 'Advertisement')
      .filter((l) => { const r = l.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    const filled = ins.filter((e) => {
      const st = e.getAttribute('data-ad-status');
      const hasIframe = e.querySelector('iframe');
      const h = parseInt(getComputedStyle(e).height) || 0;
      return st === 'filled' || (hasIframe && h > 20);
    }).length;
    return {
      ins: ins.length,
      labels: labels.length,
      filled,
      adStatuses: ins.map((e) => e.getAttribute('data-ad-status') || 'none'),
      labelFontSize: labels[0] ? getComputedStyle(labels[0]).fontSize : '-',
    };
  });

  const safe = url.replace(/[^a-z0-9]/gi, '_');
  const shot = `tests/realtime-${label}-${safe}.png`;
  await page.screenshot({ path: shot, fullPage: true });
  results.push({ base, url, vp: vp.name, ...m, errors, shot });
}

const server = startServer(); // localhost static server
await new Promise((r) => setTimeout(r, 1500));
try {
  for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    for (const url of PAGES) {
      const p1 = await browser.newPage();
      await audit(p1, LIVE, url, vp, 'live');
      await p1.close();
      const p2 = await browser.newPage();
      await audit(p2, LOCAL, url, vp, 'local');
      await p2.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}

console.log('\n' + '='.repeat(90));
console.log('REAL-TIME BROWSER TEST  (live = real AdSense; local = AdSense blocked)');
console.log('='.repeat(90));
for (const r of results) {
  console.log(`\n${r.base}${r.url}  [${r.vp}]`);
  console.log(`  ad units (ins.adsbygoogle) : ${r.ins}`);
  console.log(`  "Advertisement" labels     : ${r.labels}`);
  console.log(`  filled ad slots            : ${r.filled}/${r.ins}  statuses=[${r.adStatuses.join(',')}]`);
  console.log(`  label font-size            : ${r.labelFontSize}`);
  console.log(`  JS/console errors          : ${r.errors.length ? r.errors.join(' | ') : 'none'}`);
  console.log(`  screenshot                 : ${r.shot}`);
}
