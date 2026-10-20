# Project Memory & Historical Context

## Key Technical Decisions & Project Evolution

### 1. Medical Accreditation & Author URL Consolidation
* **Decision:** Consolidate all author profile pages under the plural `/authors/dr-rekha-kumar/` URL path.
* **Rationale:** Previously, duplicate singular `/author/` and plural `/authors/` URLs existed for Dr. Rekha Kumar and legacy references. Consolidating to `/authors/dr-rekha-kumar/` eliminated URL duplication issues in Google Search Console and sitemaps.
* **Completed (2026-10):** the surviving `author/dr-rekha-kumar/index.html` orphan (35,879 bytes, canonical pointing at `/authors/`, zero sitemap `<loc>`, zero inbound links in 34,399 scanned files) is deleted; `.htaccess` 301s `/author/dr-rekha-kumar` to the plural page so any external link still resolves instead of hitting the site-wide 404 catch-all. Rules.md 2.1 forbids singular pages.
* **LinkedIn Integration:** Dr. Rekha Kumar's official LinkedIn profile is integrated into Schema.org Person markup and profile UI:
  `https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/`

### 2. Sitemap Duplicate Cleanup & XSL Fixes
* **Decision (2026-09):** Built `fix_and_rebuild_sitemaps.py` and updated `astro.config.mjs`.
* **Fixes Applied:**
  - Removed duplicate `customPages` entry in `astro.config.mjs`.
  - Filtered out legacy `/author/` and `sarah-jenkins` paths from `sitemap-main.xml`.
  - Fixed date rendering bug in `sitemap.xsl` so `<lastmod>` date strings (`YYYY-MM-DD`) render once as `2026-09-09` instead of duplicate `2026-09-09 2026-09-09`.
* **Superseded (2026-10):** `fix_and_rebuild_sitemaps.py` is deleted. Its `ROOT_DIR` pointed at a different workspace (`d:\projects\Weight Loss Percentage\Live\...`), so it never touched this repo, and it rebuilt a monolithic `<urlset>` at `/sitemap.xml` — which contradicts the index-plus-silos design and would have broken `sitemap-index.xml` references. The build owns this now: `postProcessHtml` → `pruneNoindex()` (returns `prunedUrls`) → `syncSitemaps()` in `astro.config.mjs`. Audit with `npm run check:sitemaps`.

### 3. SPA Navigation Guard
* **Decision:** Injected `spaNavGuard.mjs` script hook during Astro HTML post-processing.
* **Rationale:** Prevents client-side router 404 errors when users click between static SSG pages and client-side React calculator components.

### 4. Git Repository & Remote Setup
* **Repository URL:** `https://github.com/weightlosspercentage-sys/weight-Loss-calculator.git`
* **Default Branch:** `master`

## 5. Koray Semantic Rewrite (2026-10-18)

Spec: re-architect pages for entity relevance, AI-Overview intent satisfaction and low
Cost of Retrieval, per Koray Tugberk Gibur's Semantic Framework / Algorithmic Authorship.

**Rules enforced in code (STEPS 1-4):**
* **STEP 1 - Declaration-First.** The first paragraph states the Is-A answer in the first
  sentence: `The Body Mass Index for {h} and {w} lbs is {bmi}.` / `The weight loss
  percentage from {A} lbs to {B} lbs is {pct}.` Then the definition, then the
  classification + its band, then where the summary lives. Qualifying conditions come
  last, never first. The Centerpiece visual (Calculation Summary box / Interactive
  Estimator) is named in prose immediately under the H1.
* **STEP 2 - micro-semantic.** No heading may contain a colon or join two topics with
  `&` - each heading states one entity (`Starting at 100 lbs: What to Expect` ->
  `What to Expect at a Starting Weight of 100 lbs`; `Metabolic & Clinical Health
  Implications` -> `Metabolic and Clinical Health Implications`). Multi-step processes use
  ordinals (Firstly/Secondly/Thirdly/Finally), one Entity-Attribute-Value sentence per
  step. Filler openers removed. **Exception held deliberately:** a paragraph that
  introduces the table directly beneath it keeps its trailing colon - a period there is
  wrong English. Ordinals are **not** applied to BMI (one formula step, not a process).
* **STEP 3 - modality balance.** Factual+structured (summary box), factual+unstructured
  (definition prose), opinionated+structured (classification band), opinionated+
  unstructured (safety callout).
* **STEP 4 - link anchoring.** No page may repeat an exact-match anchor to the same
  target. Assigned by occurrence index, and every phrase must stay true to the target.
  Hrefs are normalised to the canonical quoted, trailing-slash form *before* anchor
  rewriting so a re-run is a byte-for-byte no-op.

