import os
import re
import json

def analyze_html_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return None

    t_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    title = t_match.group(1).strip() if t_match else 'N/A'

    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    h1 = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip() if h1_match else 'N/A'

    c_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', content, re.IGNORECASE)
    canonical = c_match.group(1) if c_match else 'Missing'

    r_match = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    robots = r_match.group(1) if r_match else 'index, follow (default)'

    text_content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    text_content = re.sub(r'<style.*?</style>', '', text_content, flags=re.DOTALL | re.IGNORECASE)
    text_content = re.sub(r'<[^>]+>', ' ', text_content)
    words = len(text_content.split())

    links = re.findall(r'href=["\']([^"\']+)["\']', content)
    int_links = set([l for l in links if l.startswith('/') or 'weightlosspercentage.com' in l])

    schemas = set(re.findall(r'"@type"\s*:\s*"([^"]+)"', content))

    return {
        'filepath': filepath,
        'title': title,
        'h1': h1,
        'canonical': canonical,
        'robots': robots,
        'words': words,
        'int_links_count': len(int_links),
        'schemas': list(schemas)
    }

def main():
    root_dir = '.'
    exclude_dirs = {'node_modules', 'dist', 'dist2', 'dist3', '.astro', 'playwright-report', 'test-results', '.git', '.vscode', '.agents', '.claude'}

    html_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for f in filenames:
            if f.endswith('.html'):
                html_files.append(os.path.normpath(os.path.join(dirpath, f)))

    locale_prefixes = ('uk\\', 'ca\\', 'au\\', 'nz\\', 'zh\\', 'ru\\')
    us_files = [f for f in html_files if not f.startswith(locale_prefixes)]

    results = []

    for f in sorted(us_files):
        res = analyze_html_file(f)
        if res:
            results.append(res)

    with open('scripts/inventory_results.json', 'w', encoding='utf-8') as out:
        json.dump(results, out, indent=2)

    print(f"Done processing {len(results)} primary US HTML files!")

if __name__ == '__main__':
    main()
