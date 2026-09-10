import xml.etree.ElementTree as ET
import os
import glob
import json

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

print("=== FINAL EXHAUSTIVE SITEMAP STRUCTURE VERIFICATION ===")

results = []

for xml_file in xml_files:
    file_path = os.path.join(ROOT_DIR, xml_file)
    if not os.path.exists(file_path):
        results.append({"file": xml_file, "status": "Missing", "urls": 0, "size_kb": 0})
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    has_xml_header = content.startswith('<?xml version="1.0"')
    has_stylesheet = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>' in content
    has_priority = '<priority>' in content
    has_changefreq = '<changefreq>' in content

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        root_tag = root.tag.split('}')[-1] if '}' in root.tag else root.tag

        count = len(list(root))

        size_kb = os.path.getsize(file_path) / 1024

        status = "✅ Valid"
        if not has_xml_header or not has_stylesheet:
            status = "⚠️ Missing Header"
        if has_priority or has_changefreq:
            status = "⚠️ Deprecated Tags"

        results.append({
            "file": xml_file,
            "root_tag": root_tag,
            "status": status,
            "entries": count,
            "size_kb": round(size_kb, 1),
            "has_stylesheet": has_stylesheet,
            "clean_tags": not (has_priority or has_changefreq)
        })

    except Exception as e:
        results.append({"file": xml_file, "status": f"❌ Error: {e}", "entries": 0, "size_kb": 0})

print(json.dumps(results, indent=2))
