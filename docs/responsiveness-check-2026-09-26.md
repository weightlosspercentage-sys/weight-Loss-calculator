# Responsiveness Check: weightlosspercentage.com (local preview)

**Date**: 2026-09-26
**Mode**: Standard (skill: responsiveness-check, Mode 1)
**Breakpoints tested**: 320, 375, 768, 1024, 1280, 1440, 1920, 2560 (height 900)
**Browser tool**: local Playwright + Chrome (headless) — skill's preferred playwright-cli / Playwright MCP / Chrome MCP not installed; equivalent single-session resize workflow used
**URLs**: `/` (React shell + modern header) and `/calculators/bmi/height-weight/4-8/250/` (static legacy header)
**Screenshots**: `scratch/rc_shots/{url}_{width}.png` (16 captures)

## Summary

| Width | home | legacy-hw |
|-------|------|-----------|
| 320px | Pass (1 low) | Pass (2 low) |
| 375px | Pass (1 low) | Pass (2 low) |
| 768px | Pass | Pass |
| 1024px | Pass | Pass |
| 1280px | Pass | Pass |
| 1440px | Pass | Pass |
| 1920px | Pass | Pass |
| 2560px | Pass | Pass |

**Overall**: 0 critical / 0 high / 0 medium issues across 16 breakpoint×URL combinations. No horizontal overflow at any width. Only low-severity touch-target notes remain.

## Critical & High Issues

None.

## Transition Analysis

| Transition | Observed At | Clean? | Notes |
|-----------|-------------|--------|-------|
| Nav: hamburger → full (home, React header) | exactly 768px | Yes | Hamburger visible at 767px, full nav at 768px (Tailwind `md:`). No broken in-between state. |
| Legacy nav: row → wrapped rows | ≤700px | Yes | `mobile-nav-wrap` media query (build step 3f): logo row + wrapped links, all 5 links reachable at 320px. No hamburger on legacy pages by design (no bundle JS to drive one). |
| Grid: 1-col → 2/3-col (home) | 375 → 768px | Yes | Card grids report single column at phone widths, 2–5 columns from 768px up. |
| Grid: 1-col → 3-col (legacy related links) | 768px | Yes | |
| Content containment at ultra-wide | 1920–2560px | Yes | Centered max-width containers; no runaway text line lengths detected. |

## Per-Breakpoint Notes

### 320px / 375px — Pass (low-severity notes only)

- **[Low] Touch targets < 44px** — home: 12–14 elements; legacy: 17. Inspection shows these are inline text links inside sentences/lists (explicitly exempt from WCAG 2.5.8 target-size minimum) plus 4 small footer social icons (~20px wide). Buttons and form inputs all meet 44px.
- **[Info] CTA above fold** — home: "Calculate Now" visible at every width. Legacy page: no CTA-matching link above fold at any width (the calculator result itself is the content — heuristic miss, not a defect).
- Text "clipping" flags on home were `.sr-only` screen-reader elements (1px by design) — false positives.

## Recommendations

### Quick Fixes (CSS only) — optional polish
- Footer social icons: widen tap area to 44×44 with padding (affects all pages; would count as a UI change — needs owner approval).

### Structural Changes
- None required. The legacy-header wrap fix (astro.config.mjs step 3f + 68,744 patched files) holds across the full 320→2560 sweep in a single session.

## Skill Test Verdict

The responsiveness-check skill installed globally (`~/.claude-omniroute/skills/responsiveness-check`, mirrored to `~/.qoder/skills/`) and its Standard-mode workflow executed successfully. Notes: `npx skills add` prints nothing in non-TTY shells (run the cached `bin/cli.mjs` directly to see progress); the skill's browser-tool detection (playwright-cli / Playwright MCP / Chrome MCP) found none of its three preferred tools — the workflow was carried out with local Playwright instead, which supports all required operations (resize, screenshots, DOM checks).
