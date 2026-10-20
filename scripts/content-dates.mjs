// Real per-page last-modified dates, derived from this repository's git history.
//
// Why: the build stamped every JSON-LD node and every visible "Updated:" line with one
// hardcoded dateModified of 2026-09-15. A single frozen date across ~39k pages is not a
// freshness signal, it decays (34 days stale by 2026-10-19), and it claims a revision that
// never happened. dateModified must reflect an actual change to that file.
//
// A shallow clone is the failure mode: with one commit in history every file maps to the
// clone date, which would re-date all 39k pages as "today" on every deploy. So this module
// refuses to produce a map unless history looks real, and the caller then leaves whatever
// date is already in the file alone. Under-reporting freshness is safe; inventing it is not.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const MIN_COMMITS = 5;
const CACHE_REL = path.join('node_modules', '.cache', 'content-dates.json');
// The committed copy of the same evidence, generated locally where the history is complete:
//   node scripts/content-dates.mjs --write-manifest
// Needed because Cloudflare Pages does a shallow clone, so a CI build sees one commit and
// loadContentDates() rightly refuses to trust it. Without this file the dates I verified
// locally would not be the dates that ship; the shipped pages would keep the literals that
// step 13 can no longer back, and date-stamp.mjs would delete them. Tab-separated, ~1.5 MB.
const MANIFEST_REL = path.join('scripts', 'content-dates.manifest.txt');

function readManifest(root) {
  let text;
  try {
    text = fs.readFileSync(path.join(root, MANIFEST_REL), 'utf8');
  } catch {
    return null;
  }
  const published = new Map();
  const dates = new Map();
  let lines = 0;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line || line.startsWith('#')) continue;
    const [rel, pub, mod] = line.split('\t');
    if (!rel) continue;
    lines++;
    if (pub) published.set(rel, pub);
    if (mod) dates.set(rel, mod);
  }
  if (lines < 1000) return null;
  const norm = (rel) => rel.replace(/\\/g, '/');
  return {
    isoFor: (rel) => dates.get(norm(rel)) || null,
    publishedFor: (rel) => published.get(norm(rel)) || null,
    commits: 0,
    cached: false,
    source: `manifest (${lines} files)`,
  };
}

function headSha(root) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch (err) {
    console.warn(`[content-dates] git unavailable: ${err.message}`);
    return null;
  }
}

function scanHistory(root) {
  let out;
  try {
    out = execFileSync(
      'git',
      ['-c', 'core.quotepath=false', 'log', '--no-renames', '--pretty=format:%ct', '--name-only'],
      { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
    );
  } catch (err) {
    console.warn(`[content-dates] git log failed: ${String(err.message).slice(0, 200)}`);
    return null;
  }
  // tsByPath is first-wins because git log walks newest-first. addedByPath is last-wins, so it
  // holds the OLDEST commit that touched the path - its entry into this repository, which is
  // the earliest publication date there is any evidence for. datePublished used to be a
  // hardcoded 2025-03-01 on all 17,239 pages, two months before the first commit (2026-05-26):
  // an unverifiable claim that the content had stood the test of time longer than it can be
  // shown to have. An add-date is a lower bound, not the live publish date, and it is real.
  const tsByPath = new Map();
  const addedByPath = new Map();
  const commits = new Set();
  let currentTs = 0;
  for (const raw of out.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line) {
      currentTs = 0;
      continue;
    }
    if (/^\d+$/.test(line)) {
      currentTs = Number(line);
      commits.add(line);
      continue;
    }
    if (!currentTs) continue;
    if (!tsByPath.has(line)) tsByPath.set(line, currentTs);
    addedByPath.set(line, currentTs);
  }
  return { tsByPath, addedByPath, commits: commits.size };
}

/**
 * @param {string} root repo root (process.cwd() during an Astro build)
 * @returns {{ isoFor: (relPath: string) => string|null, publishedFor: (relPath: string) => string|null, commits: number, cached: boolean, source: string }|null}
 */
