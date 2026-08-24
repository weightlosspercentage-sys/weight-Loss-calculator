import os, re, collections

ROOT = r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1'

print("=== files remaining ===")
for loc in [os.path.join(ROOT, 'public'), ROOT]:
    print(loc)
    for f in sorted(os.listdir(loc)):
        if f.startswith('sitemap') and f.endswith('.xml'):
            with open(os.path.join(loc, f), encoding='utf-8') as fh:
                c = fh.read()
            n_urls = len(re.findall(r'<url>', c))
            n_hl = len(re.findall(r'<xhtml:link', c))
            n_loc = len(re.findall(r'<loc>', c))
            print(f"  {f:30s} urls={n_urls:5d} hreflang_links={n_hl:6d} loc={n_loc}")

print("\n=== duplicate hreflang check (same href twice in one file) ===")
pub = os.path.join(ROOT, 'public')
for f in sorted(os.listdir(pub)):
    if f.startswith('sitemap-') and f.endswith('.xml'):
        with open(os.path.join(pub, f), encoding='utf-8') as fh:
            c = fh.read()
        hrefs = re.findall(r'<xhtml:link[^>]*href="([^"]+)"', c)
        dups = [h for h, n in collections.Counter(hrefs).items() if n > 1]
        print(f"  {f}: {len(hrefs)} links, {len(dups)} duplicate href(s)")
        for d in dups[:5]:
            print('     DUP:', d)

print("\n=== retired files archived? ===")
arch = os.path.join(ROOT, 'scripts', 'archive', 'sitemaps-retired')
print(os.listdir(arch) if os.path.isdir(arch) else 'NOT ARCHIVED')

print("\n=== index content ===")
with open(os.path.join(pub, 'sitemap.xml'), encoding='utf-8') as fh:
    print(fh.read())

print("\n=== robots.txt sitemap lines ===")
with open(os.path.join(pub, 'robots.txt'), encoding='utf-8') as fh:
    for line in fh.read().splitlines()[-3:]:
        print(' ', line)
