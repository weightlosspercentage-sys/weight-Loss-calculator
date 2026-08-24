import os, re

ROOT = r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1'

# 1. Did retired sitemaps contain ONLY noindex-style URLs?
arch = os.path.join(ROOT, 'scripts', 'archive', 'sitemaps-retired')
print("=== archived sitemaps contents ===")
for f in sorted(os.listdir(arch)) if os.path.isdir(arch) else []:
    with open(os.path.join(arch, f), encoding='utf-8') as fh:
        locs = re.findall(r'<loc>(.*?)</loc>', fh.read())
    sample_noindex = 0
    sample_other = []
    for url in locs:
        path = url.replace('https://www.weightlosspercentage.com', '')
        ni = (path.startswith('/zh') or path.startswith('/ru') or
              '/calculators/bmi/height-weight/' in path or
              re.match(r'/calculators/weight-loss/from-\d+-to-\d+/', path))
        if ni:
            sample_noindex += 1
        else:
            sample_other.append(path)
    print(f"  {f}: {len(locs)} URLs, noindex-style={sample_noindex}, other={len(sample_other)}")
    for o in sample_other[:5]:
        print('     NON-NOINDEX URL:', o)

# 2. Live HTML noindex spot-check for a bmi height-weight page
bmi_dir = os.path.join(ROOT, 'dist3', 'calculators', 'bmi', 'height-weight')
samples = os.listdir(bmi_dir)[:3]
print("\n=== noindex status of live bmi height-weight samples (dist3) ===")
for d in samples:
    idx = os.path.join(bmi_dir, d)
    subs = [s for s in os.listdir(idx) if os.path.isdir(os.path.join(idx, s))]
    if subs:
        p = os.path.join(idx, subs[0], 'index.html')
        if os.path.isfile(p):
            with open(p, encoding='utf-8') as fh:
                c = fh.read()
            print(f"  {d}/{subs[0]}/: noindex={ 'noindex' in c }")

# from-to
p = os.path.join(ROOT, 'dist3', 'calculators', 'weight-loss', 'from-350-to-300', 'index.html')
with open(p, encoding='utf-8') as fh:
    print(f"\n  from-350-to-300: noindex={ 'noindex' in fh.read() }")

# zh
p = os.path.join(ROOT, 'dist3', 'zh', 'index.html')
with open(p, encoding='utf-8') as fh:
    print(f"  zh home: noindex={ 'noindex' in fh.read() }")
