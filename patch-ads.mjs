// Patch every built .html file: guard the AdSense push so the same
// <ins> is never pushed twice (fixes the "already have ads" TagError).
// Skips tooling/cache/build dirs to stay fast over the 100k-file tree.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

const SKIP = new Set([
  'node_modules', '.git', '.opencode', '.astro', '.claude', '.vscode', '.wrangler',
  'dist', 'dist2', 'dist3', 'dist3_backup_patched',
  'playwright-report', 'playwright-report-audit', 'test-results',
  'seo-strategy', 'weightlosspercentage.com-audit', 'scratch', 'scripts', 'tests',
  'assets', 'public', 'images',
]);

const OLD = '(adsbygoogle = window.adsbygoogle || []).push({});';
const NEW = `(function(){
  var ins = document.querySelector('ins.adsbygoogle');
  if (ins && ins.getAttribute('data-adsbygoogle-status') === 'done') return;
  try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
})();`;

let scanned = 0, patched = 0;
async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) { await walk(p); }
    else if (extname(e.name) === '.html') {
      scanned++;
      const html = await readFile(p, 'utf8');
      if (html.includes(OLD)) {
        await writeFile(p, html.replace(OLD, NEW), 'utf8');
        patched++;
      }
      if (scanned % 10000 === 0) console.log(`  scanned ${scanned}, patched ${patched}...`);
    }
  }
}
await walk(ROOT);
console.log(`Done. Scanned ${scanned} HTML files, patched AdSense guard in ${patched}.`);
