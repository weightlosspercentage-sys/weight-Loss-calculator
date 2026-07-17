"""
Fix External 4xx Errors — weightlosspercentage.com
Replaces all broken external image URLs and hyperlinks found in the Screaming Frog audit.
"""
import os

ROOT = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

# ─── 1. Broken Unsplash image URLs → working replacements ───────────────────
# All four broken photos are replaced with verified working Unsplash images
# matching the same subject matter.
IMAGE_REPLACEMENTS = {
    # "Weight Loss Percentage at 100–130 lbs" (appears in blog listing + blog/weight-loss-percentage-at-100-to-130-lbs/)
    "photo-1511690656952-34342bb7c2f1?auto=format&fit=crop&w=800&q=80":
        "photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=800&q=80",

    # "Weight Loss Plateau" (appears in blog listing + blog/weight-loss-plateau/)
    "photo-1531180614310-37033e64c090?auto=format&fit=crop&w=800&q=80":
        "photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",

    # "Water Fasting for Weight Loss" (appears in blog listing + blog/water-fasting-weight-loss/)
    "photo-1548839140-29a88022b7a8?auto=format&fit=crop&w=800&q=80":
        "photo-1515022781786-975609f4e18d?auto=format&fit=crop&w=800&q=80",

    # "Postpartum Weight Loss" (appears in blog listing + blog/postpartum-weight-loss-safe-guide/)
    "photo-1531983412531-1f49a365f698?auto=format&fit=crop&w=800&q=80":
        "photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
}

# ─── 2. Broken hyperlinks → working replacements ────────────────────────────
LINK_REPLACEMENTS = {
    # Oxford Academic (403 Forbidden — paywalled) → PubMed freely accessible abstract
    "https://academic.oup.com/milmed/article/169/7/533/4819777":
        "https://pubmed.ncbi.nlm.nih.gov/15307219/",

    # NZ Ministry of Health (403 — page moved) → correct current URL
    "https://www.health.govt.nz/your-health/healthy-living/food-activity-and-sleep/healthy-eating":
        "https://www.health.govt.nz/our-work/eating-and-activity-guidelines",

    # NIDDK DPP (404 — page moved, note: "programme" → "program" in new URL)
    "https://www.niddk.nih.gov/about-niddk/research-areas/diabetes/diabetes-prevention-programme-dpp":
        "https://www.niddk.nih.gov/about-niddk/research-areas/diabetes/diabetes-prevention-program-dpp",
}

# ─── Target blog directories (no need to scan weight-loss from-X-to-Y dirs) ──
BLOG_DIRS = [
    "blog",
    "uk/blog",
    "ca/blog",
    "au/blog",
    "nz/blog",
    "ru/blog",
    "zh/blog",
]

# Also include nz/calculators/weight-loss (for the health.govt.nz link)
EXTRA_DIRS = [
    "nz/calculators/weight-loss",
]

def collect_html_files(dirs):
    files = []
    for rel_dir in dirs:
        d = os.path.join(ROOT, rel_dir.replace("/", os.sep))
        if not os.path.isdir(d):
            continue
        # Only scan one level deep for blog posts (index.html in each subdir)
        idx = os.path.join(d, "index.html")
        if os.path.isfile(idx):
            files.append(idx)
        for entry in os.listdir(d):
            sub_idx = os.path.join(d, entry, "index.html")
            if os.path.isfile(sub_idx):
                files.append(sub_idx)
    return files

def fix_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    original = content

    # Apply image replacements
    for old_photo, new_photo in IMAGE_REPLACEMENTS.items():
        content = content.replace(old_photo, new_photo)

    # Apply link replacements
    for old_url, new_url in LINK_REPLACEMENTS.items():
        content = content.replace(old_url, new_url)

    if content != original:
        with open(path, "w", encoding="utf-8", newline="\r\n") as f:
            f.write(content)
        return True
    return False

print("Fixing external 4xx errors...")
all_dirs = BLOG_DIRS + EXTRA_DIRS
files = collect_html_files(all_dirs)

fixed = 0
for path in files:
    if fix_file(path):
        fixed += 1
        print(f"  FIXED: {os.path.relpath(path, ROOT)}")

print(f"\nDone. Fixed {fixed} files.")
print("\nReplacements applied:")
print("\nImage URLs:")
for old, new in IMAGE_REPLACEMENTS.items():
    print(f"  {old[:50]}...")
    print(f"  → {new[:50]}...")
print("\nHyperlinks:")
for old, new in LINK_REPLACEMENTS.items():
    print(f"  {old}")
    print(f"  → {new}")
