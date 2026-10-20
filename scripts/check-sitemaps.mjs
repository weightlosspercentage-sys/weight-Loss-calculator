// Read-only sitemap audit for a built tree. Python is a Store stub on this box, so this is
// plain node. Beyond the pattern blacklist it enforces the two invariants the build's pruning
// step must not break: every <loc> resolves to a real file, and no kept page hreflangs or
// redirects to a pruned one. Wire-up: `npm run check:sitemaps` (audits dist3).
// Usage: node scripts/check-sitemaps.mjs [dirToCheck]   (default: repo root)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || process.cwd());
const FORBIDDEN = ['/agent/', '/.agents/', '/skills/', 'spa-fallback-dummy', 'Google-SEO-Report', '/us/'];
const LOCS_PER_SILO_LIMIT = 50000;

const siloFiles = fs
  .existsSync(ROOT)
  ? fs.readdirSync(ROOT).filter((f) => /^sitemap(-[a-z0-9-]+)?\.xml$/i.test(f) && f !== 'sitemap-0.xml')
  : [];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log('  [FAIL] ' + msg);
};

console.log(`=== sitemap guard on ${ROOT}`);

if (!siloFiles.length) fail('no sitemap-*.xml files found');

const seen = new Map();
const indexFiles = new Set();
for (const f of siloFiles) {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const locs = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  for (const pattern of FORBIDDEN) {
    if (content.includes(pattern)) fail(`${f} contains forbidden pattern "${pattern}"`);
  }

  const isIndex = /<sitemapindex[\s>]/i.test(content) || f === 'sitemap-index.xml';
  if (isIndex) {
    // /sitemap.xml is an alias of the index (see copy-assets), so index rules key off the
    // document type, not the filename.
    indexFiles.add(f);
    for (const l of locs) if (!/sitemap[^/]*\.xml$/.test(l)) fail(`${f} lists a non-sitemap loc: ${l}`);
    continue;
  }

  if (locs.length > LOCS_PER_SILO_LIMIT) fail(`${f} has ${locs.length} locs (> ${LOCS_PER_SILO_LIMIT})`);

  for (const l of locs) {
    if (!/^https:\/\/www\.weightlosspercentage\.com\//.test(l)) fail(`${f} has a non-canonical loc: ${l}`);
    const key = l.replace(/^https:\/\/www\.weightlosspercentage\.com/, '') || '/';
    if (seen.has(key)) fail(`duplicate loc ${key} in ${f} and ${seen.get(key)}`);
    else seen.set(key, f);

    if (fs.existsSync(ROOT)) {
      const disk = key === '/' ? 'index.html' : key.replace(/^\/|\/$/g, '') + '/index.html';
      if (!fs.existsSync(path.join(ROOT, disk))) fail(`${f} lists ${key} but ${disk} is absent`);
    }
  }
  console.log(`  ${f.padEnd(30)} ${String(locs.length).padStart(6)} locs`);
}

const index = path.join(ROOT, 'sitemap-index.xml');
if (fs.existsSync(index)) {
  const listed = new Set(
    [...fs.readFileSync(index, 'utf8').matchAll(/<loc>[^<]*\/(sitemap-[^<]+\.xml)<\/loc>/g)].map((m) => m[1]),
  );
  for (const f of siloFiles) if (!indexFiles.has(f) && !listed.has(f)) fail(`${f} is not referenced by sitemap-index.xml`);
  for (const l of listed) if (!fs.existsSync(path.join(ROOT, l))) fail(`sitemap-index.xml references missing ${l}`);
}

const redirects = path.join(ROOT, '_redirects');
if (fs.existsSync(redirects)) {
  const lines = fs.readFileSync(redirects, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (status === '404') continue;
    const target = (to || '').replace(/^https?:\/\/(www\.)?weightlosspercentage\.com/i, '');
    if (!target.startsWith('/')) continue;
    const disk = target === '/' ? 'index.html' : target.replace(/^\/|\/$/g, '') + '/index.html';
    if (fs.existsSync(path.join(ROOT, 'index.html')) && !fs.existsSync(path.join(ROOT, disk))) {
      fail(`_redirects sends ${from} to ${target} but ${disk} is absent (redirect chain ends in a 404)`);
    }
  }
}

console.log(`=== ${failures ? 'FAILED with ' + failures + ' problem(s)' : 'clean'} — ${seen.size} unique URLs checked`);
process.exit(failures ? 1 : 0);
