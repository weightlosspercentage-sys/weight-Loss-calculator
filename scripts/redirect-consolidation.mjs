// Redirect consolidation for URLs Google still believes exist.
//
// Why this file exists
// --------------------
// The site's own Search Console export
// (https___www.weightlosspercentage.com_-Performance-on-Search-2026-09-09/Pages.csv)
// has 253 rows totalling 9,978 impressions and 12 clicks whose URL ships no file and has
// no 301 behind it. Every one of them answers HTTP 200 with the homepage shell while
// self-canonicalising, which Google reads as a soft 404: the demand is real, the page is
// gone, and the equity has nowhere to go. Measured by family:
//
//   /blog/<slug>/              68 rows   6,700 impr   deleted corpus, present in git
//   /<tree>/calculators/weight-loss/from-*/  167 rows  1,862 impr  deleted by pruneNoindex
//   /guide/<slug>/              7 rows     886 impr   predates this repository
//   /calculator/<slug>/         3 rows     434 impr   predates this repository
//   /<legacy>.html              7 rows      88 impr   predates this repository
//
// Target provenance, stated honestly because the three corpora differ:
//   - /blog/ targets were read out of each deleted page's own <title> in git
//     (git show <delete-commit>^:blog/<slug>/index.html), so they are evidence.
//   - /guide/, /calculator/ and the root .html pages appear in NO commit in this
//     repository (git log --all --diff-filter=D -- 'guide/' 'calculator/' -> empty).
//     They predate it. Their targets are chosen from the slug's topic against the live
//     page inventory, which is a judgement, not a record - so a reviewer can disagree
//     with one without disagreeing with the mechanism.
//
// Cloudflare Pages hard limits this file must respect (official docs, fetched 2026-10-21):
//   "A _redirects file is limited to 2,000 static redirects and 100 dynamic redirects,
//    for a combined total of 2,100 redirects. Each redirect declaration has a
//    1,000-character limit."
//   "The order of your redirects matter. If there are multiple redirects for the same
//    source path, the top-most redirect is applied."
//   "Static redirects should appear before dynamic redirects."
// A rule containing `*` or `:placeholder` is DYNAMIC, so the splat form costs budget on a
// different (much smaller) cap. That is why the per-slug rules below are two static lines
// rather than one splat, and why the one family that genuinely needs a splat - 5,616
// pruned thin pages, unaffordable as static rules - emits one dynamic line per tree and
// is guarded against shadowing a file that still ships.

export const BLOG_TARGETS = {
  '10-percent-weight-loss-benefits': '/calculators/weight-loss/',
  '5-percent-weight-loss': '/calculators/weight-loss/',
  'almonds-and-nuts-nutrition-weight-loss': '/nutrition/',
  'anti-gravity-exercises-weight-loss': '/calculators/fitness/',
  'bariatric-surgery-weight-loss-timeline': '/calculators/bariatric-surgery-weight-loss/',
  'best-diet-for-weight-loss': '/nutrition/',
  'biggest-loser-formula': '/calculators/biggest-loser/',
  'calculate-bmr-to-lose-weight': '/calculators/bmr/',
  'calorie-deficit-weight-loss': '/calculators/calorie-deficit/',
  'calories-vs-weight-loss': '/calculators/calorie/',
  'exercise-for-weight-loss': '/calculators/fitness/',
  'fat-loss-vs-weight-loss': '/calculators/fat-loss/',
  'glp1-for-women-hormones': '/calculators/glp1-weight-loss/',
  'glp1-medications-weight-loss-guide': '/calculators/glp1-weight-loss/',
  'glp1-vs-natural-weight-loss-2026': '/calculators/glp1-weight-loss/',
  'healthy-weight-loss-per-month': '/calculators/weight-loss/',
  'healthy-weight-loss-per-month-realistic': '/calculators/weight-loss/',
  'how-to-calculate-body-fat': '/calculators/body-fat/',
  'how-to-calculate-weight-loss-percentage': '/calculators/weight-loss/',
  'keto-diet-weight-loss': '/calculators/keto/',
  'lifestyle-changes-weight-loss-guide': '/calculators/weight-loss/',
  'newborn-weight-loss': '/calculators/newborn-weight-loss/',
  'peptide-therapy-weight-loss-guide': '/calculators/peptide-dosage/',
  'postpartum-weight-loss-safe-guide': '/calculators/postpartum-weight-loss/',
  'postpartum-weight-loss-timeline': '/calculators/postpartum-weight-loss/',
  'signs-body-burning-fat': '/calculators/fat-loss/',
  'sleep-and-weight-loss': '/calculators/weight-loss/',
  'walking-for-weight-loss': '/calculators/walking/',
  'water-fasting-weight-loss': '/calculators/intermittent-fasting/',
  'weight-loss-formulas-explained': '/calculators/bmr/',
  'weight-loss-percentage-at-100-to-130-lbs': '/calculators/weight-loss/',
  'weight-loss-percentage-at-130-to-170-lbs': '/calculators/weight-loss/',
  'weight-loss-percentage-at-170-to-230-lbs': '/calculators/weight-loss/',
  'weight-loss-percentage-at-230-to-300-lbs': '/calculators/weight-loss/',
  'weight-loss-percentage-at-300-to-400-lbs': '/calculators/weight-loss/',
  'weight-loss-percentage-by-starting-weight': '/calculators/weight-loss/',
  'weight-loss-percentage-chart': '/calculators/weight-loss/',
  'weight-loss-plateau': '/calculators/weight-loss/',
  'weight-tracking-guide': '/calculators/weight-loss/',
};

