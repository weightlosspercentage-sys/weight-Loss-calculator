"""Rebuild sitemap architecture (replaces update_sitemaps_lastmod.py in build).

1. Drops noindex URLs from sitemaps (Google: never submit noindex pages)
2. Drops stale blog URLs (page missing locally AND soft-404/unreachable live)
3. Adds hreflang <xhtml:link> alternates to remaining URLs
4. Rebuilds sitemap.xml index with all active child sitemaps
5. Retires emptied sitemaps (moves root copies to scripts/archive/sitemaps-retired)
6. Syncs root-level copies with public/ (build copies root over public)
7. Fixes robots.txt to reference a single sitemap index
8. lastmod is preserved unless a file actually changed today
"""
import os
import re
import shutil
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
SITE = 'https://www.weightlosspercentage.com'
TODAY = datetime.now().strftime('%Y-%m-%d')

XHTML_DECL = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
URLSET_PLAIN = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

REGIONS = ['', 'uk', 'ca', 'au', 'nz']
LANG_FOR = {'': 'en-US', 'uk': 'en-GB', 'ca': 'en-CA', 'au': 'en-AU', 'nz': 'en-NZ'}
REGION_PREFIX_RE = re.compile(r'^/(uk|ca|au|nz|zh|ru)(/|$)')
FROM_TO_RE = re.compile(r'/calculators/weight-loss/from-\d+-to-\d+/')
BLOG_SLUG_RE = re.compile(r'^/(?:uk|ca|au|nz|zh|ru)?/?blog/([^/]+)/$')

BLOG_SLUGS = set()
REGION_BASES = {r: set() for r in REGIONS}


def local_blog_slugs():
    slugs = set()
    blog_dir = os.path.join(ROOT, 'blog')
    if os.path.isdir(blog_dir):
        for entry in os.listdir(blog_dir):
            if os.path.isdir(os.path.join(blog_dir, entry)):
                slugs.add(entry)
    return slugs


def region_of(path):
    m = REGION_PREFIX_RE.match(path)
    return m.group(1) if m else ''


def base_of(path):
    m = REGION_PREFIX_RE.match(path)
    if m and m.group(2):
        return '/' + path[m.end():]
    if m:
        return '/'
    return path


def is_noindex_path(path):
    if path.startswith('/zh/') or path == '/zh':
        return True
    if path.startswith('/ru/') or path == '/ru':
        return True
    if '/calculators/bmi/height-weight/' in path:
        return True
    if FROM_TO_RE.match(path):
        return True
    return False


def find_stale_blog_urls():
    """Blog URLs in sitemaps whose slug has no local folder — verified live."""
    candidates = set()
    for fname in os.listdir(PUB):
        if not (fname.startswith('sitemap-') and fname.endswith('.xml')):
            continue
        with open(os.path.join(PUB, fname), 'r', encoding='utf-8') as f:
            for loc in re.findall(r'<loc>(.*?)</loc>', f.read(), re.S):
                path = loc.strip().replace(SITE, '')
                m = BLOG_SLUG_RE.match(path)
                if m and m.group(1) not in BLOG_SLUGS:
                    candidates.add(m.group(1))

    stale = set()
    if not candidates:
        return stale
    import urllib.request
    for slug in sorted(candidates):
        url = SITE + '/blog/' + slug + '/'
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read(16000).decode('utf-8', 'ignore')
            title = re.search(r'<title>(.*?)</title>', body, re.S)
            h1 = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.S)
            probe = ((title.group(1) if title else '') + ' ' + (h1.group(1) if h1 else '')).lower()
            if slug.replace('-', ' ') in probe:
                print(f"  [keep ] /blog/{slug}/ (live with real content)")
            else:
                stale.add(slug)
                print(f"  [stale] /blog/{slug}/ (soft 404 -> dropping)")
        except Exception as e:
            stale.add(slug)
            print(f"  [stale] /blog/{slug}/ (unreachable: {e})")
    return stale


def build_region_bases():
    for r in REGIONS:
        REGION_BASES[r] = set()
    for fname in os.listdir(PUB):
        if not (fname.startswith('sitemap-') and fname.endswith('.xml')):
            continue
        with open(os.path.join(PUB, fname), 'r', encoding='utf-8') as f:
            for loc in re.findall(r'<loc>(.*?)</loc>', f.read(), re.S):
                path = loc.strip().replace(SITE, '')
                region = region_of(path)
                if region in REGION_BASES:
                    REGION_BASES[region].add(base_of(path))


