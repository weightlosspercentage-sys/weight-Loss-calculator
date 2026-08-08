import re, os

for d in ['dist', 'dist2', 'dist3']:
    if not os.path.isdir(d):
        print(d, 'MISSING')
        continue
    idx = os.path.join(d, 'index.html')
    if os.path.exists(idx):
        txt = open(idx, encoding='utf-8', errors='ignore').read()
        m = re.findall(r'<link[^>]*rel=["\']canonical["\'][^>]*>', txt)
        print(d, 'index.html canonical:', m[:1])
        print('   has og:url:', 'og:url' in txt)
    else:
        print(d, 'no index.html at root')
    # check last modified of index.html
    if os.path.exists(idx):
        print('   modified:', os.path.getmtime(idx))
