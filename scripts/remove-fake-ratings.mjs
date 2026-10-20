// Remove JSON-LD aggregateRating blocks that no page actually displays.
//
// 73 committed HTML files declared ratingValue 4.8 with reviewCount/ratingCount
// of 890-1250. Verified 2026-10-19: zero of them render a rating — the only
// "review" text in the visible DOM is the FAQ question "Who reviews the content
// on this site?". Google treats an AggregateRating with no on-page evidence as
// structured-data spam and can issue a manual action.
//
// Idempotent: a second run finds nothing to change. Every touched file is
// re-parsed before it is written; a file that fails validation is skipped.
// Usage: node scripts/remove-fake-ratings.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP = new Set(['node_modules', 'dist3', 'dist3_backup', '.git', '.cache', 'weightlosspercentage.com-audit']);
const LD_RE = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/gi;
// One object member whose value is an object, allowing one level of nesting.
// The leading-comma form is the common one (aggregateRating is a trailing key).
const LEADING_COMMA = /,(\s*)"aggregateRating"\s*:\s*\{(?:[^{}]|\{[^{}]*\})*\}/;
const TRAILING_COMMA = /"aggregateRating"\s*:\s*\{(?:[^{}]|\{[^{}]*\})*\}\s*,\s*/;

function htmlFiles(dir, out = [], depth = 0) {
  if (depth > 8) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(fp, out, depth + 1);
    else if (e.name.endsWith('.html')) out.push(fp);
  }
  return out;
}

function stripRatings(inner) {
  let changed = false;
  for (;;) {
    if (LEADING_COMMA.test(inner)) {
      inner = inner.replace(LEADING_COMMA, '');
      changed = true;
      continue;
    }
    if (TRAILING_COMMA.test(inner)) {
      inner = inner.replace(TRAILING_COMMA, '');
      changed = true;
      continue;
    }
    break;
  }
  return changed ? inner : null;
}

const files = htmlFiles(ROOT);
const touched = [];
const failed = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!/aggregateRating/i.test(src)) continue;
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  let out = '';
  let last = 0;
  let blocks = 0;
  let edits = 0;
  let rejected = null;

  for (const m of src.matchAll(LD_RE)) {
    blocks++;
    out += src.slice(last, m.index);
    const rewritten = stripRatings(m[2]);
    if (rewritten !== null) {
      try {
        JSON.parse(rewritten);
      } catch (err) {
        rejected = err.message;
        break;
      }
      out += m[1] + rewritten + m[3];
      edits++;
    } else {
      out += m[0];
    }
    last = m.index + m[0].length;
  }

  if (rejected || !edits) {
    if (rejected) failed.push([rel, rejected]);
    continue;
  }
  out += src.slice(last);
  for (const m of out.matchAll(LD_RE)) {
    try { JSON.parse(m[2]); } catch (err) { rejected = `sibling block: ${err.message}`; break; }
  }
  if (rejected) { failed.push([rel, rejected]); continue; }

  if (!DRY) fs.writeFileSync(file, out);
  touched.push([rel, edits, blocks]);
}

console.log(`${DRY ? 'DRY RUN — ' : ''}html scanned: ${files.length}`);
console.log(`files ${DRY ? 'to change' : 'changed'}: ${touched.length}, members removed: ${touched.reduce((a, t) => a + t[1], 0)}`);
for (const [f, e, b] of touched) console.log(`  ${f} (${e}/${b} ld+json blocks)`);
if (failed.length) {
  console.log(`REJECTED (would produce invalid JSON-LD): ${failed.length}`);
  for (const [f, msg] of failed) console.log(`  ${f}: ${msg}`);
  process.exitCode = 1;
}
