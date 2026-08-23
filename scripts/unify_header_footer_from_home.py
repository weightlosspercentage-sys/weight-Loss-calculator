#!/usr/bin/env python3
"""Unify the header, footer and logo across every deployed page.

The home page (index.html) is the single source of truth. Its
<header class="static-header"> and <footer class="static-footer"> blocks are
extracted verbatim and spliced into every other page, so every page ends up
with the identical logo, nav (including the Calculators / Nutrition dropdowns),
Google Translate widget and footer.

Regional pages (au/ ca/ nz/ ru/ uk/ zh/) keep locale-scoped links: an href of
"/calculators/bmi/" becomes "/au/calculators/bmi/" *when that regional page
actually exists on disk*, otherwise the global URL is kept. This preserves
regional internal linking instead of pointing every locale at the global site.

Also repaired along the way:
  * pages carrying a non-canonical header variant (5 variants were in the wild)
  * pages carrying a non-canonical footer variant (3 variants)
  * the black-square logo on au/calculators/bmi/height-weight/** pages
  * <header class="nav-bar"> pages that had no static header at all
  * pages with no footer at all
  * duplicated Google Translate init scripts (some pages had it 4x)
  * invalid `colour:` CSS declarations (British spelling, silently ignored
    by every browser) -> `color:`

Usage:
    python scripts/unify_header_footer_from_home.py --dry-run
    python scripts/unify_header_footer_from_home.py --dry-run --sample 3
    python scripts/unify_header_footer_from_home.py
"""

import argparse
import os
import re
import subprocess
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.join(ROOT, "index.html")

REGIONS = ("au", "ca", "nz", "ru", "uk", "zh")

# Directories that are not part of the deployed site.
EXCLUDE_PREFIXES = (
    "dist/", "dist2/", "dist3/", "node_modules/", "scratch/", "tests/",
    "playwright-report/", "test-results/", "public/", "src/", "utils/",
    "backlink-campaign/", "weightlosspercentage.com-audit/", "seo-strategy/",
    "images/", "assets/",
)

STATIC_HEADER_RE = re.compile(r'<header\b[^>]*class="[^"]*static-header[^"]*"[\s\S]*?</header>')
STATIC_FOOTER_RE = re.compile(r'<footer\b[^>]*class="[^"]*static-footer[^"]*"[\s\S]*?</footer>')
ANY_HEADER_RE = re.compile(r"<header\b[^>]*>[\s\S]*?</header>")
ANY_FOOTER_RE = re.compile(r"<footer\b[^>]*>[\s\S]*?</footer>")
MAIN_OPEN_RE = re.compile(r"[ \t]*<main\b")

# Stray Google Translate artefacts that accumulated outside the header.
STRAY_PATTERNS = [
    re.compile(r"<script\b[^>]*>(?:(?!</script>)[\s\S])*?googleTranslateElementInit(?:(?!</script>)[\s\S])*?</script>[ \t]*\n?"),
    re.compile(r'<script\b[^>]*src="[^"]*translate\.google\.com[^"]*"[^>]*>\s*</script>[ \t]*\n?'),
    re.compile(r'<div id="google_translate_element"[^>]*>\s*</div>[ \t]*\n?'),
    re.compile(r"<!--(?:(?!-->)[\s\S])*?Google Translate(?:(?!-->)[\s\S])*?-->[ \t]*\n?"),
    re.compile(r"<style\b[^>]*>(?:(?!</style>)[\s\S])*?goog-te-gadget(?:(?!</style>)[\s\S])*?</style>[ \t]*\n?"),
]

PLACEHOLDER = "\x00__CANONICAL_HEADER__\x00"


