# Performance (Core Web Vitals) Findings

Domain: https://www.weightlosspercentage.com
Date: 2026-08-08
Method: Local Playwright lab measurements (Chromium, throttled mobile 390x844 + desktop 1440x900). PageSpeed Insights API was rate-limited (HTTP 429) throughout the audit, so no field/CrUX data was obtainable.

## Measured values

| Page | Device | LCP | CLS | Load (networkidle) | Resources | Transfer |
|------|--------|-----|-----|--------------------|-----------|----------|
| Homepage | Mobile | **4,732 ms** | 0.078 | 43.8 s | 92 | 714 KB |
| Homepage | Desktop | 884 ms | 0.036 | 22.1 s | 95 | 877 KB |
| Blog post | Mobile | 1,620 ms | 0.019 | 4.7 s | 50 | 695 KB |
| Blog post | Desktop | 1,248 ms | 0.000 | 5.0 s | 52 | 766 KB |
| BMI calculator | Mobile | 1,144 ms | 0.058 | 4.6 s | 42 | 639 KB |
| BMI calculator | Desktop | 1,048 ms | 0.022 | 4.5 s | 49 | 627 KB |

## HIGH

### 1. Homepage mobile LCP is 4.7s — fails the Core Web Vitals "good" threshold (2.5s)
- **Severity: High**
- Mobile homepage LCP 4,732 ms vs 884 ms desktop — a 5.4x gap. The homepage is the money page and the worst performer.
- CLS 0.078 is in "needs improvement" range (>0.1 is poor).
- **Recommendation:** Investigate LCP element blocking (likely the Ezoic consent/sa scripts above the fold + React mount + fonts). Preload the LCP image/font; defer non-critical third-party scripts; render the calculator statically (no client mount needed for layout).

### 2. Third-party script load is extreme on the homepage (92-95 resources, up to 877KB)
- **Severity: High**
- Ad networks/analytics per page: Ezoic (`www.ezojs.com`, `ezoicanalytics.com`, `cmp.gotokeepconsent.com`, `the.gotokeepconsent.com`), Google AdSense (`pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`, `googletagservices.com`), Google Analytics (`googletagmanager.com`), Microsoft Clarity (`clarity.ms`), Ahrefs Web Analytics (`analytics.ahrefs.com`), plus Google Fonts (render-blocking stylesheet) and Unsplash images.
- networkidle wait took 22-44s on the homepage because these scripts keep the network busy — a strong indicator of third-party bloat (matches the TBT/INP risk profile even though we could not run Lighthouse).
- **Recommendation:** Load ads only on content pages, not the homepage; lazy-load AdSense/Ezoic below the fold; move consent scripts to `async`/defer (they already are async); self-host fonts (or subset); replace the render-blocking Google Fonts `<link>` with `font-display: swap` + preload.

## MEDIUM

### 3. Render-blocking CSS + font link in `<head>`
- Homepage links `/assets/index-43gqMy96.css` and `vercel-overrides.css` synchronously plus Google Fonts CSS synchronously in head.
- **Recommendation:** Inline critical CSS; load Google Fonts with `media=print onload` trick or self-host with `font-display: swap`.

### 4. Layout loader spinner overlays the page on every load
- `BaseLayout.astro` renders a fixed full-viewport white spinner (`#layout-loader`) until window `load` (with 4s fallback). On slow mobile this delays perceived paint and contributes to CLS/LCP.
- **Recommendation:** Remove or gate the loader on first visit only; never block content behind it.

### 5. Images from Unsplash are loaded full-size where possible
- Blog `Article.image` references `images.unsplash.com/...w=800&q=80` (800px, good) but page images are fetched with various sizes; check for oversized sources and add explicit width/height to prevent CLS.

## LOW

### 6. `preconnect` to ad domains present but no `fetchpriority`/`preload` for LCP
- **Recommendation:** Add `<link rel="preload" as="image">` for the LCP hero and `fetchpriority="high"`.

## Field data gap
- CrUX field data could not be retrieved (PSI API rate-limited). Verify LCP/INP/CLS in Google Search Console Core Web Vitals report or CrUX dashboard after deploy. Given 46 of 500 pages exceed 1,500 words with heavy ads, INP risk is elevated on content pages.

## SCORE (Performance): 55/100
Content pages (blog/calculator) perform acceptably; the homepage fails mobile LCP and carries disproportionate third-party weight.
