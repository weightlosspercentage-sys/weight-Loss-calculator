# Images Findings

Domain: https://www.weightlosspercentage.com
Date: 2026-08-08

## What works
- **Alt text: 100% coverage.** Zero images missing alt text across all 500 crawled pages (0 missing alt, 0 pages affected). Excellent.
- Homepage has `og:image` (1200x630 `og-default.jpg`) + `twitter:image` + twitter:card summary_large_image.
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, and `manifest.json` all linked.
- Blog Article schema includes an image URL (Unsplash with `?w=800&q=80`).

## MEDIUM

### 1. Image inventory is small and ad-adjacent
- The site is largely text/tool-driven; images appear mostly as Unsplash stock in blog posts. Compute the per-image format/lazy-loading budget and add `loading="lazy"` below the fold consistently.

### 2. OG image coverage missing on 475/500 pages
- `og:title`/`og:description`/`og:image` defaults exist only on a subset (homepage, /about/); blog posts, calculators, and all locale pages lack OG tags entirely (verified via curl). Social sharing produces bare cards.
- **Recommendation:** Emit the standard OG + Twitter tags from `SEO.astro` for every template (the component already supports it — ensure it's applied on static-file routes, not just Astro-built routes).

### 3. No AVIF/WebP conversion strategy observed; image CLS risk
- Unsplash images load via URL params; recommend serving WebP/AVIF, adding explicit `width`/`height` attributes to all `<img>` (prevents layout shift, supports CLS).

## LOW

### 4. Add per-page/og images for key programmatic templates
- Use the existing `og-default.jpg` as fallback (works), but generate category-specific OG images for high-value pages (BMI, TDEE, from-to-weight) to lift CTR on social.

## SCORE (Images): 85/100
Alt-text perfection and core OG defaults; gaps are OG coverage on most pages and format/lazy-load optimization.
