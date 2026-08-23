"""Audit every deployed HTML page against the home page's header + footer.

Checks, per page:
  * exactly one <header class="static-header"> present
  * exactly one <footer class="static-footer"> present
  * header markup matches index.html byte-for-byte (whitespace-normalised)
  * footer markup matches index.html byte-for-byte (whitespace-normalised)
  * header logo present (gradient "%" mark + "Weight Loss Percentage" wordmark)
  * footer logo present ("%" mark + brand name)
  * header logo links to a home URL

Only files tracked by git are audited (dist/, node_modules/, scratch artefacts
are ignored). Writes a machine-readable report to scratch/header_footer_audit.json
and prints a human summary.
"""

import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.join(ROOT, "index.html")

HEADER_RE = re.compile(r'<header\b[^>]*class="[^"]*static-header[^"]*"[\s\S]*?</header>')
ANY_HEADER_RE = re.compile(r"<header\b[\s\S]*?</header>")
FOOTER_RE = re.compile(r'<footer\b[^>]*class="[^"]*static-footer[^"]*"[\s\S]*?</footer>')
ANY_FOOTER_RE = re.compile(r"<footer\b[\s\S]*?</footer>")

# Logo signatures taken from the home page.
HEADER_LOGO_MARK = "linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316)"
BRAND_WORDMARK = "Weight Loss Percentage"
FOOTER_LOGO_MARK = "background: #38bdf8; color: #0f172a"

# Every page should expose these nav entries.
REQUIRED_NAV = [
    ("Home", 'href="/"'),
    ("Calculators", 'href="/calculators/"'),
    ("Nutrition", 'href="/nutrition/"'),
    ("Compare", 'href="/compare/"'),
    ("Blog", 'href="/blog/"'),
    ("Glossary", 'href="/glossary/"'),
    ("About", 'href="/about/"'),
]

# Footer column headings that must survive on every page.
REQUIRED_FOOTER_SECTIONS = ["Top Calculators", "Popular Restaurants", "Company & Legal"]

# Regional prefixes: their logo/nav hrefs are allowed to be locale-scoped.
REGION_PREFIXES = ("au", "ca", "nz", "uk", "ru", "zh", "us", "in", "za", "ie", "sg", "ph")


def norm(s):
    """Collapse all runs of whitespace so indentation differences do not count."""
    return re.sub(r"\s+", " ", s).strip()


