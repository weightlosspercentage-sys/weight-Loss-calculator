// "Dietitian-reviewed" is a fabricated credential. Every page's own Person schema declares
// exactly one reviewer — Dr. Rekha Kumar, M.D., M.S., Lead Medical Reviewer — with no
// dietetics credential, yet the served metas, JSON-LD, visible copy and runtime i18n
// dictionaries assert dietitian review and, on ru/zh, a person who does not exist
// ("James Peterson, RD"). Correct the claim wherever this repo controls the text.
//
// Deliberately out of scope:
//   - this file            (its own patterns are the strings being replaced)
//   - *.md                 (Memory.md records this correction verbatim)
//   - *.py                 (one-off page patchers, none of them in `astro build`. Editing the
//     literals inside them would rewrite strings whose whole corpus is already deleted.)
//   - assets/index-*.js    (prebuilt minified React, no source here. translateText() in the
//     bundle looks up window.__TRANSLATIONS__[<english literal from the bundle>], so the
//     dictionary KEYS must stay byte-identical or the bundle falls back to its own invented
//     string on screen. Keys are therefore preserved; values are corrected.)
// The rebuild path IS closed: astro.config.mjs contains no such literal, and SEO.astro:155,
// Footer.astro:101 and :222 and eeat-enrich.mjs:232 are all caught by the rules below.
// Nothing here matches "consult a registered dietitian" / "педиатры и диетологи используют" /
// "儿科医生和营养师使用", which are statements about the field or advice to the reader.
//
// Usage: node scripts/fix-dietitian-claims.mjs [--write]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const SKIP_DIRS = new Set(['node_modules', 'dist3', 'dist3_backup', '.git', '.cache', 'weightlosspercentage.com-audit']);
const IN_SCOPE = /\.(html|astro|ts|tsx|txt|xml|mjs)$/i;
const isBundle = (name) => /^index-[A-Za-z0-9_-]{6,}\.js$/.test(name);

// Specific sentences first, then the general compound, so no broad rule swallows an exact one.
const FIXES = [
  [/By James Peterson, RD \| (\d+) min read/g, 'By Dr. Rekha Kumar, M.D., M.S. | $1 min read'],
  [/James Peterson, RD \(Registered Dietitian\)/g, 'Dr. Rekha Kumar, M.D., M.S. (Lead Medical Reviewer)'],
  [/James is a registered dietitian specializing in sports nutrition and accurate body composition modeling\./g,
    'Reviewed by Dr. Rekha Kumar, M.D., M.S., our Lead Medical Reviewer.'],
  [/Meet the team of clinical dietitians and experts behind our free, evidence-based health, fitness, and nutrition calculators/g,
    'Our Lead Medical Reviewer, Dr. Rekha Kumar, M.D., M.S., reviews every calculator'],
  [/Our team is composed of registered dietitians, clinical nutritionists, and exercise physiologists who review our tools, formulas, and articles/g,
    'Our Lead Medical Reviewer, Dr. Rekha Kumar, M.D., M.S., reviews our tools, formulas, and articles'],
  [/Meet the team behind our free, dietitian-reviewed health tools/g,
    'Meet the physician behind our free, medically reviewed health tools'],
  [/Articles are reviewed by a registered dietitian before publication/g,
    'Articles are reviewed by our Lead Medical Reviewer before publication'],
  [/written by clinical dietitians and exercise physiologists/g,
    'written and reviewed by our Lead Medical Reviewer'],
  [/registered dietitians and certified personal trainers reviewing every calculator and article/g,
    'our Lead Medical Reviewer checking every calculator and article'],
  [/A clinical dietitian-reviewed guide/g, 'A medically reviewed guide'],
  [/Free dietitian-reviewed/g, 'Free, medically reviewed'],
  [/Dietitian-reviewed/g, 'Medically reviewed'],
  [/Dietitian-Reviewed/g, 'Medically Reviewed'],
  [/dietitian-reviewed/g, 'medically reviewed'],
  // The 15k files already rewritten by the interrupted pass carry the old replacement text,
  // which collided with the sentence period the source kept ("…M.S." + "." → "M.S..").
  [/M\.S\.\./g, 'M.S.'],
];

