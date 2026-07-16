"""
SEO Audit Fix Script — weightlosspercentage.com
Addresses all issues found in the Screaming Frog audit:
  1. Wrong canonical on ru/calculators/calorie-deficit/
  2. Fix trailing slashes on internal links (149 redirect URLs → 1,275 inlinks)
  3. Fix duplicate titles & H1s on localized from-X-to-Y calculator pages
  4. Fix duplicate meta descriptions on locale pages
  5. Add missing width/height on <img> tags in blog pages
  6. Add Content-Security-Policy header to .htaccess
"""

import os
import re
import glob

ROOT = os.path.dirname(os.path.abspath(__file__))

# ─── Helpers ──────────────────────────────────────────────────────────────────

def read_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(content)

def find_html_files(directory):
    return glob.glob(os.path.join(directory, "**", "index.html"), recursive=True)

# ─── Fix 1: Wrong Canonical on ru/calculators/calorie-deficit/ ───────────────
def fix_ru_calorie_deficit_canonical():
    path = os.path.join(ROOT, "ru", "calculators", "calorie-deficit", "index.html")
    if not os.path.exists(path):
        print(f"  [SKIP] Not found: {path}")
        return
    content = read_file(path)
    # Check if canonical is pointing to homepage instead of self
    wrong = 'rel="canonical" href="https://www.weightlosspercentage.com/"'
    correct = 'rel="canonical" href="https://www.weightlosspercentage.com/ru/calculators/calorie-deficit/"'
    if wrong in content:
        content = content.replace(wrong, correct)
        write_file(path, content)
        print(f"  [FIXED] Wrong canonical in ru/calculators/calorie-deficit/")
    else:
        print(f"  [OK] ru/calculators/calorie-deficit/ canonical is fine")

# ─── Fix 2: Add trailing slashes to internal links ───────────────────────────
# These are the exact URL paths that currently redirect 308 (no trailing slash → trailing slash)
REDIRECT_PATHS = [
    "/blog/how-to-calculate-weight-loss-percentage",
    "/calculators/water-intake",
    "/blog/lifestyle-changes-weight-loss-guide",
    "/blog/best-diet-for-weight-loss",
    "/blog/calorie-deficit-weight-loss",
    "/blog/weight-loss-formulas-explained",
    "/blog/walking-for-weight-loss",
    "/blog/fat-loss-vs-weight-loss",
    "/blog/signs-body-burning-fat",
    "/blog/keto-diet-weight-loss",
    "/calculators/calorie",
    "/blog/calories-vs-weight-loss",
    "/calculators/macro",
    "/blog/weight-loss-plateau",
    "/blog/weight-tracking-guide",
    "/calculators/weight-loss",
    "/calculators/bmr",
    "/blog/sleep-and-weight-loss",
    "/calculators/protein",
    "/calculators/body-fat",
    "/calculators/tdee",
    "/blog/exercise-for-weight-loss",
    "/calculators/bmi",
]

def fix_trailing_slash_links(html_content):
    """Add trailing slash to any href pointing to a known redirect path (no trailing slash)."""
    changed = False
    for path in REDIRECT_PATHS:
        # Match href="<path>" or href='<path>' exactly (no trailing slash already)
        # Handles both absolute paths and relative within href attributes
        # Pattern: href='/calculators/calorie' or href="/calculators/calorie"
        for quote in ['"', "'"]:
            old = f"href={quote}{path}{quote}"
            new = f"href={quote}{path}/{quote}"
            if old in html_content:
                html_content = html_content.replace(old, new)
                changed = True
        # Also fix paths embedded in schema JSON (target="_blank" href='...') etc
        # e.g.  href='/calculators/bmr'  inside string context
        old2 = f"href=\\'{path}\\'"
        new2 = f"href=\\'{path}/\\'"
        if old2 in html_content:
            html_content = html_content.replace(old2, new2)
            changed = True
    return html_content, changed

def fix_all_trailing_slash_links():
    print("\n[Fix 2] Fixing trailing slash on internal links...")
    html_files = find_html_files(ROOT)
    fixed_count = 0
    for path in html_files:
        # Skip node_modules and dist directories
        if "node_modules" in path or "dist_old" in path or "dist_test" in path:
            continue
        content = read_file(path)
        new_content, changed = fix_trailing_slash_links(content)
        if changed:
            write_file(path, new_content)
            fixed_count += 1
            rel = os.path.relpath(path, ROOT)
            print(f"  [FIXED] {rel}")
    print(f"  Total files fixed: {fixed_count}")

# ─── Fix 3: Fix duplicate titles & H1s on locale from-X-to-Y pages ──────────

LOCALE_CONFIG = {
    "uk": {"label": "UK", "lang_name": "United Kingdom"},
    "ca": {"label": "Canada", "lang_name": "Canada"},
    "au": {"label": "Australia", "lang_name": "Australia"},
    "nz": {"label": "New Zealand", "lang_name": "New Zealand"},
    "ru": {"label": "Russia", "lang_name": "Russia"},
    "zh": {"label": "China", "lang_name": "China"},
}