export function loadContentDates(root) {
  const sha = headSha(root);
  if (!sha) {
    const m = readManifest(root);
    if (m) console.warn('[content-dates] no git in this checkout - using the committed manifest for dates');
    return m;
  }
  const cachePath = path.join(root, CACHE_REL);
  const collected = collectFromGit(root, cachePath);
  if (!collected) {
    const m = readManifest(root);
    if (m) console.warn('[content-dates] history unusable - falling back to the committed manifest');
    return m;
  }
  const { dates, published, commitCount } = collected;
  const norm = (rel) => rel.replace(/\\/g, '/');
  const manifest = readManifest(root);
  if (manifest) {
    // The manifest is a snapshot; git is live. A drifting snapshot means someone edited pages
    // without regenerating it, so the build says so instead of quietly shipping either one.
    let drift = 0;
    let checked = 0;
    for (const [rel, mod] of dates) {
      if (checked++ % 97) continue;
      if (manifest.isoFor(rel) && manifest.isoFor(rel) !== mod) drift++;
    }
    if (drift) console.warn(`[content-dates] ${MANIFEST_REL} is stale vs git history on ${drift} sampled files; regenerate with --write-manifest`);
  }
  return {
    isoFor: (rel) => dates.get(norm(rel)) || null,
    publishedFor: (rel) => published.get(norm(rel)) || null,
    commits: commitCount,
    cached: !!collected.cached,
    source: collected.cached ? 'git cache' : 'git scan',
  };
}

/**
 * Walk the full history once and produce the per-file date maps, caching the result.
 * @returns {{dates: Map, published: Map, commitCount: number, sha: string}|null}
 */
function collectFromGit(root, cachePath = path.join(root, CACHE_REL)) {
  const sha = headSha(root);
  if (!sha) return null;
  try {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (cached.head === sha && Number.isInteger(cached.commitCount) && cached.commitCount >= MIN_COMMITS
      && Array.isArray(cached.dates) && Array.isArray(cached.published)) {
      return {
        dates: new Map(cached.dates),
        published: new Map(cached.published),
        commitCount: cached.commitCount,
        sha,
        cached: true,
      };
    }
  } catch {
    /* no usable cache */
  }

  const scan = scanHistory(root);
  if (!scan) return null;
  if (scan.commits < MIN_COMMITS) {
    console.warn(
      `[content-dates] history has only ${scan.commits} distinct commit date(s); treating as a shallow clone. ` +
      `Skipping per-page dateModified so 34k pages are not all re-dated to the clone date.`
    );
    return null;
  }

  const iso = (ts) => new Date(ts * 1000).toISOString().slice(0, 10);
  const dates = new Map();
  const published = new Map();
  for (const [rel, ts] of scan.tsByPath) {
    if (!ts || !rel.endsWith('.html')) continue;
    if (rel.startsWith('dist3_backup/')) continue;
    dates.set(rel, iso(ts));
    const addedTs = scan.addedByPath.get(rel);
    if (addedTs) published.set(rel, iso(addedTs));
  }
  const commitCount = scan.commits;
  try {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify({ head: sha, commitCount, dates: [...dates], published: [...published] }));
  } catch (err) {
    console.warn(`[content-dates] cache write failed: ${err.message}`);
  }
  return { dates, published, commitCount, sha };
}

/** Write the committed evidence snapshot that a shallow CI clone can still read. */
export function writeManifest(root) {
  const collected = collectFromGit(root);
  if (!collected) throw new Error('git history is missing or shallow; refusing to write a manifest of unevidenced dates');
  const rows = [...collected.dates.keys()].filter((rel) => !rel.startsWith('dist3_backup/')).sort()
    .map((rel) => `${rel}\t${collected.published.get(rel) || ''}\t${collected.dates.get(rel)}`);
  const header = `# per-file content dates - generated by scripts/content-dates.mjs --write-manifest\n`
    + `# head=${collected.sha} commits=${collected.commitCount} files=${rows.length}\n`
    + `# columns: repo-relative html path \t datePublished (commit that added the file) \t dateModified (last commit touching it)\n`;
  fs.writeFileSync(path.join(root, MANIFEST_REL), header + rows.join('\n') + '\n');
  return { files: rows.length, sha: collected.sha, commits: collected.commitCount };
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('content-dates.mjs') && process.argv.includes('--write-manifest')) {
  const root = process.cwd();
  const r = writeManifest(root);
  console.log(`[content-dates] wrote ${MANIFEST_REL}: ${r.files} files from ${r.commits} commit dates at ${r.sha.slice(0, 10)}`);
}