// ru/zh: the dictionary VALUES are what those readers see. Phrase-anchored so the legitimate
// "consult a physician, pediatrician, registered dietitian" and "pediatricians and dietitians
// use the Schofield equation" sentences cannot be touched.
const LOCALE_FIXES = [
  // Russian
  [/Наша команда состоит из дипломированных диетологов, клинических диетологов и физиологов-физкультурников, которые проверяют наши инструменты/g,
    'Ведущий медицинский редактор проверяет наши инструменты'],
  [/Познакомьтесь с командой наших бесплатных, проверенных диетологами инструментов для здоровья\./g,
    'Познакомьтесь с нашим ведущим медицинским редактором — д-ром Рекой Кумар, M.D., M.S.'],
  [/написанные клиническими диетологами и физиологами/g, 'проверенные нашим медицинским редактором'],
  [/Джеймс Петерсон, доктор медицинских наук \(зарегистрированный диетолог\)/g,
    'Д-р Река Кумар, M.D., M.S. (ведущий медицинский редактор)'],
  [/Джеймс Петерсон, доктор медицинских наук \| (\d+) минут чтения/g, 'Д-р Река Кумар, M.D., M.S. | $1 минут чтения'],
  [/Джеймс — дипломированный диетолог, специализирующийся на спортивном питании и точном моделировании состава тела\./g,
    'Материалы проверены нашим ведущим медицинским редактором — д-ром Рекой Кумар, M.D., M.S.'],
  [/\s*\|\s*Блог с отзывами диетологов/g, ''],
  [/Блог с отзывами диетологов/g, 'Медицински проверенный блог'],
  [/Познакомьтесь с командой клинических диетологов и экспертов, создающих наши бесплатные, основанные на фактических данных калькуляторы здоровья, фитнеса и питания\./g,
    'Все наши бесплатные калькуляторы здоровья, фитнеса и питания проверяет ведущий медицинский редактор — д-р Река Кумар, M.D., M.S.'],
  [/Проверено диетологом\./g, 'Проверено врачом.'],
  [/Проверено диетологом/g, 'Проверено врачом'],
  [/Отзыв диетолога,/g, 'Медицински проверено,'],
  [/проверенн(?:ые|ых|ое|ой) клиническими диетологами/g, (m) => m.replace(/клиническими диетологами/, 'врачом')],
  [/проверенн(?:ые|ых|ое|ой) диетологами/g, (m) => m.replace(/диетологами/, 'врачом')],
  // Chinese
  [/我们的团队由注册营养师、临床营养师和运动生理学家组成，他们审查我们的工具、公式和文章/g,
    '首席医学审核人审查我们的工具、公式和文章'],
  [/阅读临床营养师和运动生理学家撰写的循证指南/g, '阅读经医学审核的循证指南'],
  [/詹姆斯·彼得森，RD（注册营养师）/g, 'Rekha Kumar 医生（M.D., M.S.，首席医学审核人）'],
  [/作者：James Peterson，RD/g, '作者：Rekha Kumar 医生（M.D., M.S.）'],
  [/詹姆斯是一名注册营养师，专门从事运动营养和准确的身体成分建模。/g,
    '内容由首席医学审核人 Rekha Kumar 医生（M.D., M.S.）审核。'],
  [/临床营养师和专家团队/g, '医学审核人'],
  [/临床营养师审查的/g, '医学审核的'],
  [/\s*\|\s*营养师审查的博客/g, ''],
  [/营养师-2026 年审查/g, '2026 年医学审核'],
  [/经过营养师审查/g, '经过医学审核'],
  [/营养师审查指南/g, '医学审核指南'],
  [/营养师审查/g, '医学审核'],
];

const counts = new Map([...FIXES, ...LOCALE_FIXES].map((_, i) => [i, { hits: 0, files: 0 }]));

// Accumulate hit counts as the rules run. The head/tail/dictionary spans of a file are
// disjoint, so a replacement is counted once per occurrence even though applyAll runs
// several times per file; `files` stays a per-file Set because a rule hit twice in one file
// must not read as two files.
const applyAll = (text, table, hitRules) => {
  let out = text;
  let hits = 0;
  table.forEach(([re, to], i) => {
    const found = out.match(re) || [];
    if (!found.length) return;
    hits += found.length;
    counts.get(i).hits += found.length;
    hitRules.add(i);
    out = out.replace(re, to);
  });
  return { out, hits };
};

/**
 * Braces of the window.__TRANSLATIONS__ object, quote-aware. Returns [start, end) covering
 * the `{...}`, or null.
 */
function blobSpan(src) {
  const at = src.indexOf('window.__TRANSLATIONS__');
  if (at < 0) return null;
  const open = src.indexOf('{', at);
  if (open < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return [open, i + 1]; }
  }
  return null;
}

const ALL_RULES = [...FIXES, ...LOCALE_FIXES];

/**
 * Rewrite only the string VALUES of the flat dictionary. Keys are the bundle's lookup
 * strings and stay byte-for-byte identical; a string followed by `:` is a key.
 */
