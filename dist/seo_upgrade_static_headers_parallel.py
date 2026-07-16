"""
Upgrade Static Headers (Parallel) — weightlosspercentage.com
Upgrades the hardcoded static navigation headers in all HTML files in the project
to a premium glassmorphic, animated navigation design with hover effects.
Uses multiprocessing for extremely fast execution.
"""
import os
import re
import multiprocessing

ROOT = r"d:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1"

# ─── Translations for each locale ────────────────────────────────────────────
LOCALE_DATA = {
    "us": {
        "brand_name": "Weight Loss Percentage",
        "home": "Home",
        "calculators": "Calculators",
        "nutrition": "Nutrition",
        "blog": "Blog",
        "compare": "Compare",
        "prefix": "/"
    },
    "uk": {
        "brand_name": "Weight Loss Percentage",
        "home": "Home",
        "calculators": "Calculators",
        "nutrition": "Nutrition",
        "blog": "Blog",
        "compare": "Compare",
        "prefix": "/uk/"
    },
    "ca": {
        "brand_name": "Weight Loss Percentage",
        "home": "Home",
        "calculators": "Calculators",
        "nutrition": "Nutrition",
        "blog": "Blog",
        "compare": "Compare",
        "prefix": "/ca/"
    },
    "au": {
        "brand_name": "Weight Loss Percentage",
        "home": "Home",
        "calculators": "Calculators",
        "nutrition": "Nutrition",
        "blog": "Blog",
        "compare": "Compare",
        "prefix": "/au/"
    },
    "nz": {
        "brand_name": "Weight Loss Percentage",
        "home": "Home",
        "calculators": "Calculators",
        "nutrition": "Nutrition",
        "blog": "Blog",
        "compare": "Compare",
        "prefix": "/nz/"
    },
    "ru": {
        "brand_name": "Процент потери веса",
        "home": "Дом",
        "calculators": "Калькуляторы",
        "nutrition": "Питание",
        "blog": "Блог",
        "compare": "Сравнивать",
        "prefix": "/ru/"
    },
    "zh": {
        "brand_name": "减肥百分比",
        "home": "家",
        "calculators": "计算器",
        "nutrition": "营养",
        "blog": "博客",
        "compare": "比较",
        "prefix": "/zh/"
    }
}

HEADER_STYLE = """<style>
  .static-nav-link {
    position: relative;
    padding: 0.25rem 0;
  }
  .static-nav-link:hover {
    color: #4f46e5 !important;
  }
  .static-nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #f97316);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .static-nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
</style>"""

def get_locale_from_path(file_path):
    rel = os.path.relpath(file_path, ROOT)
    parts = rel.split(os.sep)
    if parts and parts[0] in LOCALE_DATA:
        return parts[0]
    return "us"

def make_premium_header(locale):
    data = LOCALE_DATA[locale]
    pref = data["prefix"]
    
    html = f"""<header class="static-header" style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226, 232, 240, 0.8); padding: 1rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); font-family: sans-serif;">
  {HEADER_STYLE}
  <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
    <a href="{pref}" style="font-weight: 700; font-size: 1.25rem; text-decoration: none; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s;">
      <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316); color: white; border-radius: 8px; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);">%</span>
      {data["brand_name"]}
    </a>
    <nav style="display: flex; gap: 1.5rem; align-items: center;">
      <a href="{pref}" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; transition: color 0.2s;">{data["home"]}</a>
      <a href="{pref}calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; transition: color 0.2s;">{data["calculators"]}</a>
      <a href="{pref}nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; transition: color 0.2s;">{data["nutrition"]}</a>
      <a href="{pref}blog/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; transition: color 0.2s;">{data["blog"]}</a>
      <a href="{pref}compare/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; transition: color 0.2s;">{data["compare"]}</a>
    </nav>
  </div>
</header>"""
    return html

header_pattern = re.compile(r'<header class="static-header".*?</header>', re.DOTALL)

def process_single_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        if not header_pattern.search(content):
            return False
            
        locale = get_locale_from_path(file_path)
        new_header = make_premium_header(locale)
        
        new_content = header_pattern.sub(new_header, content)
        if new_content != content:
            with open(file_path, "w", encoding="utf-8", newline="\r\n") as f:
                f.write(new_content)
            return True
    except Exception as e:
        pass
    return False

def collect_html_files(root_dir):
    results = []
    subdirs_to_process = [
        'about', 'blog', 'calculators', 'category', 'compare', 
        'contact', 'disclaimer', 'glossary', 'nutrition', 
        'privacy', 'restaurants', 'terms',
        'uk', 'ca', 'au', 'nz', 'zh', 'ru'
    ]
    
    idx = os.path.join(root_dir, "index.html")
    if os.path.isfile(idx):
        results.append(idx)
        
    for subdir in subdirs_to_process:
        d = os.path.join(root_dir, subdir)
        if not os.path.isdir(d):
            continue
        for r, dirs, files in os.walk(d):
            # Skip build/assets directories
            if "node_modules" in r or "dist_old" in r or "dist_test" in r:
                continue
            for f in files:
                if f.endswith('.html'):
                    results.append(os.path.join(r, f))
    return results

if __name__ == '__main__':
    html_files = collect_html_files(ROOT)
    total_files = len(html_files)
    print(f"Collected {total_files} HTML files. Starting parallel update...")
    
    # Use multiprocessing Pool to process files in parallel
    pool = multiprocessing.Pool(multiprocessing.cpu_count())
    results = pool.map(process_single_file, html_files)
    pool.close()
    pool.join()
    
    fixed = sum(1 for r in results if r)
    print(f"\nCompleted! Upgraded static headers in {fixed} of {total_files} files.")
