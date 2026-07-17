"""
Fix 1: Add trailing slashes to internal links in blog posts.
Only scans blog directories - much faster than recursive root scan.
"""
import os, re

ROOT = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

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

def fix_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    original = content
    for p in REDIRECT_PATHS:
        for q in ['"', "'"]:
            old = f"href={q}{p}{q}"
            new = f"href={q}{p}/{q}"
            content = content.replace(old, new)
        # Also fix href inside JSON-LD / script strings: href=\'path\'
        content = content.replace(f"href=\\'{p}\\'", f"href=\\'{p}/\\'")
        # Fix href inside JSON strings: "href": "/path"
        content = content.replace(f'"href": "{p}"', f'"href": "{p}/"')
    if content != original:
        with open(path, "w", encoding="utf-8", newline="\r\n") as f:
            f.write(content)
        return True
    return False

# Target directories: blog posts and locale blog posts
BLOG_DIRS = [
    os.path.join(ROOT, "blog"),
    os.path.join(ROOT, "uk", "blog"),
    os.path.join(ROOT, "ca", "blog"),
    os.path.join(ROOT, "au", "blog"),
    os.path.join(ROOT, "nz", "blog"),
    os.path.join(ROOT, "ru", "blog"),
    os.path.join(ROOT, "zh", "blog"),
]

fixed = 0
for blog_dir in BLOG_DIRS:
    if not os.path.isdir(blog_dir):
        continue
    for entry in os.listdir(blog_dir):
        html = os.path.join(blog_dir, entry, "index.html")
        if os.path.isfile(html):
            if fix_file(html):
                fixed += 1
                print(f"  FIXED: {os.path.relpath(html, ROOT)}")
    # Also check blog/index.html
    idx = os.path.join(blog_dir, "index.html")
    if os.path.isfile(idx):
        if fix_file(idx):
            fixed += 1
            print(f"  FIXED: {os.path.relpath(idx, ROOT)}")

print(f"\nDone. Fixed {fixed} blog files.")
