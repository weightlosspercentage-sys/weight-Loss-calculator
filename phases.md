# Project Phases & Development Roadmap

## Phase 1: Core Calculators & Static Foundation ✅ (Completed)
- [x] Implement core Weight Loss Percentage Calculator with Imperial (`lbs`) and Metric (`kg`) support.
- [x] Develop specialized calculators (Fat Loss %, BMI, BMR, TDEE, Calorie Deficit).
- [x] Build Newborn & Infant Weight Loss Calculator with pediatric risk thresholds (5%, 7%, 10%).

## Phase 2: E-E-A-T Medical Accreditation & Authority ✅ (Completed)
- [x] Establish Dr. Rekha Kumar, M.D., M.S. as Lead Medical Reviewer.
- [x] Implement full Schema.org `Person`, `Organization`, and `WebSite` JSON-LD structured data.
- [x] Link Dr. Rekha Kumar's official LinkedIn profile (`https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/`).
- [x] Consolidate author URL structure to canonical `/authors/dr-rekha-kumar/` (eliminating duplicate `/author/` paths).

## Phase 3: Restaurant Nutrition Hub & Content Expansion ✅ (Completed)
- [x] Launch Nutrition Hub (`/nutrition/`) covering top restaurant chains (Chipotle, Taco Bell, Subway, Starbucks, McDonald's, Dominos).
- [x] Build Health & Fitness Glossary (`/glossary/`) and Side-by-Side Comparisons (`/compare/`).

## Phase 4: Internationalization & Regional SEO ✅ (Completed)
- [x] Configure localized sub-paths (`/uk/`, `/ca/`, `/au/`, `/nz/`).
- [x] Enforce self-referential canonicals and matching `hreflang` headers across all regional variations.
- [x] Implement automated sitemap rebuild engine (`fix_and_rebuild_sitemaps.py`) guaranteeing 0 duplicate URLs across `sitemap-index.xml` and sub-sitemaps.

## Phase 5: Chrome DevTools Audits & Deployment Readiness 🚀 (Active)
- [x] Run Chrome DevTools audits for HTTP status, JS reactivity, mobile viewport overflow, and console warnings.
- [x] Fix `sitemap.xsl` date formatting bug (eliminating repeated `YYYY-MM-DD` string output).
- [ ] Finalize GitHub Pages deployment workflow (`.github/workflows/deploy.yml`).
