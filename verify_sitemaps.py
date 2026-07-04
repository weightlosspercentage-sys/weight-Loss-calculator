import os
import xml.etree.ElementTree as ET

domain = 'https://www.weightlosspercentage.com'
sitemaps = [
    'sitemap-us.xml',
    'sitemap-uk.xml',
    'sitemap-ca.xml',
    'sitemap-au.xml',
    'sitemap-nz.xml',
    'sitemap-zh.xml',
    'sitemap-ru.xml',
    'sitemap-from-to-weight.xml'
]

def check_sitemap(filename):
    if not os.path.exists(filename):
        print(f"[-] Sitemap file {filename} does not exist!")
        return 0, 0
        
    try:
        tree = ET.parse(filename)
        root = tree.getroot()
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('s:url/s:loc', ns)]
        
        missing = []
        for url in urls:
            # Convert URL to local path
            if not url.startswith(domain):
                print(f"[-] URL {url} in {filename} does not start with domain {domain}")
                continue
                
            path_part = url[len(domain):]
            if path_part.startswith('/'):
                path_part = path_part[1:]
                
            # If path_part is empty, it refers to index.html in the root
            if not path_part:
                local_path = 'index.html'
            else:
                # If path_part ends with '/', it's a directory containing index.html
                if path_part.endswith('/'):
                    local_path = os.path.join(path_part, 'index.html')
                else:
                    # If it's a file
                    local_path = path_part
                    
            local_path = os.path.normpath(local_path)
            
            if not os.path.exists(local_path):
                missing.append((url, local_path))
                
        if missing:
            print(f"[-] Sitemap {filename} has {len(missing)} / {len(urls)} missing files:")
            for u, p in missing[:10]:
                print(f"    - URL: {u} -> Expected file: {p}")
            if len(missing) > 10:
                print(f"    - ... and {len(missing) - 10} more.")
            return len(urls), len(missing)
        else:
            print(f"[+] Sitemap {filename} has all {len(urls)} files existing on disk.")
            return len(urls), 0
    except Exception as e:
        print(f"[-] Error parsing sitemap {filename}: {e}")
        return 0, 0

def main():
    total_urls = 0
    total_missing = 0
    for sm in sitemaps:
        u, m = check_sitemap(sm)
        total_urls += u
        total_missing += m
    print(f"\nSummary: Checked {total_urls} URLs, {total_missing} missing on disk.")

if __name__ == '__main__':
    main()
