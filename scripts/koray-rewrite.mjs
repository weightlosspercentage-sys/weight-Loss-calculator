#!/usr/bin/env node
// Koray semantic rewrite for the two editable programmatic families.
// Committed HTML is the source of truth (the generators are archived), so this
// is an idempotent read-modify-write codemod, not a generator.
//
//   node scripts/koray-rewrite.mjs --sample --dry     print diff, touch nothing
//   node scripts/koray-rewrite.mjs --trees=en --families=hw,wl
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const h = argv.find((a) => a.startsWith('--' + n + '=')); return h ? h.split('=').slice(1).join('=') : d; };
const has = (n) => argv.includes('--' + n);
const DRY = has('dry');
const SAMPLE = has('sample');
const FAMILIES = flag('families', 'hw,wl').split(',');
const TREES = flag('trees', 'en,uk,au,ca,nz').split(',');

const EOL = '\r\n';
const flat = (s) => s.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
const dec = (s) => flat(s).replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

const stats = { hwChanged: 0, wlChanged: 0, blChanged: 0, blNoop: 0, blLocalized: 0, bailHW: 0, bailWL: 0, bailBL: 0, wlNoCut: 0, wlRedundant: 0, badgeFixed: 0, faqDropped: 0 };
const bails = [];
const DIFF = [];

function walk(dir, acc = []) {
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc); else if (e.name === 'index.html') acc.push(p);
  }
  return acc;
}

// Every JSON-LD edit goes through parse -> mutate -> reserialize. Regex surgery
// on JSON corrupts blocks that were valid before, and there is no way to prove
// it safe across 9,880 files.
function ldBlocks(h) {
  return [...h.matchAll(/<script([^>]*application\/ld\+json[^>]*)>([\s\S]*?)<\/script>/gi)]
    .map((m) => ({ start: m.index, end: m.index + m[0].length, attrs: m[1], body: m[2], full: m[0] }));
}

function ldParse(body) { try { return JSON.parse(body); } catch { return null; } }

function replaceBlock(h, blk, obj) {
  // < and > are legal raw in JSON but "</script>" inside a string would close
  // the element early and corrupt the document.
  const json = JSON.stringify(obj, null, 2).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
  // These files are CRLF and plain() collapses whitespace inside values, so
  // every remaining newline here is structural.
  return h.slice(0, blk.start) + '<script' + blk.attrs + '>' + json.replace(/\n/g, EOL) + '</script>' + h.slice(blk.end);
}

// All <script> bodies, so a prose transform can never reach JSON or inline JS.
// The href normaliser did exactly that: href='/calculators/tdee' inside a JSON
// string became href="/calculators/tdee/" and invalidated the whole block.
function scriptSpans(h) {
  return [...h.matchAll(/<script[^>]*>[\s\S]*?<\/script>/gi)]
    .map((m) => ({ start: m.index, end: m.index + m[0].length, full: m[0] }));
}

const mapProse = (h, fn) => {
  let out = '', cursor = 0;
  for (const s of scriptSpans(h)) { out += fn(h.slice(cursor, s.start)) + s.full; cursor = s.end; }
  return out + fn(h.slice(cursor));
};
const proseOnly = (h) => mapProse(h, (s) => s);

// Literal replace across every occurrence. A first-occurrence-only replace makes
// the pass non-idempotent on files that repeat a section, which /uk/ does.
const subAll = (h, from, to) => (h.includes(from) ? h.split(from).join(to) : h);

// Schema text wants prose, not markup: answers carry <strong> and <a> tags.
// Tags vanish rather than becoming spaces, or "as <strong>Underweight</strong>."
// turns into "as Underweight ." in the marked-up answer text.
const plain = (s) => dec(s.replace(/<[^>]*>/g, '')).replace(/[\u00a0\u200b]/g, ' ')
  .replace(/\s+([.,;:!?])/g, '$1').replace(/\s+/g, ' ').trim();
// The JSON-LD bodies themselves would satisfy a naive "is this visible" check.
// Here tags become spaces, so neighbouring text nodes cannot glue into a
// substring that no real heading or row contains.
const visibleText = (h) => plain(h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]*>/g, ' '));