def tracked_html():
    out = subprocess.run(
        ["git", "ls-files", "-z", "*.html"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    files = [p for p in out.split("\0") if p]
    return [f for f in files if not f.startswith(EXCLUDE_PREFIXES)]


def url_for(relpath):
    """calculators/bmi/index.html -> /calculators/bmi/ ; index.html -> /"""
    if relpath == "index.html":
        return "/"
    if relpath.endswith("/index.html"):
        return "/" + relpath[: -len("index.html")]
    return "/" + relpath


def region_of(relpath):
    head = relpath.split("/", 1)[0]
    return head if head in REGIONS else ""


def localize(block, region, existing_urls):
    """Rewrite global hrefs to the regional equivalent when that page exists."""
    if not region:
        return block

    def repl(m):
        url = m.group(1)
        candidate = "/" + region + url
        return 'href="%s"' % (candidate if candidate in existing_urls else url)

    return re.sub(r'href="(/[^"]*)"', repl, block)


def strip_stray(html):
    for pat in STRAY_PATTERNS:
        html = pat.sub("", html)
    return html


def rewrite(src, header, footer):
    """Return (new_html, actions) or (None, reason) if the page can't be handled."""
    actions = []
    out = src

    # ---- header ---------------------------------------------------------
    m = STATIC_HEADER_RE.search(out)
    if m:
        actions.append("header-replaced")
    else:
        m = ANY_HEADER_RE.search(out)
        if m:
            actions.append("header-converted")
    if m:
        out = out[: m.start()] + PLACEHOLDER + out[m.end():]
    else:
        mm = MAIN_OPEN_RE.search(out)
        if not mm:
            return None, "no-header-and-no-main"
        out = out[: mm.start()] + "      " + PLACEHOLDER + "\n" + out[mm.start():]
        actions.append("header-inserted")

    # Drop translate leftovers that live outside the header before re-inserting.
    before = out
    out = strip_stray(out)
    if out != before:
        actions.append("stray-translate-removed")

    out = out.replace(PLACEHOLDER, header)

    # ---- footer ---------------------------------------------------------
    fm = STATIC_FOOTER_RE.search(out)
    if fm:
        out = out[: fm.start()] + footer + out[fm.end():]
        actions.append("footer-replaced")
    else:
        fm = ANY_FOOTER_RE.search(out)
        if fm:
            out = out[: fm.start()] + footer + out[fm.end():]
            actions.append("footer-converted")
        else:
            idx = out.rfind("</main>")
            if idx == -1:
                return None, "no-footer-and-no-main-close"
            cut = idx + len("</main>")
            out = out[:cut] + "\n\n" + footer + out[cut:]
            actions.append("footer-inserted")

    # ---- invalid British-spelling CSS -----------------------------------
    if "colour:" in out:
        out = out.replace("colour:", "color:")
        actions.append("colour-css-fixed")

    return out, actions


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="report without writing")
    ap.add_argument("--sample", type=int, default=0,
                    help="with --dry-run, print a unified diff for the first N changed files")
    args = ap.parse_args()

    with open(HOME, "r", encoding="utf-8") as fh:
        home_html = fh.read()

    hm = STATIC_HEADER_RE.search(home_html)
    fm = STATIC_FOOTER_RE.search(home_html)
    if not hm or not fm:
        sys.exit("FATAL: cannot extract canonical header/footer from index.html")
    canonical_header = hm.group(0)
    canonical_footer = fm.group(0)
    print(f"Canonical header: {len(canonical_header):,} bytes")
    print(f"Canonical footer: {len(canonical_footer):,} bytes")

    files = tracked_html()
    existing_urls = {url_for(f) for f in files}
    print(f"Pages in scope : {len(files):,}\n")

    # Pre-build one localized header/footer per region (cheap, avoids 14k regexes).
    variants = {"": (canonical_header, canonical_footer)}
    for r in REGIONS:
        variants[r] = (
            localize(canonical_header, r, existing_urls),
            localize(canonical_footer, r, existing_urls),
        )
    for r in REGIONS:
        n = len(re.findall(r'href="/%s/' % r, variants[r][0] + variants[r][1]))
        print(f"  /{r}/ variant: {n} locale-scoped links")
    print()

    stats = Counter()
    changed = []
    skipped = []

    for rel in files:
        path = os.path.join(ROOT, rel)
        try:
            with open(path, "r", encoding="utf-8") as fh:
                src = fh.read()
        except OSError as exc:
            skipped.append((rel, f"unreadable: {exc}"))
            continue

        header, footer = variants[region_of(rel)]
        new, actions = rewrite(src, header, footer)
        if new is None:
            skipped.append((rel, actions))
            stats["skipped"] += 1
            continue

        for a in actions:
            stats[a] += 1

        if new != src:
            changed.append((rel, src, new))
            stats["files-changed"] += 1
            if not args.dry_run:
                with open(path, "w", encoding="utf-8", newline="") as fh:
                    fh.write(new)
        else:
            stats["already-correct"] += 1

    print("=" * 68)
    print("DRY RUN — nothing written" if args.dry_run else "APPLIED")
    print("=" * 68)
    for k, v in sorted(stats.items(), key=lambda kv: -kv[1]):
        print(f"  {v:7,}  {k}")

    if skipped:
        print(f"\nSkipped {len(skipped)} file(s):")
        for rel, why in skipped[:20]:
            print(f"  {rel}: {why}")

    if args.dry_run and args.sample:
        import difflib
        for rel, src, new in changed[: args.sample]:
            print("\n" + "-" * 68)
            print(f"DIFF {rel}")
            print("-" * 68)
            diff = difflib.unified_diff(
                src.splitlines(), new.splitlines(),
                fromfile="before", tofile="after", lineterm="", n=2,
            )
            for i, line in enumerate(diff):
                if i > 120:
                    print("  ... (truncated)")
                    break
                print(line)

    return 0


if __name__ == "__main__":
    sys.exit(main())
