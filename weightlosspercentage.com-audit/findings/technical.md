# Technical SEO Findings

Domain: https://www.weightlosspercentage.com
Crawl: 500 pages (all HTTP 200), 9 sitemaps (~14,350 URLs)
Date: 2026-08-08

## CRITICAL

### 1. Live site serves `http://localhost:4321` canonical on the homepage and 22 other pages
- **Severity: Critical**
- 23 of 500 crawled pages emit `<link rel="canonical" href="http://localhost:4321/...">` including the homepage (`https://www.weightlosspercentage.com/`), `/about/`, `/contact/`, `/blog/`, `/calculators/`, `/nutrition/`, `/compare/`, 3 blog posts (`/blog/postpartum-weight-loss-safe-guide/`, `/blog/water-fasting-weight-loss/`, `/blog/weight-loss-plateau/`), a programmatic page (`/calculators/weight-loss/from-120-to-114/`), and all 7 locale variants of the 2 blog posts.
- `og:url` is also `http://localhost:4321/` on these pages.
- **Evidence:** Live `curl https://www.weightlosspercentage.com/` returns `canonical http://localhost:4321/`. Other pages (e.g. `/blog/how-to-calculate-weight-loss-percentage/`, `/calculators/bmi/`) return correct `https://www.weightlosspercentage.com/...` canonicals — proving an inconsistent/mixed deployment.
- **Root cause (confirmed in source):** `dist/` and `dist2/` were built with `astro.config.mjs site: http://localhost:4321`; the current config (`site: https://www.weightlosspercentage.com`, `outDir: ./dist3`) is correct and `dist3/index.html` has the right canonical. The **live deployment is serving the stale `dist`/`dist2` build**. Local repo static HTML files (e.g. `about/index.html`, `index.html`) are correct, so only the deployed build is stale.
- **Impact:** Homepage and key money pages are self-canonicalized to an unreachable host. Google cannot resolve the canonical and will likely drop these pages from the index or severely limit their ranking. This explains the site failing to rank for its exact-match keyword.
- **Recommendation:** Rebuild with the current config (`npm run build` → dist3) and redeploy from dist3. Purge Cloudflare CDN cache. Verify post-deploy: homepage canonical must be `https://www.weightlosspercentage.com/`.

### 2. Soft-404s: Cloudflare SPA fallback returns HTTP 200 with homepage content for non-existent URLs
- **Severity: Critical**
- `curl -sI https://www.weightlosspercentage.com/this-page-does-not-exist-xyz-404/` → **HTTP 200** with the homepage body (same title + localhost canonical as the homepage).
- This is caused by the `_redirects` file's catch-all `/* /index.html 200` SPA fallback combined with `[...fallback].astro` serving `index.html`.
- `/calculators/weight-loss/from-120-to-114/` (in sitemap) is actually a soft-404: it serves the homepage template (homepage title + localhost canonical) and is NOT in any sitemap.
- **Impact:** Crawlers waste crawl budget discovering thousands of phantom 200 pages; index bloat; the localhost-canonical homepage is reinforced as the fallback for every miss. Google may treat soft-404s as a site quality signal.
- **Recommendation:** Return true 404 (`/* /index.html 404` or a real 404.html) for unmatched routes, or restrict the fallback to known SPA entry points only (the React-rendered locale roots). Ensure from-to-weight/bmi pages that exist in sitemaps actually exist as files.

## HIGH

### 3. robots.txt: Cloudflare-managed block disallows all major AI crawlers before the site's re-allow rules
- **Severity: High**
- The robots.txt begins with a Cloudflare-managed section: `User-agent: GPTBot / ClaudeBot / Google-Extended / CCBot / Bytespider / Amazonbot / Applebot-Extended / meta-externalagent` all `Disallow: /`.
- Later custom groups re-allow these bots (`User-agent: GPTBot Allow: /` etc.), but per robots.txt standards the **first matching group wins**, so GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider, Amazonbot, Applebot-Extended, and meta-externalagent remain **blocked**.
- This directly contradicts `ai.txt`, which states these agents are "permitted to read /llms.txt, /calculators/*, and /blog/*".
- ChatGPT-User, PerplexityBot, Gemini, cohere-ai, OMgiliBot are allowed (not in the CF block).
- **Recommendation:** Move the custom AI crawler `Allow:` groups ABOVE the Cloudflare-managed section, or remove those bots from Cloudflare's managed block list.

### 4. No Content-Security-Policy header
- **Severity: High (security)**
- Headers observed: `x-frame-options: SAMEORIGIN`, `x-content-type-options: nosniff`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `referrer-policy: strict-origin-when-cross-origin`, `Access-Control-Allow-Origin: *`. No CSP.
- **Recommendation:** Add a CSP allowing `*.ezojs.com`, `*.gotokeepconsent.com`, `googletagmanager.com`, `google-analytics.com`, `pagead2.googlesyndication.com`, `*.clarity.ms`, `analytics.ahrefs.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, `images.unsplash.com`. Also consider removing the wildcard `Access-Control-Allow-Origin: *`.

## MEDIUM

### 5. 11 crawled URLs absent from all sitemaps
- `/calculators/weight-loss/from-120-to-114/`, `/blog/anti-gravity-exercises-weight-loss/`, and trailing-slash-less variants (`/calculators/bmi`, `/calculators/tdee`, etc. — these 308-redirect to the slash form, so they are redirect duplicates rather than true gaps).
- **Recommendation:** Add missing pages to sitemaps; keep sitemaps free of redirecting URLs.

### 6. Sitemap `lastmod` all identical (2026-07-30) across every sitemap
- **Severity: Medium**
- All 9 sitemaps share the same lastmod date. `sitemap.xml` itself reports lastmod 2026-07-30. Unvarying lastmod reduces Google's trust in freshness signals.
- **Recommendation:** Regenerate lastmod per-URL from actual file mtimes (the build script `scripts/update_sitemaps_lastmod.py` already exists) and refresh on every deploy.

## LOW / INFO

### 7. Mixed redirect style (301 for host, 308 for trailing slash)
- http→https = 301, www→non-www = 301, trailing-slash normalization = 308. 308 is acceptable but 301 is more universally understood; consider consistency (low priority).

### 8. HTTPS/redirect hygiene otherwise excellent
- Single canonical host `https://www.weightlosspercentage.com`; all 120 sampled sitemap URLs return 200; HSTS preload active; HTTP/3 (alt-svc) available; Cloudflare with Brotli.

## CRAWL SUMMARY (of 500 pages)
- 200 status: 500/500; noindex: 0; canonical missing: 0; broken canonicals (localhost): 23 (4.6%).
- avg response time measured across crawl: all requests succeeded within timeout.
- Third-party domains observed on every page: `www.googletagmanager.com` (500), `pagead2.googlesyndication.com` (462), `cmp.gotokeepconsent.com` (23), `the.gotokeepconsent.com` (23), `analytics.ahrefs.com` (23).

## SCORE (Technical SEO): 45/100
Docked heavily for the localhost canonical + soft-404s (both indexing blockers). Sitemaps, redirects, host hygiene and security basics are solid.
