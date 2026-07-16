"""
Fix 4: Add missing width/height to Unsplash <img> tags in blog posts.
"""
import os, re

ROOT = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

img_pat = re.compile(
    r'(<img\s)((?:(?!width=|height=)[^>])*?)(/>|>)',
    re.IGNORECASE | re.DOTALL
)

def fix_img(m):
    tag_start = m.group(1)
    attrs = m.group(2)
    tag_end = m.group(3)
    src_m = re.search(r'src="([^"]+)"', attrs)
    if not src_m:
        return m.group(0)
    src = src_m.group(1)
    if "unsplash.com" not in src:
        return m.group(0)
    if "width=" in attrs.lower() or "height=" in attrs.lower():
        return m.group(0)
    w_m = re.search(r'[?&]w=(\d+)', src)
    width = int(w_m.group(1)) if w_m else 800
    height = round(width * 2 / 3)
    return f'{tag_start}{attrs} width="{width}" height="{height}"{tag_end}'

BLOG_DIRS = ["blog", "uk/blog", "ca/blog", "au/blog", "nz/blog", "ru/blog", "zh/blog"]

fixed = 0
for rel_dir in BLOG_DIRS:
    d = os.path.join(ROOT, rel_dir)
    if not os.path.isdir(d):
        continue
    for entry in [""] + os.listdir(d):
        if entry == "":
            html = os.path.join(d, "index.html")
        else:
            html = os.path.join(d, entry, "index.html")
        if not os.path.isfile(html):
            continue
        with open(html, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        new_content = img_pat.sub(fix_img, content)
        if new_content != content:
            with open(html, "w", encoding="utf-8", newline="\r\n") as f:
                f.write(new_content)
            fixed += 1
            print(f"  FIXED: {os.path.relpath(html, ROOT)}")

print(f"\nDone. Fixed image attributes in {fixed} files.")
