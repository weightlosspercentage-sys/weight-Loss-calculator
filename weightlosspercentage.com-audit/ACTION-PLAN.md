# ACTION PLAN — weightlosspercentage.com

Priorities: **Critical** (blocks indexing/penalties — fix now) > **High** (1 week) > **Medium** (1 month) > **Low** (backlog).

---

## Phase 1: Critical Fixes (Week 1)

### C1. Redeploy from the correct build (eliminates the localhost canonical bug)
- Rebuild with current config: `npm run build` (produces `dist3` with `site: https://www.weightlosspercentage.com`).
- Point the Cloudflare Pages deploy to the correct output directory and purge CDN cache (dist/dist2 are stale — built with `site: http://localhost:4321`).
- **Verify:** `curl -s https://www.weightlosspercentage.com/ | grep canonical` → must return `https://www.weightlosspercentage.com/`. Check `/about/`, `/blog/`, `/calculators/`, `/nutrition/`, `/compare/`, `/contact/`, and the 3 blog posts + all their locale variants.
- **Impact:** Fixes 23 broken pages incl. homepage; prerequisite for everything else. Most likely cause of total SERP absence for the exact-match domain.

### C2. Fix soft-404s (SPA fallback)
- Change the catch-all in `_redirects` from `/* /index.html 200` to `/* /index.html 404` (or implement a real 404 page).
- Locale SPA roots still need their 200 fallbacks (`/uk/*`, `/ca/*`, etc.) — keep those only for the React-rendered locale entry points.
- **Impact:** Stops phantom 200s, reclaims crawl budget, removes the "homepage serves everything" signal.

### C3. Unblock AI crawlers in robots.txt
- Move the custom `User-agent: GPTBot / ChatGPT-User / ClaudeBot / PerplexityBot / Google-Extended / Gemini / cohere-ai / OMgiliBot ... Allow: /` groups **above** the Cloudflare-managed block, or delete GPTBot/ClaudeBot/Google-Extended/CCBot/Bytespider/Amazonbot/Applebot-Extended/meta-externalagent from Cloudflare's managed block list.
- First-match-wins means the current file blocks them despite the later Allow rules.
- **Verify:** fetch robots.txt and confirm the AI crawler groups precede the Cloudflare block.

---

## Phase 2: High-Impact Improvements (Weeks 2-3)

### H1. Add visible E-E-A-T to blog articles (YMYL)
- Author byline with credentials + author profile page; "Reviewed by [Dietitian], last updated [date]" line; a **Sources & References** section with 3-5 primary citations (CDC, WHO, NIH/NIDDK, peer-reviewed trials); keep the global medical disclaimer visible on articles.
- Also add `<meta name="author">` and link `Article.author.url` to the bio page (schema).

### H2. De-duplicate JSON-LD
- In `src/utils/parser_v2.ts`, strip `<script type="application/ld+json">` from parsed HTML (mirror the existing canonical-strip at line 151), OR stop passing page schemas into `SEO.astro`. Homepage should emit exactly one Organization, one FAQPage, one WebApplication (ideally one `@graph`).
- Standardize brand to **"Weight Loss Percentage"** in all schema.

### H3. Add default OG/Twitter tags sitewide
- Ensure `SEO.astro`'s OG/Twitter defaults render on **every** template (currently missing on 475/500 pages — blog, calculators, locale pages). Includes `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card/image`.
- **Verify:** curl a blog post and a `/uk/` page and grep for `og:title`.

### H4. Add `WebSite` + SearchAction schema sitewide
- Include `WebSite`/`SearchAction` in the default schema block (`SEO.astro` fallback graph).

### H5. Trim title lengths
- 328 pages have titles >60 chars. Shorten to 50-60 chars with keyword near the front; remove date-stamping promo strings like "(Free 2026)". Fix the 78 pages under 30 chars (non-legal pages).

### H6. Improve locale differentiation
- For en-gb/en-ca/en-au/en-nz: add genuine local guidance (NHS, Health Canada, WHO BMI ranges), local units defaults (kg/stone), local calculator context — get below ~70% similarity to US.
- Decide zh/ru strategy: either translate fully or noindex the thin stubs.

---

## Phase 3: Content & Authority (Month 2)

### M1. Quality-gate programmatic pages (index bloat)
- 13,832 BMI + from-to-weight URLs dominate sitemaps. Apply a quality gate: noindex below-threshold template pages; keep a curated top-N in sitemaps; ensure internal links point to the canonical tool pages. Track indexation in GSC after.

### M2. Refresh sitemap lastmod
- Regenerate per-URL `lastmod` from real file mtimes via `scripts/update_sitemaps_lastmod.py` on every deploy; remove redirect-duplicate and phantom URLs from sitemaps; add `/blog/anti-gravity-exercises-weight-loss/`.

### M3. Homepage performance pass
- Target mobile LCP <2.5s: preload/fetchpriority the LCP element, gate the layout spinner, defer/self-host fonts (`font-display: swap`), inline critical CSS, lazy-load ad/consent scripts below the fold, and consider not loading the React mount for static pages.

### M4. Add CSP + fix CORS
- Content-Security-Policy allowing the known third parties (Ezoic, AdSense, GTM/GA4, Clarity, Ahrefs, fonts, Unsplash). Remove `Access-Control-Allow-Origin: *`.

### M5. Head-term ownership
- Pick homepage vs `/calculators/weight-loss/` as the owner of "weight loss percentage calculator"; align canonical, internal links, and WebSite entity; add a worked example + unit toggle + references to the owner page to match competing SERP features.

---

## Phase 4: Monitoring & Iteration (Ongoing)

- Verify Core Web Vitals in **GSC → Core Web Vitals** (field CrUX) and **PageSpeed Insights** after deploy; re-baseline mobile LCP/CLS/INP.
- Watch **Google Search Console → Indexing** for the 23 previously-broken pages; request re-indexing of homepage once canonical is fixed.
- Monitor AI citations (ChatGPT/Perplexity/Claude) for brand mentions after robots fix.
- Monthly sitemap/canonical/hreflang drift check; re-run a lightweight audit on each deploy.
- Add glossary (`DefinedTermSet`), compare-page (`FAQPage`/`Article`), and nutrition (`NutritionInformation`) schema as content ships.

---

## Effort summary
| Phase | Items | Est. effort |
|-------|-------|-------------|
| 1. Critical | 3 | 1-2 days |
| 2. High | 6 | 1-2 weeks |
| 3. Medium | 5 | 3-4 weeks |
| 4. Monitoring | 5 | Ongoing |

## Estimated impact
- Fixing C1+C2+C3 (redeploy + 404s + robots) is expected to restore indexability of the homepage and money pages — the single largest ranking lever available.
- E-E-A-T (H1) + head-term ownership (M5) address the YMYL proof gap vs competitors.
- Performance (M3) protects CWV thresholds and mobile UX.
