// @ts-check
/**
 * Locale-tree sitemap coverage, and the one exclusion it enforces.
 *
 * Two separate jobs, both about the honesty of a <loc> entry.
 *
 * 1. RESTORE COVERAGE THE PIPELINE LOSES. The committed `sitemap-international.xml`
 *    has listed all 16 locale trees — 15,105 URLs, since d07f9b58e5 (2026-09-26). But
 *    the build regenerates the silos from the *root* copy, which only knows 12,120
 *    paths, and pruneNoindex then drops 2,106 more. What reached production after every
 *    deploy since was 10,014 URLs: au/ca/nz/sg/uk/zh/ru minus the pruned set, with
 *    ae/cn/sg and the seven thin trees silently gone. Verified against the live host:
 *    live 10,014, dist3 15,105, in dist3 not live 5,091, in live not dist3 0. So this
 *    step does not add pages nobody ever listed — it re-adds 5,091 the pipeline deletes.
 *    (That is why the header of this file used to claim the opposite; it had been
 *    reading the generated artifact, not the committed one. Rule 2 applies to comments.)
 *
 * 2. WITHHOLD THE CLAIM A RENDERER CAN VOID. A locale page that loads
 *    `assets/index-*.js` mounts the React router, and the router's own head manager
 *    replaces the committed self-canonical with one built from the locale-free route.
 *    Measured on the deployed artifact (scratch/spa-canonical-render.mjs, 36 routes ×
 *    their trees, rendered at 390px): 342 of 394 such pages advertise a URL whose
 *    rendered canonical names an English page, and 16 more render the app's own
 *    "404 Page not found" view while keeping a self-canonical. Listing either is a
 *    contradiction Google resolves against us: it submits the locale URL, crawls it,
 *    sees a different canonical or an error body, and reports the locale URL as a
 *    duplicate or soft-404. Every one of the 31 English targets is itself listed in
 *    sitemap-main.xml or sitemap-calculators.xml (31/31, 0 unlisted), so no content
 *    loses its only discovery claim.
 *
 *    The predicate is bundle-presence rather than a list of the routes observed to
 *    misbehave, on purpose. The bundle is a 610,846-byte minified artifact with no
 *    source in this repo, so "these 31 routes rewrite, these 5 do not" is a fact read
 *    out of it once and it rots silently the next time the app changes. "This page
 *    mounts a client router we cannot audit" is checkable from the bytes that ship, and
 *    it subsumes the error-view class too. Cost of the conservative rule: 36 URLs
 *    (0.2% of the sitemap) under the four `/compare/` sub-pages, which hold a
 *    self-canonical and render correctly today. Those pages stay crawlable through
 *    internal links; they just do not carry a claim this build cannot guarantee.
 *
 * Runs after pruneNoindex and before syncSitemaps, so every path it adds is a file that
 * actually ships, and so the index's per-silo <lastmod> is still free to be re-derived
 * from the finished silo.
 */

/** Every prefix that is a deployed site tree rather than an asset or an artifact directory. */
export const LOCALE_TREES = [
  'ae', 'au', 'ca', 'cn', 'de', 'es', 'fr', 'it', 'ja', 'ko',
  'nz', 'pt', 'sg', 'uk', 'us', 'zh', 'ru',
];

/** The silo that already carries locale URLs; no new sitemap file is introduced. */
export const COVERAGE_SILO = 'sitemap-international.xml';

const HOST = 'https://www.weightlosspercentage.com';

/**
 * Does this page hand its own `<head>` to the client-side React router?
 *
 * The discriminator is the bundle's `<script src>`, not `SPA_ROUTES` membership from
 * `src/utils/spaNavGuard.mjs`: that list claims 34 routes where the browser found 36
 * mounting pages, so it is neither necessary nor sufficient. The script tag is what
 * causes the rewrite and what executes; a preload link for the same file mounts nothing.
 * All 15,105 locale pages name `assets/index-*` somewhere, so requiring `src=` on a
 * `script` is the entire discrimination — a bare substring test classifies everything.
 *
 * Anchoring on `<script` is also what makes the scan affordable: identical classification
 * (symmetric difference 0 over every locale page, scratch/predicate-equivalence.mjs) at
 * 4.7s instead of 50.3s across the trees (scratch/spa-scan-cost.mjs). The tag sits at the
 * end of `<body>` on these minified pages, so this runs over the whole document.
 * @param {string} html
 */
