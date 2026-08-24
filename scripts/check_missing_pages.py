import os
ROOT = r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1'
for post in ['postpartum-weight-loss-safe-guide', 'water-fasting-weight-loss']:
    for locale in ['', 'uk', 'ca', 'au', 'nz', 'zh', 'ru']:
        p = os.path.join(ROOT, locale, 'blog', post, 'index.html')
        exists = os.path.isfile(p)
        print(f"{'(us)' if locale=='' else locale:5s} /blog/{post}/ exists={exists}")
    print()

# Check bundle too
import subprocess
r = subprocess.run(['node', 'scripts/check_blog_slugs_bundle.cjs'], cwd=ROOT, capture_output=True, text=True)
print(r.stdout[-800:] if r.stdout else r.stderr[-200:])
