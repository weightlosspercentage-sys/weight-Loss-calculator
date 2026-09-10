import { chromium } from 'playwright';
const LIVE = 'https://www.weightlosspercentage.com';
const PAGES = ['/calculators/newborn-weight-loss/', '/calculators/bmr/'];
const browser = await chromium.launch();
for (const vp of [{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844}]) {
  for (const url of PAGES) {
    const page = await browser.newPage();
    const cspErrs = [], other = [];
    page.on('console', m => { if (m.type()==='error'){ const t=m.text(); if(/Content Security Policy|violates/.test(t)) cspErrs.push(t.split(' ')[0]+'...'); else other.push(t.slice(0,80)); }});
    page.on('pageerror', e => other.push('PAGEERR: '+e.message.slice(0,80)));
    await page.setViewportSize({width:vp.w,height:vp.h});
    await page.goto(LIVE+url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(7000);
    const m = await page.evaluate(()=>({
      ins: document.querySelectorAll('ins.adsbygoogle').length,
      labels: [...document.querySelectorAll('p')].filter(p=>p.textContent.trim()==='Advertisement'&&p.getBoundingClientRect().width>0).length,
      statuses: [...document.querySelectorAll('ins.adsbygoogle')].map(e=>e.getAttribute('data-ad-status')||'none'),
    }));
    console.log(`${LIVE}${url} [${vp.n}] ins=${m.ins} labels=${m.labels} statuses=[${m.statuses.join(',')}]`);
    console.log(`   CSP violations: ${cspErrs.length}   other errors: ${other.length}`);
    if (cspErrs.length) console.log('   CSP: '+[...new Set(cspErrs)].join(' | '));
    await page.close();
  }
}
await browser.close();
