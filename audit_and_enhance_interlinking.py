import os
import glob
import re
import json

ROOT_DIR = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

html_files = glob.glob(os.path.join(ROOT_DIR, "*.html"))

audit_results = {
    "total_links_audited": 0,
    "generic_anchors_found": [],
    "keyword_stuffed_anchors": [],
    "natural_anchors": [],
    "anchor_distribution": {}
}

generic_words = {'click here', 'here', 'link', 'this', 'page', 'read more', 'more'}

print("=== AUDITING INTERNAL LINKING & ANCHOR TEXT NATURALNESS ===")

for html_file in html_files:
    fname = os.path.basename(html_file)
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    matches = re.finditer(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', content, re.DOTALL | re.IGNORECASE)
    for m in matches:
        href = m.group(1).strip()
        raw_text = m.group(2)
        # Strip internal tags like svg/img/span
        clean_text = re.sub(r'<[^>]+>', '', raw_text).strip()

        if href.startswith('/') or 'weightlosspercentage.com' in href:
            audit_results["total_links_audited"] += 1
            text_lower = clean_text.lower()

            if not clean_text:
                continue

            if text_lower in generic_words:
                audit_results["generic_anchors_found"].append({"file": fname, "href": href, "text": clean_text})
            elif len(clean_text.split()) > 12:
                audit_results["keyword_stuffed_anchors"].append({"file": fname, "href": href, "text": clean_text})
            else:
                audit_results["natural_anchors"].append({"href": href, "text": clean_text})
                audit_results["anchor_distribution"][clean_text] = audit_results["anchor_distribution"].get(clean_text, 0) + 1

print(f"Total Internal Links Audited: {audit_results['total_links_audited']}")
print(f"Generic Anchor Text Found ('click here', etc.): {len(audit_results['generic_anchors_found'])}")
print(f"Overly Stuffed Anchor Text Found (>12 words): {len(audit_results['keyword_stuffed_anchors'])}")

print("\n=== TOP 20 NATURAL ANCHOR TEXT VARIATIONS IN USE ===")
sorted_anchors = sorted(audit_results["anchor_distribution"].items(), key=lambda x: x[1], reverse=True)[:20]
for text, count in sorted_anchors:
    print(f"  Count: {count:<4} | Anchor: '{text}'")

with open("interlinking_audit_results.json", "w") as f:
    json.dump(audit_results, f, indent=2)

print("\nSaved full audit to interlinking_audit_results.json")