def fix_locale_from_x_to_y_titles():
    print("\n[Fix 3] Fixing duplicate titles & H1s on locale from-X-to-Y pages...")
    fixed_count = 0

    for locale, cfg in LOCALE_CONFIG.items():
        locale_calc_dir = os.path.join(ROOT, locale, "calculators", "weight-loss")
        if not os.path.isdir(locale_calc_dir):
            continue

        for entry in os.listdir(locale_calc_dir):
            if not entry.startswith("from-"):
                continue
            page_path = os.path.join(locale_calc_dir, entry, "index.html")
            if not os.path.exists(page_path):
                continue

            content = read_file(page_path)
            changed = False

            # ── Title fix: add locale label if not already present
            # Pattern: <title>Weight Loss Percentage from X to Y lbs: Safe Deficit Plan</title>
            title_pattern = re.compile(
                r'(<title>)(Weight Loss Percentage from \d+ to \d+ lbs: Safe Deficit Plan)(</title>)',
                re.IGNORECASE
            )
            def title_replacer(m):
                return f'{m.group(1)}{m.group(2)} ({cfg["label"]}){m.group(3)}'

            new_content = title_pattern.sub(title_replacer, content)
            if new_content != content:
                content = new_content
                changed = True

            # ── H1 fix: add locale label if not already present
            # Pattern: <h1 ...>Weight Loss Percentage from X to Y lbs</h1>
            h1_pattern = re.compile(
                r'(<h1[^>]*>)(Weight Loss Percentage from \d+ to \d+ lbs)(</h1>)',
                re.IGNORECASE
            )
            def h1_replacer(m):
                return f'{m.group(1)}{m.group(2)} ({cfg["label"]}){m.group(3)}'

            new_content = h1_pattern.sub(h1_replacer, content)
            if new_content != content:
                content = new_content
                changed = True

            # ── og:title fix as well (if present)
            og_title_pattern = re.compile(
                r'(property="og:title"\s+content=")(Weight Loss Percentage from \d+ to \d+ lbs[^"]*?)(")',
                re.IGNORECASE
            )
            def og_title_replacer(m):
                if f'({cfg["label"]})' not in m.group(2):
                    return f'{m.group(1)}{m.group(2)} ({cfg["label"]}){m.group(3)}'
                return m.group(0)

            new_content = og_title_pattern.sub(og_title_replacer, content)
            if new_content != content:
                content = new_content
                changed = True

            if changed:
                write_file(page_path, content)
                fixed_count += 1

    print(f"  Total locale from-X-to-Y pages fixed: {fixed_count}")

# ─── Fix 4: Fix duplicate meta descriptions on locale pages ──────────────────

# Map of locale prefix → localized qualifier to append to description
LOCALE_META_SUFFIX = {
    "uk": " Tailored for UK users.",
    "ca": " Tailored for Canadian users.",
    "au": " Tailored for Australian users.",
    "nz": " Tailored for New Zealand users.",
}

# Pages that have duplicate meta descriptions between main and locale versions
# These are the known duplicated descriptions (from the audit CSV)
DUPLICATE_DESCRIPTIONS = [
    "Calculate your weight loss percentage instantly with our free tool. Track body weight trends, set healthy goals and start your weight loss journey safely today.",
    "Honest side-by-side comparisons: BMR vs TDEE, BMI vs body fat, keto vs low-carb, calories vs macros.",
    "Look up calories, protein, carbs, and fat for thousands of foods. Build meals and track nutrition with our free tool.",
    "Estimate daily calorie needs, safe weight loss timelines, and portion adjustments for your dog based on breed and activity level.",
    "Get in touch with the Weight Loss Percentage team.",
    "Calculate the ideal daily protein intake for fat loss, muscle gain, or maintenance based on your weight, activity, and training goals.",
    "Terms governing your use of our website and calculators.",
    "Calculate the calories your body burns at rest using the Harris–Benedict equation. Plan a deficit or surplus from your true baseline.",
    "Calculate your exact calorie deficit to lose weight at a safe, sustainable pace. Enter your stats and get your daily calorie target, TDEE, and weekly loss projection in seconds. Dietitian-reviewed.",
    "Evidence-based guides on weight loss, calorie tracking, macros, and sustainable fitness habits.",
    "Educational use only — not medical advice.",
    "Calculate the weight loss percentage from",  # partial match for from-X-to-Y pages
]

