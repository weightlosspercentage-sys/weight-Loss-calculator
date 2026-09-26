# Interlinking & Anchor Text Audit — Before vs Now

Date: 2026-09-26 · Site: weightlosspercentage.com (Astro + static trees, `dist3`)

- **Before** = pre-session committed state (`git HEAD` source trees, 14,177 pages — the same content the live site serves) + live origin sample
- **Now** = current `dist3` build (34,460 pages incl. i18n/regional trees) + localhost sample
- Method: full site-wide link-graph scans (`scratch/interlink_graph_scan.mjs`, reports in `scratch/interlink_graph_{before,now}.txt`) + 14-page live-vs-local sample (`scratch/interlink_compare.cjs`)
- Region/language prefixes normalized before counting (a `/uk/calculators/` link counts toward the `/calculators/` pillar)

## 1. Site-wide totals

| Metric | Before (HEAD) | Now (dist3) |
|---|---|---|
| Pages scanned | 14,177 | 34,460 (2.4× incl. 7 lang + 9 regional trees) |
| Internal links | 825,295 | 1,845,492 |
| Avg links / page | 58.2 | 53.6 |
| Pages with 0 internal links | 0 | 0 |
| Unique link targets | 11,790 | 28,355 |

## 2. Anchor text ratio (site-wide)

| Anchor class | Before | Now |
|---|---|---|
| Descriptive (3+ words) | 49.9% | **53.1%** |
| Descriptive (2 words) | 30.3% | 27.9% |
| Single word | 15.3% | **11.7%** ↓ |
| Branded | 4.5% | 5.5% |
| **Money exact** ("weight loss percentage calculator") | **0.0% (6 links)** | **1.9% (34,454 links — one per page, 99.98% coverage)** |
| Generic (click here / read more…) | 0.0% | 0.0% |
| Bare URL / empty | ~0% | ~0% |

No spammy anchor classes on either side; the session's change moved the mix toward descriptive + one unique exact-money anchor per page (Google-exact on the money term is now ~2%, well inside a natural ratio).

## 3. Money page (`/`) interlinking

| Metric | Before | Now |
|---|---|---|
| Inbound internal links to `/` | 40,537 | **107,145** (top target site-wide) |
| Inbound with money-exact anchor | 6 | **34,437** |
| Pages carrying exactly one money anchor | 0 | 34,454 (step 3e + footer injection, verified 27/27 live earlier) |

## 4. Pillar page inbound (pages linking to each pillar)

| Pillar | Before | Now |
|---|---|---|
| /calculators/weight-loss/ (weight-loss pillar) | 44,974 | **107,105** |
| /compare/ | 28,317 | **68,822** |
| /calculators/ (tools pillar) | 27,255 | **66,321** |
| /glossary/ | 20,237 | **40,547** |
| /nutrition/ | 15,226 | **34,387** |
| /category/weight-loss/, /category/nutrition/ | 3 | 4 — **still orphaned** (only sitemap-silo references; see gaps) |

Every pillar roughly doubled+ its inbound interlink count (more from i18n/regional trees inheriting the footer/nav, plus nav-normalize region rewriting).

## 5. Per-page sample, live → local (14 pages)

| Page | Internal links | Unique targets | → pillars | Money anchor |
|---|---|---|---|---|
| Home | 101 → 79 | 62 → 31 | 10 → 15 | 0 → 1 |
| /calculators/ | 88 → 102 | 58 → 61 | 21 → 30 | 0 → 1 |
| /calculators/bmi/ | 61 → 53 | 27 → 29 | 12 → 13 | 0 → 1 |
| /calculators/bmr/ | 52 → 43 | 26 → 27 | 11 → 8 | 0 → 1 |
| /calculators/weight-loss/ | 59 → 55 | 26 → 29 | 10 → 10 | 0 → 1 |
| HW deep (4-8/250) | 52 → 48 | 33 → 36 | 10 → 10 | 0 → 1 |
| /nutrition/ | 84 → 98 | 53 → 55 | 19 → 28 | 0 → 1 |
| /compare/ | 39 → 57 | 22 → 30 | 18 → 27 | 0 → 1 |
| /glossary/ | 35 → 36 | 23 → 23 | 7 → 7 | 0 → 1 |
| /restaurants/mcdonalds/ | 38 → 35 | 25 → 28 | 8 → 8 | 0 → 1 |
| /es/calculators/bmr/ | 101 → 35 | 62 → 23 | 10 → 6 | 0 → 1 |
| /uk/ | 55 → 55 | 28 → 28 | 9 → 9 | 0 → 1 |
| /about/ | 41 → 55 | 23 → 26 | 11 → 11 | 0 → 1 |
| /authors/dr-rekha-kumar/ | **0 (live 301 loop)** → 35 | 0 → 26 | 0 → 7 | 0 → 1 |

Notes:
- **ES BMR 101→35**: live serves the full English mega-footer to Spanish pages; local ships a localized 35-link set — fewer, more relevant links (not a regression).
- **Author page 0→35**: live `/authors/dr-rekha-kumar/` is a redirect loop (uncrawlable, 0 links); local serves it with 35 internal links incl. 7 pillar links.
- Thin hubs gained links: /compare/ 39→57, /about/ 41→55 (author + related-tool links from this session's earlier interlinking work).

## 6. Cleanup wins vs before

- Dead `/blog/` links: **16,140 → 0** (removed from footers/nav).
- `/contact/` footer weight: 28,300 → 4,276 (demoted from every-page footer prominence).
- Every page now carries exactly one money anchor + reviewed-by/references links (E-E-A-T pass) with no generic anchors introduced.

## 7. Remaining gaps (not yet done)

1. `/category/*` silo pages are still near-orphans (4 inbound) — add category links from calculator hub cards or breadcrumbs (breadcrumb schema was added today, but visible category links are the crawl path).
2. Author-page authority flow: 34,253 pages now link `/authors/dr-rekha-kumar/` via the E-E-A-T strip — after deploy, watch GSC crawl on that URL.
3. Live scores only update after deploy + recrawl.
