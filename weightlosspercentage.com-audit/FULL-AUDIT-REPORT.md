# FULL SEO AUDIT REPORT — weightlosspercentage.com

**Audit date:** 2026-08-08
**Domain:** https://www.weightlosspercentage.com
**Business type:** Health & Fitness Calculator / Publisher (YMYL) — free calculators + dietitian-reviewed blog
**Platform:** Astro static site on Cloudflare Pages (hybrid React-SPA fallback)
**Scope:** 500 pages crawled (all HTTP 200), 9 sitemaps reviewed (~14,350 URLs), homepage rendered, 6 key pages tested in Playwright, SERP benchmarked

---

## Executive Summary

### SEO Health Score: **57 / 100**

| Category | Score | Weight |
|----------|-------|--------|
| Technical SEO | 45 | 22% |
| Content Quality | 55 | 23% |
| On-Page SEO | 52 | 20% |
| Schema / Structured Data | 75 | 10% |
| Performance (CWV) | 55 | 10% |
| AI Search Readiness | 70 | 10% |
| Images | 85 | 5% |

**Weighted total:** 57.2 → **57/100**

### The headline problem
The site is **deployed from a stale build** (`dist`/`dist2`, built with `site: http://localhost:4321`) instead of the current `dist3`. As a result the homepage and 22 other pages — including `/about/`, `/contact/`, `/blog/`, `/calculators/`, `/nutrition/` — emit `rel=canonical` pointing at `http://localhost:4321/`. An exact-match domain (weightlosspercentage.com) is **not appearing in the top-8 SERPs** for "weight loss percentage calculator", which this bug plausibly causes: Google cannot resolve the canonical and drops/limits those pages.

