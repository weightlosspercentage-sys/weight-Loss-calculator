// Prune noindexed thin locale pages so the deploy stays under the Cloudflare
// Pages 20,000-file project limit, and rewrite any kept-page links that would
// point at pruned URLs. Run against the built output dir. Idempotent.
import fs from 'fs';
import path from 'path';

const LOCALES = ['ae', 'au', 'ca', 'nz', 'sg', 'cn', 'zh', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'uk'];

function walkHtml(dir, cb) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (err) {
    // A skipped tree here silently spares its pages from pruning, which can push
    // the deploy past the Cloudflare Pages file limit. Say so instead of hushing it.
    if (fs.existsSync(dir)) console.warn(`[prune-noindex] unreadable ${dir}: ${err.message}`);
    return;
  }
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
  try { return fs.readdirSync(dir).length === 0; }
  catch (err) { console.warn(`[prune-noindex] cannot stat ${dir}: ${err.message}`); return false; }
}

// urlPath keeps the trailing slash for directory URLs; mirror that so absolute
// hreflang targets compare equal to the pruned paths.
function asUrlPath(p) {
  if (!p) return '/';
  if (/\.[a-z0-9]+$/i.test(p)) return p;
  return p.endsWith('/') ? p : p + '/';
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
    // Kept English pages are the ones that carry the dangling hreflang: step 6 of
    // postProcessHtml emits en-gb/en-ca/... alternates for pages this pass is
    // about to delete under a locale tree. Collect them here so the rewrite loop
    // below reaches them without another read of the ~49k page tree.
    else kept.push(f);
  });

  let deleted = 0, rewritten = 0, filesChanged = 0, hreflangStripped = 0;
  const enIndex = new Set();
  walkHtml(outDir, (f) => enIndex.add(urlPath(outDir, f)));

  for (const f of kept) {
    const html = fs.readFileSync(f, 'utf8');
    let out = html;
    let touched = 0;
    let stripped = 0;
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
    // hreflang uses absolute URLs, so the pass above never reaches it. A cluster
    // pointing at a page we are about to delete is worse than no cluster: Google
    // discards non-reciprocal hreflang groups wholesale.
    out = out.replace(/<link\b[^>]*\bhreflang=[^>]*\/?>/gi, (m) => {
      const href = (m.match(/href="([^"]+)"/i) || [])[1];
      if (!href) return m;
      let target;
      try { target = new URL(href).pathname; }
      catch { return m; }
      if (!pruned.has(asUrlPath(target))) return m;
      stripped++;
      hreflangStripped++;
      return '';
    });
    if (touched || stripped) {
      fs.writeFileSync(f, out);
      rewritten += touched;
      filesChanged++;
    }
  }

  for (const p of pruned) {
    const file = path.join(outDir, p.slice(1), 'index.html');
    const loc = p.split('/')[1];
    if (!LOCALES.includes(loc)) continue;
    if (fs.existsSync(file)) {
      try {
        fs.rmSync(file);
        deleted++;
      } catch (err) {
        console.error(`[prune-noindex] failed to delete ${file}: ${err.message}`);
        continue;
      }
      let d = path.dirname(file);
      while (d !== path.normalize(outDir) && isEmptyDir(d)) {
        try {
          fs.rmdirSync(d);
        } catch (err) {
          console.warn(`[prune-noindex] could not remove empty dir ${d}: ${err.message}`);
          break;
        }
        d = path.dirname(d);
      }
    }
  }
  console.log(`[prune-noindex] deleted=${deleted} prunedUrls=${pruned.size} linksRewritten=${rewritten} hreflangStripped=${hreflangStripped} on ${filesChanged} kept pages`);
  // Callers need the URL set, not just counts: hreflang and sitemap <loc> entries
  // are written before these files are removed, and nothing else can find them.
  return { deleted, rewritten, filesChanged, hreflangStripped, prunedUrls: [...pruned] };
}
