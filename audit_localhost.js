const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const base = 'http://127.0.0.1:4321';
  const pages = ['/', '/calculators/fat-loss/', '/calculators/bmi/', '/calculators/calorie/'];
  const viewports = [{name:'desktop',w:1440,h:900},{name:'mobile',w:375,h:667}];
  const results=[];
  const screenshotDir = path.join(__dirname,'screenshots');
  fs.mkdirSync(screenshotDir,{recursive:true});
  const browser = await chromium.launch({headless:true});
  for(const vp of viewports){
    const ctx = await browser.newContext({viewport:{width:vp.w,height:vp.h}});
    const page = await ctx.newPage();
    for(const p of pages){
      const url = base+p; const start=Date.now();
      try{
        await page.goto(url,{waitUntil:'networkidle'});
        const load=Date.now()-start;
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
        const slug = p.replace(/\//g,'_').replace(/^_/,'')||'home';
        const shot = path.join(screenshotDir,`${vp.name}_${slug}.png`);
        await page.screenshot({path:shot,fullPage:true});
        results.push({url,viewport:vp.name,load,overflow});
      }catch(e){results.push({url,viewport:vp.name,error:e.message});}
    }
    await ctx.close();
  }
  await browser.close();
  const report = path.join(__dirname,'localhost_audit_report.md');
  const lines=['# Audit Report',''];
  results.forEach(r=>{
    if(r.error) lines.push(`- ${r.viewport} ${r.url} ❌ ${r.error}`);
    else lines.push(`- ${r.viewport} ${r.url} ⏱️ ${r.load}ms ${r.overflow?'❌ overflow':''}`);
  });
  fs.writeFileSync(report,lines.join('\n'));
  console.log('Report written to',report);
})();
