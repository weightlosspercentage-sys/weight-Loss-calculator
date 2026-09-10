import os
import glob
import re
import shutil

ROOT_DIR = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

xml_files = [
    "sitemap-index.xml",
    "sitemap-main.xml",
    "sitemap-calculators.xml",
    "sitemap-categories.xml",
    "sitemap-compare.xml",
    "sitemap-international.xml",
    "sitemap-restaurants.xml",
    "sitemap.xml"
]

print("=== OPTIMIZING SITEMAPS FOR GOOGLEBOT & ADDING XSL STYLESHEET ===")

for xml_file in xml_files:
    file_path = os.path.join(ROOT_DIR, xml_file)
    if not os.path.exists(file_path):
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove deprecated priority and changefreq tags to reduce file size & optimize crawl speed
    content = re.sub(r'\s*<priority>[^<]*</priority>', '', content)
    content = re.sub(r'\s*<changefreq>[^<]*</changefreq>', '', content)

    # 2. Add xml-stylesheet instruction if missing
    if '<?xml-stylesheet' not in content:
        content = re.sub(
            r'<\?xml version="1\.0" encoding="UTF-8"\?>',
            '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
            content
        )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    size_kb = os.path.getsize(file_path) / 1024
    print(f"  [Optimized] {xml_file} -> {size_kb:.1f} KB (Added sitemap.xsl & stripped deprecated tags)")

# Sync sitemap.xsl and xml files to public/ and dist3/
for target in ["public", "dist3"]:
    target_path = os.path.join(ROOT_DIR, target)
    if os.path.exists(target_path):
        shutil.copy2(os.path.join(ROOT_DIR, "sitemap.xsl"), os.path.join(target_path, "sitemap.xsl"))
        for xml_file in xml_files:
            src = os.path.join(ROOT_DIR, xml_file)
            dst = os.path.join(target_path, xml_file)
            if os.path.exists(src):
                shutil.copy2(src, dst)
        print(f"  [Synced] All optimized files copied to {target}/")

print("\nOptimization completed!")
