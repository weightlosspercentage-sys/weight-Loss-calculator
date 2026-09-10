import os
import glob
import re
from datetime import datetime
import xml.etree.ElementTree as ET

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

def get_disk_lastmod(url_path):
    rel_path = url_path.lstrip('/')
    if not rel_path:
        target = os.path.join(ROOT_DIR, "index.html")
    elif rel_path.endswith('/'):
        target = os.path.join(ROOT_DIR, rel_path, "index.html")
    else:
        target = os.path.join(ROOT_DIR, rel_path)

    if not os.path.exists(target):
        target = os.path.join(ROOT_DIR, rel_path.rstrip('/') + '.html')

    if os.path.exists(target):
        mtime = os.path.getmtime(target)
        return datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    
    return datetime.now().strftime('%Y-%m-%d')

def update_dynamic_lastmods():
    print("=== UPDATING DYNAMIC ACCURATE <lastmod> TIMESTAMPS ===")
    
    for sm_name in xml_files:
        file_path = os.path.join(ROOT_DIR, sm_name)
        if not os.path.exists(file_path):
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse loc elements and update their specific lastmod based on disk mtime
        def replace_url_block(match):
            block = match.group(0)
            loc_match = re.search(r'<loc>(https://www.weightlosspercentage.com[^<]*)</loc>', block)
            if loc_match:
                full_url = loc_match.group(1)
                path = full_url.replace("https://www.weightlosspercentage.com", "")
                disk_date = get_disk_lastmod(path)
                if '<lastmod>' in block:
                    block = re.sub(r'<lastmod>[^<]*</lastmod>', f'<lastmod>{disk_date}</lastmod>', block)
                else:
                    block = block.replace('</loc>', f'</loc>\n    <lastmod>{disk_date}</lastmod>')
            return block

        new_content = re.sub(r'<url>.*?</url>', replace_url_block, content, flags=re.DOTALL)
        
        # Ensure stylesheet header is present
        if '<?xml-stylesheet' not in new_content:
            new_content = re.sub(
                r'<\?xml version="1\.0" encoding="UTF-8"\?>',
                '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
                new_content
            )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  [+] Dynamic <lastmod> updated for {sm_name}")

if __name__ == '__main__':
    update_dynamic_lastmods()
