# Sitemap & Crawlability Findings

Domain: https://www.weightlosspercentage.com
Date: 2026-08-08

## Summary
- Sitemap index: https://www.weightlosspercentage.com/sitemap.xml → 9 sub-sitemaps, all return 200 and are well-formed XML.
- Total URLs: locale sitemaps 74×7 = 518 (us/uk/ca/au/nz/zh/ru), `sitemap-from-to-weight.xml` = 2,457, `sitemap-bmi.xml` = 11,375. **Total ≈ 14,350 URLs.**
- robots.txt: `Allow: /` for all normal crawlers; disallows `/api/`, `/*?`, `/cdn-cgi/`.

## HIGH

### 1. Index bloat: 13,832 (96%) of sitemap URLs are programmatic calculator-result pages
- **Severity: High**
- 11,375 BMI pages + 2,457 from-to-weight pages overwhelm the 518 content pages.
- Sampled pages return 200 and have real content (from-to-weight avg 1,246 words; bmi avg 827), so they are not empty — but these are template pages with high similarity, high URL volume, and limited unique value.
- Robots allows them; without proper quality gates they consume a disproportionate share of crawl budget and can dilute site authority.
- **Recommendation:** Apply a quality gate — for pages below a uniqueness/word threshold, either `noindex` them or exclude from sitemaps. Prioritize a curated top-N (e.g., most-searched weight ranges) in sitemaps, and keep the rest crawlable-but-noindexed. Verify the bmi pages' internal linking depth and canonicalization.

### 2. Sitemap `lastmod` values are static/stale (all 2026-07-30)
- **Severity: Medium**
- Every sitemap and the index report the same single lastmod date regardless of actual content changes; several blog posts show earlier dates.
- **Recommendation:** Compute per-URL lastmod from file mtime in `scripts/update_sitemaps_lastmod.py` and regenerate on each deploy.

## MEDIUM

### 3. Coverage gaps: 11 crawled URLs missing from sitemaps
- Truly missing pages: `/calculators/weight-loss/from-120-to-114/` (this page is a soft-404 serving the homepage), `/blog/anti-gravity-exercises-weight-loss/` (a real 1,961-word article).
- Slash-less variants (`/calculators/bmi`, `/calculators/tdee`, ...) 308-redirect to canonical slash forms and should not be listed.
- **Recommendation:** Add the anti-gravity article to sitemap; remove/replace the phantom from-120-to-114 entry once soft-404s are fixed.

## LOW / INFO

### 4. Locale sitemaps appear correctly scoped
- Spot-checked that locale URLs use their region prefix (e.g. sitemap-uk.xml → `/uk/...`). Hreflang tags are present with return links on every sampled page (8 alternates on calculators: x-default + en-us + en-gb + en-ca + en-au + en-nz + zh + ru).

### 5. No `hreflang` in sitemaps
- Locale sitemaps do not include xhtml:link hreflang annotations. Not required (page-level hreflang is present), but adding them improves cross-verification.

## Sitemap status sample (120 URLs tested, allow_redirects=False)
- sitemap-us.xml: 40/40 → 200
- sitemap-bmi.xml: 40/40 → 200
- sitemap-from-to-weight.xml: 40/40 → 200

## SCORE (Sitemap quality): 65/100
Clean structure and healthy URLs, but index bloat and stale lastmod need attention.
