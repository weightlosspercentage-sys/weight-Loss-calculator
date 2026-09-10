import { chromium } from 'playwright';
const LIVE='https://www.weightlosspercentage.com';
const PAGES=['/calculators/newborn-weight-loss/','/calculators/bmr/'];
const b=await chromium.launch();
for(const vp of [{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844}]){
 for(const url of PAGES){
  const p=await b.newPage(); const csp=[]; const other=[];
  p.on('console',m=>{if(m.type()==='error'){const t=m.text(); if(/Content Security Policy|violates/.test(t)){const u=t.match(/https?:\/\/[a-z0-9.\-]+/i); if(u)csp.push(u[0]);}else other.push(t.slice(0,70));}});
  await p.setViewportSize({width:vp.w,height:vp.h});
  await p.goto(LIVE+url,{waitUntil:'domcontentloaded',timeout:30000});
  await p.waitForTimeout(8000);
  const m=await p.evaluate(()=>({ins:document.querySelectorAll('ins.adsbygoogle').length,labels:[...document.querySelectorAll('p')].filter(x=>x.textContent.trim()==='Advertisement'&&x.getBoundingClientRect().width>0).length,statuses:[...document.querySelectorAll('ins.adsbygoogle')].map(e=>e.getAttribute('data-ad-status')||'none')}));
  console.log(`${url} [${vp.n}] ins=${m.ins} labels=${m.labels} statuses=[${m.statuses.join(',')}]`);
  console.log(`   CSP violations: ${[...new Set(csp)].length}  other errors: ${other.length}`);
  if([...new Set(csp)].length) console.log('   still-blocked: '+[...new Set(csp)].join(', '));
  await p.close();
 }
}
await b.close();
