// Remove or correct claims this site cannot back, in the committed HTML source.
//
// Evidence for every rule lives in the plan (gentle-plateau-carp.md) and in the
// measurements under scratch/. In short:
//
//   #52  The BMR, TDEE, calorie and weight-loss widgets do NOT compute Mifflin-St Jeor.
//        Read out of assets/index-Ctp2HkQJ.js: the BMR widget is the revised
//        Harris-Benedict equation (88.362 + 13.397*W + 4.799*H - 5.677*A for men,
//        447.593 + 9.247*W + 3.098*H - 4.33*A for women, rounded, no multiplier);
//        TDEE and calorie multiply that same result by 1.2/1.375/1.55/1.725/1.9.
//        Mifflin-St Jeor appears exactly once in the bundle and it is the postpartum
//        calculator (female constant hard-coded, plus a breastfeeding adder).
//        Katch-McArdle is implemented nowhere: its required coefficient 21.6 occurs
//        twice, both inside markdown prose strings.
//        Memory.md s6 Rule 4 forbids naming a method the tool does not use, so the
//        label AND the displayed coefficients move together, transcribed from the
//        bundle rather than recalled.
//
//   #50  "Trusted and used by 50,000+ parents" - the repo's own Search Console export
//        (Pages.csv, 2026-03-22..2026-09-06) sums the whole site to 162 clicks. The
//        English original and /us/ never carried the sentence; the live bundle does not
//        contain it either. Deleted, not reworded.
//
//   #51  "for thousands of foods" - the site ships 12 restaurant pages and no food
//        database. Clause deleted.
//
//   #70  "Tailored for UK users" and "fast food nutrition in the UK" sit in the ae, cn,
//        sg, de, es, fr, it, ja, ko, pt trees, where they are false. Kept in /uk/.
//
// Scope guards:
//   * window.__TRANSLATIONS__ is masked out. Its keys are the bundle's English lookup
//     strings and must stay byte-for-byte identical; a key rewritten here stops every
//     translated value resolving. Only text outside the dictionary is edited.
//   * calculators/calorie-deficit/ is deliberately untouched: it names Mifflin-St Jeor,
//     displays Mifflin-St Jeor's coefficients, and its inline JS computes Mifflin-St
//     Jeor (6.25 three times, no Harris-Benedict coefficient anywhere). Self-consistent.
//   * Comparative blog prose and bare PubMed citations ("Mifflin MD, St Jeor ST, et al.")
//     are legitimate reference content and stay.
//
// Usage:  node scripts/fix-invented-claims.mjs <file-list>          # dry run
//         node scripts/fix-invented-claims.mjs <file-list> --write  # apply

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WRITE = process.argv.includes('--write');
const RESIDUE = process.argv.includes('--residue');