export function mountsSpa(html) {
  return /<script[^>]+src=["'][^"']*assets\/index-[^"']*\.js["']/.test(html);
}


/**
 * A page is indexable unless a robots meta says otherwise. Absence means index: that is
 * the default, and it is what the overwhelming majority of this artifact relies on.
 * @param {string} html
 */
export function isIndexable(html) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\bname=["'](robots|googlebot)["']/i.test(tag) &&
        !/\bcontent=["'][^"']*["'][^>]*\bname=["'](robots|googlebot)["']/i.test(tag)) continue;
    const content = (tag.match(/\bcontent=["']([^"']*)["']/i) || [])[1] || '';
    if (/noindex/i.test(content)) return false;
  }
  return true;
}

/** `de/calculators/bmi/index.html` -> `/de/calculators/bmi/`, root index -> `/`. */
function urlPathOf(tree, relWithinTree) {
  const clean = relWithinTree.replace(/\\/g, '/').replace(/index\.html$/, '');
  return '/' + tree + (clean.startsWith('/') ? clean : '/' + clean);
}

/**
 * @param {string} outDir
 * @param {{ fs: any, path: any, dates?: null | { isoFor: (p: string) => string | null },
 *   log?: (msg: string) => void }} opts
 * @returns {{ added: number, byTree: Record<string, number>, spaUrls: string[],
 *   spaListed: number }}
 */
export function addLocaleCoverage(outDir, { fs, path, dates = null, log = console.log } = {}) {
  const siloPath = path.join(outDir, COVERAGE_SILO);
  let xml;
  try {
    xml = fs.readFileSync(siloPath, 'utf8');
  } catch (err) {
    log(`[sitemap-coverage] SKIP: cannot read ${siloPath}: ${err.message}`);
    return { added: 0, byTree: {}, spaUrls: [], spaListed: 0 };
  }
  if (!xml.includes('</urlset>')) {
    log(`[sitemap-coverage] SKIP: ${COVERAGE_SILO} has no </urlset> to append to`);
    return { added: 0, byTree: {}, spaUrls: [], spaListed: 0 };
  }

  const listed = new Set();
  for (const m of xml.matchAll(/<loc>\s*[^<]*?weightlosspercentage\.com([^<\s]*)\s*<\/loc>/gi)) {
    const p = m[1] || '/';
    listed.add(p.endsWith('/') ? p : p + '/');
  }

  const blocks = [];
  /** @type {Record<string, number>} */
  const byTree = {};
  /** Locale URLs that mount the client router, listed or not — syncSitemaps drops the
   *  ones the committed silo already carries. Collected here so the whole-tree scan
   *  happens once, rather than again inside syncSitemaps. */
  const spaUrls = [];

  for (const tree of LOCALE_TREES) {
    const dir = path.join(outDir, tree);
    if (!fs.existsSync(dir)) continue;
    let count = 0;
    const walk = (d) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, entry.name);
        if (entry.isDirectory()) { walk(p); continue; }
        if (!entry.name.endsWith('.html')) continue;
        const rel = path.relative(dir, p);
        const urlPath = urlPathOf(tree, rel);
        let html;
        try {
          html = fs.readFileSync(p, 'utf8');
        } catch (err) {
          log(`[sitemap-coverage] cannot read ${p}: ${err.message}`);
          continue;
        }
        if (mountsSpa(html)) {
          spaUrls.push(urlPath);
          continue;
        }
        if (listed.has(urlPath)) continue;
        if (!isIndexable(html)) continue;
        let lastmod = '';
        if (dates) {
          const iso = dates.isoFor(path.join(tree, rel).replace(/\\/g, '/'));
          if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) lastmod = `\n    <lastmod>${iso}</lastmod>`;
        }
        blocks.push(`  <url>\n    <loc>${HOST}${urlPath}</loc>${lastmod}\n  </url>`);
        count++;
      }
    };
    try {
      walk(dir);
    } catch (err) {
      log(`[sitemap-coverage] walk of ${tree}/ failed: ${err.message}`);
    }
    if (count) byTree[tree] = count;
  }

  const spaListed = spaUrls.filter((u) => listed.has(u)).length;

  if (blocks.length === 0) {
    log(`[sitemap-coverage] every non-SPA locale page is already listed; nothing added (${spaUrls.length} SPA urls withheld, ${spaListed} of them already listed)`);
    return { added: 0, byTree: {}, spaUrls, spaListed };
  }

  const next = xml.replace(/<\/urlset>/, `${blocks.join('\n')}\n</urlset>`);
  try {
    fs.writeFileSync(siloPath, next);
  } catch (err) {
    log(`[sitemap-coverage] cannot write ${siloPath}: ${err.message}`);
    return { added: 0, byTree: {}, spaUrls, spaListed };
  }

  const added = blocks.length;
  const summary = Object.entries(byTree).map(([t, n]) => `${t}=${n}`).join(' ');
  log(`[sitemap-coverage] ${added} indexable locale ${added === 1 ? 'url' : 'urls'} added to ${COVERAGE_SILO}: ${summary}`);
  log(`[sitemap-coverage] ${spaUrls.length} locale ${spaUrls.length === 1 ? 'url' : 'urls'} withheld for mounting the client router (${spaListed} already listed, dropped by syncSitemaps)`);
  return { added, byTree, spaUrls, spaListed };
}
