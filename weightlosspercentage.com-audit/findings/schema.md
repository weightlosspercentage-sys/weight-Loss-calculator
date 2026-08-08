# Schema / Structured Data Findings

Domain: https://www.weightlosspercentage.com
Date: 2026-08-08

## What works
- Excellent schema coverage: of 500 pages — Organization (462), BreadcrumbList (229), FAQPage (154), WebApplication (137), Article (83), MedicalWebPage (83), HowTo (73), HealthTopic (73), Person (92).
- Blog articles carry `Article` with headline, description, datePublished/dateModified, Person author, Organization publisher with logo, mainEntityOfPage, image. Strong.
- Calculators carry `WebApplication` (HealthApplication) + `Offer` (free) + `FAQPage` + `BreadcrumbList`. Correct types for the page class.
- All blocks parse as valid JSON-LD.

## HIGH

### 1. Homepage emits duplicated JSON-LD blocks (2x Organization, 2x FAQPage, 2x WebApplication)
- **Severity: High**
- Live homepage has **6** JSON-LD blocks: Organization, FAQPage, WebApplication, then the same Organization, FAQPage, WebApplication again — byte-identical pairs.
- 90 of 500 pages emit >=6 schema blocks; 268 emit only 1 (the default Organization).
- Cause: `index.astro` passes `parsed.seoProps.schemas` into `BaseLayout` → `SEO.astro`, which renders them, while the raw parsed HTML also carries its own `<script type="application/ld+json">` blocks (parser only strips canonical links, not JSON-LD). Net effect: doubled schema.
- **Impact:** Duplicate structured data can cause Google to ignore rich-result features; flagged as a quality issue.
- **Recommendation:** De-duplicate — strip JSON-LD from `headInner` in `parser_v2.ts` (like it already strips canonical) OR stop passing page schemas into SEO.astro. Emit each entity once.

### 2. Brand inconsistency in schema author
- **Severity: Medium**
- `WebApplication.author` = Organization `"WeightLossPercentage.com"` while the site brand is "Weight Loss Percentage" (no camelcase). Also `Article.publisher.name` = `WeightLossPercentage.com`.
- **Recommendation:** Use one consistent organization name/URL across all schema (and link Organization to the same entity with `sameAs` for social profiles if they exist).

## MEDIUM

### 3. Missing `WebSite` + `SearchAction` schema
- No `WebSite` type with potentialAction/SearchAction anywhere in the crawl.
- **Recommendation:** Add sitewide `WebSite`/`SearchAction` JSON-LD in the default SEO block.

### 4. No `Person` entity connecting authors to the Organization
- `Article.author` is a Person without `worksFor`/`url` (no author profile page). The `Person` type appears 92x but never linked to the publisher.
- **Recommendation:** Add an author bio page and reference it in schema (`Person.url`, `worksFor`).

## LOW / INFO

### 5. Missing opportunities
- **Glossary:** no `ItemList`/`DefinedTermSet` schema on `/glossary/`.
- **Compare pages:** no `Article`/`FAQPage` on `/compare/` pages (many exist in crawl as 4 category pages with no schema variety beyond Organization).
- **Restaurants/nutrition pages:** no `NutritionInformation` schema on restaurant nutrition pages.
- **from-to-weight / bmi programmatic pages:** rely on template defaults; if retained for indexing, add `FAQPage`/`WebApplication` consistently.
- `MedicalWebPage` present (83) — good; keep `MedicalCondition`/`MedicalCode` associations where accurate.

## RECOMMENDED MERGE (homepage)
Consolidate the 6 homepage blocks into a single `@graph`:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "name": "Weight Loss Percentage", "url": "https://www.weightlosspercentage.com" },
    { "@type": "WebSite", "name": "Weight Loss Percentage", "url": "https://www.weightlosspercentage.com/",
      "potentialAction": { "@type": "SearchAction", "target": "https://www.weightlosspercentage.com/search?q={query}", "query-input": "required name=query" } },
    { "@type": "WebApplication", "name": "Weight Loss Percentage Calculator", "url": "https://www.weightlosspercentage.com/",
      "applicationCategory": "HealthApplication", "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },
    { "@type": "FAQPage", "mainEntity": [ ...single set of questions... ] }
  ]
}
```

## SCORE (Schema): 75/100
Coverage is a strength; duplication and minor consistency issues hold it back.