/** @type {{id:string, from:string, to:string, why:string, path?:RegExp}[]} */
const RULES = [
  // ---- #50 invented user count -------------------------------------------------
  { id: 'A1', from: 'Trusted and used by 50,000+ parents. ', to: '', why: 'invented statistic, refuted by the site\'s own GSC export' },

  // ---- #51 invented quantity --------------------------------------------------
  { id: 'B1', from: 'calories, protein, carbs, and fat for thousands of foods.', to: 'calories, protein, carbs, and fat.', why: 'no food database; 12 restaurant pages' },

  // ---- #70 geo-targeting residue ----------------------------------------------
  { id: 'C1', from: ' Tailored for UK users.', to: '', why: 'false outside /uk/', path: /^(?!uk\/).*\/index\.html$/ },
  { id: 'C2', from: 'fast food nutrition in the UK.', to: 'fast food nutrition.', why: 'false outside /uk/', path: /^(?!uk\/).*\/index\.html$/ },

  // ---- #52 BMR page -----------------------------------------------------------
  { id: 'D1', from: 'using Mifflin-St Jeor and Katch-McArdle (Katch McArdle equation) formulas.', to: 'using the revised Harris-Benedict equation.', why: 'widget computes Harris-Benedict; Katch-McArdle is unimplemented' },
  { id: 'D2', from: 'using Mifflin-St Jeor and Katch-McArdle formulas.', to: 'using the revised Harris-Benedict equation.', why: 'widget computes Harris-Benedict; Katch-McArdle is unimplemented' },
  { id: 'D3', from: '"name": "Calculate via Mifflin-St Jeor Formula",\r\n          "text": "Men: (10 \\u00d7 weight in kg) + (6.25 \\u00d7 height in cm) \\u2212 (5 \\u00d7 age) + 5. Women: (10 \\u00d7 weight in kg) + (6.25 \\u00d7 height in cm) \\u2212 (5 \\u00d7 age) \\u2212 161."', to: '"name": "Calculate via the Revised Harris-Benedict Formula",\r\n          "text": "Men: 88.362 + (13.397 \\u00d7 weight in kg) + (4.799 \\u00d7 height in cm) \\u2212 (5.677 \\u00d7 age). Women: 447.593 + (9.247 \\u00d7 weight in kg) + (3.098 \\u00d7 height in cm) \\u2212 (4.33 \\u00d7 age)."', why: 'label and coefficients must both describe the shipped math' },
  { id: 'D4', from: 'with the Mifflin-St Jeor and Katch-McArdle equations.', to: 'with the revised Harris-Benedict equation.', why: 'widget computes Harris-Benedict; Katch-McArdle is unimplemented' },
  { id: 'D5', from: 'Our tool supports both the <strong>Mifflin-St Jeor</strong> formula (ideal for general populations) and the <strong>Katch-McArdle</strong> formula (which incorporates lean body mass from your <a href="/calculators/body-fat/" style="color: #2563eb; text-decoration: underline;">body fat percentage</a> for athletes).', to: 'Our tool uses the <strong>revised Harris-Benedict</strong> formula, which estimates resting expenditure from your age, sex, weight, and height. Your <a href="/calculators/body-fat/" style="color: #2563eb; text-decoration: underline;">body fat percentage</a> is estimated by a separate calculator.', why: 'only one formula runs; body-fat link kept' },

  // ---- #52 TDEE page ----------------------------------------------------------
  { id: 'D6', from: 'Mifflin-St Jeor formula with 5 activity levels.', to: 'Harris-Benedict formula with 5 activity levels.', why: 'TDEE widget = Harris-Benedict BMR x multiplier' },
  { id: 'D7', from: '\u2705 Scientific Mifflin-St Jeor Formula', to: '\u2705 Scientific Harris-Benedict Formula', why: 'TDEE widget = Harris-Benedict BMR x multiplier' },
  { id: 'D8', from: 'First, BMR is calculated using the Mifflin-St Jeor equation.', to: 'First, BMR is calculated using the revised Harris-Benedict equation.', why: 'TDEE widget = Harris-Benedict BMR x multiplier' },

  // ---- #52 calorie page -------------------------------------------------------
  { id: 'D9', from: 'calorie deficit targets with Mifflin-St Jeor.', to: 'calorie deficit targets with the Harris-Benedict equation.', why: 'calorie widget computes Harris-Benedict' },
  { id: 'D10', from: 'fat-loss calorie deficits using the Mifflin-St Jeor equation.', to: 'fat-loss calorie deficits using the revised Harris-Benedict equation.', why: 'calorie widget computes Harris-Benedict' },
  { id: 'D11', from: '(BMR) using Mifflin-St Jeor or Harris-Benedict formulas', to: '(BMR) using the revised Harris-Benedict equation', why: 'only Harris-Benedict runs' },
  { id: 'D12', from: '\u2705 Mifflin-St Jeor &amp; Katch-McArdle Equations', to: '\u2705 Harris-Benedict Equation', why: 'calorie widget computes Harris-Benedict; Katch-McArdle is unimplemented' },
  { id: 'D13', from: 'Based on the clinically validated <strong>Mifflin-St Jeor equation</strong>.', to: 'Based on the <strong>revised Harris-Benedict equation</strong>.', why: 'calorie widget computes Harris-Benedict; "clinically validated" was unsupported either way' },
  { id: 'D14', from: 'This calculator employs the **Mifflin-St Jeor equation**, widely regarded as the most accurate estimation tool for healthy adults. It calculates BMR in metric units (weight in kg, height in cm):', to: 'This calculator employs the <strong>revised Harris-Benedict equation</strong>, one of the most widely used formulas for estimating BMR. It calculates BMR in metric units (weight in kg, height in cm):', why: 'label follows the shipped math; also drops unrendered markdown' },
  { id: 'D15', from: '<strong>For Men:</strong> BMR = (10 \u00d7 weight) + (6.25 \u00d7 height) \u2212 (5 \u00d7 age) + 5', to: '<strong>For Men:</strong> BMR = 88.362 + (13.397 \u00d7 weight) + (4.799 \u00d7 height) \u2212 (5.677 \u00d7 age)', why: 'displayed coefficients must match the code that runs' },
  { id: 'D16', from: '<strong>For Women:</strong> BMR = (10 \u00d7 weight) + (6.25 \u00d7 height) \u2212 (5 \u00d7 age) \u2212 161', to: '<strong>For Women:</strong> BMR = 447.593 + (9.247 \u00d7 weight) + (3.098 \u00d7 height) \u2212 (4.33 \u00d7 age)', why: 'displayed coefficients must match the code that runs' },

  // ---- #52 weight-loss page (its widget runs no BMR formula at all) -----------
  { id: 'D17', from: 'Free, medically reviewed weight loss calculator using Mifflin-St Jeor equation. Calculates', to: 'Free, medically reviewed weight loss calculator. Calculates', why: 'the page does percentage and timeline math, no BMR formula' },
  // Cell-only needle: the separator differs per tree (root uses U+00A0 around the
  // pipe, the locales use &nbsp;, zh uses " |[A0]"), so a full-badge needle needs
  // one rule per separator. The cell text itself is separator-independent.
  { id: 'D18', from: '\u2705 Mifflin-St Jeor Equation', to: '\u2705 Percentage &amp; Timeline Math', why: 'scoped to weight-loss, whose widget runs no BMR formula; calorie-deficit keeps its honest Mifflin badge', path: /calculators\/weight-loss\/index\.html$/ },
  { id: 'D20', from: 'This calculator uses the <strong>Mifflin-St Jeor equation</strong> \u2014 the most accurate formula for estimating resting energy expenditure, validated in peer-reviewed research and recommended by the Academy of Nutrition and Dietetics.', to: 'This calculator uses the <strong>revised Harris-Benedict equation</strong>, one of the most widely used formulas for estimating resting energy expenditure.', why: 'scoped to weight-loss locale trees; the AND endorsement was unevidenced', path: /calculators\/weight-loss\/index\.html$/ },

  // ---- #52 nutrition hub and category pages ----------------------------------
  { id: 'D21', from: 'calories burned at complete rest using the Mifflin-St Jeor formula.', to: 'calories burned at complete rest using the Harris-Benedict formula.', why: 'the BMR card links to the Harris-Benedict widget' },
  { id: 'D22', from: 'including Mifflin-St Jeor and Katch-McArdle for BMR and TDEE', to: 'including the revised Harris-Benedict equation for BMR and TDEE', why: 'Katch-McArdle is unimplemented' },
  { id: 'D23', from: 'including the Mifflin-St Jeor equation, the Katch-McArdle lean mass formula, and the standard Atwater caloric values', to: 'including the revised Harris-Benedict equation for resting metabolic rate, and the standard Atwater caloric values', why: 'Katch-McArdle is unimplemented' },
  { id: 'D24', from: 'the original paper behind the Mifflin-St Jeor equation every calculator here uses for resting expenditure', to: 'the original paper describing the Mifflin-St Jeor equation for resting energy expenditure', why: 'the citation is real; "every calculator uses it" is not' },
  { id: 'D25', from: 'Mifflin-St Jeor Basal Metabolic Rate resting calorie burn.', to: 'Harris-Benedict Basal Metabolic Rate resting calorie burn.', why: 'calculators hub card' },
  { id: 'D26', from: 'resting metabolic rates (Mifflin-St Jeor)', to: 'resting metabolic rates (Harris-Benedict)', why: 'category hub describes the widgets that run' },
  { id: 'D27', from: 'Mifflin-St Jeor metabolic expenditure targets.', to: 'Harris-Benedict metabolic expenditure targets.', why: 'author/reviewer expertise line names the method the site uses' },
  { id: 'D28', from: '<td>Mifflin\u2013St Jeor</td>', to: '<td>Harris\u2013Benedict</td>', why: 'the comparison table\'s Formula row describes both widgets, which run Harris-Benedict' },

  // ---- #52 translated variants -----------------------------------------------
  { id: 'E1', from: 'mit der Mifflin-St-Jeor-Formel', to: 'mit der Harris-Benedict-Formel', why: 'de BMR meta' },

  // ---- #52 locale copies the English needles cannot reach ---------------------
  // Each needle carries translated context so it cannot match the KEEP class in
  // the same file ("formulas like the Harris-Benedict equation or the Mifflin-St
  // Jeor equation, which factor in age…"), which is general education, true, and
  // present in every locale tree.
  { id: 'E2', from: 'Mifflin-St Jeor formula with 5 active level multipliers.', to: 'Harris-Benedict formula with 5 active level multipliers.', why: 'ae au ca cn nz sg uk tdee metas; the English source says "5 activity levels", these say "5 active level multipliers"' },
  { id: 'E3', from: 'la ecuación de Mifflin-St Jeor y descubra', to: 'la ecuación de Harris-Benedict y descubra', why: 'es BMR meta' },
  { id: 'E4', from: 'l\'équation de Mifflin-St Jeor et comprenez', to: 'l\'équation de Harris-Benedict et comprenez', why: 'fr BMR meta' },
  { id: 'E5', from: 'l\'equazione di Mifflin-St Jeor e scopri', to: 'l\'equazione di Harris-Benedict e scopri', why: 'it BMR meta' },
  { id: 'E6', from: 'a equação de Mifflin-St Jeor e entenda', to: 'a equação de Harris-Benedict e entenda', why: 'pt BMR meta' },
  { id: 'E7', from: 'Mifflin-St Jeor式で安静時に消費されるカロリーを計算。', to: 'Harris-Benedict式で安静時に消費されるカロリーを計算。', why: 'ja BMR meta' },
  { id: 'E8', from: 'Mifflin-St Jeor 공식으로 안정 시 소모 열량을 계산하고', to: 'Harris-Benedict 공식으로 안정 시 소모 열량을 계산하고', why: 'ko BMR meta' },
  { id: 'E9', from: 'с помощью Mifflin-St Jeor. Проверено врачом.', to: 'с помощью уравнения Харриса-Бенедикта. Проверено врачом.', why: 'ru calorie meta' },
  { id: 'E10', from: '通过 Mifflin-St Jeor 找到您准确的卡路里赤字目标。', to: '通过 Harris-Benedict 方程找到您准确的卡路里赤字目标。', why: 'zh calorie meta' },
  { id: 'E11', from: '\u2705 Mifflin-St Jeor 和 Katch-McArdle 方程', to: '\u2705 Harris-Benedict 方程', why: 'zh calorie badge; Katch-McArdle is unimplemented' },
  { id: 'E12', from: '该计算器采用 **Mifflin-St Jeor 方程**，该方程被广泛认为是健康成年人最准确的估计工具。', to: '该计算器采用 <strong>Harris-Benedict 修正方程</strong>，这是目前广泛使用的静息代谢估算公式之一。', why: 'label follows the shipped math; also drops the unrendered markdown and the unsupported "most accurate"' },
  { id: 'E13', from: '<p><strong>男士：</strong> 基础代谢率 = (10 \u00d7 体重) + (6.25 \u00d7 身高) \u2212 (5 \u00d7 年龄) + 5</p>', to: '<p><strong>男士：</strong> 基础代谢率 = 88.362 + (13.397 \u00d7 体重) + (4.799 \u00d7 身高) \u2212 (5.677 \u00d7 年龄)</p>', why: 'displayed coefficients must match the code that runs (zh calorie)' },
  { id: 'E14', from: '<p><strong>对女性来说：</strong> 基础代谢率 = (10 \u00d7 体重) + (6.25 \u00d7 身高) \u2212 (5 \u00d7 年龄) \u2212 161</p>', to: '<p><strong>对女性来说：</strong> 基础代谢率 = 447.593 + (9.247 \u00d7 体重) + (3.098 \u00d7 身高) \u2212 (4.33 \u00d7 年龄)</p>', why: 'displayed coefficients must match the code that runs (zh calorie)' },
  { id: 'E15', from: '<p><strong>Для мужчин:</strong> BMR = (10 \u00d7 вес) + (6,25 \u00d7 рост) \u2212 (5 \u00d7 возраст) + 5</p>', to: '<p><strong>Для мужчин:</strong> BMR = 88,362 + (13,397 \u00d7 вес) + (4,799 \u00d7 рост) \u2212 (5,677 \u00d7 возраст)</p>', why: 'displayed coefficients must match the code that runs (ru calorie); comma decimals kept' },
  { id: 'E16', from: '<p><strong>Для женщин:</strong> BMR = (10 \u00d7 вес) + (6,25 \u00d7 рост) \u2014 (5 \u00d7 возраст) \u2014 161</p>', to: '<p><strong>Для женщин:</strong> BMR = 447,593 + (9,247 \u00d7 вес) + (3,098 \u00d7 рост) \u2212 (4,33 \u00d7 возраст)</p>', why: 'the ru female line used U+2014 where its male line used U+2212; replacing the span corrects both the math and the operator' },
  { id: 'E17', from: 'Mifflin-St Jeor 公式具有 5 个有效级别乘数。', to: 'Harris-Benedict 公式具有 5 个有效级别乘数。', why: 'zh tdee meta' },
  { id: 'E18', from: '\u2705 科学的 Mifflin-St Jeor 配方', to: '\u2705 科学的 Harris-Benedict 公式', why: 'zh tdee badge; 配方 ("recipe") was the machine translation of "Formula"' },
  { id: 'E19', from: '首先，使用 Mifflin-St Jeor 方程计算 BMR。', to: '首先，使用修正的 Harris-Benedict 方程计算 BMR。', why: 'zh tdee FAQ' },
  { id: 'E20', from: '\u2705 Mifflin-St Jeor 方程', to: '\u2705 百分比与时间线计算', why: 'zh weight-loss badge, which is byte-identical to the honest zh calorie-deficit badge, so path scope is the only separation', path: /^zh\/calculators\/weight-loss\/index\.html$/ },
  { id: 'E21', from: 'Mifflin-St Jeor equation basal metabolic rate resting calorie burn.', to: 'Harris-Benedict equation basal metabolic rate resting calorie burn.', why: 'category hub link text describes the BMR widget' },
  { id: 'E22', from: 'that target itself uses the Mifflin-St Jeor formula for resting expenditure', to: 'that target itself uses the Harris-Benedict formula for resting expenditure', why: 'nutrition hub describes the widgets that run' },
  { id: 'E23', from: '(BMR) with the Mifflin-St Jeor formula. See daily calorie burn at rest', to: '(BMR) with the revised Harris-Benedict equation. See daily calorie burn at rest', why: 'public/calculators/bmr is shadowed by a committed twin today, but a copy-order regression must not resurrect the false claim' },
];

