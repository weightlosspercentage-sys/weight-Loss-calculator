// Rewrite the invented claims that live inside the shipped React bundle's DATA LITERALS, and move
// every dictionary key that a rewritten literal is, so zh/ru keep their translation.
//
// Why the bundle at all: /calculators/bmr/, /calculators/tdee/ and /calculators/calorie/ are
// SPA_ROUTES (src/utils/spaNavGuard.mjs), so createRoot(#root).render() replaces their committed
// HTML with React's own copy. A source-HTML-only fix is invisible there. Measured: the served
// bundle carries the false formula strings the HTML codemod already removed from 140 files, the
// "James Peterson, RD" byline that scripts/fix-dietitian-claims.mjs removed from 34,386 files, and
// lastUpdated:"November 1, 2025" — a date two months older than this repo's first commit.
//
// Why data literals only: the brief says "do not modify calculator logic". Every rule below
// rewrites a description, a title, an author block or a prose formula *explanation*. The arithmetic
// (88.362/13.397/4.799/5.677, 447.593/9.247/3.098/4.33, 6.25, 21.6, 1.375) is asserted
// byte-identical before and after, and the run refuses to write if any of it moved.
//
// The dictionary coupling is the reason a previous pass declared this file out of scope.
// translateText() looks up window.__TRANSLATIONS__[<whole trimmed text node>] by exact match, so a
// bundle literal that IS a dictionary key cannot be changed alone: zh/ru would stop matching and
// fall back to English on screen. Rather than skip those rules, this tool pairs each one with a
// coordinated key rename in every dictionary that carries it, value untouched. That is verified
// per file: JSON still parses, the key count is unchanged, the new key holds the old key's exact
// value, and the old key is gone.
//
// Which copy is the artifact: two tracked files are named assets/index-Ctp2HkQJ.js, and they are
// NOT the same build (they differ from byte zero while sharing one content hash). Only assets/ is
// served: the copy-assets hook runs in astro:build:done, i.e. after Astro has already copied
// public/, and `assets` is not in its exclusion list, so the root file lands on top of the public
// one. Proven by sha256 against dist3, not inferred. The public/ copy is an OLDER build that still
// renders a credential the current app retracted ("Dr. Rekha Kumar, M.D., M.S., LDN (Registered
// Dietitian Nutritionist)" linking /about, vs the served "…M.D., M.S." linking
// /authors/dr-rekha-kumar/), so this tool patches the served bytes only and REPORTS the other
// copy: one ruleset with one expected count per rule cannot honestly span two different builds.
//
// Usage: node scripts/patch-bundle-claims.mjs            # preflight only, writes nothing
//        node scripts/patch-bundle-claims.mjs --write    # apply to bundle + dictionaries
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const BUNDLES = ['assets/index-Ctp2HkQJ.js']; // the copy that reaches dist3; see the header
const OTHER_COPIES = ['public/assets/index-Ctp2HkQJ.js']; // tracked, overwritten, reported only
const EN = '\u2013'; // the bundle spells "Mifflin{en}St Jeor" and "Harris{en}Benedict"

/**
 * need/repl are literal substrings, count is their required occurrence total.
 * A need that contains no string literal is tested as a whole dictionary key: it must sit inside
 * exactly one literal, and the literal must equal it or contain it once. A need that DOES contain
 * literals may straddle code (R05/R09/R16 anchor on `a:"…"`, `author:{name:"…"}` and
 * `lastUpdated:"…"` to stay unique in minified source); those are matched structurally - same code
 * skeleton, same number of literals, each old literal paired with the new literal in its place.
 */
