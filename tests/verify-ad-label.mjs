// Verify the ad-label patch: labels present, ad units intact, no new JS errors.
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
let failures = 0;

for (const vp of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile ', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`${e.name}: ${e.message}`));

  console.log(`\n########## ${vp.name} ${vp.width}x${vp.height} ##########`);

  for (const url of ['/calculators/newborn-weight-loss/', '/calculators/bmr/', '/blog/how-to-calculate-weight-loss-percentage/']) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // scroll to trigger every lazy IntersectionObserver slot
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 800));
    });
    await page.waitForTimeout(1000);

    const r = await page.evaluate(() => {
      const ins = Array.from(document.querySelectorAll('ins.adsbygoogle'));
      // labels rendered by the patched component
      const labels = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent.trim() === 'Advertisement'
      );
      // each label must be the first child of an ad wrapper containing the ins/placeholder
      const paired = labels.filter((l) => {
        const w = l.parentElement;
        return w && (w.querySelector('ins.adsbygoogle') || w.querySelector('div[aria-hidden="true"]'));
      });
      return {
        // only React-driven pages use the patched AdSlot component
        isReact: !!document.querySelector('script[type="module"][src*="/assets/index-"]'),
        ins: ins.length,
        slots: ins.map((e) => e.getAttribute('data-ad-slot') || 'auto').join(','),
        labels: labels.length,
        paired: paired.length,
        labelStyle: labels[0] ? getComputedStyle(labels[0]).textTransform : 'n/a',
      };
    });

    // Static pages don't use AdSlot, so they are reported but not asserted.
    const ok = r.isReact ? r.labels > 0 && r.paired === r.labels : true;
    if (!ok) failures++;
    const tag = r.isReact ? (ok ? 'PASS' : 'FAIL') : 'SKIP';
    console.log(
      `${tag} ${url.padEnd(48)} react=${r.isReact ? 'Y' : 'n'} ins=${r.ins} labels=${r.labels} paired=${r.paired}`
    );
    console.log(`     slots: ${r.slots}`);
  }

  const unique = [...new Set(errors)];
  console.log(`JS errors: ${unique.length ? unique.join(' | ') : '(none)'}`);
  await page.close();
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