// Only the trees that actually hosted blog files before the deletion (git log
// --diff-filter=D -- '*blog*'). A rule for a URL that never existed spends budget and
// proves nothing.
export const BLOG_TREES = ['', 'au/', 'ca/', 'nz/', 'ru/', 'uk/', 'zh/'];

// /guide/<slug>/ -> live page. 7 rows, 886 impressions, /guide/calculator-guide/ alone
// is 664 at position 24.4, so this is not clutter being tidied, it is demand being
// redirected at a page that can answer it.
export const GUIDE_TARGETS = {
  '5-percent-weight-loss': '/calculators/weight-loss/',
  'burning-fat-signs': '/calculators/fat-loss/',
  'calculator-guide': '/calculators/',
  'how-to-calculate-weight-loss-percentage-in-kg': '/calculators/weight-loss/',
  'understanding-bmi': '/calculators/bmi/',
  'weight-loss-chart': '/calculators/weight-loss/',
  'weight-loss-tips': '/nutrition/',
};

// The legacy singular /calculator/ tree. 3 rows, 434 impressions.
export const CALCULATOR_TARGETS = {
  'female': '/calculators/weight-loss/',
  'walking': '/calculators/walking/',
  'water-fasting': '/calculators/intermittent-fasting/',
};

// Root .html URLs from the pre-Astro site. 7 rows, 88 impressions, but strong
// transactional positions - /about.html sits at 5.0 and /privacy-policy.html at 5.8,
// which is brand navigation, not long-tail scrap.
export const LEGACY_HTML_TARGETS = {
  'about.html': '/about/',
  'author.html': '/authors/dr-rekha-kumar/',
  'privacy-policy.html': '/privacy/',
  'ru/blog.html': '/ru/',
  'terms-conditions.html': '/terms/',
  'weight-loss-percentage-calculator-female.html': '/calculators/weight-loss/',
  'weight-loss-percentage-female.html': '/calculators/weight-loss/',
};

// The thin /calculators/weight-loss/from-<A>-to-<B>/ family that pruneNoindex deletes
// under the locale trees to fit the 20,000-file project limit. Measured on the deployed
// artifact: 0 survivors in all 17 trees, so one dynamic splat per tree cannot shadow a
// file that ships.
// The English originals DO survive on disk, but they are not a valid destination: step 3b
// marks all 351 of them `noindex` at build time and syncSitemaps drops them from
// sitemap-calculators.xml (2,021 -> 1,670). A 301 into an excluded page consolidates the
// request onto a URL that can never rank, which is the outcome this module exists to avoid.
// So the splat targets the nearest indexable ancestor instead - the weight-loss hub.
const THIN_PREFIX = '/calculators/weight-loss/from-';
const THIN_HUB = '/calculators/weight-loss/';
const STATIC_CAP = 2000;
const DYNAMIC_CAP = 100;
// Above this many URLs in one tree, per-URL static rules stop being affordable and the
// splat is the only form left. 5,616 pruned thin URLs vs a 2,000-line cap makes that
// threshold academic, but the guard keeps the fallback explicit.
const STATIC_RULES_PER_TREE = 400;

const MARKER = '# ─── Deleted-URL consolidation (scripts/redirect-consolidation.mjs) ───';

