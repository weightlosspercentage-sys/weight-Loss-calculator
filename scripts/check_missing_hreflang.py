import re
pub = r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1\public'
for f in ['sitemap-us.xml', 'sitemap-au.xml', 'sitemap-uk.xml', 'sitemap-ca.xml', 'sitemap-nz.xml']:
    with open(f'{pub}\\{f}', encoding='utf-8') as fh:
        c = fh.read()
    blocks = re.findall(r'<url>[\s\S]*?</url>', c)
    missing = []
    for b in blocks:
        if '<xhtml:link' not in b:
            loc = re.search(r'<loc>(.*?)</loc>', b, re.S).group(1)
            missing.append(loc)
    print(f"{f}: {len(blocks)} urls, {len(missing)} without hreflang")
    for m in missing[:10]:
        print('   MISSING:', m)