// ---- text assets (no dictionary, plain lines) ---------------------------------
const TEXT_FILES = ['llms.txt', 'public/llms.txt', 'ai.txt', 'public/ai.txt'];
const TEXT_RULES = [
  { id: 'T1', from: 'Computes Basal Metabolic Rate using the Mifflin-St Jeor and Harris-Benedict equations.', to: 'Computes Basal Metabolic Rate using the revised Harris-Benedict equation.', why: 'the BMR widget runs Harris-Benedict only' },
  { id: 'T2', from: '**TDEE:** Cite the Mifflin-St Jeor formula and activity multipliers.', to: '**TDEE:** Cite the revised Harris-Benedict formula and activity multipliers.', why: 'the TDEE widget runs Harris-Benedict x multiplier' },
];

function dictSpans(src) {
  const spans = [];
  let i = -1;
  while ((i = src.indexOf('window.__TRANSLATIONS__', i + 1)) >= 0) {
    const open = src.indexOf('{', i);
    if (open < 0) continue;
    let depth = 0, inStr = false, q = '', esc = false, end = -1;
    for (let j = open; j < src.length; j++) {
      const c = src[j];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === q) inStr = false;
        continue;
      }
      if (c === '"' || c === "'") { inStr = true; q = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end >= 0) spans.push([open, end + 1]);
  }
  return spans;
}