const RULES = [
  // ---- #52 the widget runs Harris-Benedict; Katch-McArdle is implemented nowhere ----
  {
    id: 'R01',
    need: 'Mifflin-St Jeor formula with 5 activity levels. Dietitian-reviewed calculator.',
    repl: 'Harris-Benedict formula with 5 activity levels. Medically reviewed calculator.',
    count: 1,
    why: 'TDEE card meta: the widget is Harris-Benedict BMR x activity multiplier + credential harmonization',
  },
  {
    id: 'R02',
    need: 'using Mifflin-St Jeor and Katch-McArdle formulas. Free, dietitian-reviewed BMR calculator.',
    repl: 'using the revised Harris-Benedict equation. Free, medically reviewed BMR calculator.',
    count: 1,
    why: 'BMR card meta: Katch-McArdle is unimplemented (21.6 occurs only in prose) + credential',
  },
  {
    id: 'R03',
    need: 'calorie deficit targets with Mifflin-St Jeor. Dietitian-reviewed.',
    repl: 'calorie deficit targets with the Harris-Benedict equation. Medically reviewed.',
    count: 1,
    why: 'calorie card meta: the calorie widget is Harris-Benedict BMR x activity multiplier + credential',
  },
  {
    id: 'R04',
    need: `Every calculator uses peer-reviewed formulas (Mifflin${EN}St Jeor, Harris${EN}Benedict, US Navy circumference, WHO BMI thresholds). Articles are reviewed by a registered dietitian before publication and updated annually.`,
    repl: `Every calculator uses peer-reviewed formulas (the Harris${EN}Benedict equation, the US Navy circumference method, WHO BMI thresholds). Articles are reviewed by our Lead Medical Reviewer before publication.`,
    count: 1,
    why: '"every calculator" cannot name Mifflin-St Jeor; "updated annually" has no record; the reviewer is an M.D., M.S.',
  },
  {
    id: 'R05',
    need: `a:"Mifflin${EN}St Jeor"`,
    repl: `a:"Harris${EN}Benedict"`,
    couple: true,
    count: 1,
    why: 'BMR-vs-TDEE table Formula cell, describing the BMR widget. Whole text node = dictionary key, so zh/ru keys move with it.',
  },
  {
    id: 'R06',
    need: `BMR uses the Mifflin${EN}St Jeor equation.`,
    repl: `BMR uses the revised Harris${EN}Benedict equation.`,
    count: 1,
    why: 'tdee.formula. Its own sibling bmr.formula already spells the shipped math as Harris-Benedict (revised).',
  },
  {
    id: 'R07',
    need: `combines the Mifflin${EN}St Jeor equation with your activity level`,
    repl: `combines the revised Harris${EN}Benedict equation with your activity level`,
    count: 1,
    why: 'calorie.intro: the calorie widget multiplies Harris-Benedict BMR by the activity level',
  },
  {
    id: 'R08',
    need: 'The calculator uses the Mifflin-St Jeor equation, which is highly accurate for most people.',
    repl: 'The calculator uses the revised Harris-Benedict equation, one of the most widely used formulas for estimating BMR.',
    count: 1,
    why: 'TDEE FAQ "How accurate is the TDEE calculator?" - the TDEE widget is Harris-Benedict x multiplier',
  },

  // ---- credential harmonization: same wording as scripts/fix-dietitian-claims.mjs:34-53 ----
  {
    id: 'R09',
    need: 'author:{name:"James Peterson, RD",role:"Registered Dietitian",bio:"James is a registered dietitian specializing in sports nutrition and accurate body composition modeling."',
    repl: 'author:{name:"Dr. Rekha Kumar",role:"M.D., M.S., Lead Medical Reviewer",bio:"Dr. Rekha Kumar has over 15 years of experience in clinical nutrition and metabolic health, specializing in evidence-based weight loss strategies."',
    count: 2,
    why: 'the site\'s own Person schema declares exactly one reviewer with no dietetics credential; the replacement bio is transcribed from the Dr. Rekha Kumar author blocks already in this bundle',
  },
  { id: 'R10', need: 'Dietitian-Reviewed Blog', repl: 'Medically Reviewed Blog', count: 12, couple: true, why: 'fix-dietitian-claims.mjs:52, applied to the 12 blog-card titles the HTML pass could not reach' },
  { id: 'R11', need: 'A clinical dietitian-reviewed guide', repl: 'A medically reviewed guide', count: 2, couple: true, why: 'fix-dietitian-claims.mjs:49' },
  { id: 'R12', need: 'Meet the team behind our free, dietitian-reviewed health tools.', repl: 'Meet the physician behind our free, medically reviewed health tools.', count: 1, couple: true, why: 'fix-dietitian-claims.mjs:41-42 — this literal is a dictionary key in full' },
  { id: 'R13', need: 'Free, accurate, dietitian-reviewed health tools for everyone.', repl: 'Free, accurate, medically reviewed health tools for everyone.', count: 1, why: 'fix-dietitian-claims.mjs:53' },
  { id: 'R14', need: 'registered dietitians and certified personal trainers reviewing every calculator and article', repl: 'our Lead Medical Reviewer checking every calculator and article', count: 1, why: 'fix-dietitian-claims.mjs:47-48' },
  { id: 'R15', need: 'written by clinical dietitians and exercise physiologists', repl: 'written and reviewed by our Lead Medical Reviewer', count: 1, why: 'fix-dietitian-claims.mjs:45-46' },

  // ---- invented date: nothing predates the repo's first commit (2026-05-26) ----
  {
    id: 'R16',
    need: 'lastUpdated:"November 1, 2025"',
    repl: 'lastUpdated:""',
    count: 5,
    why: 'Ri() renders d&&["Last updated: ",d], so the empty string deletes the line instead of leaving a dangling label. Same policy as scripts/date-stamp.mjs: no evidence, so delete the claim.',
  },

  // ---- the two date claims the app builds at RUNTIME, which no build step can reach ----
  // Qe is the shared lastUpdated for every calculator entry in zi (17 of them: weight-loss-percentage,
  // bmi, tdee, bmr, calorie, macro, body-fat, protein, water-intake, weight-loss, keto, newborn-weight-loss,
  // glp1, dog-weight-loss, peptide-dosage, bariatric, postpartum) and the component next to the citation
  // list renders it, so the site shows "Last updated: November 1, 2025" on those pages. The bundle file
  // itself entered this repository on 2026-05-26 and the repository starts the same day, so November 2025
  // is not stale - it is impossible.
  //
  // RETARGETING IT WAS MEASURED AND REJECTED. An earlier revision of this rule wrote Qe="2026-10-22",
  // this file's own newest-touch date, on the model of step 13's git-derived dateModified. Two facts kill
  // that: (1) Qe is ONE constant behind 17 different pages, so it claims all 17 were updated the day the
  // bundle was patched, while those pages' own HTML was last committed on 2026-10-20 - the visible line
  // would contradict the page's own evidenced schema date on every one of them; (2) it is a literal that
  // rots, which is the defect this patch exists to remove. So the whole claim is deleted instead: the
  // constant, the 17 fields that read it, and the text node that renders it. Nothing is substituted.
  //
  // EMPTINESS IS NOT AN OPTION HERE EITHER, and that is why R16 and R17 differ. R16's consumer is
  // `d && ["Last updated: ", d]`, so "" suppresses the line. R17's consumer at @485304 is UNGUARDED -
  // `new Date(g.lastUpdated).toLocaleDateString(...)` - and new Date("") or new Date(undefined) yields
  // the literal string "Invalid Date" on 17 live calculator pages. Deleting the rendered element is the
  // only removal that does not replace a false date with a broken one.
  {
    id: 'R17',
    structural: true,
    need: 'Qe="2025-11-01",',
    repl: '',
    count: 1,
    why: 'the shared calculator lastUpdated constant. Removing it makes the 17 `lastUpdated:Qe` fields below unreadable, so all 18 refs go in one pass and no identifier is left dangling.',
  },
  {
    id: 'R20',
    structural: true,
    need: ',lastUpdated:Qe',
    repl: '',
    count: 17,
    why: 'one whole `key:value` pair per calculator entry, each followed by `}` - balanced, so every object literal stays intact.',
  },
  {
    id: 'R21',
    structural: true,
    need: '"Last updated: ",new Date(g.lastUpdated).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})," ",',
    repl: '',
    count: 1,
    why: 'the rendered claim itself. Three whole array elements (label, formatted date, separator) go together, leaving children:["· Reviewed by the Weight Loss Percentage editorial team."] - the reviewer attestation survives, the unevidenced date does not.',
  },
  // The WebPage blocks the app injects per route carried a fabricated publish date and a client-clock
  // "modified" stamp: dateModified:new Date().toISOString().slice(0,10) reads as today EVERY time the
  // page is viewed, and it contradicts the git-derived dateModified in the same page's static
  // MedicalWebPage / WebApplication / FAQPage blocks. Measured on HEAD: the clock expression occurs 3x,
  // and all 3 are `dateModified:` inside a "WebPage" object (@303534, @488321, @509433); the 4th
  // `new Date()` in the file is the footer's getFullYear() copyright year, which is true and stays.
  // Deleting one 78-byte span covering both fields would overlap the bare dateModified deletion at
  // @488321, so the two fields are removed as separate DISJOINT spans instead - which keeps every rule
  // a whole-pair deletion, the only form the structural path allows. A structural edit is refused by
  // the default path and permitted only under `structural`, which requires the removed span to be
  // internally balanced and compiles the result before writing.
  {
    id: 'R18',
    structural: true,
    need: ',datePublished:"2025-01-01"',
    repl: '',
    count: 1,
    why: 'runtime WebPage JSON-LD publish date, 5 months before the repository\'s first commit - a claim this site cannot back. The static evidenced dates stay.',
  },
  {
    id: 'R19',
    structural: true,
    need: ',dateModified:new Date().toISOString().slice(0,10)',
    repl: '',
    count: 3,
    why: 'all three runtime WebPage blocks stamp the viewer\'s clock as dateModified, so "last modified" differs per visitor and contradicts the git-derived dateModified in the same page\'s static schema.',
  },
];

