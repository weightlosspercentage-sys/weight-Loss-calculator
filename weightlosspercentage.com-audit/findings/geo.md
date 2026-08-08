# AI Search Readiness (GEO) Findings

Domain: https://www.weightlosspercentage.com
Date: 2026-08-08

## What works (strengths — rare in this niche)
- **llms.txt present and high quality**: full manifest with canonical domain, sitemap index, localized sitemaps, contact, CC BY 4.0 license, explicit AI-permission statement, calculator list with formulas, topical clusters, and crawling guidelines.
- **ai.txt present and excellent**: brand metadata, preferred citation rules (link to specific calculator pages, descriptive anchor text), accuracy/reference guidelines per calculator (TDEE → Mifflin-St Jeor, newborn thresholds 7/8-10/10%, GLP-1 → 15-20% over 52-72 weeks), crawl permissions, licensing.
- Statically rendered, JS-free content for AI crawlers; no paywall; no login.
- Strong schema (Organization/FAQ/Article) aids passage-level extraction.
- PerplexityBot, ChatGPT-User, Gemini, cohere-ai, OMgiliBot allowed by robots.

## HIGH

### 1. robots.txt contradicts ai.txt — major AI crawlers are blocked
- **Severity: High**
- The Cloudflare-managed robots block (`Disallow: /`) applies to GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent and appears FIRST in the file.
- The site's later `User-agent: GPTBot/ClaudeBot/Google-Extended Allow: /` groups are ignored because the first matching group wins per robots.txt rules.
- ai.txt explicitly claims these agents "are permitted to read /llms.txt, /calculators/*, and /blog/*" — false for the blocked ones.
- **Impact:** ChatGPT/OpenAI (GPTBot), Claude/Anthropic (ClaudeBot), and Google Gemini training (Google-Extended) cannot crawl the site, cutting off the site from the exact AI surfaces the llms.txt/ai.txt files were built to serve.
- **Recommendation:** Move all AI crawler `Allow` groups above the Cloudflare-managed block (or delete those bots from Cloudflare's managed block list). Re-test with each UA string.

### 2. Localhost canonical bug undermines citation-worthiness
- **Severity: High**
- If a model or human cites the homepage it gets `http://localhost:4321/` as the canonical/URL — a broken link for any AI assistant grounding on the site.
- Fixing the deploy (Technical finding #1) is a prerequisite for GEO value.

## MEDIUM

### 3. Citability of localized/thin pages
- zh/ru locale pages are too thin (47-300 words) to be useful AI citations; AI assistants will skip them in favor of the English pages.
- Near-duplicate en-gb/en-ca/en-au/en-nz content may cause AI models to cite a single representative locale, diluting return-links to the other variants.

### 4. Contact email in ai.txt is a placeholder
- `webmaster@weightlosspercentage.com (placeholder)` — replace with a real address to strengthen trust signals for editors.

## LOW

### 5. No `Meta-AI` or specialized GPT-URL agent allowlist
- Consider allowing additional agents explicitly (e.g., `Meta-ExternalAgent`, `Applebot` for Apple Intelligence, `FriendlyCrawler`) to future-proof.

## Recommendation summary
1. Fix robots.txt ordering (blocked AI crawlers) — High.
2. Redeploy to eliminate localhost canonicals — Critical prerequisite.
3. Add visible author + citations (supports AI credibility scoring).
4. Keep llms.txt/ai.txt updated on every deploy (they are currently a genuine differentiator).

## SCORE (AI Search Readiness): 70/100
Excellent on-paper GEO infrastructure (llms.txt, ai.txt, schema, static content) is undermined by the robots.txt block and the canonical bug.
