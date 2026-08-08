# Search Experience (SXO) Findings

Domain: https://www.weightlosspercentage.com
Date: 2026-08-08

## SERP evidence
- Query: **"weight loss percentage calculator"** (the site's exact-match keyword; domain literally IS weightlosspercentage.com).
- Observed top-8 organic results: Omni Calculator, Good Calculators, The Calculator, Inch Calculator, percentagecalculatorbox.com, calculator-online.net, easyprotools.com, calculator.academy. **weightlosspercentage.com does not appear.**
- SERP features present among competitors: direct calculator widgets, embedded formula explanations, FAQ blocks, comparison tables, references to NIDDK/CDC/WebMD (authority citations), author bylines with credentials.

## HIGH

### 1. Page-type mismatch + canonical failure suppress the exact-match homepage
- **Severity: High**
- For a tool keyword, Google rewards pages that are (a) crawlable with a resolvable canonical, (b) a functional calculator with clear widget, and (c) backed by authoritative citation. The homepage fails (a) via the localhost canonical and is further penalized by serving as the soft-404 catch-all (every missing URL returns the homepage).
- The site's own `/calculators/weight-loss/` is the better-matching URL but competes with the homepage for the same query without a clear sitewide internal-linking vote.
- **Recommendation:** After redeploy, point internal links + sitemap + a sitewide `WebSite` entity at a single target for this query; decide whether homepage or `/calculators/weight-loss/` owns "weight loss percentage calculator" and canonicalize accordingly (both are viable; pick one and link consistently).

### 2. Content surfaces that outrank this site share strong visible proof
- Competitors show: formula + worked example above the fold, unit toggle, related calculators, references to authoritative sources, author bios, and FAQ. This site has the depth but buries proof: 2 external references in the flagship article vs competitors' 2-4+ with named sources (WebMD, NHLBI, NIDDK, CDC).
- **Recommendation:** Add a visible "Sources & references" section and worked example to calculator pages and the flagship article; surface the dietitian byline and review date on-page.

## MEDIUM

### 3. Locale duplication weakens user-story matching
- en-gb/en-ca/en-au/en-nz users land on ~80%-identical content; the user story ("use stones/kg, NHS guidance") is weakly served. This is an intent mismatch for regional queries (e.g., "weight loss calculator kg UK").

## LOW

### 4. Search-action schema absent
- No `WebSite` SearchAction; a site with a calculator suite should expose one.

## SCORE (SXO): 45/100
The exact-match domain should dominate this query; canonical failure + weak visible proof + locale parity explain non-ranking.