/** Resolve a slug to a target the artifact actually ships: own tree, else English root. */
function resolveTarget(outDir, path, tree, canonical, exists) {
  const local = '/' + tree + canonical.slice(1);
  if (tree && exists(path.join(outDir, tree + canonical.slice(1), 'index.html'))) return local;
  if (exists(path.join(outDir, canonical.slice(1), 'index.html'))) return canonical;
  return null;
}

/**
 * A static rule matches one exact path, and Cloudflare does not treat `/foo` and `/foo/`
 * as the same source. The site canonicalises with a trailing slash, but GSC shows both
 * forms arriving (/blog/how-to-calculate-weight-loss-percentage is its own row at 206
 * impressions). So the no-slash form is not a nicety, it is a separate URL that needs its
 * own rule - and two static lines cost a different budget than one dynamic splat.
 */
function staticPair(from, target) {
  return [`${from} ${target} 301`, `${from}/ ${target} 301`];
}

function countRules(lines) {
  let staticN = 0, dynamicN = 0;
  for (const l of lines) {
    const t = l.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts.length < 3) continue;
    if (/^(301|302|307|308|404|410)$/.test(parts[2]) === false) continue;
    if (parts[0].includes('*') || /:[a-z]+/i.test(parts[0])) dynamicN++;
    else staticN++;
  }
  return { staticN, dynamicN };
}

/**
 * Add the 301s to outDir/_redirects ahead of the 404 catch-alls (a catch-all must never
 * shadow a redirect, and the docs order static before dynamic). Idempotent: rules already
 * in the file are not duplicated, and a second call adds nothing and does not rewrite.
 */
