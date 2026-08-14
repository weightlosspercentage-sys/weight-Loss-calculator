import os
import re
import json

def verify_build():
    dist_dir = 'dist3' if os.path.exists('dist3') else '.'
    
    # 1. Check Canonical & Hreflang on a regional page
    uk_glp1 = os.path.join(dist_dir, 'uk', 'calculators', 'glp1-weight-loss', 'index.html')
    uk_canonical = 'N/A'
    if os.path.exists(uk_glp1):
        with open(uk_glp1, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()
        m = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', c)
        if m:
            uk_canonical = m.group(1)

    # 2. Check Noindex on thin programmatic page
    bmi_prog = os.path.join(dist_dir, 'calculators', 'bmi', 'height-weight', '4-10', '100', 'index.html')
    bmi_robots = 'N/A'
    if os.path.exists(bmi_prog):
        with open(bmi_prog, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()
        m = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)["\']', c)
        if m:
            bmi_robots = m.group(1)

    # 3. Check GLP-1 calculator page word count and schema
    glp1_page = os.path.join(dist_dir, 'calculators', 'glp1-weight-loss', 'index.html')
    glp1_words = 0
    glp1_schemas = []
    if os.path.exists(glp1_page):
        with open(glp1_page, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()
        text = re.sub(r'<script.*?</script>', '', c, flags=re.DOTALL)
        text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        glp1_words = len(text.split())
        glp1_schemas = list(set(re.findall(r'"@type"\s*:\s*"([^"]+)"', c)))

    # 4. Check Bariatric calculator page word count and schema
    bar_page = os.path.join(dist_dir, 'calculators', 'bariatric-surgery-weight-loss', 'index.html')
    bar_words = 0
    bar_schemas = []
    if os.path.exists(bar_page):
        with open(bar_page, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()
        text = re.sub(r'<script.*?</script>', '', c, flags=re.DOTALL)
        text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        bar_words = len(text.split())
        bar_schemas = list(set(re.findall(r'"@type"\s*:\s*"([^"]+)"', c)))

    # 5. Check master weight range guide
    guide_page = os.path.join(dist_dir, 'blog', 'weight-loss-percentage-by-starting-weight', 'index.html')
    guide_words = 0
    if os.path.exists(guide_page):
        with open(guide_page, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()
        text = re.sub(r'<script.*.*?/script>', '', c, flags=re.DOTALL)
        text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        guide_words = len(text.split())

    # 6. Check _redirects line count
    red_count = 0
    red_file = os.path.join(dist_dir, '_redirects')
    if os.path.exists(red_file):
        with open(red_file, 'r', encoding='utf-8') as f:
            red_count = len(f.readlines())

    print("=== VERIFICATION REPORT ===")
    print(f"UK Regional Canonical: {uk_canonical}")
    print(f"Programmatic BMI Meta Robots: {bmi_robots}")
    print(f"GLP-1 Page Word Count: {glp1_words} | Schemas: {glp1_schemas}")
    print(f"Bariatric Page Word Count: {bar_words} | Schemas: {bar_schemas}")
    print(f"Master Weight Range Guide Word Count: {guide_words}")
    print(f"Generated Redirects Count: {red_count}")

if __name__ == '__main__':
    verify_build()
