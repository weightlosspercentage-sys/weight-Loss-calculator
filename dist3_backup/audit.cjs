const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function audit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const calcDirs = fs.readdirSync('calculators', {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name);
  
  const results = [];
  
  for (const calc of calcDirs) {
    const url = `http://localhost:4321/calculators/${calc}/`;
    try {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(500); // Wait a bit for hydration
      
      const data = await page.evaluate((currentUrl) => {
        const getH1 = () => document.querySelector('h1')?.innerText || '';
        const getTitle = () => document.title || '';
        
        const first100 = document.body.innerText.split(/\s+/).slice(0, 100).join(' ');
        
        const hasWorkingTool = !!document.querySelector('input, select, button'); 
        const toolAboveFold = (() => {
          const input = document.querySelector('input');
          return input ? input.getBoundingClientRect().top < window.innerHeight : false;
        })();
        
        const links = Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
        const internalLinks = links.filter(l => l.href.includes('localhost') || l.href.startsWith('/'));
        
        const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
          try { return JSON.parse(s.innerText); } catch (e) { return null; }
        }).filter(Boolean);
        
        const text = document.body.innerText;
        const hasAuthor = /author|written by|reviewed by|reviewer/i.test(text);
        const hasMethodology = /methodology|formula|equation|how this is calculated/i.test(text);
        const hasUpdatedDate = /updated|last modified/i.test(text);
        const hasDisclaimer = /disclaimer|medical advice|consult/i.test(text);
        const hasCitation = /source|reference|citation/i.test(text);
        
        return {
          title: getTitle(),
          h1: getH1(),
          first100,
          hasWorkingTool,
          toolAboveFold,
          internalLinksCount: internalLinks.length,
          anchors: internalLinks.map(l => l.text.trim()),
          schemas: schemas.map(s => s['@type'] || (s['@graph'] ? s['@graph'].map(g => g['@type']) : 'Unknown')).flat(),
          hasAuthor, hasMethodology, hasUpdatedDate, hasDisclaimer, hasCitation,
          textLength: text.length
        };
      }, url);
      
      console.log(`✅ ${calc} — scraped`);
      results.push({calc, data});
    } catch (e) {
      console.log(`❌ ${calc} — error: ${e.message}`);
    }
  }
  
  await browser.close();
  fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
}

audit().catch(console.error);