function fixDictionaryValues(blobText, hitRules) {
  const strs = [...blobText.matchAll(/"(?:[^"\\]|\\.)*"/g)];
  let out = '';
  let cursor = 0;
  let changed = 0;
  for (const m of strs) {
    const after = blobText.slice(m.index + m[0].length).match(/^\s*:/);
    out += blobText.slice(cursor, m.index);
    cursor = m.index + m[0].length;
    if (after) { out += m[0]; continue; }
    const raw = m[0].slice(1, -1);
    const res = applyAll(raw, ALL_RULES, hitRules);
    changed += res.hits;
    // A value that still asserts the credential after every rule is a gap in the tables,
    // not a legitimate mention: keys never reach here, and reader-facing advice about
    // dietitians as a profession does not match these phrase-anchored patterns.
    for (const s of res.out.matchAll(/[^<>]{0,50}(?:dietiti|диетолог|营养师)[^<>]{0,50}/gi)) {
      const key = s[0].replace(/\s+/g, ' ').trim();
      claimResidual.set(key, (claimResidual.get(key) || 0) + 1);
    }
    out += '"' + res.out + '"';
  }
  out += blobText.slice(cursor);
  return { out, changed };
}

let scanned = 0, matchedFiles = 0, changedFiles = 0, dictStrings = 0, blobFiles = 0, skippedBlobs = 0, blobNotJson = 0;
const residual = new Map();
const claimResidual = new Map();

const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); continue; }
    if (!IN_SCOPE.test(e.name) || isBundle(e.name) || e.name === 'fix-dietitian-claims.mjs') continue;
    let src;
    try { src = fs.readFileSync(p, 'utf8'); } catch { continue; }
    scanned++;
    // Prefilter must also admit the "M.S.." artifact: the interrupted first pass emptied some
    // files of every claim stem, and those files still need the punctuation cleanup.
    if (!/dietiti|peterson|диетолог|营养师|M\.S\.\./i.test(src)) continue;

    const hitRules = new Set();
    const span = blobSpan(src);
    let out;
    if (span) {
      blobFiles++;
      const blobText = src.slice(span[0], span[1]);
      // Mass write needs a corruption guard: only ship a rewritten dictionary if it still
      // parses. A bad rewrite would blank every translated string on the page.
      let verifiable = true;
      try { JSON.parse(blobText); } catch { verifiable = false; blobNotJson++; }
      const head = applyAll(src.slice(0, span[0]), ALL_RULES, hitRules).out;
      const tail = applyAll(src.slice(span[1]), ALL_RULES, hitRules).out;
      const dict = fixDictionaryValues(blobText, hitRules);
      let dictApplied = true;
      if (verifiable) {
        try { JSON.parse(dict.out); } catch { dictApplied = false; skippedBlobs++; }
      }
      if (dictApplied) dictStrings += dict.changed;
      else dict.out = blobText;
      out = head + dict.out + tail;
    } else {
      out = applyAll(src, ALL_RULES, hitRules).out;
    }

    for (const i of hitRules) { counts.get(i).files++; }
    if (out !== src) {
      matchedFiles++;
      if (WRITE) { try { fs.writeFileSync(p, out); changedFiles++; } catch (err) { console.error(`write failed ${p}: ${err.message}`); } }
    }
    for (const m of out.matchAll(/[^<>"]{0,60}dietiti[^<>"]{0,60}/gi)) {
      const key = m[0].replace(/\s+/g, ' ').trim();
      residual.set(key, (residual.get(key) || 0) + 1);
    }
    if (scanned % 5000 === 0) process.stderr.write(`scanned ${scanned}...\n`);
  }
};
walk(ROOT);

console.log(`${WRITE ? 'APPLIED' : 'DRY RUN'}: scanned=${scanned} filesMatched=${matchedFiles} changed=${changedFiles} dictionaryFiles=${blobFiles} dictionaryValuesRewritten=${dictStrings} dictionariesSkippedUnparseable=${skippedBlobs} dictionariesNotJson=${blobNotJson}`);
console.log('--- rules:');
ALL_RULES.forEach((f, i) => {
  const r = counts.get(i);
  if (!r.hits) return;
  console.log(`  ${String(r.hits).padStart(7)} hits / ${String(r.files).padStart(6)} files  ${String(f[0]).slice(1, 52)}... -> ${typeof f[1] === 'function' ? '(fn)' : String(f[1]).slice(0, 40)}`);
});
console.log(`--- claims left in dictionary VALUES (${claimResidual.size} distinct; 0 expected):`);
for (const [k, v] of [...claimResidual].sort((a, b) => b[1] - a[1]).slice(0, 14)) {
  console.log(`  ${String(v).padStart(6)}  ${k.slice(0, 150)}`);
}
console.log(`--- residual "dietiti*" anywhere (${residual.size} distinct; English dictionary keys are expected):`);
for (const [k, v] of [...residual].sort((a, b) => b[1] - a[1]).slice(0, 14)) {
  console.log(`  ${String(v).padStart(6)}  ${k.slice(0, 150)}`);
}