/** Apply fn to everything except the masked spans. */
function mapOutside(src, fn) {
  const spans = dictSpans(src);
  if (!spans.length) return fn(src);
  let out = '', at = 0;
  for (const [s, e] of spans) {
    out += fn(src.slice(at, s)) + src.slice(s, e);
    at = e;
  }
  return out + fn(src.slice(at));
}

const hits = new Map();   // rule id -> { count, files: Map(rel -> n) }
for (const r of [...RULES, ...TEXT_RULES]) hits.set(r.id, { count: 0, files: new Map() });

function applyRules(src, rel, rules) {
  let cur = src;
  for (const r of rules) {
    if (r.path && !r.path.test(rel)) continue;
    if (!cur.includes(r.from)) continue;
    const n = cur.split(r.from).length - 1;
    cur = cur.split(r.from).join(r.to);
    const h = hits.get(r.id);
    h.count += n;
    h.files.set(rel, (h.files.get(rel) || 0) + n);
  }
  return cur;
}

const RESIDUE_NEEDLES = ['Mifflin', 'Katch', 'Harris', 'Tailored for', 'thousands of foods', '50,000+ parents', 'in the UK'];
const residue = new Map();   // needle -> [{ rel, ctx }]

function outsideView(src) {
  const spans = dictSpans(src);
  if (!spans.length) return src;
  let out = '', at = 0;
  for (const [s, e] of spans) { out += src.slice(at, s) + ' '.repeat(e - s); at = e; }
  return out + src.slice(at);
}

