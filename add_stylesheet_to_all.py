import os
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

for xml_file in xml_files:
    file_path = os.path.join(ROOT_DIR, xml_file)
    if not os.path.exists(file_path):
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if '<?xml-stylesheet' not in content:
        content = re.sub(
            r'<\?xml version=[\'"]1\.0[\'"] encoding=[\'"]utf-8[\'"]\?>',
            '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
            content,
            flags=re.IGNORECASE
        )
        if '<?xml-stylesheet' not in content:
            content = '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n' + content

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added stylesheet header to {xml_file}")

# Sync all files to public and dist3
for target in ["public", "dist3"]:
    target_path = os.path.join(ROOT_DIR, target)
    if os.path.exists(target_path):
        shutil.copy2(os.path.join(ROOT_DIR, "sitemap.xsl"), os.path.join(target_path, "sitemap.xsl"))
        for xml_file in xml_files:
            src = os.path.join(ROOT_DIR, xml_file)
            dst = os.path.join(target_path, xml_file)
            if os.path.exists(src):
                shutil.copy2(src, dst)
        print(f"Synced all files to {target}/")
