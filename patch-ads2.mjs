// Remove the redundant manual AdSense unit (Footer) from every built .html file.
// Auto Ads (enabled on the account) was double-filling the same <ins>, causing
// the "adsbygoogle.push() ... already have ads" TagError. Removing the manual
// unit lets Auto Ads manage placement and eliminates the console error.
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

const RE = /<!-- AdSense Dharma 2 Pre-Footer Ad Unit -->[\s\S]*?<\/script>\s*<\/div>/g;

let scanned = 0, removed = 0;
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
      if (RE.test(html)) {
        await writeFile(p, html.replace(RE, ''), 'utf8');
        removed++;
      }
      if (scanned % 10000 === 0) console.log(`  scanned ${scanned}, removed ${removed}...`);
    }
  }
}
await walk(ROOT);
console.log(`Done. Scanned ${scanned} HTML files, removed manual ad unit from ${removed}.`);
