import os
import glob
from datetime import datetime
import xml.etree.ElementTree as ET

def update_sitemaps():
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
    sitemap_files = glob.glob(os.path.join(public_dir, 'sitemap*.xml'))
    
    current_date = datetime.now().strftime('%Y-%m-%d')
    print(f"Updating {len(sitemap_files)} sitemap files to lastmod date: {current_date}")
    
    for sitemap_file in sitemap_files:
        try:
            # We will do a simple string replacement because XML namespaces can make ElementTree modify the formatting/prefixes unexpectedly.
            with open(sitemap_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Replace all <lastmod>YYYY-MM-DD</lastmod> with the current date
            import re
            new_content = re.sub(r'<lastmod>\d{4}-\d{2}-\d{2}</lastmod>', f'<lastmod>{current_date}</lastmod>', content)
            
            with open(sitemap_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            print(f"  [+] Updated {os.path.basename(sitemap_file)}")
        except Exception as e:
            print(f"  [-] Error updating {sitemap_file}: {e}")

if __name__ == '__main__':
    update_sitemaps()
