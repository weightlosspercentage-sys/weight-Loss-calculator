import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import glob
import os
import json
from collections import Counter

BASE_URL = "http://localhost:8080"
ROOT_DIR = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

sitemap_files = [
    "sitemap-index.xml",
    "sitemap-main.xml",
    "sitemap-calculators.xml",
    "sitemap-categories.xml",
    "sitemap-compare.xml",
    "sitemap-international.xml",
    "sitemap-restaurants.xml",
    "sitemap.xml"
]

report = {
    "total_urls_scanned": 0,
    "unique_urls": 0,
    "duplicate_urls": [],
    "missing_files_on_disk": [],
    "broken_http_urls": [],
    "invalid_path_patterns": [],
    "file_breakdown": {}
}

all_seen_urls = set()
duplicates = set()

# Pattern checks for things that SHOULD NOT be in sitemaps:
# - static assets (.js, .css, .png, .jpg, .json, .txt, .xml, .cjs, .mjs, .py, .sh)
# - internal directories (/agent/, /skills/, /node_modules/, /.git/, /.vscode/)
# - query parameters
# - draft/test files
invalid_extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.json', '.txt', '.xml', '.cjs', '.mjs', '.py', '.sh', '.csv', '.log']
invalid_folders = ['/agent/', '/.agents/', '/skills/', '/node_modules/', '/.git/', '/.vscode/', '/scratch/', '/dist/']

print("=== DEEP SITEMAP AUDIT & TESTING START ===")

for sm_file in sitemap_files:
    file_path = os.path.join(ROOT_DIR, sm_file)
    if not os.path.exists(file_path):
        print(f"Skipping {sm_file} (not found)")
        continue

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        root_tag = root.tag.split('}')[-1] if '}' in root.tag else root.tag

        urls_in_file = []
        file_issues = []

        if root_tag == "sitemapindex":
            for child in root:
                tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                if tag == "sitemap":
                    for sub in child:
                        sub_tag = sub.tag.split('}')[-1] if '}' in sub.tag else sub.tag
                        if sub_tag == "loc" and sub.text:
                            urls_in_file.append(sub.text.strip())
        elif root_tag == "urlset":
            for child in root:
                tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                if tag == "url":
                    for sub in child:
                        sub_tag = sub.tag.split('}')[-1] if '}' in sub.tag else sub.tag
                        if sub_tag == "loc" and sub.text:
                            urls_in_file.append(sub.text.strip())

        print(f"\nProcessing {sm_file}: {len(urls_in_file)} URLs found")

        for u in urls_in_file:
            report["total_urls_scanned"] += 1
            if u in all_seen_urls and sm_file != "sitemap.xml":
                duplicates.add(u)
            else:
                all_seen_urls.add(u)

            parsed = urllib.parse.urlparse(u)
            path = parsed.path

            # Check invalid path patterns
            for ext in invalid_extensions:
                if path.endswith(ext):
                    report["invalid_path_patterns"].append({"file": sm_file, "url": u, "reason": f"Asset extension {ext}"})
            for folder in invalid_folders:
                if folder in path:
                    report["invalid_path_patterns"].append({"file": sm_file, "url": u, "reason": f"Internal directory {folder}"})

            # Local disk path check
            # e.g., /about/ -> ROOT_DIR/about/index.html or ROOT_DIR/about.html
            rel_path = path.lstrip('/')
            if rel_path == '' or rel_path == '/':
                disk_target = os.path.join(ROOT_DIR, "index.html")
            elif rel_path.endswith('/'):
                disk_target = os.path.join(ROOT_DIR, rel_path, "index.html")
            else:
                disk_target = os.path.join(ROOT_DIR, rel_path)

            # Also check html fallback if not found
            exists_on_disk = os.path.exists(disk_target) or os.path.exists(os.path.join(ROOT_DIR, rel_path.rstrip('/') + '.html')) or os.path.exists(os.path.join(ROOT_DIR, rel_path))
            
            if not exists_on_disk:
                report["missing_files_on_disk"].append({"file": sm_file, "url": u, "expected_disk": disk_target})

        report["file_breakdown"][sm_file] = {
            "count": len(urls_in_file),
            "root_tag": root_tag
        }

    except Exception as e:
        print(f"Error parsing {sm_file}: {e}")

report["unique_urls"] = len(all_seen_urls)
report["duplicate_urls"] = list(duplicates)

print("\n=== SUMMARY RESULTS ===")
print(f"Total URLs Scanned: {report['total_urls_scanned']}")
print(f"Unique URLs: {report['unique_urls']}")
print(f"Invalid Path Patterns Found: {len(report['invalid_path_patterns'])}")
print(f"Missing Files On Disk Found: {len(report['missing_files_on_disk'])}")

with open(os.path.join(ROOT_DIR, "deep_sitemap_test_results.json"), "w") as f:
    json.dump(report, f, indent=2)

print("\nSaved full detailed test results to deep_sitemap_test_results.json")