def tracked_html_files():
    out = subprocess.run(
        ["git", "ls-files", "-z", "*.html"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    files = [p for p in out.split("\0") if p]
    skip = ("dist/", "dist2/", "dist3/", "scratch/", "tests/", "playwright-report/",
            "test-results/", "weightlosspercentage.com-audit/", "seo-strategy/",
            "backlink-campaign/", "public/")
    return [f for f in files if not f.startswith(skip)]


def region_of(relpath):
    first = relpath.split("/", 1)[0]
    return first if first in REGION_PREFIXES else ""


def audit_page(relpath, home_header_n, home_footer_n):
    path = os.path.join(ROOT, relpath)
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            html = fh.read()
    except OSError as exc:
        return {"file": relpath, "issues": [f"unreadable: {exc}"]}

    issues = []
    headers = HEADER_RE.findall(html)
    footers = FOOTER_RE.findall(html)
    any_headers = ANY_HEADER_RE.findall(html)
    any_footers = ANY_FOOTER_RE.findall(html)

    # --- header presence -------------------------------------------------
    if not headers:
        if any_headers:
            issues.append("header-not-static-header")
        else:
            issues.append("header-missing")
    elif len(headers) > 1:
        issues.append(f"header-duplicated x{len(headers)}")

    # --- footer presence -------------------------------------------------
    if not footers:
        if any_footers:
            issues.append("footer-not-static-footer")
        else:
            issues.append("footer-missing")
    elif len(footers) > 1:
        issues.append(f"footer-duplicated x{len(footers)}")

    header = headers[0] if headers else ""
    footer = footers[0] if footers else ""

    # --- parity with home page -------------------------------------------
    if header and norm(header) != home_header_n:
        issues.append("header-differs-from-home")
    if footer and norm(footer) != home_footer_n:
        issues.append("footer-differs-from-home")

    # --- logo ------------------------------------------------------------
    if header:
        if HEADER_LOGO_MARK not in header:
            issues.append("header-logo-mark-missing")
        if BRAND_WORDMARK not in header:
            issues.append("header-wordmark-missing")
        if not re.search(r'<a\s+href="(/|https?://[^"]*/)"[^>]*>\s*<span[^>]*linear-gradient', header):
            issues.append("header-logo-not-linked-home")
    if footer:
        if FOOTER_LOGO_MARK not in footer:
            issues.append("footer-logo-mark-missing")
        if BRAND_WORDMARK not in footer:
            issues.append("footer-wordmark-missing")

    # --- nav completeness -------------------------------------------------
    if header:
        missing_nav = [label for label, href in REQUIRED_NAV if href not in header]
        if missing_nav:
            issues.append("nav-missing:" + ",".join(missing_nav))
        if header.count("nav-item-dropdown") < 2:
            issues.append("nav-dropdowns-missing")
        if "google_translate_element" not in header:
            issues.append("translate-widget-missing")

    if footer:
        missing_sections = [s for s in REQUIRED_FOOTER_SECTIONS if s not in footer]
        if missing_sections:
            issues.append("footer-sections-missing:" + ",".join(missing_sections))

    # --- ordering: header before main, footer after -----------------------
    if header and footer:
        if html.index(header) > html.index(footer):
            issues.append("header-after-footer")

    return {
        "file": relpath,
        "region": region_of(relpath),
        "issues": issues,
        "header_len": len(header),
        "footer_len": len(footer),
    }


def main():
    with open(HOME, "r", encoding="utf-8", errors="replace") as fh:
        home_html = fh.read()

    home_headers = HEADER_RE.findall(home_html)
    home_footers = FOOTER_RE.findall(home_html)
    if not home_headers or not home_footers:
        sys.exit("FATAL: could not extract header/footer from index.html")

    home_header_n = norm(home_headers[0])
    home_footer_n = norm(home_footers[0])

    files = tracked_html_files()
    print(f"Auditing {len(files)} tracked HTML pages against index.html\n")

    results = []
    for relpath in files:
        results.append(audit_page(relpath, home_header_n, home_footer_n))

    clean = [r for r in results if not r["issues"]]
    broken = [r for r in results if r["issues"]]

    issue_counts = Counter()
    for r in broken:
        for i in r["issues"]:
            issue_counts[i.split(":")[0]] += 1

    print("=" * 72)
    print(f"PASS : {len(clean)} pages match the home page header + footer exactly")
    print(f"FAIL : {len(broken)} pages differ")
    print("=" * 72)

    if issue_counts:
        print("\nIssue breakdown:")
        for issue, n in issue_counts.most_common():
            print(f"  {n:6d}  {issue}")

    by_dir = defaultdict(int)
    for r in broken:
        parts = r["file"].split("/")
        by_dir["/".join(parts[:2]) if len(parts) > 1 else parts[0]] += 1
    if by_dir:
        print("\nFailing pages by section (top 30):")
        for d, n in sorted(by_dir.items(), key=lambda kv: -kv[1])[:30]:
            print(f"  {n:6d}  {d}")

        print("\nFirst 25 failing files:")
        for r in broken[:25]:
            print(f"  {r['file']}\n      -> {', '.join(r['issues'])}")

    report_path = os.path.join(ROOT, "scratch", "header_footer_audit.json")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as fh:
        json.dump(
            {
                "total": len(files),
                "pass": len(clean),
                "fail": len(broken),
                "issue_counts": dict(issue_counts),
                "failures": broken,
            },
            fh,
            indent=2,
        )
    print(f"\nFull report: scratch/header_footer_audit.json")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
