import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const server = spawn('node', ['tests/static-server.mjs'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2500);

const triggers = await page.evaluate(() => {
  const nav = [...document.querySelectorAll('nav')].sort((a,b)=>b.querySelectorAll('a').length-a.querySelectorAll('a').length)[0];
  const items = [...nav.querySelectorAll('a, button')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.top < 120 && r.width > 0 && el.innerText.trim().length > 0 && el.innerText.trim().length < 30;
  });
  return items.map(el => ({ tag: el.tagName, text: el.innerText.trim().replace(/\s+/g,' '), href: el.getAttribute('href') || '' }));
});

const tree = [];
for (const t of triggers) {
  if (t.tag !== 'BUTTON' && !t.href) continue;
  if (t.href) { tree.push({ label: t.text, href: t.href, items: [] }); continue; }
  // it's a button -> click and capture its dropdown
  try {
    await page.evaluate((txt) => {
      const b = [...document.querySelectorAll('nav button')].find(x => x.innerText.trim().replace(/\s+/g,' ') === txt);
      b && b.click();
    }, t.text);
  } catch {}
  await page.waitForTimeout(350);
  const menu = await page.evaluate(() => {
    const visible = [...document.querySelectorAll('nav a')].filter(a => {
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden';
    });
    return visible.map(a => ({ text: a.innerText.trim().replace(/\s+/g,' '), href: a.getAttribute('href') }))
      .filter(x => x.text && x.text !== 'Weight Loss Percentage');
  });
  tree.push({ label: t.text, href: '', items: menu });
  // close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
}

console.log('=== NAVIGATION BAR (localhost) ===');
for (const t of tree) {
  console.log(`\n• ${t.label}${t.href ? '  → ' + t.href : '  (dropdown)'}`);
  const seen = new Set();
  for (const it of t.items) { const k = it.text+'|'+it.href; if (seen.has(k)) continue; seen.add(k); console.log(`    └ ${it.text}  →  ${it.href}`); }
}
await browser.close();
server.kill();
