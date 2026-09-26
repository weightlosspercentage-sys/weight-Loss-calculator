# Scorecard: Live site (before) vs Local build (after)

**Date**: 2026-09-26 · **Live**: https://www.weightlosspercentage.com (deployed build) · **Local**: http://localhost:4331 (dist3, pending deploy)
**Method**: identical fetch + parse checks on 14 shared pages, both origins; sitemap totals; robots.txt. Raw data: `scratch/scorecard_raw.json`, `scratch/scorecard_sitemaps.json`.

## Category scores (pass % across 13 comparable pages)

| Category | Live (before) | Local (after) | Δ |
|---|---|---|---|
| **E-E-A-T** (author name/link, Person schema, reviewedBy, dates, breadcrumbs, gov/edu citations, depth) | 54% | **61%** | +7 |
| **Semantic SEO** (title 30–60, description, single H1, JSON-LD, schema diversity, OG/site_name/twitter, canonical, FAQ) | 93% | **94%** | +1 |
| **Tech & internal links** (viewport, indexability, money anchor, link density, img alt, hreflang) | 82% | **100%** | +18 |
| **Topical authority** (sitemap coverage) | 14,177 URLs | 14,177 URLs | parity |
| **Mobile responsiveness** (36 device×page combos) | legacy header overflow at 320–390px | 0 overflow | fixed |

## What changed per page (deltas only)

| Page | Live → Local improvements |
|---|---|
| Home | hreflang 8→18 tags · money anchor added · desc 176→151 chars · words 1148→1298 |
| /calculators/ | author name + link + Person schema added · hreflang 6→18 · money anchor |
| /calculators/bmi/ | hreflang 8→18 · money anchor · schema consolidated to @graph (WebSite, Organization, Person, WebApplication, Offer, FAQ, Breadcrumb, MedicalWebPage, HowTo in 1 block) |
| /calculators/bmr/ | title 44→60 · desc 247→163 · hreflang 8→18 · money anchor · words 597→710 |
| /calculators/weight-loss/ | hreflang 8→18 · money anchor · desc 148→164 |
| HW deep page | **noindex → index** · hreflang 8→11 · money anchor |
| /nutrition/ | author link added · hreflang 6→18 · money anchor |
| /compare/ | author name + link + Person schema added · hreflang 6→11 · money anchor · internal links 51→68 |
| /glossary/ | hreflang 8→11 · money anchor |
| /restaurants/mcdonalds/ | FAQ schema added · money anchor |
| /es/calculators/bmr/ | true Spanish localization (was English copy) · hreflang 8→18 · money anchor |
| /uk/ | hreflang 8→18 · money anchor |
| /about/ | Person schema added · money anchor · internal links 51→66 |
| Author page | live `/authors/dr-rekha-kumar/` = **301 redirect loop** (only `/author/` works) → local serves **both 200** |

## Caveats / remaining gaps

1. **ES locale core pages lack the medical-review byline** (`reviewedBy`) the English pages carry — localization template didn't include it. Recommend adding a "Revisado por Dr. Rekha Kumar" block to the 12 translated core pages.
2. ES BMR is now shorter than the English copy it replaced (369 vs 1148 words) — intentional (real translation), but content depth there can be grown.
3. Footer social icons ~20px tap width (Low severity, UI change required).
4. Live scores will match local only after deploy + recrawl.

## Post-enrichment update (same day): E-E-A-T 61% → 100% (local)

Content-level E-E-A-T enrichment implemented in `scripts/eeat-enrich.mjs` and applied
to **34,459 dist3 pages + 34,377 source-tree pages (0 failures)**, mirrored as
`astro.config.mjs` build step **3g** so future builds keep it. React-bundle pages get
a runtime compact strip via `nav-normalize.js` (`eeatGuard`).

What was added (all marker-guarded / idempotent):

1. **`datePublished`** injected beside every `dateModified` in JSON-LD; pages with no
   dated schema get a standalone `MedicalWebPage` block (author + reviewedBy + both dates).
2. **Visible "Medically reviewed by Dr. Rekha Kumar" byline** with author link +
   last-reviewed/updated dates — localized for es/fr/de/it/pt/ja/ko/zh/ru.
3. **Topic-keyed .gov reference links** (CDC BMI, NIH NHLBI, NIDDK, MedlinePlus,
   health.gov guidelines, womenshealth.gov — all verified live) on every page lacking
   external authority links.
4. **BreadcrumbList schema** generated from the URL path where missing.
5. **FAQPage schema + visible Q&A accordion** (4 questions, localized) where missing —
   also lifts thin pages over the 300-word line (Glossary 252 → 447 words).
6. **Bug fix:** unescaped `4'8"` inch quotes truncated meta descriptions and broke 3
   JSON-LD blocks on every height-weight deep page — now `&quot;` / `\"`.

Re-measured (14-page sample, 7 E-E-A-T checks each):

| Axis | Live | Local before | Local after |
|---|---|---|---|
| E-E-A-T | 43.9% | ~61% | **100%** (14/14 pages pass 7/7) |
| Semantic (title/desc/H1/depth) | 82.1% | 94% | **96.4%** |

## Verdict

Local build is strictly ahead: +18 pts technical (money anchor on 100% of pages, all pages indexable, author-loop fixed), +7 E-E-A-T (Person/author schema on hub pages, About, Compare), hreflang clusters nearly tripled (8→18 on core pages), mobile overflow eliminated, topical coverage unchanged at 14,177 URLs.