def hreflang_block(path):
    base = base_of(path)
    lines = []
    for region in REGIONS:
        if base not in REGION_BASES[region]:
            continue
        target = SITE + ('/' + region if region else '') + base
        lines.append(f'    <xhtml:link rel="alternate" hreflang="{LANG_FOR[region]}" href="{target}" />')
        if region == '':
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{target}" />')
    return '\n'.join(lines)


def previous_index_lastmods():
    idx_path = os.path.join(PUB, 'sitemap.xml')
    out = {}
    if os.path.isfile(idx_path):
        with open(idx_path, 'r', encoding='utf-8') as f:
            content = f.read()
        for m in re.finditer(r'<sitemap>\s*<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>\s*</sitemap>', content, re.S):
            out[m.group(1).strip().rsplit('/', 1)[-1]] = m.group(2).strip()
    return out


def process_child_sitemap(fname, stale_blog_slugs):
    fpath = os.path.join(PUB, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    removed = 0
    annotated = 0

    def repl(m):
        nonlocal removed, annotated
        block = m.group(0)
        loc = re.search(r'<loc>(.*?)</loc>', block, re.S)
        if not loc:
            return block
        path = loc.group(1).strip().replace(SITE, '')
        if is_noindex_path(path):
            removed += 1
            return ''
        blog_m = BLOG_SLUG_RE.match(path)
        if blog_m and blog_m.group(1) in stale_blog_slugs:
            removed += 1
            return ''
        block = re.sub(r'\s*<xhtml:link[^>]*/>', '', block)
        hl = hreflang_block(path)
        if hl:
            block = re.sub(r'(<loc>.*?</loc>)', r'\1\n' + hl, block, count=1, flags=re.S)
            annotated += 1
        return block

    new_content = re.sub(r'<url>[\s\S]*?</url>', repl, content)
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)

    if URLSET_PLAIN in new_content and XHTML_DECL not in new_content:
        new_content = new_content.replace(URLSET_PLAIN, XHTML_DECL)

    has_urls = '<url>' in new_content
    changed = new_content != content
    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return {'file': fname, 'kept': len(re.findall(r'<url>', new_content)),
            'removed': removed, 'hreflang': annotated,
            'retire': not has_urls, 'changed': changed}


def write_index(children, changed):
    prev = previous_index_lastmods()
    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
             '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for c in children:
        lastmod = TODAY if changed.get(c) else prev.get(c, TODAY)
        parts += ['  <sitemap>',
                  f'    <loc>{SITE}/{c}</loc>',
                  f'    <lastmod>{lastmod}</lastmod>',
                  '  </sitemap>']
    parts.append('</sitemapindex>')
    with open(os.path.join(PUB, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(parts) + '\n')


def fix_robots():
    rp = os.path.join(PUB, 'robots.txt')
    with open(rp, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()
    out = [l for l in lines if not l.strip().lower().startswith('sitemap:')]
    while out and not out[-1].strip():
        out.pop()
    out.append(f'Sitemap: {SITE}/sitemap.xml')
    with open(rp, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')


def main():
    BLOG_SLUGS.update(local_blog_slugs())
    print(f"[info] local blog posts: {len(BLOG_SLUGS)}")

    stale = find_stale_blog_urls()
    build_region_bases()

    child_files = sorted(f for f in os.listdir(PUB)
                         if f.startswith('sitemap-') and f.endswith('.xml'))
    report, children, retired = [], [], []
    for f in child_files:
        r = process_child_sitemap(f, stale)
        report.append(r)
        if r['retire']:
            retired.append(f)
            os.remove(os.path.join(PUB, f))
            root_copy = os.path.join(ROOT, f)
            if os.path.isfile(root_copy):
                arch = os.path.join(ROOT, 'scripts', 'archive', 'sitemaps-retired')
                os.makedirs(arch, exist_ok=True)
                shutil.move(root_copy, os.path.join(arch, f))
                print(f"  [retire] {f} root copy archived")
        else:
            children.append(f)

    write_index(children, {r['file']: r['changed'] for r in report})
    fix_robots()

    for f in children + ['sitemap.xml', 'sitemap.xsl', 'robots.txt']:
        src = os.path.join(PUB, f)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(ROOT, f))

    print(f"=== SITEMAP REBUILD {TODAY} ===")
    for r in report:
        status = 'RETIRED' if r['retire'] else 'active'
        print(f"{r['file']:32s} kept={r['kept']:5d} removed={r['removed']:4d} hreflang={r['hreflang']:4d} {status}")
    print(f"index children ({len(children)}): {', '.join(children)}")
    print(f"retired: {', '.join(retired) or 'none'}")
    print(f"stale blog urls dropped: {', '.join(sorted(stale)) if stale else 'none'}")
    print("robots.txt -> single index reference; root copies synced")


if __name__ == '__main__':
    main()