**The constraint that governs any content work here - read before editing HTML:**
Committed HTML is the source of truth (generators archived; `[...fallback].astro` serves
one dummy path and ~49k committed trees overlay Astro's output). Two kinds of page exist:
* **Editable** - pages with no React bundle script. Committed prose IS the rendered page.
  Only two families qualify: `calculators/bmi/height-weight/*` (1,625 per tree) and
  `calculators/weight-loss/from-*` (351 per tree) across `us`, `uk`, `ca`, `au`, `nz` =
  **9,880 pages**.
* **Bundle-locked** - pages loading `assets/index-*.js`. `createRoot(#root).render()`
  *replaces* `#root`, so editing their committed prose changes nothing a JS-rendering
  crawler sees. Includes `/`, `calculators/newborn-weight-loss`, `baby-weight-loss`,
  `weight-loss`, `bmr`, `keto`, `restaurants/subway`. Proven in-browser locally and on
  production: `/calculators/baby-weight-loss/` renders the newborn page's H1 under a
  mismatched `<title>`, `/calculators/weight-loss/` renders the calorie-deficit tool.

**Tooling:** `scripts/koray-rewrite.mjs` (untracked) - idempotent read-modify-write
codemod, `--sample --dry` to print a diff without touching files, `--trees=`,
`--families=`, `--extra=`, `--out=`. Two invariants: prose transforms must never enter
`<script>` bodies, and every JSON-LD edit goes parse -> mutate -> reserialize (regex
surgery on JSON corrupts blocks and cannot be proven safe across 9,880 files). Files are
CRLF; splice multi-span edits in reverse offset order; use `/g` because a locale page can
render one section twice.

**Measured result (before = HEAD, after = worktree, live markup only - scripts and HTML
comments stripped so nothing un-followable is counted):** declaration-first 0 -> 9,880
pages; colon headings 7,020 -> 0 on WL; `&` headings 3,510 -> 0; live non-canonical
calculator hrefs 10,505 -> 0; orphan `FAQPage` blocks 1,755 dropped; hub anchor repeats
75 -> 0 on WL; +68 words/page on BMI, +199 on WL. Zero links removed. Build exit 0.

**Still open:**
* BMI pages repeat one hub anchor 0.73x/page (5,910 instances) - the `rewriteHW` rules are
  phrase-keyed, so the assessment paragraph and the FAQ answer both receive the same
  anchor. Fix = extend WL's occurrence rotation to HW, re-sweep 8,125 files.
* Reach is capped at **41.4% of impressions / 20.3% of clicks** (GSC export
  2026-10-18). Closing the rest needs bundle surgery or a React source rebuild, which was
  declined.
* 11 of the top 60 GSC URLs are absent from disk, incl. all `/blog/*`.
* `uk/calculators/bmi/height-weight/5-8/270` and `/6-3/335` hold a neighbour's content and
  canonicalize elsewhere; `uk/.../from-280-to-220` renders one section twice.

## 6. No-AI-Slop Standard (2026-10-19)

Reference the user asked to keep and to work under: **<https://en.wikipedia.org/wiki/AI_slop>**

**Definition on record:** AI slop is digital content made with generative AI "that is
perceived as lacking in effort, quality, or meaning, and usually produced in high volume
to gain advantage, to earn money, or to deceive people" (Hern & Milmo 2024; Read 2024).
Also defined as "digital clutter" and "filler content prioritizing speed and quantity over
substance and quality". Kommers et al. (Jan 2026) hold that it resists formal definition
but name three prototypical properties:

* **Superficial competence** - it looks finished and reads fluent; the failure is substance, not polish.
* **Asymmetric effort** - far less work went in than the artefact implies, and the cost of
  that gap lands on the reader (HBR/Stanford/BetterUp "workslop": "AI-generated content
  that looks good, but lacks substance" - 40% of employees received it, ~2 hours to resolve each).
* **Mass producibility** - templated, high volume, same shape at scale.

Related failure modes named in the article that apply directly to a site like this one:
**model collapse** (slop training on slop converges output - the "Elias Thorne lighthouse
keeper" effect); **trendslop** ("propensity for AI to opt for buzzy ideas over reasoned
solutions"); and **AutoBait** (DoubleVerify, Mar 2026: 200+ sites running templated prompts
to publish articles "designed primarily to generate advertising revenue").

**Binding rules for this repo, derived from the three properties:**
1. No bulk content edit may ship a sentence that is *interchangeable between the files it
   was written to*. If the same string lands in 9,880 pages, it is mass producibility by
   definition. Per-page edits must say something true of *that* page (its numbers, its
   entity, its threshold) or must not be made.
2. Do not add polish that implies work that was not done - schema, ratings, dates,
   authorship and citation claims must be backed by the page's own visible content. This is
   why the 52 committed pages carrying `aggregateRating` 4.8 / 890-1250 with zero displayed
   ratings were stripped on 2026-10-19 (`scripts/remove-fake-ratings.mjs`), and why
   `dateModified` must reflect an actual change, not a build-time literal.
3. Volume is not a deliverable. A sweep that touches N files is only justified if each file
   needed the fix; report the count honestly and never present count as quality.
4. Cite the real source next to the claim (the article's own standard), and never invent a
   quotation, credential, study or statistic. Verified fact: the reviewer identity on this
   site is **Dr. Rekha Kumar, M.D., M.S. - Lead Medical Reviewer** (Rules.md §4); the
   "PhD, RD, CPT / Lead Clinical Dietitian" variant served by `llms.txt` and
   `llms-full.txt` was fabricated relative to every other source and was corrected 2026-10-19.
5. Prefer deleting filler to rewriting it. Filler openers, hedge-free boilerplate and
   restated headings should be removed rather than reworded into new filler.
6. Self-check before reporting a content task done: would a reader who knew the generation
   method say "incredibly banal, realistic style" (Gilmore)? If yes, it is not finished.

**Honest exposure on this project:** ~49,000 programmatically generated calculator and locale
pages, of which the largest families ship a 19-character meta description and no `og:title`
(11,375 height-weight pages) - thin at scale is the slop pattern, and metadata and content
work should reduce it rather than add volume to it.

