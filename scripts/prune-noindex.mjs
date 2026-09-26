// Prune noindexed thin locale pages so the deploy stays under the Cloudflare
// Pages 20,000-file project limit, and rewrite any kept-page links that would
// point at pruned URLs. Run against the built output dir. Idempotent.
import fs from 'fs';
import path from 'path';

const LOCALES = ['ae', 'au', 'ca', 'nz', 'sg', 'cn', 'zh', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'uk'];

function walkHtml(dir, cb) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, cb);
    else if (e.name.endsWith('.html')) cb(full);
  }
}

function urlPath(outDir, file) {
  return '/' + path.relative(outDir, file).replaceAll('\\', '/').replace(/[^/]*\.html$/, '');
}

function isEmptyDir(dir) {
  try { return fs.readdirSync(dir).length === 0; } catch { return false; }
}

export function pruneNoindex(outDir) {
  const pruned = new Set();
  const kept = [];
  for (const loc of LOCALES) {
    const root = path.join(outDir, loc);
    walkHtml(root, (f) => {
      const html = fs.readFileSync(f, 'utf8');
      if (/content="noindex/.test(html)) pruned.add(urlPath(outDir, f));
      else kept.push(f);
    });
  }
  // also treat any other dir's noindex pages as targets for link rewriting,
  // but only delete under the locale trees.
  walkHtml(outDir, (f) => {
    const rel = path.relative(outDir, f).replaceAll('\\', '/').split('/')[0];
    if (LOCALES.includes(rel)) return;
    const html = fs.readFileSync(f, 'utf8');
    if (/content="noindex/.test(html)) pruned.add(urlPath(outDir, f));
  });

  let deleted = 0, rewritten = 0, filesChanged = 0;
  const enIndex = new Set();
  walkHtml(outDir, (f) => enIndex.add(urlPath(outDir, f)));

  for (const f of kept) {
    const html = fs.readFileSync(f, 'utf8');
    let out = html;
    let touched = 0;
    out = out.replace(/href="(\/[^"#?]*)"/g, (m, p) => {
      const norm = p.endsWith('/') ? p : p + '/';
      if (!pruned.has(norm)) return m;
      const rest = norm.replace(/^\/([a-z]{2}(?:-[a-z]{2})?)\//, '/');
      let target;
      if (enIndex.has(rest) || fs.existsSync(path.join(outDir, rest.slice(1), 'index.html'))) target = rest;
      else target = '/' + norm.split('/')[1] + '/';
      touched++;
      return `href="${target}"`;
    });
    if (touched) {
      fs.writeFileSync(f, out);
      rewritten += touched;
      filesChanged++;
    }
  }

  const dirs = [];
  for (const p of pruned) {
    const file = path.join(outDir, p.slice(1), 'index.html');
    const loc = p.split('/')[1];
    if (!LOCALES.includes(loc)) continue;
    if (fs.existsSync(file)) {
      fs.rmSync(file);
      deleted++;
      let d = path.dirname(file);
      while (d !== path.normalize(outDir) && isEmptyDir(d)) {
        fs.rmdirSync(d);
        d = path.dirname(d);
      }
    }
  }
  console.log(`[prune-noindex] deleted=${deleted} prunedUrls=${pruned.size} linksRewritten=${rewritten} on ${filesChanged} kept pages`);
  return { deleted, rewritten, filesChanged };
}