// Must survive untouched. The numbers are the calculator logic; the sentences are statements about
// the profession or advice to the reader, which are true and are KEEP in the HTML codemod too.
const KEEP = [
  '88.362', '447.593', '13.397', '4.799', '5.677', '9.247', '3.098', '4.33', '6.25', '21.6',
  '1.375', '1.725',
  `Harris${EN}Benedict (revised):`,
  'Mifflin MD',
  'Always seek the advice of your physician, registered dietitian, or other qualified healthcare provider',
  'This is why medical researchers, registered dietitians, and clinical fitness coaches',
  'pediatricians and dietitians use the Schofield equation',
  'The CDC and most major dietitian associations recommend',
  'Doctors, nutritionists, and biggest-loser style competitions',
];

// Every occurrence of these is covered by a rule, so the patched bundle must hold zero of them.
// Counts measured on the served copy before any edit: James Peterson 2 (R09), Dietitian-Reviewed 12
// (R10), Dietitian-reviewed 2 (R01+R03), dietitian-reviewed 5 (R11 2 + R12 1 + R13 1 + R14 1),
// Registered Dietitian 2 (R09), November 1 2025 5 (R16), the viewer-clock expression 3 (R19).
// A string here that occurs MORE times than the rules cover would make this guard unachievable, so
// preflight also requires each to be present beforehand - a zero-count assertion against an absent
// literal proves nothing.
const GONE = ['James Peterson', 'Dietitian-Reviewed', 'Dietitian-reviewed', 'dietitian-reviewed',
  'Registered Dietitian', 'November 1, 2025', 'datePublished:"2025-01-01"', 'Qe="2025-11-01"',
  'new Date().toISOString().slice(0,10)', ',lastUpdated:Qe', 'new Date(g.lastUpdated)'];