### Top 5 Critical Issues
1. **Localhost canonical on 23 pages incl. homepage** — live deploy is stale (built with wrong `site`), canonical + og:url point to `http://localhost:4321` (fix: rebuild & redeploy dist3, purge cache).
2. **Soft-404s** — Cloudflare SPA fallback `/* /index.html 200` returns HTTP 200 with homepage content for any missing URL (crawl-budget waste + index bloat).
3. **Index bloat** — 13,832 of 14,350 sitemap URLs are programmatic BMI/from-to-weight pages; no quality gate, all crawlable.
4. **robots.txt blocks AI crawlers** — Cloudflare-managed block (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider`, `Amazonbot`, `Applebot-Extended`, `meta-externalagent`) appears first and wins; contradicts the site's own `ai.txt` permission claims.
5. **Duplicate JSON-LD on homepage** — 2× Organization, 2× FAQPage, 2× WebApplication (schema bloat risks rich-result suppression).

### Top 5 Quick Wins
1. Redeploy current build (`npm run build` → `dist3`) + purge Cloudflare cache; verify homepage canonical = `https://www.weightlosspercentage.com/`. **This single fix addresses issues 1-3's root causes.**
2. Move AI-crawler `Allow:` groups above the Cloudflare-managed robots block (unblocks GPTBot/ClaudeBot/Google-Extended within minutes).
3. Add visible author byline + "last reviewed" + references/citations section to blog articles (health YMYL E-E-A-T).
4. Emit default OG/Twitter tags on every page (currently missing on 475/500) — one template change.
5. Replace `/* /index.html 200` with a true 404 (`/* /index.html 404`) to stop soft-404s.

---

## Technical SEO (45/100)

**What works**
- Clean host hygiene: single canonical host `https://www.weightlosspercentage.com`; http→https 301, non-www→www 301, trailing-slash 308.
- All 120 sampled sitemap URLs return 200; sitemap index well-formed; robots allows normal crawlers; HSTS preload, nosniff, frame-options, referrer-policy headers present; HTTP/3 + Brotli.

**Findings**
1. **CRITICAL — Localhost canonicals (23 pages incl. homepage).** Verified live `curl` shows `canonical http://localhost:4321/` + `og:url` on `/` and `/about/`; `dist`/`dist2` built with `site:http://localhost:4321`; current `dist3` is correct. Redeploy from `dist3`.
2. **CRITICAL — Soft-404 via SPA fallback.** `/* /index.html 200` returns homepage for nonexistent paths (verified with a throwaway URL). `/calculators/weight-loss/from-120-to-114/` is a phantom page serving the homepage.
3. **HIGH — Security:** no Content-Security-Policy header; `Access-Control-Allow-Origin: *`.
4. **MEDIUM — Sitemap coverage gaps:** `/blog/anti-gravity-exercises-weight-loss/` and the phantom from-120-to-114 not in sitemaps; slash-less calculator URLs in crawl are redirect duplicates.
5. **MEDIUM — Sitemap `lastmod` static** (all 2026-07-30) across all sitemaps.

---

## Content Quality (55/100)

**What works**
- Blog avg ~1,012 words; calculator pages avg ~816; global Medical Disclaimer block on every page (YMYL-positive); unique titles across 500 pages; Article schema declares clinical author.

**Findings**
1. **HIGH — Weak visible E-E-A-T.** Flagship article: no author byline/meta author, no visible last-updated, only 2 external references, no in-article disclaimer. Health = YMYL; Google weights visible credentials.
2. **HIGH — Thin localized content.** `/zh/` pages average ~70 words (min 47); `/ru/` ~299; `/uk/` ~288. Effectively stubs.
3. **HIGH — Near-duplicate locales.** UK/CA/AU/NZ homepages ~80% identical to US (en-only respelling, not local content).
4. **MEDIUM — 123/500 pages <300 words** (24.6%); titles >60 chars on 328 pages, <30 on 78.
5. **LOW — Readability** ~23 words/sentence (college level; target 8th-9th grade for health).

---

## On-Page SEO (52/100)

**What works**
- 0 missing H1, 0 multiple H1, 0 missing meta descriptions, 0 missing canonicals (though 23 are broken/wrong), 0 noindex, hreflang self-returns present on all sampled pages.

**Findings**
1. **HIGH — Canonical correctness (23 broken)** — see Technical #1.
2. **MEDIUM — Title lengths:** 328 pages >60 chars (truncation risk), 78 pages <30 chars.
3. **MEDIUM — OG tags missing on 475/500 pages** (`og:title`/`og:description`/`og:url`); twitter card coverage likewise sparse outside homepage.
4. **LOW — 25 meta descriptions <50 chars.**

---

## Schema & Structured Data (75/100)

**What works**
- Rich, correct type coverage: Organization (462), BreadcrumbList (229), FAQPage (154), WebApplication (137), Article (83), MedicalWebPage (83), HowTo (73), Person (92). Blog Article blocks are detailed (author, publisher+logo, dates, mainEntityOfPage).

**Findings**
1. **HIGH — Homepage schema duplicated** (2× Organization/FAQPage/WebApplication); 90 pages emit ≥6 blocks. Cause: `parser_v2.ts` doesn't strip JSON-LD from parsed HTML before `SEO.astro` re-injects it. De-duplicate.
2. **MEDIUM — Brand inconsistency** (`WeightLossPercentage.com` vs `Weight Loss Percentage`) across schema author/publisher.
3. **MEDIUM — Missing `WebSite`/SearchAction;** author `Person` never linked to Organization via `worksFor`/profile URL.
4. **LOW — Missing opportunities:** glossary (`DefinedTermSet`/`ItemList`), compare pages (`FAQPage`/`Article`), nutrition pages (`NutritionInformation`).

---

## Performance (55/100)

| Page | Device | LCP | CLS | Load | Resources |
|------|--------|-----|-----|------|-----------|
| Homepage | Mobile | **4,732 ms** ❌ | 0.078 ⚠️ | 43.8s | 92 |
| Homepage | Desktop | 884 ms ✅ | 0.036 ✅ | 22.1s | 95 |
| Blog post | Mobile | 1,620 ms ✅ | 0.019 ✅ | 4.7s | 50 |
| BMI calc | Mobile | 1,144 ms ✅ | 0.058 ⚠️ | 4.6s | 42 |

**Findings**
1. **HIGH — Homepage mobile LCP 4.7s** (threshold 2.5s); 5.4× slower than desktop. Layout spinner + Ezoic consent + ads + fonts + React mount compound above the fold.
2. **HIGH — Third-party bloat:** Ezoic, AdSense, Google Analytics, Clarity, Ahrefs, Google Fonts, Unsplash — 92-95 requests / up to 877KB on homepage; `networkidle` 22-44s.
3. **MEDIUM — Render-blocking CSS/fonts in head;** no preload/fetchpriority for LCP.
4. **MEDIUM — Full-page white loader** delays perceived paint on every visit.
5. Field data unavailable (PSI rate-limited). Verify in GSC CrUX after fixes.

---

## Images (85/100)

**What works**
- **Alt text: 0 missing across 500 pages** — exceptional. OG image 1200×630 on homepage, favicon set complete.

**Findings**
1. **MEDIUM — OG coverage missing on 475/500 pages** (social cards fall back to default).
2. **MEDIUM — No WebP/AVIF strategy, missing width/height** on some imgs (CLS risk).
3. **LOW — Category-specific OG images** for high-value tools would lift social CTR.

---

## AI Search Readiness (70/100)

**What works (genuinely rare)**
- **llms.txt**: complete manifest (sitemaps, licensing CC BY 4.0, AI permission grant, calculator formulas).
- **ai.txt**: best-practice retrieval guide with citation rules, per-calculator accuracy references (newborn 7/8-10/10% thresholds, GLP-1 15-20% in 52-72wk).
- Static, JS-free, no paywall; strong schema; PerplexityBot/ChatGPT-User/Gemini/cohere/OMgili allowed.

**Findings**
1. **HIGH — robots.txt blocks GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent** (Cloudflare-managed block wins over later Allow groups). Directly contradicts ai.txt claims.
2. **HIGH — Localhost canonicals poison citations** until redeploy.
3. **MEDIUM — Thin zh/ru pages not citable; en-gb/ca/au/nz near-duplicates dilute return links.**
4. **LOW — Placeholder contact in ai.txt.**

---

## Search Experience (SXO — 45/100)

- For **"weight loss percentage calculator"** the exact-match domain is absent from the top-8 SERPs (Omni, Good Calculators, Inch Calculator, calculator-online.net, etc. rank). The likely root causes are the localhost canonical, soft-404 fallback serving the homepage, weak visible E-E-A-T (competitors show author bios, references to NIDDK/CDC/WebMD, worked examples), and undifferentiated locale pages.
- **Recommendation:** After redeploy, pick ONE URL owner for the head term (homepage vs `/calculators/weight-loss/`), build internal links + sitemap + WebSite entity to it, and add visible proof (sources, byline, worked example, unit toggle).

---

## Scoring Methodology
- 500-page crawl with per-page extraction (titles, metas, canonicals, schema, images, links, word counts, robots, headers).
- Playwright lab Web Vitals on 3 page classes × 2 viewports.
- robots.txt, sitemaps (9), redirects, security headers, llms.txt/ai.txt verified live.
- SERP benchmark via live search for the head keyword.
- CrUX field data and PageSpeed API unavailable (persistent 429 during audit window).

*Detailed per-category findings: `findings/technical.md`, `findings/content.md`, `findings/schema.md`, `findings/sitemap.md`, `findings/performance.md`, `findings/geo.md`, `findings/images.md`, `findings/sxo.md`.*
