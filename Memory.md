# Project Memory & Historical Context

## Key Technical Decisions & Project Evolution

### 1. Medical Accreditation & Author URL Consolidation
* **Decision:** Consolidate all author profile pages under the plural `/authors/dr-rekha-kumar/` URL path.
* **Rationale:** Previously, duplicate singular `/author/` and plural `/authors/` URLs existed for Dr. Rekha Kumar and legacy references. Consolidating to `/authors/dr-rekha-kumar/` eliminated URL duplication issues in Google Search Console and sitemaps.
* **LinkedIn Integration:** Dr. Rekha Kumar's official LinkedIn profile is integrated into Schema.org Person markup and profile UI:
  `https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/`

### 2. Sitemap Duplicate Cleanup & XSL Fixes
* **Decision:** Built `fix_and_rebuild_sitemaps.py` and updated `astro.config.mjs`.
* **Fixes Applied:**
  - Removed duplicate `customPages` entry in `astro.config.mjs`.
  - Filtered out legacy `/author/` and `sarah-jenkins` paths from `sitemap-main.xml`.
  - Fixed date rendering bug in `sitemap.xsl` so `<lastmod>` date strings (`YYYY-MM-DD`) render once as `2026-09-09` instead of duplicate `2026-09-09 2026-09-09`.

### 3. SPA Navigation Guard
* **Decision:** Injected `spaNavGuard.mjs` script hook during Astro HTML post-processing.
* **Rationale:** Prevents client-side router 404 errors when users click between static SSG pages and client-side React calculator components.

### 4. Git Repository & Remote Setup
* **Repository URL:** `https://github.com/weightlosspercentage-sys/weight-Loss-calculator.git`
* **Default Branch:** `master`