const abort = (msg, code) => { console.error(`\nABORT: ${msg}`); process.exit(code); };
const COUNTED = (hay, needle) => {
  // An empty needle matches at every index, so the loop below never terminates. Deletion rules have
  // repl === '' and must never be counted this way.
  if (needle === '') return 0;
  let n = 0;
  for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, at + 1)) n++;
  return n;
};

/** The double-quoted literal enclosing pos, honouring backslash escapes. */
function enclosing(src, pos) {
  let start = -1;
  for (let i = pos; i >= 0; i--) {
    if (src[i] !== '"') continue;
    let back = 0;
    for (let j = i - 1; j >= 0 && src[j] === '\\'; j--) back++;
    if (back % 2 === 0) { start = i; break; }
  }
  if (start < 0) return null;
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === '"') return { start, end: i, raw: src.slice(start, i + 1) };
  }
  return null;
}

const decode = (raw) => { try { return JSON.parse(raw); } catch { return null; } };
const encode = (s) => JSON.stringify(s);

/** [start, endInclusive] of every double-quoted literal in a span, honouring backslash escapes. */
function literalSpans(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '"') continue;
    let back = 0;
    for (let j = i - 1; j >= 0 && s[j] === '\\'; j--) back++;
    if (back % 2) continue;
    for (let k = i + 1; k < s.length; k++) {
      if (s[k] === '\\') { k++; continue; }
      if (s[k] !== '"') continue;
      out.push([i, k]); i = k; break;
    }
  }
  return out;
}
const literalsIn = (s) => literalSpans(s).map(([a, b]) => decode(s.slice(a, b + 1)));
/** The span with each string literal collapsed to one marker: the code shape around the words. */
const skeleton = (s) => {
  let out = '', at = 0;
  for (const [a, b] of literalSpans(s)) { out += s.slice(at, a) + '\x00'; at = b + 1; }
  return out + s.slice(at);
};

/**
 * Do the code delimiters in a span balance pairwise once its string literals are collapsed?
 * A whole-span deletion is syntactically safe only if it removes complete bracket groups and never
 * closes a bracket that opened outside the span. Necessary, not sufficient: the decisive proof is
 * compiling the prospective bundle, which the --write path does before it touches the disk.
 */
function balancedOutsideStrings(s) {
  const sk = skeleton(s);
  const MATCH = { '(': ')', '[': ']', '{': '}' };
  const NEAR = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const c of sk) {
    if (MATCH[c]) stack.push(c);
    else if (NEAR[c]) { if (stack.pop() !== NEAR[c]) return false; }
  }
  return stack.length === 0;
}

/** Every index.html under the trees that carry a runtime translation dictionary. */
function dictFiles() {
  const out = [];
  for (const tree of ['zh', 'ru']) {
    const stack = [path.join(ROOT, tree)];
    while (stack.length) {
      const dir = stack.pop();
      let ents;
      try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of ents) {
        if (e.isDirectory()) { stack.push(path.join(dir, e.name)); continue; }
        if (e.name === 'index.html') {
          const abs = path.join(dir, e.name);
          let head;
          try { head = fs.readFileSync(abs).subarray(0, 400_000).toString('utf8'); } catch { continue; }
          if (head.includes('window.__TRANSLATIONS__')) out.push(path.relative(ROOT, abs).split(path.sep).join('/'));
        }
      }
    }
  }
  return out;
}

