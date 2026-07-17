"""
Fix 2: Fix duplicate titles & H1s on locale from-X-to-Y calculator pages.
Only scans the specific locale/calculators/weight-loss/from-*/ directories.
"""
import os, re

ROOT = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

LOCALE_LABEL = {
    "uk": "UK",
    "ca": "Canada",
    "au": "Australia",
    "nz": "New Zealand",
    "ru": "Russia",
    "zh": "中文",
}

title_pat = re.compile(
    r'(<title>)(Weight Loss Percentage from \d+ to \d+ lbs: Safe Deficit Plan)(</title>)',
    re.IGNORECASE
)
h1_pat = re.compile(
    r'(<h1[^>]*>)(Weight Loss Percentage from \d+ to \d+ lbs)(</h1>)',
    re.IGNORECASE
)

fixed = 0
for locale, label in LOCALE_LABEL.items():
    wl_dir = os.path.join(ROOT, locale, "calculators", "weight-loss")
    if not os.path.isdir(wl_dir):
        continue
    for entry in os.listdir(wl_dir):
        if not entry.startswith("from-"):
            continue
        html = os.path.join(wl_dir, entry, "index.html")
        if not os.path.isfile(html):
            continue
        with open(html, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        original = content

        # Fix title — only if locale label not already there
        def replace_title(m):
            if f"({label})" in m.group(2):
                return m.group(0)
            return f"{m.group(1)}{m.group(2)} ({label}){m.group(3)}"

        def replace_h1(m):
            if f"({label})" in m.group(2):
                return m.group(0)
            return f"{m.group(1)}{m.group(2)} ({label}){m.group(3)}"

        content = title_pat.sub(replace_title, content)
        content = h1_pat.sub(replace_h1, content)

        if content != original:
            with open(html, "w", encoding="utf-8", newline="\r\n") as f:
                f.write(content)
            fixed += 1

print(f"Done. Fixed {fixed} locale from-X-to-Y pages.")
