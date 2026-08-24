import os
ROOT = r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1'
for post in ['postpartum-weight-loss-safe-guide', 'water-fasting-weight-loss']:
    for locale in ['', 'uk', 'ca', 'au', 'nz', 'zh', 'ru']:
        p = os.path.join(ROOT, locale, 'blog', post, 'index.html')
        print(f"{'(us)' if locale=='' else locale:5s} /blog/{post}/ exists={os.path.isfile(p)}")
    print()
# also check hreflang_block output for these paths via importable function
import sys
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from rebuild_sitemaps import hreflang_block
for path in ['/blog/postpartum-weight-loss-safe-guide/', '/blog/water-fasting-weight-loss/']:
    hb = hreflang_block(path)
    print(path, '-> lines:', len(hb.splitlines()) if hb else 0)
    if hb:
        print(hb)