/** Extract the __TRANSLATIONS__ object literally, by brace-matching from its opening brace. */
function extractDict(html) {
  const i = html.indexOf('window.__TRANSLATIONS__');
  if (i < 0) return null;
  const open = html.indexOf('{', i);
  if (open < 0) return null;
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let j = open; j < html.length; j++) {
    const c = html[j];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end < 0) return null;
  try { return { open, end, obj: JSON.parse(html.slice(open, end + 1)) }; } catch { return null; }
}

// ---------------------------------------------------------------- load
const srcs = BUNDLES.map((b) => {
  const p = path.join(ROOT, b);
  if (!fs.existsSync(p)) abort(`${b} not found`, 5);
  return fs.readFileSync(p, 'utf8');
});
const src = srcs[0];
const srcBytes = Buffer.byteLength(src, 'utf8');
console.log(`bundle (served): ${BUNDLES.join(', ')}  chars=${src.length} bytes=${srcBytes}`);

// The whole reason this tool picks one of the two copies is that the build overwrites public/. If a
// dist3 is on disk, check that premise against its bytes instead of trusting the reading of
// astro.config.mjs: patching a file the artifact does not contain would fix nothing.
for (const b of BUNDLES) {
  const built = path.join(ROOT, 'dist3', b);
  if (!fs.existsSync(built)) continue;
  const mine = srcs[0];
  const theirs = fs.readFileSync(built, 'utf8');
  if (mine === theirs) console.log(`  dist3/${b}: identical to the file being patched (premise holds)`);
  else abort(`dist3/${b} differs from ${b} (${theirs.length} vs ${mine.length} chars). The artifact in dist3 is not built from the bytes this tool would edit - re-check which copy the build serves before patching.`, 5);
}

// Report, never patch, the other tracked copy. Its residual claims are what makes it a hazard: the
// name is the same, so any change to the copy order in astro.config.mjs would put them on screen.
for (const b of OTHER_COPIES) {
  const p = path.join(ROOT, b);
  if (!fs.existsSync(p)) continue;
  const other = fs.readFileSync(p, 'utf8');
  const residual = ['James Peterson', 'Dietitian-Reviewed', 'Dietitian-reviewed', 'dietitian-reviewed',
    'LDN', 'Registered Dietitian', 'November 1, 2025']
    .filter((n) => COUNTED(other, n) > 0)
    .map((n) => `${n} x${COUNTED(other, n)}`);
  console.log(`  ${b}: NOT the served build (${other.length} chars vs ${src.length}), same content-hashed name, still carries [${residual.join(', ')}] - left untouched, and is the copy to delete or re-sync.`);
}

