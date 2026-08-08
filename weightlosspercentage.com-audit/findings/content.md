# Content Quality & E-E-A-T Findings

Domain: https://www.weightlosspercentage.com
Crawl: 500 pages analyzed
Date: 2026-08-08

## What works
- Blog content is substantial: avg ~1,012 words/article (max 2,180).
- Calculator pages avg ~816 words — good depth for tool pages.
- Every page includes a global Medical Disclaimer + Evidence-Based Guidelines block (YMYL-positive) via `BaseLayout.astro`.
- Schema declares named clinical author ("Dr. Sarah Jenkins, Clinical Dietitian & Weight Management Specialist") on blog articles.
- Unique page titles across all 500 crawled pages (no exact-duplicate titles in the sample).

## HIGH

### 1. On-page E-E-A-T signals are weak — author bio and freshness not visible in rendered HTML
- **Severity: High** (YMYL vertical: health)
- On `/blog/how-to-calculate-weight-loss-percentage/` (1,267 words): no `<meta name="author">`, no author byline/author profile link in the visible content, no visible "last updated" date, only 2 external reference links in the body, and no in-article medical disclaimer.
- The schema `Article` block declares `author` and `dateModified`, but Google strongly weights **visible** author/credential signals for Your-Money-or-Your-Life content.
- **Recommendation:** Add visible author byline with credentials + author bio linking to a team page; add an on-article "Reviewed by / Last updated" line; expand citations to primary sources (CDC, WHO, NIH, peer-reviewed trials) with linked references.

### 2. Thin content on locale sites — /zh/ pages average ~70 words
- **Severity: High**
- Word counts by locale (14 pages each): zh avg **70** (min 47, max 169), uk avg 288, ru avg 299. Home/about/contact/terms/privacy/glossary/compare on `/zh/` are 47-68 words — effectively stub pages.
- Examples: `/zh/privacy/` (47), `/zh/terms/` (47), `/zh/disclaimer/` (47), `/zh/about/` (49), `/zh/calculators/` (59), `/zh/nutrition/` (60).
- **Recommendation:** Either invest in proper translation of all content for zh/ru, or noindex low-value thin locale pages. Partial-machine-translated thin pages create duplicate/thin-content risk for Google.

### 3. Near-duplicate localized content: UK/CA/AU/NZ homepages ~80% identical to US
- **Severity: High**
- Sequence-similarity vs US homepage: UK 80.55%, CA 80.46%, AU 80.39%, NZ 80.34%. These are English re-spellings (lbs→stones/kg, localized units) rather than unique content.
- ZH (5.52%) and RU (6.77%) are genuine translations.
- **Impact:** The hreflang setup (correct, return tags present) mitigates but does not eliminate the near-duplicate risk; Google may consolidate these into one result and ignore locale value.
- **Recommendation:** Add genuinely localized content (local guidelines, BMI categories per NHS/Health Canada, local calculators, UK/AU unit defaults) to differentiate locale pages.

## MEDIUM

### 4. 123 of 500 crawled pages have <300 words (24.6%)
- Clusters: legal/policy pages (~200 words is fine), locale stubs (above), some calculator and category pages (`/zh/...`, `/ru/...`), glossary entries.
- **Recommendation:** Audit pages under 300 words; expand or merge.

### 5. Titles: 328 pages >60 chars, 78 pages <30 chars
- Too long: e.g. `Calorie Deficit Calculator — Find Your Exact Daily Target (Free 2026)` (~60+). Too short: legal pages (`Privacy Policy`) and `/zh/` pages.
- **Recommendation:** Target 50-60 chars; keep keyword near the front; avoid "Free 2026" promo strings that date-stamp content.

## LOW

### 6. Readability slightly dense
- Homepage avg sentence length ~23 words (roughly college level). Flesch target for health content ~60-70 (8th-9th grade).
- **Recommendation:** Shorten sentences in homepage intro and calculator explainers.

### 7. Meta descriptions present on all 500 pages; 25 are <50 chars
- Legal pages have appropriately short descriptions; verify the 25 short ones aren't truncation artifacts.

## On-Page signals captured (500 pages)
- Missing H1: 0 | Multiple H1: 0 | Missing meta description: 0 | Missing canonical: 0 | Noindex: 0
- Internal links per page: present (navigation-heavy header/footer); avg ~30-60 internal link anchors per page.

## SCORE (Content Quality): 55/100
Strong blog depth and YMYL disclaimer infrastructure offset by thin localized sites, weak visible E-E-A-T, and near-duplicate locale content.
