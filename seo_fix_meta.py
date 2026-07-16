"""
Fix 3: Fix duplicate meta descriptions on locale pages.
Scans all index.html files in locale root directories (not the huge weight-loss from-X-to-Y pages).
"""
import os, re

ROOT = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

LOCALE_SUFFIX = {
    "uk": " Tailored for UK users.",
    "ca": " Tailored for Canadian users.",
    "au": " Tailored for Australian users.",
    "nz": " Tailored for New Zealand users.",
}

# Exact descriptions known to be duplicated (from CSV audit)
DUPLICATE_DESCS = {
    "Calculate your weight loss percentage instantly with our free tool. Track body weight trends, set healthy goals and start your weight loss journey safely today.",
    "Honest side-by-side comparisons: BMR vs TDEE, BMI vs body fat, keto vs low-carb, calories vs macros.",
    "Look up calories, protein, carbs, and fat for thousands of foods. Build meals and track nutrition with our free tool.",
    "Estimate daily calorie needs, safe weight loss timelines, and portion adjustments for your dog based on breed and activity level.",
    "Get in touch with the Weight Loss Percentage team.",
    "Calculate the ideal daily protein intake for fat loss, muscle gain, or maintenance based on your weight, activity, and training goals.",
    "Terms governing your use of our website and calculators.",
    "Calculate the calories your body burns at rest using the Harris\u2013Benedict equation. Plan a deficit or surplus from your true baseline.",
    "Calculate your exact calorie deficit to lose weight at a safe, sustainable pace. Enter your stats and get your daily calorie target, TDEE, and weekly loss projection in seconds. Dietitian-reviewed.",
    "Evidence-based guides on weight loss, calorie tracking, macros, and sustainable fitness habits.",
    "Educational use only \u2014 not medical advice.",
}

meta_pat = re.compile(
    r'(<meta\s+name="description"\s+content=")(.*?)("\s*/>)',
    re.IGNORECASE
)

def collect_html_files_for_locale(locale_dir):
    """Walk locale dir but skip weight-loss/from-* directories (too many)."""
    results = []
    for dirpath, dirnames, filenames in os.walk(locale_dir):
        # Skip the massive weight-loss/from-*/ tree
        if "weight-loss" in dirpath and "from-" in os.path.basename(dirpath):
            dirnames.clear()
            continue
        if "index.html" in filenames:
            results.append(os.path.join(dirpath, "index.html"))
    return results

fixed = 0
for locale, suffix in LOCALE_SUFFIX.items():
    locale_dir = os.path.join(ROOT, locale)
    if not os.path.isdir(locale_dir):
        continue
    for html_path in collect_html_files_for_locale(locale_dir):
        with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        original = content

        def replace_meta(m):
            desc = m.group(2)
            # Only modify if exact duplicate and suffix not already added
            if desc in DUPLICATE_DESCS and suffix.strip() not in desc:
                # Don't exceed 200 chars
                new_desc = desc + suffix
                if len(new_desc) <= 200:
                    return f'{m.group(1)}{new_desc}{m.group(3)}'
            return m.group(0)

        content = meta_pat.sub(replace_meta, content)
        if content != original:
            with open(html_path, "w", encoding="utf-8", newline="\r\n") as f:
                f.write(content)
            fixed += 1
            print(f"  FIXED: {os.path.relpath(html_path, ROOT)}")

print(f"\nDone. Fixed meta descriptions in {fixed} locale pages.")