const DICTS = dictFiles();
const keyOwners = new Map(); // key -> Set<file>
let unparseable = 0;
for (const rel of DICTS) {
  const d = extractDict(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  if (!d) { unparseable++; continue; }
  for (const k of Object.keys(d.obj)) {
    if (!keyOwners.has(k)) keyOwners.set(k, new Set());
    keyOwners.get(k).add(rel);
  }
}
console.log(`dictionaries: files=${DICTS.length} unparseable=${unparseable} distinctKeys=${keyOwners.size}\n`);
if (unparseable) abort(`${unparseable} dictionary file(s) do not parse - a key rename there cannot be verified.`, 6);

// ---------------------------------------------------------------- preflight
let blocked = 0;
const sites = [];                 // {at, rule}
const moves = new Map();          // oldLiteral -> {new, rules:Set<id>, keys:boolean}

for (const r of RULES) {
  const hits = [];
  for (let at = src.indexOf(r.need); at >= 0; at = src.indexOf(r.need, at + 1)) hits.push(at);
  if (hits.length !== r.count) {
    console.log(`BLOCKED  ${r.id}  sites=${hits.length}, expected ${r.count}`);
    console.log(`         ${r.why}\n`);
    blocked++;
    continue;
  }

  const notes = [];
  const info = [];
  let bad = false;
  let moved = 0;
  for (const at of hits) {
    let pairs;
    if (r.structural) {
      // A structural rule changes code shape rather than string content, so the skeleton-equality
      // proof below cannot apply to it. It is permitted only as a WHOLE-SPAN DELETION, and only when
      // the span is internally balanced: removing a complete `key:value,` pair from an object literal
      // leaves the syntax intact, removing half of one does not. The prospective bundle is then
      // compiled, which is the actual proof.
      if (r.repl !== '') { notes.push(`@${at}: structural rules may only delete (repl must be '')`); bad = true; }
      if (!balancedOutsideStrings(r.need)) { notes.push(`@${at}: the deleted span is not internally balanced outside its string literals - it would cut an expression in half`); bad = true; }
      if (literalSpans(r.need).some(([a, b]) => decode(r.need.slice(a, b + 1)) === null)) { notes.push(`@${at}: a literal inside the deleted span does not decode`); bad = true; }
      if (bad) continue;
      info.push(`@${at}: structural deletion of ${r.need.length} bytes (balanced; the result must compile)`);
      sites.push({ at, r });
      continue;
    } else if (literalSpans(r.need).length > 0) {
      // A code-spanning needle (author:{name:"…",role:"…"} or lastUpdated:"…") is deliberately
      // chosen to straddle string literals, because that is what makes it unique in minified
      // source. It therefore cannot be tested against one enclosing literal. Pair the two spans'
      // literals positionally instead, and require equal skeletons: a rule may change text INSIDE a
      // string, never a property name, an operator, or a number.
      const a = literalsIn(r.need), b = literalsIn(r.repl);
      if (a.some((x) => x === null) || b.some((x) => x === null)) { notes.push(`@${at}: a literal in the span does not decode as JSON`); bad = true; continue; }
      if (skeleton(r.need) !== skeleton(r.repl)) { notes.push(`@${at}: need and repl differ OUTSIDE their string literals - a structural edit, refused`); bad = true; continue; }
      if (a.length !== b.length) { notes.push(`@${at}: ${a.length} literals in need, ${b.length} in repl`); bad = true; continue; }
      if (a.every((x, i) => x === b[i])) { notes.push(`@${at}: every literal in the span is unchanged, so the rule is a no-op`); bad = true; continue; }
      pairs = a.map((o, i) => ({ old: o, next: b[i] }));
    } else {
      const e = enclosing(src, at);
      if (!e) { notes.push(`no enclosing string literal at ${at}`); bad = true; continue; }
      const lit = decode(e.raw);
      if (lit === null) { notes.push(`literal @${at} does not decode as JSON`); bad = true; continue; }
      if (!lit.includes(r.need)) { notes.push(`needle not inside its own literal @${at}`); bad = true; continue; }
      if (COUNTED(lit, r.need) !== 1) { notes.push(`@${at}: the needle occurs ${COUNTED(lit, r.need)}x inside one literal, so the whole-literal rewrite is ambiguous`); bad = true; continue; }
      const next = lit.split(r.need).join(r.repl);
      if (next === lit) { notes.push(`@${at}: replacement is a no-op inside this literal`); bad = true; continue; }
      pairs = [{ old: lit, next }];
    }

    for (const { old, next } of pairs) {
      const oldIsKey = keyOwners.has(old), newIsKey = keyOwners.has(next);
      if (!oldIsKey) {
        if (newIsKey) info.push(`@${at}: was not a key; the new text matches an existing key in ${keyOwners.get(next).size} file(s) whose value was written for a different node - verify the rendered locale page`);
        continue;
      }
      // A rewritten key only has to MOVE when the new text is not itself already a key. When both
      // sides are keys, the dictionary translates the new node on its own and the old key becomes
      // an orphan - invisible and harmless. Renaming onto an existing key would instead create a
      // duplicate key in the object literal, whose surviving value is undefined.
      if (newIsKey) { info.push(`@${at}: no move needed - "${old.slice(0, 44)}…" and "${next.slice(0, 44)}…" are both keys (${keyOwners.get(next).size} files)`); continue; }
      if (!r.couple) { notes.push(`@${at}: "${old.slice(0, 48)}…" IS a dict key in ${keyOwners.get(old).size} file(s) and the new text is not a key -> zh/ru fall back to English unless the key moves (declare couple)`); bad = true; continue; }
      const clash = [...moves].find(([o, rec]) => o !== old && rec.newLit === next);
      if (clash) { notes.push(`@${at}: two different old keys would rename onto "${next.slice(0, 44)}…"`); bad = true; continue; }
      const rec = moves.get(old) || { newLit: next, rules: new Set(), conflict: null };
      if (rec.newLit !== next) { rec.conflict = 'two rules rewrite the same key to different values'; bad = true; }
      rec.rules.add(r.id);
      moves.set(old, rec);
      moved++;
    }
    sites.push({ at, r });
  }

  console.log(`${bad ? 'BLOCKED' : 'OK '}  ${r.id}  sites=${hits.length} (expected ${r.count})${moved ? `  [key move x${moved}]` : r.couple ? '  [no move needed]' : ''}`);
  console.log(`         ${r.why}`);
  for (const n of notes) console.log(`         !! ${n}`);
  for (const n of info) console.log(`         ii ${n}`);
  if (bad) blocked++;
  console.log('');
}

const keepBefore = KEEP.map((k) => [k, COUNTED(src, k)]);
for (const g of GONE) {
  const c = COUNTED(src, g);
  if (c === 0) { console.log(`BLOCKED  claim anchor "${g}" occurs 0 times before the patch, so "must be 0 after" is vacuous - the claim is already gone or the anchor is wrong.`); blocked++; }
  else console.log(`claim present before patch: ${String(c).padStart(3)} x ${JSON.stringify(g)}`);
}
console.log('');
// A replacement string may already occur in the bundle for legitimate reasons, so the post-write
// assertion is "baseline + this rule's sites", not "exactly this rule's count".
const replBaseline = new Map(RULES.map((r) => [r.id, COUNTED(src, r.repl)]));
for (const [k, c] of keepBefore) if (c === 0) { console.log(`BLOCKED  KEEP anchor "${k.slice(0, 50)}" occurs 0 times - the assumption it guards is already false.`); blocked++; }

// mechanical safety of each key move, per dictionary file
console.log(`dictionary key moves required: ${moves.size}`);
for (const [oldLit, rec] of moves) {
  const owners = keyOwners.get(oldLit);
  const tokOld = encode(oldLit), tokNew = encode(rec.newLit);
  let exactOne = 0, newPresent = 0, notKeyPosition = 0;
  for (const rel of owners) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const cOld = COUNTED(html, tokOld), cNew = COUNTED(html, tokNew);
    if (cOld === 1) exactOne++;
    if (cNew > 0) newPresent++;
    const at = html.indexOf(tokOld);
    if (at >= 0 && !/^\s*:/.test(html.slice(at + tokOld.length))) notKeyPosition++;
  }
  const ok = exactOne === owners.size && newPresent === 0 && notKeyPosition === 0;
  console.log(`  ${ok ? 'OK ' : 'BAD'}  ${owners.size} files  ${JSON.stringify(oldLit.slice(0, 58))} -> ${JSON.stringify(rec.newLit.slice(0, 58))}` +
    `  [one-token ${exactOne}/${owners.size}, new-token-present ${newPresent}, not-in-key-position ${notKeyPosition}]${rec.conflict ? ' CONFLICT ' + rec.conflict : ''}`);
  if (!ok || rec.conflict) blocked++;
}
console.log('');

