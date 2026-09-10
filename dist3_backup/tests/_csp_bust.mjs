import { chromium } from 'playwright';
const LIVE='https://www.weightlosspercentage.com';
const b=await chromium.launch();
const p=await b.newPage();
const blocked=new Set();
p.on('console',m=>{if(m.type()==='error'&&/violates the following Content Security Policy/.test(m.text())){const u=m.text().match(/https?:\/\/[a-z0-9.\-]+/i); if(u)blocked.add(u[0]);}});
// cache-bust so Cloudflare returns a FRESH response with the new CSP
const url=LIVE+'/calculators/bmr/?nocache='+Date.now();
await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
await p.waitForTimeout(8000);
console.log('Blocked hosts (cache-busted URL):');
console.log([...blocked].join('\n')||'(none)');
console.log('count='+blocked.size);
await b.close();
