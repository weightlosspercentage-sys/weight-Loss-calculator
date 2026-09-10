import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import glob
import os
import json

BASE_URL = "http://localhost:8080"
ROOT_DIR = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

sitemap_files = [
    "sitemap-main.xml",
    "sitemap-calculators.xml",
    "sitemap-categories.xml",
    "sitemap-compare.xml",
    "sitemap-international.xml",
    "sitemap-restaurants.xml"
]

report = {
    "total_urls_tested": 0,
    "http_200_count": 0,
    "http_404_count": 0,
    "bad_urls": [],
    "by_file": {}
}

print("=== STARTING FULL HTTP STATUS AUDIT OF ALL SITEMAP URLS ===")

for sm_file in sitemap_files:
    file_path = os.path.join(ROOT_DIR, sm_file)
    if not os.path.exists(file_path):
        continue

    tree = ET.parse(file_path)
    root = tree.getroot()
    
    file_bad = []
    file_good = 0

    for elem in root.iter():
        if elem.tag.endswith('loc') and elem.text:
            url = elem.text.strip()
            parsed = urllib.parse.urlparse(url)
            path = parsed.path
            
            test_target = f"{BASE_URL}{path}"
            report["total_urls_tested"] += 1
            
            try:
                # Use HEAD request for speed
                req = urllib.request.Request(test_target, method='HEAD')
                res = urllib.request.urlopen(req)
                if res.status == 200:
                    file_good += 1
                    report["http_200_count"] += 1
                else:
                    file_bad.append({"url": url, "path": path, "status": res.status})
                    report["http_404_count"] += 1
            except urllib.error.HTTPError as e:
                file_bad.append({"url": url, "path": path, "status": e.code})
                report["http_404_count"] += 1
            except Exception as e:
                file_bad.append({"url": url, "path": path, "status": str(type(e).__name__)})
                report["http_404_count"] += 1

    report["by_file"][sm_file] = {
        "good_200": file_good,
        "bad": len(file_bad),
        "bad_urls_list": file_bad
    }
    print(f"{sm_file:<30}: {file_good} HTTP 200 | {len(file_bad)} Bad/404")

with open("http_sitemap_test_results.json", "w") as f:
    json.dump(report, f, indent=2)

print("\nFull HTTP test complete! Results written to http_sitemap_test_results.json")