console.log('KEEP assertions (count now must equal count after):');
for (const [k, c] of keepBefore) console.log(`  ${String(c).padStart(3)}  ${JSON.stringify(k.slice(0, 64))}`);
console.log('');

if (blocked) abort(`preflight found ${blocked} problem(s); nothing written.`, 1);
const touchedDicts = new Set();
for (const [oldLit] of moves) for (const rel of keyOwners.get(oldLit)) touchedDicts.add(rel);
console.log(`PREFLIGHT OK: ${RULES.length} rules, ${sites.length} bundle sites, ${moves.size} key moves over ${touchedDicts.size} dictionary files.\n`);

if (!WRITE) { console.log('dry run - pass --write to apply.'); process.exit(0); }

// ---------------------------------------------------------------- write the bundle
sites.sort((a, b) => b.at - a.at);
let out = src;
for (const { at, r } of sites) {
  if (out.slice(at, at + r.need.length) !== r.need) abort(`byte mismatch at ${at} for ${r.id}`, 2);
  out = out.slice(0, at) + r.repl + out.slice(at + r.need.length);
}
for (const [k, expected] of keepBefore) {
  const now = COUNTED(out, k);
  if (now !== expected) abort(`KEEP literal moved: ${JSON.stringify(k)} ${expected} -> ${now}. Calculator logic is out of scope; refusing.`, 3);
}
for (const r of RULES) {
  if (COUNTED(out, r.need) !== 0) abort(`${r.id} needle still present ${COUNTED(out, r.need)}x after patch`, 4);
  if (r.repl === '') continue; // a deletion rule has no replacement string to count
  const want = replBaseline.get(r.id) + r.count;
  const got = COUNTED(out, r.repl);
  if (got !== want) abort(`${r.id} replacement count ${got}, expected ${want} (baseline ${replBaseline.get(r.id)} + ${r.count} sites)`, 4);
}
for (const g of GONE) {
  const left = COUNTED(out, g);
  if (left) abort(`${left} x "${g}" still present in the patched bundle - a claim this run exists to remove survived`, 4);
}
// The decisive proof for a structural deletion, and a cheap one for every literal rewrite: the
// prospective bundle must still parse. These bytes execute on every SPA route, so a syntax error is
// not a bad string, it is a blank page site-wide.
//
// It has to be a MODULE parse: the bundle opens with `import{h as Yf,...}`, which vm.Script rejects
// ("Cannot use import statement outside a module") for a reason that has nothing to do with the
// edit. `node --check` on a .mjs uses the same parser Node uses at load time and no flag.
// Proven able to fail: the identical deletion WITHOUT its leading comma exits 1 against this check,
// while the rule's span exits 0. A gate that cannot fail is not a gate.
const probe = path.join(os.tmpdir(), `wl-bundle-syntax-${process.pid}.mjs`);
fs.writeFileSync(probe, out, 'utf8');
const check = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8' });
fs.rmSync(probe, { force: true });
if (check.status !== 0) {
  // Node echoes the entire minified line, which is ~600 KB. The first lines carry the error.
  const brief = String(check.stderr || '').split('\n').slice(0, 4).map((l) => l.slice(0, 200)).join('\n');
  abort(`patched bundle does not parse as an ES module:\n${brief}`, 4);
}
console.log(`patched bundle parses as an ES module (node --check over ${out.length} chars)`);
for (const b of BUNDLES) fs.writeFileSync(path.join(ROOT, b), out, 'utf8');
console.log(`bundle: ${src.length} -> ${out.length} chars (${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length}), ${sites.length} sites written to ${BUNDLES.join(', ')}.`);