function diff(rel, before, after, beforeAnchor, afterAnchor) {
  if (before === after) return;
  const win = (h, a) => { const i = h.indexOf(a); return i < 0 ? '(anchor missing)' : flat(h.slice(i, i + 620)); };
  DIFF.push('===== ' + rel + '  ' + before.length + ' -> ' + after.length + ' bytes');
  DIFF.push('  BEFORE ' + win(before, beforeAnchor));
  DIFF.push('  AFTER  ' + win(after, afterAnchor));
}

// ---------------------------------------------------------------- height-weight
function rewriteHW(html, rel) {
  const before = html;
  const text = proseOnly(html);
  const q1 = text.match(/Q: What does a BMI of ([\d.]+) mean for someone ([^<]+) tall\?/);
  const a1 = text.match(/A BMI of [\d.]+ for a [^<]+ individual classifies you as <strong>([^<]+)<\/strong>/);
  const a2 = text.match(/the healthy weight range is <strong>([\d,]+) to ([\d,]+) lbs<\/strong> \(BMI 18\.5 to 24\.9\)/);
  const fm = text.match(/BMI = \(weight in lbs . height in inches.\) . 703\. For ([^(]+) \((\d+) inches\) and ([\d,]+) lbs: \(([\d,]+) . (\d+.)\) . 703 = <strong>([\d.]+)<\/strong>/);
  if (!q1 || !a1 || !a2 || !fm || q1[1] !== fm[6]) { stats.bailHW++; bails.push(rel); return html; }

  const bmi = q1[1], who = dec(q1[2]), cat = dec(a1[1]), lo = a2[1], hi = a2[2], weight = fm[3];
  // Stating the numeric band keeps the declaration non-circular: "Normal Weight
  // because 18.5 to 24.9 is healthy" says nothing.
  const band = /Obese Class III/.test(cat) ? '40.0 and above'
    : /Obese Class II/.test(cat) ? '35.0 to 39.9'
      : /Obese Class I/.test(cat) ? '30.0 to 34.9'
        : /^Overweight/.test(cat) ? '25.0 to 29.9'
          : /Normal/.test(cat) ? '18.5 to 24.9'
            : 'below 18.5';
  const position = /Obese|Overweight/.test(cat) ? 'above' : /Underweight/.test(cat) ? 'below' : 'within';

  const lead = '<p style="font-size: 1.1rem; color: #475569; margin-bottom: 2rem;">';
  const oldIntro = new RegExp(lead.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    'Calculate your Body Mass Index for a height of <strong>[^<]*</strong> and weight of <strong>[^<]*</strong>\\.</p>');
  // Re-running must not be a silent bail. Every edit below is individually
  // idempotent, so a page that already carries the declaration is processed
  // again (and picks up any later edit) instead of being skipped as unknown.
  const done = text.includes('The Body Mass Index for ' + who + ' and ' + weight + ' lbs is');
  if (!oldIntro.test(text) && !done) { stats.bailHW++; bails.push(rel + ' (intro)'); return html; }

  // STEP 1 + 2: replace the tool announcement with a Declaration-First answer.
  // Element, inline style and position are unchanged, so layout does not move.
  const answer =
    'The Body Mass Index for ' + who + ' and ' + weight + ' lbs is <strong>' + bmi + '</strong>. ' +
    'Body Mass Index is a measure of weight relative to height, calculated as weight in pounds divided by height in inches squared and multiplied by 703. ' +
    'A Body Mass Index of ' + bmi + ' is classified as ' + cat + ', the ' + cat + ' band of BMI ' + band + '. ' +
    'A weight of ' + weight + ' lbs for a height of ' + who + ' sits ' + position + ' the healthy range of ' + lo + ' to ' + hi + ' lbs.';

  let h = mapProse(html, (p) => {
    p = p.replace(oldIntro, lead + answer + '</p>');
    // The "Should You Lose Weight?" badge is hard-coded to the normal-weight
    // answer, so 1,140 underweight pages state the opposite of their own status
    // line. Same element, same inline styles; only the words change.
    if (/Underweight/.test(cat)) {
      p = p.replace('>Your weight is in the healthy range</p>', () => {
        stats.badgeFixed++;
        return '>No - you are below a healthy weight and may need to gain</p>';
      });
    }
    // STEP 2: the second FAQ heading duplicates the first one's intent.
    p = subAll(p, '<h2 style="font-size:1.05rem;margin:1rem 0 .5rem">Frequently asked questions</h2>',
      '<h2 style="font-size:1.05rem;margin:1rem 0 .5rem">Website and calculator policies</h2>');
    // STEP 2: every FAQ answer closes with a period.
    p = p.replace(/<p style="margin: 0; color: #475569;">([\s\S]*?)<\/p>/g, (m, body) => {
      const t = body.replace(/\s+$/, '');
      const bare = t.replace(/<\/strong>\s*$/, '');
      return /[.;:!?]$/.test(bare) ? m : '<p style="margin: 0; color: #475569;">' + t + '.</p>';
    });
    // STEP 4: three links to one target, each stating a different relation.
    p = subAll(p, '<a href="/calculators/weight-loss/">Weight Loss Calculator</a>',
      '<a href="/calculators/weight-loss/">safe weekly weight loss rate calculator</a>');
    return subAll(p, '<a href="/calculators/weight-loss/">weight loss calculator</a>',
      '<a href="/calculators/weight-loss/">weight loss percentage calculator</a>');
  });

  // Structured data: FAQPage currently marks only the four generic policy
  // questions, while the entity questions a searcher actually asked are not
  // marked. Both sets are visible on the page, so both are marked, with the
  // page-specific questions first.
  const body = proseOnly(h);
  const vis = [...body.matchAll(/font-weight: 700; color: #0f172a;">Q: ([^<]+)<\/p>\s*<p style="margin: 0; color: #475569;">([\s\S]*?)<\/p>/g)]
    .map((m) => [plain(m[1]), plain(m[2]).replace(/^A\s+/, '')]);
  const acc = [...body.matchAll(/<summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p>/g)].map((m) => [plain(m[1]), plain(m[2])]);
  const seen = new Set();
  const pairs = [...vis, ...acc].filter(([q, a]) => q && a && !seen.has(q) && seen.add(q));
  if (pairs.length) {
    const at = ldBlocks(h).findIndex((b) => ldParse(b.body)?.['@type'] === 'FAQPage');
    if (at >= 0) {
      const obj = ldParse(ldBlocks(h)[at].body);
      obj.mainEntity = pairs.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      }));
      const next = replaceBlock(h, ldBlocks(h)[at], obj);
      const back = ldParse(ldBlocks(next)[at]?.body);
      if (!back || back.mainEntity.length !== pairs.length) { stats.bailHW++; bails.push(rel + ' (ld)'); return html; }
      h = next;
    }
  }
  stats.hwChanged++; diff(rel, before, h, 'Calculate your Body Mass Index for a height', 'The Body Mass Index for ');
  return h;
}

