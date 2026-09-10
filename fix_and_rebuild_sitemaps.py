import xml.etree.ElementTree as ET
import os
import shutil

ROOT_DIR = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

# 1. Clean sitemap-main.xml
sitemap_main_path = os.path.join(ROOT_DIR, "sitemap-main.xml")
tree = ET.parse(sitemap_main_path)
root = tree.getroot()

# Register default namespace
ET.register_namespace('', "http://www.sitemaps.org/schemas/sitemap/0.9")

urls_to_keep = []

for url_elem in list(root):
    loc_elem = None
    for child in url_elem:
        if child.tag.endswith('loc'):
            loc_elem = child
            break
    
    if loc_elem is not None and loc_elem.text:
        loc_text = loc_elem.text.strip()
        path = loc_text.replace("https://www.weightlosspercentage.com", "")
        
        # Exclude invalid /us/ 404 URLs, fallback dummies, audit reports, and partial snippets
        if path.startswith("/us/") or "spa-fallback-dummy" in path or "Google-SEO-Report" in path:
            print(f"[REMOVED 404 Path] {loc_text}")
            root.remove(url_elem)
        elif path in ["/backlink-campaign/dashboard/", "/bottom_content/", "/footer/", "/github_skill_finder/"]:
            print(f"[REMOVED Snippet Path] {loc_text}")
            root.remove(url_elem)
        else:
            urls_to_keep.append(loc_text)

tree.write(sitemap_main_path, encoding='utf-8', xml_declaration=True)
print(f"\n[+] sitemap-main.xml cleaned successfully! {len(urls_to_keep)} valid URLs remaining.")

# 2. Rebuild monolithic sitemap.xml from all clean sub-sitemaps
sub_sitemaps = [
    "sitemap-main.xml",
    "sitemap-calculators.xml",
    "sitemap-categories.xml",
    "sitemap-compare.xml",
    "sitemap-international.xml",
    "sitemap-restaurants.xml"
]

all_combined_url_elements = []
seen_urls = set()

for sm_file in sub_sitemaps:
    sm_path = os.path.join(ROOT_DIR, sm_file)
    sm_tree = ET.parse(sm_path)
    sm_root = sm_tree.getroot()
    
    for url_elem in sm_root:
        tag_local = url_elem.tag.split('}')[-1] if '}' in url_elem.tag else url_elem.tag
        if tag_local == "url":
            for child in url_elem:
                if child.tag.endswith('loc') and child.text:
                    u = child.text.strip()
                    if u not in seen_urls:
                        seen_urls.add(u)
                        all_combined_url_elements.append(url_elem)

# Build new sitemap.xml root
urlset_root = ET.Element("{http://www.sitemaps.org/schemas/sitemap/0.9}urlset")
for elem in all_combined_url_elements:
    urlset_root.append(elem)

new_sitemap_tree = ET.ElementTree(urlset_root)
sitemap_xml_path = os.path.join(ROOT_DIR, "sitemap.xml")
new_sitemap_tree.write(sitemap_xml_path, encoding='utf-8', xml_declaration=True)

print(f"[+] sitemap.xml rebuilt successfully with {len(seen_urls)} unique 200-OK URLs.")

# 3. Synchronize with public/ and dist3/
for target_dir in ["public", "dist3"]:
    for f in ["sitemap-main.xml", "sitemap.xml", "robots.txt"]:
        src = os.path.join(ROOT_DIR, f)
        dst = os.path.join(ROOT_DIR, target_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"  [Synced] {f} -> {target_dir}/{f}")

print("\nRebuild and sync complete!")
