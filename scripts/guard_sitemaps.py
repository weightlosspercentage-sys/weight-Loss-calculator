import os
import glob
import re
import xml.etree.ElementTree as ET
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))

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

forbidden_patterns = ['/agent/', '/.agents/', '/skills/', 'spa-fallback-dummy', 'Google-SEO-Report', '/us/']

def run_sitemap_guard():
    print("=== RUNNING SITEMAP CI/CD SANITATION GUARD ===")
    violations = 0

    for xml_file in xml_files:
        path = os.path.join(ROOT_DIR, xml_file)
        if not os.path.exists(path):
            continue

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        file_violations = []
        for pattern in forbidden_patterns:
            if pattern in content:
                file_violations.append(pattern)

        if file_violations:
            print(f"  [VIOLATION] {xml_file} contains forbidden patterns: {file_violations}")
            violations += 1
        else:
            print(f"  [CLEAN] {xml_file} passed all sanitation rules")

    if violations > 0:
        raise SystemExit(f"Sitemap guard failed with {violations} violations!")
    else:
        print("\nAll sitemaps passed sanitation guard!")
        # Sync to public/ and dist3/
        for target in ["public", "dist3"]:
            target_path = os.path.join(ROOT_DIR, target)
            if os.path.exists(target_path):
                shutil.copy2(os.path.join(ROOT_DIR, "sitemap.xsl"), os.path.join(target_path, "sitemap.xsl"))
                for xml_file in xml_files:
                    src = os.path.join(ROOT_DIR, xml_file)
                    dst = os.path.join(target_path, xml_file)
                    if os.path.exists(src):
                        shutil.copy2(src, dst)
                print(f"  [Synced] Sanitized sitemaps copied to {target}/")

if __name__ == '__main__':
    run_sitemap_guard()