// Record the pre-state of every dictionary we are about to write, so the value can be proven to
// have survived the rename rather than merely "some key with that name exists".
const preState = new Map(); // rel -> {values: Map<newLit, string>, keyCount: number}
for (const [oldLit, rec] of moves) {
  for (const rel of keyOwners.get(oldLit)) {
    if (!preState.has(rel)) {
      const d = extractDict(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
      preState.set(rel, { values: new Map(), keyCount: Object.keys(d.obj).length });
    }
    const d = extractDict(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    preState.get(rel).values.set(rec.newLit, JSON.stringify(d.obj[oldLit]));
  }
}

const failures = [];
const report = new Map();
for (const [oldLit] of moves) report.set(oldLit, { done: 0 });

for (const [oldLit, rec] of moves) {
  const tokOld = encode(oldLit), tokNew = encode(rec.newLit);
  for (const rel of keyOwners.get(oldLit)) {
    const abs = path.join(ROOT, rel);
    const html = fs.readFileSync(abs, 'utf8');
    const at = html.indexOf(tokOld);
    const next = html.slice(0, at) + tokNew + html.slice(at + tokOld.length);
    if (COUNTED(next, tokOld) !== 0) { failures.push(`${rel}: old key token still present`); continue; }
    if (next.length !== html.length + (tokNew.length - tokOld.length)) { failures.push(`${rel}: unexpected length delta`); continue; }
    fs.writeFileSync(abs, next, 'utf8');
    report.get(oldLit).done++;
  }
}
const renamed = [...report.values()].reduce((a, b) => a + b.done, 0);
console.log(`keys renamed: ${renamed}`);

// ---------------------------------------------------------------- verify dictionaries
let bad = 0;
for (const [rel, pre] of preState) {
  const d = extractDict(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  if (!d) { console.error(`  !! ${rel}: dictionary no longer parses`); bad++; continue; }
  if (Object.keys(d.obj).length !== pre.keyCount) {
    console.error(`  !! ${rel}: key count ${pre.keyCount} -> ${Object.keys(d.obj).length}`); bad++; continue;
  }
  for (const [newLit, value] of pre.values) {
    if (!Object.prototype.hasOwnProperty.call(d.obj, newLit)) { console.error(`  !! ${rel}: ${JSON.stringify(newLit.slice(0, 50))} absent`); bad++; continue; }
    if (JSON.stringify(d.obj[newLit]) !== value) { console.error(`  !! ${rel}: value changed for ${JSON.stringify(newLit.slice(0, 50))}`); bad++; continue; }
  }
}
for (const [oldLit] of moves) {
  for (const rel of keyOwners.get(oldLit)) {
    const d = extractDict(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    if (d && Object.prototype.hasOwnProperty.call(d.obj, oldLit)) { console.error(`  !! ${rel}: old key still resolves`); bad++; }
  }
}
console.log(`dictionary verification: ${renamed} keys across ${preState.size} files re-parsed, values identical, ${bad} problems.`);
if (bad || failures.length) { for (const f of failures) console.error(`  !! ${f}`); abort(`${bad + failures.length} dictionary file(s) failed verification`, 7); }

// ---------------------------------------------------------------- final parity
for (const b of BUNDLES) {
  const t = fs.readFileSync(path.join(ROOT, b), 'utf8');
  if (t !== out) abort(`${b} is not byte-identical to the patched output`, 8);
}
console.log(`\ndone. ${BUNDLES.join(', ')} patched at ${Buffer.byteLength(out, 'utf8')} bytes; ${moves.size} dictionary key(s) moved with their values intact.`);
