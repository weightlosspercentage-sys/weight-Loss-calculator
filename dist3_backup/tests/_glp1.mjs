import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
for (const name of ['glp1-weight-loss','calorie-deficit','fitness']) {
  await p.goto('http://localhost:4321/calculators/'+name+'/', { waitUntil:'networkidle', timeout:20000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(()=>({ inputs: document.querySelectorAll('input,select,button').length, h1:(document.querySelector('h1')?.innerText||'').trim().slice(0,50), body: document.body.innerText.slice(0,120).replace(/\n/g,' ') }));
  console.log(`/calculators/${name}/ -> inputs=${r.inputs} h1="${r.h1}" body="${r.body}"`);
}
await b.close();
