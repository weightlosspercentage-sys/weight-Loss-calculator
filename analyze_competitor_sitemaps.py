import csv
import urllib.parse
import json

CSV_PATH = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1\table-export-68-rows (1).csv"

competitors = []

with open(CSV_PATH, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader, None)
    for row in reader:
        if not row or len(row) < 7:
            continue
        pos = row[0].strip()
        url = row[1].strip()
        as_score = row[2].strip()
        ref_domains = row[3].strip()
        backlinks = row[4].strip()
        traffic = row[5].strip()
        keywords = row[6].strip()

        if not url or pos == "AI Overview":
            continue

        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc

        sitemap_candidate = f"https://{domain}/sitemap.xml" if domain else ""

        try:
            pos_int = int(pos)
        except ValueError:
            pos_int = 999

        competitors.append({
            "position": pos_int,
            "url": url,
            "domain": domain,
            "sitemap": sitemap_candidate,
            "page_as": as_score,
            "ref_domains": ref_domains,
            "backlinks": backlinks,
            "traffic": traffic,
            "keywords": keywords
        })

competitors.sort(key=lambda x: x["position"])

print(f"Loaded {len(competitors)} competitor URLs from SERP export CSV.\n")

print("=== TOP 15 COMPETITORS & THEIR SITEMAP DISCOVERY CANDIDATES ===")
top_15 = competitors[:15]
for c in top_15:
    print(f"Pos #{c['position']:<2} | {c['domain']:<25} | Traffic: {c['traffic']:<6} | AS: {c['page_as']:<3} | Sitemap: {c['sitemap']}")

with open("competitor_analysis_summary.json", "w") as f:
    json.dump(competitors, f, indent=2)

print("\nCompetitor summary saved to competitor_analysis_summary.json")