export function applyRedirectConsolidation(outDir, { fs, path, prunedUrls = [], write = console.log } = {}) {
  if (!fs) throw new Error('applyRedirectConsolidation needs an fs implementation');
  if (!path) throw new Error('applyRedirectConsolidation needs a path implementation');

  const file = path.join(outDir, '_redirects');
  if (!fs.existsSync(file)) {
    write('[consolidate] no _redirects in the artifact - 301 block skipped');
    return { static: 0, dynamic: 0, unresolved: 0 };
  }

  const exists = (p) => fs.existsSync(p);
  const staticRules = [];
  const dynamicRules = [];
  let unresolved = 0;

  const addSlugMap = (map, dir, trees) => {
    for (const slug of Object.keys(map).sort()) {
      for (const tree of trees) {
        const target = resolveTarget(outDir, path, tree, map[slug], exists);
        if (!target) {
          unresolved++;
          write(`[consolidate] WARN /${tree}${dir}${slug} -> ${map[slug]} is not in the artifact; rule skipped`);
          continue;
        }
        staticRules.push(...staticPair(`/${tree}${dir}${slug}`, target));
      }
    }
  };

  addSlugMap(BLOG_TARGETS, 'blog/', BLOG_TREES);
  addSlugMap(GUIDE_TARGETS, 'guide/', ['']);
  addSlugMap(CALCULATOR_TARGETS, 'calculator/', ['']);

  // The .html forms are the URL; a trailing-slash variant is not a request anyone makes,
  // and spending a rule on it is budget with no traffic behind it.
  for (const legacy of Object.keys(LEGACY_HTML_TARGETS).sort()) {
    const target = LEGACY_HTML_TARGETS[legacy];
    if (!exists(path.join(outDir, target.slice(1), 'index.html'))) {
      unresolved++;
      write(`[consolidate] WARN /${legacy} -> ${target} is not in the artifact; rule skipped`);
      continue;
    }
    staticRules.push(`/${legacy} ${target} 301`);
  }

  // Thin from-<A>-to-<B> pages prune deleted, one dynamic splat per tree.
  // prunedUrls are absolute paths (/ca/calculators/weight-loss/from-100-to-90/), so the
  // tree is the first segment and the thin prefix sits behind it; a startsWith on the
  // prefix alone matches nothing and would silently emit zero rules.
  const byTree = new Map();
  for (const u of prunedUrls) {
    const tree = u.slice(1).split('/')[0];
    if (!tree || tree === 'calculators') continue;
    if (!u.startsWith('/' + tree + THIN_PREFIX)) continue;
    byTree.set(tree, (byTree.get(tree) || 0) + 1);
  }
  for (const [tree, n] of [...byTree].sort()) {
    // A splat is only safe while nothing under it ships: Pages resolves redirects before
    // it serves a file, so one surviving page here would be 301'd away from itself.
    const survivors = (() => {
      const dir = path.join(outDir, tree, 'calculators', 'weight-loss');
      if (!fs.existsSync(dir)) return 0;
      return fs.readdirSync(dir).filter((d) => d.startsWith('from-')).length;
    })();
    if (survivors > 0) {
      write(`[consolidate] WARN ${tree}/ keeps ${survivors} thin pages; splat skipped to avoid redirecting a live file`);
      continue;
    }
    if (n > STATIC_RULES_PER_TREE) {
      write(`[consolidate] NOTE ${tree}: ${n} urls is beyond the per-tree static budget (${STATIC_RULES_PER_TREE}); splat is the only affordable form`);
    }
    // /us/ and the locale trees differ in one respect that matters: prune counts a
    // noindexed /us/ page as a pruned URL but does not delete it (only LOCALES trees are
    // deleted), so a count alone is not proof of absence. The survivor check above is
    // what the safety rests on; this line records which trees are actually deleted.
    // `tree` is a bare code ('ca'), so the separator has to be written here; interpolating
    // it directly is what produced /cacalculators/... in the first test run.
    // Destination: the tree's own hub when it ships (keeps the visitor in their locale),
    // else the English hub. Both are indexable and listed, unlike the from-* pages.
    const hub = fs.existsSync(path.join(outDir, tree, 'calculators', 'weight-loss', 'index.html'))
      ? `/${tree}${THIN_HUB}`
      : THIN_HUB;
    dynamicRules.push(
      `/${tree}/${THIN_PREFIX.slice(1)}* ${hub} 301`
    );
    write(`[consolidate] ${tree}: ${n} pruned thin urls -> one dynamic splat to ${hub}`);
  }

  const body = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const lines = body.split('\n');
  const present = new Set(lines.map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
  const freshStatic = staticRules.filter((r) => !present.has(r));
  const freshDynamic = dynamicRules.filter((r) => !present.has(r));

  const before = countRules(lines);
  const afterStatic = before.staticN + freshStatic.length;
  const afterDynamic = before.dynamicN + freshDynamic.length;
  const tooLong = [...freshStatic, ...freshDynamic].find((r) => r.length > 1000);
  if (tooLong) throw new Error(`[consolidate] redirect declaration exceeds the 1,000-character limit: ${tooLong.slice(0, 80)}`);
  if (afterStatic > STATIC_CAP || afterDynamic > DYNAMIC_CAP) {
    // Exceeding the cap does not degrade one rule, it endangers the file: the deploy then
    // silently stops applying consolidation, including the rules that were meant to fix
    // the soft 404s. Refuse loudly instead of shipping a partial file.
    throw new Error(
      `[consolidate] would exceed the Cloudflare Pages _redirects limits: ` +
      `static ${afterStatic}/${STATIC_CAP}, dynamic ${afterDynamic}/${DYNAMIC_CAP}. ` +
      `Trim BLOG_TARGETS/GUIDE_TARGETS or move the thin-page family to Bulk Redirects.`
    );
  }

  const addCount = freshStatic.length + freshDynamic.length;
  if (addCount === 0) {
    // Nothing to add: leave the bytes untouched, so a re-run is provably a no-op.
    write(`[consolidate] ${staticRules.length + dynamicRules.length} rules already present, 0 added, ${unresolved} unresolved`);
    return { static: 0, dynamic: 0, already: staticRules.length + dynamicRules.length, unresolved };
  }

  // Insert before the first status-404 rule, statics first, then the splats.
  let insertAt = lines.findIndex((l) => /\s404\s*$/.test(l.trim()));
  if (insertAt === -1) insertAt = lines.length;

  const markerAlreadyPresent = lines.some((l) => l.trim() === MARKER);
  const out = [
    ...lines.slice(0, insertAt),
    ...(markerAlreadyPresent ? [] : [MARKER]),
    ...freshStatic,
    ...freshDynamic,
    ...lines.slice(insertAt),
  ];
  // A Cloudflare _redirects file must end with a newline; the generated one did not, which
  // left its final rule unterminated. Normalise rather than inherit whatever the previous
  // writer left.
  fs.writeFileSync(file, out.join('\n').replace(/\n*$/, '\n'));

  const total = countRules(out);
  write(`[consolidate] ${freshStatic.length} static + ${freshDynamic.length} dynamic 301s added, ${staticRules.length + dynamicRules.length - addCount} already present, ${unresolved} unresolved -> _redirects now ${total.staticN} static / ${total.dynamicN} dynamic (caps ${STATIC_CAP}/${DYNAMIC_CAP})`);
  return { static: freshStatic.length, dynamic: freshDynamic.length, unresolved, totalStatic: total.staticN, totalDynamic: total.dynamicN };
}
