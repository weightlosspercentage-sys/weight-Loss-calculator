import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import re
import os
import json
from datetime import datetime

BASE_URL = "http://localhost:8080"

report = {
    "timestamp": datetime.now().isoformat(),
    "robots_txt_sitemaps": [],
    "sitemap_files": {},
    "total_unique_urls": 0,
    "issues": [],
    "quality_signals": []
}

# 1. Fetch robots.txt
print("--- 1. Checking robots.txt ---")
try:
    req = urllib.request.urlopen(f"{BASE_URL}/robots.txt")
    robots_content = req.read().decode('utf-8')
    sitemaps_declared = re.findall(r'(?i)^\s*Sitemap:\s*(.+)$', robots_content, re.MULTILINE)
    report["robots_txt_sitemaps"] = [s.strip() for s in sitemaps_declared]
    print(f"Found {len(sitemaps_declared)} Sitemap declarations in robots.txt:")
    for s in sitemaps_declared:
        print(f"  - {s.strip()}")
except Exception as e:
    report["issues"].append({"severity": "High", "issue": f"Could not fetch robots.txt: {e}"})

sitemap_files_to_check = [
    "sitemap-index.xml",
    "sitemap.xml",
    "sitemap-main.xml",
    "sitemap-calculators.xml",
    "sitemap-categories.xml",
    "sitemap-compare.xml",
    "sitemap-international.xml",
    "sitemap-restaurants.xml"
]

all_urls = set()
url_sample_list = []

def get_child_text(elem, child_tag_name):
    for child in elem:
        tag_local = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        if tag_local == child_tag_name:
            return child.text.strip() if child.text else ""
    return None

def has_child_tag(elem, child_tag_name):
    for child in elem:
        tag_local = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        if tag_local == child_tag_name:
            return True
    return False

for sm_file in sitemap_files_to_check:
    full_url = f"{BASE_URL}/{sm_file}"
    print(f"\n--- Checking {sm_file} ---")
    try:
        req = urllib.request.urlopen(full_url)
        content = req.read()
        size_mb = len(content) / (1024 * 1024)
        
        root = ET.fromstring(content)
        root_tag = root.tag.split('}')[-1] if '}' in root.tag else root.tag
        
        file_info = {
            "type": root_tag,
            "size_mb": round(size_mb, 4),
            "url_count": 0,
            "has_priority": False,
            "has_changefreq": False,
            "http_urls_count": 0,
            "https_urls_count": 0,
            "valid_lastmod_count": 0,
            "invalid_lastmod_count": 0,
            "unique_lastmods_count": 0,
            "lastmods_sample": []
        }

        if root_tag == "sitemapindex":
            sitemaps = [c for c in root if (c.tag.split('}')[-1] if '}' in c.tag else c.tag) == "sitemap"]
            file_info["url_count"] = len(sitemaps)
            print(f"  [Sitemap Index] {len(sitemaps)} child sitemaps.")
            lastmods = []
            for sm in sitemaps:
                loc_text = get_child_text(sm, "loc")
                lastmod_text = get_child_text(sm, "lastmod")
                if lastmod_text:
                    lastmods.append(lastmod_text)
            file_info["unique_lastmods_count"] = len(set(lastmods))
            file_info["lastmods_sample"] = list(set(lastmods))[:5]
            
        elif root_tag == "urlset":
            urls = [c for c in root if (c.tag.split('}')[-1] if '}' in c.tag else c.tag) == "url"]
            file_info["url_count"] = len(urls)
            print(f"  [URL Set] {len(urls)} URLs. Size: {size_mb:.2f} MB.")

            if len(urls) > 50000:
                report["issues"].append({"severity": "Critical", "issue": f"{sm_file} exceeds 50,000 URLs limit ({len(urls)} URLs)"})
            if size_mb > 50:
                report["issues"].append({"severity": "Critical", "issue": f"{sm_file} exceeds 50MB limit ({size_mb:.2f} MB)"})

            lastmods = []
            for u in urls:
                loc_text = get_child_text(u, "loc")
                lastmod_text = get_child_text(u, "lastmod")

                if has_child_tag(u, "priority"):
                    file_info["has_priority"] = True
                if has_child_tag(u, "changefreq"):
                    file_info["has_changefreq"] = True

                if loc_text:
                    all_urls.add(loc_text)
                    if len(url_sample_list) < 50:
                        url_sample_list.append(loc_text)
                    if loc_text.startswith("https://"):
                        file_info["https_urls_count"] += 1
                    elif loc_text.startswith("http://") and not loc_text.startswith("http://localhost"):
                        file_info["http_urls_count"] += 1

                if lastmod_text:
                    lastmods.append(lastmod_text)
                    if re.match(r'^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?$', lastmod_text):
                        file_info["valid_lastmod_count"] += 1
                    else:
                        file_info["invalid_lastmod_count"] += 1

            file_info["unique_lastmods_count"] = len(set(lastmods))
            file_info["lastmods_sample"] = list(set(lastmods))[:5]

            if file_info["has_priority"] or file_info["has_changefreq"]:
                report["issues"].append({"severity": "Info", "issue": f"{sm_file} uses deprecated/ignored tags (<priority> or <changefreq>)"})

            if file_info["http_urls_count"] > 0:
                report["issues"].append({"severity": "Medium", "issue": f"{sm_file} contains {file_info['http_urls_count']} HTTP non-secure URLs"})

            if len(set(lastmods)) == 1 and file_info["url_count"] > 10:
                report["issues"].append({"severity": "Low", "issue": f"{sm_file} has uniform <lastmod> across all {file_info['url_count']} URLs ({list(set(lastmods))[0]})"})

        report["sitemap_files"][sm_file] = file_info

    except Exception as e:
        report["issues"].append({"severity": "High", "issue": f"Error parsing {sm_file}: {e}"})

report["total_unique_urls"] = len(all_urls)
print(f"\nTotal unique URLs across all sitemaps: {len(all_urls)}")

# 3. Check HTTP status of sample URLs on localhost
print("\n--- Spot checking HTTP status codes of 20 sample URLs ---")
status_counts = {}
sample_subset = url_sample_list[:20]
for u in sample_subset:
    try:
        parsed = urllib.parse.urlparse(u)
        local_path = parsed.path if parsed.path else "/"
        test_url = f"{BASE_URL}{local_path}"
        req = urllib.request.Request(test_url, method='HEAD')
        res = urllib.request.urlopen(req)
        st = res.status
        status_counts[st] = status_counts.get(st, 0) + 1
    except urllib.error.HTTPError as e:
        status_counts[e.code] = status_counts.get(e.code, 0) + 1
    except Exception as e:
        status_counts[str(type(e).__name__)] = status_counts.get(str(type(e).__name__), 0) + 1

report["sample_status_counts"] = status_counts

with open("audit_sitemap_results.json", "w") as f:
    json.dump(report, f, indent=2)

print("Audit completed successfully. Results written to audit_sitemap_results.json")