// ---------------------------------------------------------------- weight-loss
function rewriteWL(html, rel) {
  const before = html;
  const text = proseOnly(html);
  const hc = text.match(/How We Calculated Your ([\d.]+)% Weight Loss<\/h3>/);
  const fm = text.match(/>\s*\(([\d,]+) . ([\d,]+)\) . 100 = ([\d.]+)%<\/p>/);
  if (!hc || !fm) { stats.bailWL++; bails.push(rel); return html; }
  const lost = fm[1], start = fm[2], pct = fm[3];
  const cat = text.match(/id="ui-cat">([A-Z][^<(]*)\(([^)]*)\)<\/p>/);
  if (!cat) { stats.bailWL++; bails.push(rel + ' (cat)'); return html; }
  const catName = cat[1].trim();
  const band = cat[2].trim().replace(/^./, (c) => c.toLowerCase());
  const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const target = num(Number(start.replace(/,/g, '')) - Number(lost.replace(/,/g, '')));

  // STEP 1: the answer. Nine different marketing openers exist across the 351
  // pages ("is a fantastic first step", "represents a staggering"); all of them
  // bury the number, so the first sentence is replaced, not softened. Guarded
  // by the opening words of the declaration so a second pass is a no-op.
  const decl =
    'The weight loss percentage from <strong>' + start + ' lbs</strong> to <strong>' + target + ' lbs</strong> is <strong>' + pct + '%</strong>. ' +
    "Weight loss percentage is the share of a person's starting body weight that they lose, calculated as pounds lost divided by starting pounds and multiplied by 100. " +
    'A ' + pct + '% loss is classified as <strong>' + catName + '</strong>, the category defined as ' + band + ' of starting body weight. ' +
    'The Calculation Summary below states the percentage, the clinical classification and the total calorie deficit for these values.';
  const introRe = /(<h1[^>]*>[\s\S]*?<\/h1>\s*(?:<!--[\s\S]*?-->\s*)?<p>)([\s\S]*?)(<\/p>)/;

  const oldCalc = /<p>To find the exact percentage, we took your total weight loss \(<strong>[\d,]+ lbs<\/strong>\) and divided it by your starting weight \(<strong>[\d,]+ lbs<\/strong>\)\. We then multiplied the result by 100\.<\/p>/g;

  // Three of the ten tail shapes (99 of 1,755 pages) restate the classification
  // the declaration has just stated, which is pure Cost of Retrieval. Anchored to
  // the end of the declaration so a re-run strips it from pages written before
  // this rule existed. The other seven add a health claim, so they stay.
  const DECL_END = 'The Calculation Summary below states the percentage, the clinical classification and the total calorie deficit for these values.';
  const redundant = new RegExp(DECL_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '(?: This <strong>[\\d.]+% reduction</strong> falls into the <strong>[^<]*</strong> category' +
    '| A [\\d.]+% weight loss is considered <strong>[^<]*</strong>' +
    '| Losing [\\d.]+% of your body weight places you in the <strong>[^<]*</strong> category)\\.', 'g');

  const HUB_LINK = '/calculators/weight-loss/';
  const HUB_ANCHORS = ['weight loss percentage calculator', 'weight loss percentage formula and tables',
    'example weight loss percentage calculations'];
  let k = 0;
  let h = mapProse(html, (p) => {
    // STEP 1: Declaration-First. Replace only the first sentence, keep the
    // author's follow-up (it holds the internal link) and the rest verbatim.
    p = p.replace(introRe, (all, pfx, body, suf) => {
      if (body.startsWith('The weight loss percentage from ')) return all;
      const cut = body.search(/\.\s+(?=[A-Z(])/);
      if (cut < 0) { stats.wlNoCut++; bails.push(rel + ' (no sentence boundary)'); return all; }
      return pfx + decl + ' ' + body.slice(cut + 1).trimStart() + suf;
    });
    p = p.replace(redundant, () => { stats.wlRedundant++; return DECL_END; });

    // STEP 2: no heading carries a colon, and "&" joins two topics inside one
    // heading, so each heading is rewritten to state one entity. Global,
    // because /uk/ renders this section twice in one file.
    p = p.replace(/Starting at ([\d,]+) lbs: What to Expect<\/h3>/g,
      'What to Expect at a Starting Weight of $1 lbs</h3>');
    p = p.replace(/Why ([\d.]+)% is Life-Changing: Deep Metabolic Transformation/g,
      'Why $1% Weight Loss Causes Deep Metabolic Transformation');
    p = p.replace(/Why ([\d.]+)% is Clinically Significant: What Happens Inside Your Body/g,
      'What Happens Inside Your Body at $1% Weight Loss');
    p = p.replace(/Why ([\d.]+)% Matters: The Science of Early-Stage Weight Loss/g,
      'The Science of Early-Stage Weight Loss at $1%');
    p = p.replace(/Metabolic (?:&amp;|&) Clinical Health Implications/g, 'Metabolic and Clinical Health Implications');
    p = p.replace(/Safe Deficit (?:&amp;|&) Weekly Timeline Options/g, 'Safe Deficit and Weekly Timeline Options');

    // STEP 2: a lead-in that ends in a colon is an unfinished proposition.
    p = subAll(p, 'Adjust the sliders below to calculate custom weight loss milestones dynamically:',
      'Adjust the sliders below to calculate custom weight loss milestones. The sliders use the formula stated in the calculation section above.');

    // STEP 2 + 3: ordinals for the multi-step process, each step one EAV sentence.
    p = p.replace(oldCalc,
      '<p>Firstly, subtract the target weight from the starting weight. The total weight loss is <strong>' + lost + ' lbs</strong>. ' +
      'Secondly, divide the total weight loss by the starting weight. The starting weight is <strong>' + start + ' lbs</strong>. ' +
      'Thirdly, multiply the quotient by 100. ' +
      'Finally, the result is the weight loss percentage, which is <strong>' + pct + '%</strong>. ' +
      'Percentage is used rather than pounds because it expresses change relative to the body mass a person started from.</p>');

    // STEP 4: single-quoted hrefs without a trailing slash resolve to a second
    // URL for the same page. Normalise first, so the anchor rewrite below sees
    // one quoting form and a second pass is a byte-for-byte no-op.
    p = p.replace(/href='(\/calculators\/[a-z-]+)'/g, 'href="$1/"');

    // STEP 4: every weight-loss page pointed its links at the same hub with the
    // identical anchor "weight loss calculator", the exact-match repeat the
    // framework forbids. Assign anchors by occurrence order so no page repeats
    // one, and keep every phrase true to the target: that hub is the percentage
    // calculator and it carries the formula plus the example tables.
    p = p.replace(/<a href="(\/calculators\/weight-loss\/)">weight loss calculator<\/a>/g,
      () => '<a href="' + HUB_LINK + '">' + HUB_ANCHORS[k++ % HUB_ANCHORS.length] + '</a>');
    return p;
  });

  // Structured data: this page marks up a FAQPage of generic questions that are
  // not visible anywhere on the page. FAQ markup must describe rendered content,
  // so a block whose questions are all absent from the prose is dropped. The
  // block that mirrors the rendered questions stays untouched.
  const shown = visibleText(h);
  const drop = ldBlocks(h).filter((b) => {
    const o = ldParse(b.body);
    if (o?.['@type'] !== 'FAQPage' || !Array.isArray(o.mainEntity) || !o.mainEntity.length) return false;
    const names = o.mainEntity.map((q) => plain(q.name || '')).filter(Boolean);
    return names.length > 0 && names.every((n) => !shown.includes(n));
  });
  // Splice from the last block backwards, so earlier offsets stay valid.
  for (const b of [...drop].reverse()) h = h.slice(0, b.start) + h.slice(b.end);

  stats.wlChanged++;
  diff(rel, before, h, '</h1>', 'The weight loss percentage from ');
  diff(rel, before, h, '<h3>Starting at ', 'What to Expect at a Starting Weight');
  return h;
}

// ---------------------------------------------------------------- shared: FAQ
// FAQ markup must describe content a reader can actually see. A FAQPage block
// whose questions are all absent from the rendered prose is invented rich
// results, so it is removed. Blocks that mirror rendered questions are kept.
// Splice from the last block backwards so earlier offsets stay valid.
function dropPhantomFaq(h) {
  const shown = visibleText(h);
  const isPhantom = (f) => {
    if (!f || f['@type'] !== 'FAQPage' || !Array.isArray(f.mainEntity) || !f.mainEntity.length) return false;
    const names = f.mainEntity.map((q) => plain(q.name || '')).filter(Boolean);
    return names.length > 0 && names.every((n) => !shown.includes(n));
  };
  // Splice backwards so earlier block offsets stay valid while editing.
  for (const b of [...ldBlocks(h)].reverse()) {
    const o = ldParse(b.body);
    if (!o) continue;
    const isGraph = !Array.isArray(o) && Array.isArray(o['@graph']);
    const faqs = isGraph ? o['@graph'].filter(isPhantom) : (isPhantom(o) ? [o] : []);
    if (!faqs.length) continue;
    if (isGraph) {
      // Only the phantom node is invented markup. WebSite, Organization, Person,
      // SoftwareApplication and BreadcrumbList in the same @graph are real and
      // must survive, so the node is removed from the array, not the block.
      const kept = o['@graph'].filter((n) => !isPhantom(n));
      if (!kept.length) { h = h.slice(0, b.start) + h.slice(b.end); stats.faqDropped++; continue; }
      const next = replaceBlock(h, b, { ...o, '@graph': kept });
      const back = ldParse(ldBlocks(next)[ldBlocks(next).findIndex((x) => x.start <= b.start && b.start < x.end)]?.body);
      if (!back || !Array.isArray(back['@graph']) || back['@graph'].length !== kept.length) continue;
      h = next;
    } else {
      h = h.slice(0, b.start) + h.slice(b.end);
    }
    stats.faqDropped++;
  }
  return h;
}

// ---------------------------------------------------------------- biggest-loser
// No React bundle loads on these pages, so the committed prose IS the document a
// crawler renders. Every edit below changes text only: no element, class, inline
// style or order changes, so nothing moves on screen.
function rewriteBL(html, rel) {
  const before = html;
  const text = proseOnly(html);

  // Declaration-First, replacing the imperative tool announcement.
  const introRe = /(<h1[^>]*>[\s\S]*?<\/h1>[\s\S]{0,900}?<p>)([\s\S]*?)(<\/p>)/;
  const DECL =
    'The Biggest Loser weight loss percentage is the pounds lost divided by the starting weight, multiplied by 100. ' +
    'The Biggest Loser calculator above applies that formula to a starting and a current weight, so progress is expressed as a share of starting body weight rather than as absolute pounds. ' +
    'A contestant weighing 300 lbs who loses 30 lbs and a contestant weighing 150 lbs who loses 15 lbs both record 10.0%, which is why the show scores competitions on percentage. ' +
    'A healthy, sustainable rate is 0.5% to 1.0% of body weight per week.';
  const hasIntro = /Calculate your weight loss progress using the official formula/.test(text);
  const done = text.includes('The Biggest Loser weight loss percentage is the pounds lost');
  if (!hasIntro && !done) { stats.bailBL++; bails.push(rel + ' (intro)'); return html; }

  let h = mapProse(html, (p) => {
    // STEP 1: declaration replaces the announcement paragraph. The h1-anchored
    // window can lazily match a later <p> once the first one no longer carries
    // the announcement, so the guard tests the captured body rather than the
    // position. Without that test a second pass rewrites the wrong paragraph.
    p = p.replace(introRe, (all, pfx, body, suf) => {
      if (!/Calculate your weight loss progress using the official formula/.test(body)) return all;
      return pfx + DECL + suf;
    });

    // STEP 2: a lead-in ending in a colon is an unfinished proposition. Here it
    // also carries no information, because the block beneath repeats it, so the
    // colon is replaced by the actual three-step statement (STEP 2.5 ordinals).
    p = subAll(p, '<p>The mathematical equation is expressed as:</p>',
      '<p>Firstly, subtract the current weight from the starting weight to find the total pounds lost. ' +
      'Secondly, divide that loss by the starting weight. ' +
      'Thirdly, multiply the quotient by 100, which expresses the loss as a percentage of starting body weight.</p>');

    // STEP 2: "&" joins two topics inside one heading, and a warning glyph is
    // decoration rather than meaning. Both are heading-level noise.
    p = p.replace(/(<h[23]\b[^>]*>)⚠️\s*/g, '$1');
    const AMP = [
      ['Medical & Sustainability Disclaimer', 'Medical and Sustainability Disclaimer'],
      ['Medical &amp; Sustainability Disclaimer', 'Medical and Sustainability Disclaimer'],
      ['Scientific References &amp; Clinical Guidelines', 'Scientific References and Clinical Guidelines'],
      ['Related Clinical &amp; Fitness Hubs', 'Related Clinical and Fitness Hubs'],
      ['Formulas &amp; Math', 'Formulas and Math'],
      ['Challenge &amp; Group Rules', 'Challenge and Group Rules'],
      ['Clinical &amp; Safety Benchmarks', 'Clinical and Safety Benchmarks'],
    ];
    for (const [from, to] of AMP) p = subAll(p, '>' + from + '<', '>' + to + '<');

    // STEP 4: this sentence promises "our detailed guide on The Biggest Loser
    // weight loss formula article" and then carries no <a>. There is no such URL
    // in the repo, so the dangling promise is repointed at content that exists.
    p = subAll(p,
      ' Learn more about the calculations in our detailed guide on The Biggest Loser weight loss formula article.',
      ' The calculation section above states each step of that formula.');

    // STEP 4: three of the four internal targets sat only in link grids, where
    // anchor text is not prose. These sentences move them into prose, each with a
    // distinct semantic anchor and no repeats. Each search string is chosen so it
    // is NOT a substring of its own replacement, which is what makes a re-run a
    // no-op instead of a second append.
    p = subAll(p,
      'normalizing starting weight differences.',
      'so that starting weight differences no longer decide the ranking. ' +
      'Absolute pounds and <a href="/calculators/bmi/">body mass index</a> rank the same field differently, because a heavier contestant starts from more mass to move. ' +
      'The share of starting weight that a given number of pounds represents is what the <a href="/calculators/weight-loss/">weight loss percentage formula</a> measures.');
    p = subAll(p,
      'A healthy, sustainable weight loss rate is <strong>0.5% to 1.0% of body weight per week</strong>.</p>',
      'A healthy, sustainable weight loss rate is <strong>0.5% to 1.0% of body weight per week</strong>. ' +
      'That benchmark is the same rate the <a href="/calculators/weight-loss/">safe weekly weight loss rate</a> guidance applies across this site.</p>');
    p = subAll(p,
      "Wikipedia's Weight Loss Page</a>.</p>",
      "Wikipedia's Weight Loss Page</a>. " +
      'The energy half of that adaptation is quantified by <a href="/calculators/tdee/">total daily energy expenditure</a>, ' +
      'and the floor below which a deficit becomes unsafe is set by <a href="/calculators/bmr/">basal metabolic rate</a>.</p>');
    return p;
  });

  // Structured data: the root page ships a FAQPage node holding one question that
  // appears nowhere in the visible prose.
  h = dropPhantomFaq(h);

  if (h === before) { stats.blNoop++; return h; }
  stats.blChanged++;
  diff(rel, before, h, '<h1', 'The Biggest Loser weight loss percentage is');
  diff(rel, before, h, '<p>The mathematical equation', 'Firstly, subtract the current weight');
  return h;
}

// zh and ru carry the same layout with translated copy, so only the two edits
// that need no language are applied: the warning glyph in the heading and the
// fullwidth colon that terminates the equation lead-in.
function localizeBL(html, rel) {
  const before = html;
  let h = mapProse(html, (p) => {
    p = p.replace(/(<h[23]\b[^>]*>)⚠️\s*/g, '$1');
    p = subAll(p, '<p>数学方程表示为：</p>', '<p>数学方程如下。</p>');
    p = subAll(p, '<p>Математическое уравнение выражается:</p>', '<p>Математическое уравнение приведено ниже.</p>');
    return p;
  });
  h = dropPhantomFaq(h);
  if (h !== before) stats.blLocalized++;
  return h;
}

// ---------------------------------------------------------------- driver
const targets = [];
const LOCALIZED = new Set(['zh', 'ru']);
for (const t of TREES) {
  const pre = t === 'en' ? '' : t + '/';
  if (FAMILIES.includes('hw')) for (const f of walk(path.join(ROOT, pre + 'calculators/bmi/height-weight'))) targets.push([f, rewriteHW]);
  if (FAMILIES.includes('wl')) for (const f of walk(path.join(ROOT, pre + 'calculators/weight-loss'))) {
    if (/[\\/]from-\d+-to-\d+[\\/]/.test(f)) targets.push([f, rewriteWL]);
  }
  if (FAMILIES.includes('bl')) {
    const fn = LOCALIZED.has(t) ? localizeBL : rewriteBL;
    for (const f of walk(path.join(ROOT, pre + 'calculators/biggest-loser'))) targets.push([f, fn]);
  }
}
let picked = targets;
if (SAMPLE) {
  const pick = (name, n) => targets.filter((x) => x[1].name === name).slice(0, n);
  // --extra= adds named pages on top of the first six of each family, so a
  // review sample can include the rare shapes (e.g. one page per category).
  const fnFor = (relPath) => {
    const tree = relPath.split('/')[0];
    if (/height-weight/.test(relPath)) return rewriteHW;
    if (/biggest-loser/.test(relPath)) return LOCALIZED.has(tree) ? localizeBL : rewriteBL;
    return rewriteWL;
  };
  const extra = flag('extra', '').split(',').map((s) => s.trim()).filter(Boolean)
    .map((relPath) => [path.resolve(ROOT, relPath), fnFor(relPath)]);
  picked = [...pick('rewriteHW', 6), ...pick('rewriteWL', 6), ...pick('rewriteBL', 3), ...pick('localizeBL', 2), ...extra];
}
console.log('targets=' + targets.length + ' processing=' + picked.length + (DRY ? ' DRY' : ''));
for (const [f, fn] of picked) {
  const rel = f.slice(ROOT.length + 1).replace(/\\/g, '/');
  const src = fs.readFileSync(f, 'utf8');
  const out = fn(src, rel);
  if (out !== src && !DRY) fs.writeFileSync(f, out, 'utf8');
}
console.log(JSON.stringify(stats));
if (bails.length) console.log('BAILS ' + bails.length + ' :: ' + bails.slice(0, 12).join(' | '));
const outName = flag('out', SAMPLE ? 'koray-sample-diff.txt' : '');
if (outName) {
  fs.writeFileSync(path.resolve(ROOT, outName), DIFF.join(EOL), 'utf8');
  console.log('diff -> ' + outName + ' entries=' + DIFF.length / 3);
}