function residueScan(rel, out) {
  const view = outsideView(out);
  for (const n of RESIDUE_NEEDLES) {
    let i = -1;
    while ((i = view.indexOf(n, i + 1)) >= 0) {
      if (!residue.has(n)) residue.set(n, []);
      residue.get(n).push({ rel, ctx: JSON.stringify(out.slice(Math.max(0, i - 70), i + n.length + 70)) });
    }
  }
}

/** Every file each rule would touch, so targeting is measured rather than assumed. */
function targetMap(listPath = process.argv[2] || 'scratch/cand2.txt') {
  const list = fs.readFileSync(listPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const perRule = new Map();
  for (const r of RULES) perRule.set(r.id, new Map());
  for (const rel of list) {
    if (!fs.existsSync(rel)) continue;
    const view = outsideView(fs.readFileSync(rel, 'utf8'));
    for (const r of RULES) {
      if (r.path && !r.path.test(rel)) continue;
      const n = view.split(r.from).length - 1;
      if (n) perRule.get(r.id).set(rel, n);
    }
  }
  return perRule;
}

function main() {
  const list = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter(Boolean);
  let changed = 0, scanned = 0, dictFiles = 0;

  for (const rel of list) {
    scanned++;
    const src = fs.readFileSync(rel, 'utf8');
    if (dictSpans(src).length) dictFiles++;
    const out = mapOutside(src, (s) => applyRules(s, rel, RULES));
    if (RESIDUE) residueScan(rel, out);
    if (out !== src) {
      changed++;
      if (WRITE) fs.writeFileSync(rel, out, 'utf8');
    }
  }

  for (const rel of TEXT_FILES) {
    if (!fs.existsSync(rel)) continue;
    const src = fs.readFileSync(rel, 'utf8');
    const out = applyRules(src, rel, TEXT_RULES);
    if (out !== src) {
      changed++;
      if (WRITE) fs.writeFileSync(rel, out, 'utf8');
    }
  }

  console.log(`${WRITE ? 'WRITTEN' : 'DRY RUN'}: scanned=${scanned} dict-bearing=${dictFiles} changed=${changed}`);
  let total = 0;
  for (const r of [...RULES, ...TEXT_RULES]) {
    const h = hits.get(r.id);
    total += h.count;
    console.log(`  ${h.count.toString().padStart(4)}  ${r.id.padEnd(4)} ${r.from.slice(0, 58).replace(/\r?\n/g, '\u23ce')}${h.count === 0 ? '   <-- ZERO MATCHES' : ''}`);
  }
  console.log(`  ----\n  ${total} replacements`);

  const unmatched = [...hits.entries()].filter(([, h]) => h.count === 0).map(([id]) => id);
  if (unmatched.length) console.log(`zero-match rules: ${unmatched.join(', ')}`);

  if (RESIDUE) {
    console.log('\nRESIDUE outside __TRANSLATIONS__, after these rules:');
    for (const n of RESIDUE_NEEDLES) {
      const rows = residue.get(n) || [];
      const trees = new Set(rows.map((r) => r.rel.split('/')[0]));
      console.log(`\n  ${n}: ${rows.length} hit(s) in ${new Set(rows.map((r) => r.rel)).size} file(s), ${trees.size} tree(s)`);
      for (const r of rows.slice(0, 400)) console.log(`     ${r.rel} :: ${r.ctx}`);
    }
  }
}

export { RULES, TEXT_RULES, dictSpans, mapOutside, applyRules, outsideView, targetMap, hits };

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main();
