import json, re
from collections import Counter

data = json.load(open('weightlosspercentage.com-audit/crawl-data.json', encoding='utf-8'))
pages = [p for p in data['crawled'] if isinstance(p, dict)]

for u in ['https://www.weightlosspercentage.com/', 'https://www.weightlosspercentage.com/about/']:
    for p in pages:
        if p.get('url') == u:
            print(u)
            print('  og_title:', repr(p.get('og_title')), '| og_image:', p.get('og_image'), '| tw:', p.get('twitter_card'))
            break

print()
print('og missing by path-type:')
c = Counter()
for p in pages:
    if not p.get('og_title'):
        seg = p.get('url', '').replace('https://www.weightlosspercentage.com', '').split('/')[1] or 'home'
        c[seg] += 1
print(c.most_common(12))
print('total missing og:', sum(1 for p in pages if not p.get('og_title')), '/', len(pages))

print()
print('=== programmatic pages (from-to-weight / bmi) ===')
ftw = [p for p in pages if '/from-' in p.get('url', '')]
bmi_p = [p for p in pages if '/bmi/' in p.get('url', '')]
print('from-to-weight crawled:', len(ftw), '| bmi crawled:', len(bmi_p))
for label, grp in [('ftw', ftw), ('bmi', bmi_p)]:
    if grp:
        words = [p.get('words', 0) for p in grp]
        titles = Counter(p.get('title', '') for p in grp)
        print(f'{label}: words avg={sum(words)/len(words):.0f} min={min(words)} max={max(words)} | unique titles={len(titles)}/{len(grp)}')
        for t, n in titles.most_common(4):
            print(f'    x{n}: {t[:90]}')

print()
print('=== title length distribution ===')
short = [p for p in pages if 0 < len(p.get('title', '')) < 30]
long = [p for p in pages if len(p.get('title', '')) > 60]
print('short<30:', len(short), '| long>60:', len(long))
print('sample short:')
for p in short[:5]:
    print('   ', p.get('url'), '|', p.get('title'))
print('sample long:')
for p in long[:5]:
    print('   ', p.get('url'), '|', p.get('title'))

print()
print('=== hreflang self-return check (sample) ===')
for p in pages[:12]:
    hl = p.get('hreflangs', [])
    if hl:
        ok = p.get('url') in hl or p.get('canonical') in hl or any(x.strip('/') == p.get('url','').strip('/') for x in hl)
        print(p.get('url'), '| hreflang count:', len(hl), '| self present:', ok, '| langs:', [h.split('/')[-2] for h in hl][:8])

print()
print('=== third-party domains (top) ===')
td = Counter()
for p in pages:
    for d in p.get('third_party_domains', []):
        td[d] += 1
print(td.most_common(15))
