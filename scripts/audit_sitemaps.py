import re, os

pub = r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1\public'
for fn in sorted(os.listdir(pub)):
    if fn.startswith('sitemap') and fn.endswith('.xml'):
        with open(os.path.join(pub, fn), encoding='utf-8') as f:
            c = f.read()
        urls = len(re.findall(r'<loc>', c))
        has_lastmod = '<lastmod>' in c
        has_changefreq = '<changefreq>' in c
        has_priority = '<priority>' in c
        is_index = '<sitemapindex' in c
        children = re.findall(r'<loc>(.*?)</loc>', c) if is_index else []
        print(f"{fn:35s} index={is_index!s:5s} urls={urls:6d} lastmod={has_lastmod} changefreq={has_changefreq} priority={has_priority}")
        if is_index:
            for ch in children:
                print('   ->', ch)
