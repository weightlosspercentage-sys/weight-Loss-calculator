import re

targets = ['blog/water-fasting-weight-loss/index.html', 'blog/postpartum-weight-loss-safe-guide/index.html',
           'blog/how-to-calculate-weight-loss-percentage/index.html', 'about/index.html', 'index.html',
           'calculators/bmi/index.html', 'calculators/weight-loss/from-120-to-114/index.html']
for t in targets:
    try:
        txt = open(t, encoding='utf-8', errors='ignore').read()
    except Exception as e:
        print(t, 'ERROR', e)
        continue
    m = re.findall(r'<link[^>]*rel=["\']canonical["\'][^>]*>', txt)
    og = re.findall(r'property=["\']og:url["\'][^>]*>', txt)
    print(t)
    print('  canonical tags:', m[:2])
    print('  og:url tags:', og[:2])
