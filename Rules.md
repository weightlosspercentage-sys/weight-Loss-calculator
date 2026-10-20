# Development & Quality Rules

## 1. Code Standards & Quality Guidelines

1. **HTML & Accessibility Compliance (WCAG 2.2 AA):**
   - Every document MUST start with `<!DOCTYPE html>` (prevents Quirks Mode).
   - Every input element MUST have explicit `id` and `name` attributes paired with `<label>` tags.
   - Contrast ratios MUST meet WCAG 2.2 AA standards (minimum 4.5:1 for body text, 3:1 for large headers).

2. **SEO & Canonical Integrity:**
   - Single `<h1>` tag per page describing primary page intent.
   - Title tags MUST be under 60 characters and clean of repetitive brand clutter.
   - Canonical tags MUST be self-referential on regional pages (`/uk/`, `/ca/`, `/au/`, `/nz/`) to match `hreflang` declarations 100%.

3. **Zero Duplicate Sitemaps Rule:**
   - NEVER add duplicate URLs across sub-sitemaps in `astro.config.mjs` or XML generators.
   - Sitemap and hreflang integrity is owned by the build: `postProcessHtml` marks thin locales
     `noindex`, `pruneNoindex` deletes them and returns `prunedUrls`, then `syncSitemaps` drops
     those `<loc>` entries and strips hreflang pointing at them. `npm run build` is the only
     step required — no manual sitemap script exists.

---

## 2. E-E-A-T Medical Content Rules

1. **Author & Reviewer Attribution:**
   - Medical content MUST reference **Dr. Rekha Kumar, M.D., M.S.** as Lead Medical Reviewer.
   - Schema.org `Person` JSON-LD MUST include her official LinkedIn URL:
     `https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/`
   - Canonical author pages MUST use plural `/authors/` URL paths (e.g., `/authors/dr-rekha-kumar/`). Do NOT create singular `/author/` duplicate pages.

2. **Formula Transparency:**
   - Every calculator page MUST explicitly state the mathematical formula used (e.g., `((Starting Weight − Current Weight) ÷ Starting Weight) × 100`).

---

## 3. Git & Deployment Workflow Rules

1. **Commit Messages:** Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `perf:`).
2. **Pre-push Verification:**
   - Run `npm run build` and confirm `dist3` exits clean — the build regenerates `_redirects`
     from `.htaccess`, prunes noindexed pages and re-syncs every silo sitemap.
   - Verify zero horizontal overflow on mobile viewports.
