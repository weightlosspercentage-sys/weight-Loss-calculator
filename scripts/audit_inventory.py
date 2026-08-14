import os
import glob
import re

def analyze_html_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return None

    # Title
    t_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    title = t_match.group(1).strip() if t_match else 'N/A'

    # H1
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    h1 = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip() if h1_match else 'N/A'

    # Canonical
    c_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', content, re.IGNORECASE)
    canonical = c_match.group(1) if c_match else 'Missing'

    # Robots
    r_match = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    robots = r_match.group(1) if r_match else 'index, follow (default)'

    # Word count (text in body)
    text_content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    text_content = re.sub(r'<style.*?</style>', '', text_content, flags=re.DOTALL | re.IGNORECASE)
    text_content = re.sub(r'<[^>]+>', ' ', text_content)
    words = len(text_content.split())

    # Internal links
    links = re.findall(r'href=["\']([^"\']+)["\']', content)
    int_links = set([l for l in links if l.startswith('/') or 'weightlosspercentage.com' in l])

    # Schema types
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

    print(f"Total HTML files found: {len(html_files)}")
    print(f"US/Primary HTML files found: {len(us_files)}")

    print("\n--- BLOG ARTICLES ---")
    blog_files = [f for f in us_files if f.startswith('blog\\')]
    for bf in sorted(blog_files):
        res = analyze_html_file(bf)
        if res:
            url_path = '/' + bf.replace('\\', '/')
            print(f"URL: {url_path:<60} | Words: {res['words']:<5} | IntLinks: {res['int_links_count']:<3} | Schemas: {','.join(res['schemas']):<30} | H1: {res['h1'][:40]}")

    print("\n--- CORE CALCULATOR PAGES ---")
    calc_files = [f for f in us_files if f.startswith('calculators\\') and not ('bmi\\height-weight' in f or 'weight-loss\\from-' in f)]
    for cf in sorted(calc_files):
        res = analyze_html_file(cf)
        if res:
            url_path = '/' + cf.replace('\\', '/')
            print(f"URL: {url_path:<60} | Words: {res['words']:<5} | IntLinks: {res['int_links_count']:<3} | Schemas: {','.join(res['schemas']):<30} | H1: {res['h1'][:40]}")

    print("\n--- CORE MAIN / UTILITY PAGES ---")
    other_files = [f for f in us_files if not f.startswith('blog\\') and not f.startswith('calculators\\')]
    for of in sorted(other_files):
        res = analyze_html_file(of)
        if res:
            url_path = '/' + of.replace('\\', '/')
            print(f"URL: {url_path:<60} | Words: {res['words']:<5} | IntLinks: {res['int_links_count']:<3} | Schemas: {','.join(res['schemas']):<30} | H1: {res['h1'][:40]}")

if __name__ == '__main__':
    main()