def fix_locale_meta_descriptions():
    print("\n[Fix 4] Fixing duplicate meta descriptions on locale pages...")
    fixed_count = 0

    for locale, suffix in LOCALE_META_SUFFIX.items():
        locale_dir = os.path.join(ROOT, locale)
        if not os.path.isdir(locale_dir):
            continue

        for page_path in find_html_files(locale_dir):
            if "node_modules" in page_path or "dist" in page_path:
                continue

            content = read_file(page_path)
            changed = False

            # Find meta description tag
            meta_pattern = re.compile(
                r'(<meta\s+name="description"\s+content=")(.*?)("\s*/?>)',
                re.IGNORECASE | re.DOTALL
            )

            def desc_replacer(m):
                desc = m.group(2)
                # Only modify if this description matches a known duplicate
                is_duplicate = any(
                    dup.lower() in desc.lower() for dup in DUPLICATE_DESCRIPTIONS
                )
                # And only if locale suffix not already there
                locale_already_added = any(
                    suf.strip().lower() in desc.lower()
                    for suf in LOCALE_META_SUFFIX.values()
                )
                if is_duplicate and not locale_already_added and len(desc) + len(suffix) <= 200:
                    return f'{m.group(1)}{desc}{suffix}{m.group(3)}'
                return m.group(0)

            new_content = meta_pattern.sub(desc_replacer, content)
            if new_content != content:
                content = new_content
                changed = True
                fixed_count += 1
                write_file(page_path, content)

    print(f"  Total locale pages with meta description updated: {fixed_count}")

# ─── Fix 5: Add missing width/height attributes to blog <img> tags ────────────

def fix_missing_image_sizes():
    print("\n[Fix 5] Adding missing width/height to <img> tags in blog pages...")
    fixed_count = 0

    # Unsplash images typically loaded with w=800, aspect ratio ~3:2 → height=533
    # Also handle w=1200 → height=800
    img_pattern = re.compile(
        r'(<img\s)((?:(?!width=|height=|/>|>)[^>])*?)(/>|>)',
        re.IGNORECASE | re.DOTALL
    )

    def img_replacer(m):
        tag_start = m.group(1)
        attrs = m.group(2)
        tag_end = m.group(3)

        # Check src for Unsplash with w= param
        src_match = re.search(r'src="([^"]+)"', attrs)
        if not src_match:
            return m.group(0)
        src = src_match.group(1)

        # Only fix Unsplash images that don't already have width/height
        if "unsplash.com" not in src:
            return m.group(0)
        if "width=" in attrs.lower() or "height=" in attrs.lower():
            return m.group(0)

        # Determine dimensions from URL params
        w_match = re.search(r'[?&]w=(\d+)', src)
        if w_match:
            width = int(w_match.group(1))
            # Standard 3:2 ratio
            height = round(width * 2 / 3)
        else:
            width, height = 800, 533

        return f'{tag_start}{attrs} width="{width}" height="{height}"{tag_end}'

    # Target blog directories
    blog_dirs = [
        os.path.join(ROOT, "blog"),
        os.path.join(ROOT, "uk", "blog"),
        os.path.join(ROOT, "ca", "blog"),
        os.path.join(ROOT, "au", "blog"),
        os.path.join(ROOT, "nz", "blog"),
        os.path.join(ROOT, "ru", "blog"),
        os.path.join(ROOT, "zh", "blog"),
    ]

    for blog_dir in blog_dirs:
        if not os.path.isdir(blog_dir):
            continue
        for page_path in find_html_files(blog_dir):
            content = read_file(page_path)
            new_content = img_pattern.sub(img_replacer, content)
            if new_content != content:
                write_file(page_path, new_content)
                fixed_count += 1
                rel = os.path.relpath(page_path, ROOT)
                print(f"  [FIXED] {rel}")

    print(f"  Total blog pages with image sizes fixed: {fixed_count}")

# ─── Fix 6: Add Content-Security-Policy to .htaccess ─────────────────────────

CSP_HEADER = """  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com; frame-src 'self' https://googleads.g.doubleclick.net; object-src 'none'; base-uri 'self';"\n"""

def fix_htaccess_csp():
    print("\n[Fix 6] Adding Content-Security-Policy to .htaccess...")
    htaccess_path = os.path.join(ROOT, ".htaccess")
    if not os.path.exists(htaccess_path):
        print("  [SKIP] .htaccess not found")
        return

    content = read_file(htaccess_path)

    if "Content-Security-Policy" in content:
        print("  [OK] Content-Security-Policy already present")
        return

    # Insert CSP after X-Frame-Options line inside the <IfModule mod_headers.c> block
    old = '  Header set X-Frame-Options "SAMEORIGIN"\n'
    new = old + CSP_HEADER
    if old in content:
        content = content.replace(old, new)
        # Use Unix line endings for .htaccess
        with open(htaccess_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        print("  [FIXED] Content-Security-Policy header added to .htaccess")
    else:
        print("  [WARN] Could not find insertion point in .htaccess — please add CSP manually")

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("SEO Audit Fix Script — weightlosspercentage.com")
    print("=" * 60)

    print("\n[Fix 1] Checking wrong canonical on ru/calculators/calorie-deficit/...")
    fix_ru_calorie_deficit_canonical()

    fix_all_trailing_slash_links()
    fix_locale_from_x_to_y_titles()
    fix_locale_meta_descriptions()
    fix_missing_image_sizes()
    fix_htaccess_csp()

    print("\n" + "=" * 60)
    print("All fixes applied. Please review git diff before deploying.")
    print("=" * 60)
