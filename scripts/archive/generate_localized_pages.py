import os
import re
import shutil
import urllib.request
import urllib.parse
import json
from html.parser import HTMLParser

# 1. Define configuration
countries = {
    'uk': {'name': 'UK', 'hreflang': 'en-gb', 'translate': False},
    'ca': {'name': 'Canada', 'hreflang': 'en-ca', 'translate': False},
    'au': {'name': 'Australia', 'hreflang': 'en-au', 'translate': False},
    'nz': {'name': 'New Zealand', 'hreflang': 'en-nz', 'translate': False},
    'zh': {'name': 'China', 'hreflang': 'zh', 'translate': True, 'target_lang': 'zh-CN'},
    'ru': {'name': 'Russia', 'hreflang': 'ru', 'translate': True, 'target_lang': 'ru'}
}

default_hreflang = 'en-us'
domain = 'https://www.weightlosspercentage.com'

# List of folders to process
subdirs_to_process = [
    'about',
    'blog',
    'calculators',
    'category',
    'compare',
    'contact',
    'disclaimer',
    'glossary',
    'nutrition',
    'privacy',
    'restaurants',
    'terms'
]

# Spelling mapping for UK/CA/AU/NZ localization
spelling_map = {
    'behavior': 'behaviour',
    'Behavior': 'Behaviour',
    'behaviors': 'behaviours',
    'Behaviors': 'Behaviours',
    'program': 'programme',
    'Program': 'Programme',
    'programs': 'programmes',
    'Programs': 'Programmes',
    'fiber': 'fibre',
    'Fiber': 'Fibre',
    'organize': 'organise',
    'Organize': 'Organise',
    'organizing': 'organising',
    'Organizing': 'Organising',
    'flavor': 'flavour',
    'Flavor': 'Flavour',
    'flavors': 'flavours',
    'Flavors': 'Flavours',
    'color': 'colour',
    'Color': 'Colour',
    'colors': 'colours',
    'Colors': 'Colours',
}

# --- Translation Caching Setup ---
cache_file = 'translation_cache.json'
translation_cache = {}

if os.path.exists(cache_file):
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
        print(f"Loaded {len(translation_cache)} cached translations from {cache_file}.")
    except Exception as e:
        print(f"Error loading translation cache: {e}")

# Build localized maps for JS injection
zh_map = {}
ru_map = {}
for key, val in translation_cache.items():
    if val:
        if key.startswith("zh-CN:"):
            zh_map[key[len("zh-CN:"):]] = val
        elif key.startswith("ru:"):
            ru_map[key[len("ru:"):]] = val
print(f"Built JS translation maps: {len(zh_map)} zh entries, {len(ru_map)} ru entries.")

def save_cache():
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving translation cache: {e}")

def translate_string(text, target_lang):
    text_stripped = text.strip()
    if not text_stripped:
        return text
    
    # Check cache first
    cache_key = f"{target_lang}:{text_stripped}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
        
    # Translate using Google Translate API
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + target_lang + "&dt=t&q=" + urllib.parse.quote(text_stripped)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = "".join([sentence[0] for sentence in res[0]])
            
            # Cache and save
            translation_cache[cache_key] = translated
            save_cache()
            return translated
    except Exception as e:
        # Fallback to original text on failure
        return text_stripped

# --- HTML Node-by-Node Translator ---
class HTMLTranslator(HTMLParser):
    def __init__(self, translate_func):
        super().__init__()
        self.translate_func = translate_func
        self.result = []
        self.in_script_or_style = False
        self.self_closing_tags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
        
    def handle_starttag(self, tag, attrs):
        self.in_script_or_style = tag.lower() in ['script', 'style']
        
        attr_str = ""
        for name, value in attrs:
            # If it is meta description, translate its content
            if tag.lower() == 'meta' and name.lower() == 'content':
                is_desc = any(an.lower() in ['name', 'property'] and av.lower() in ['description', 'og:description', 'twitter:description'] for an, av in attrs)
                if is_desc and value:
                    value = self.translate_func(value)
            attr_str += f' {name}="{value}"' if value is not None else f' {name}'
            
        if tag.lower() in self.self_closing_tags:
            self.result.append(f'<{tag}{attr_str} />')
        else:
            self.result.append(f'<{tag}{attr_str}>')
        
    def handle_endtag(self, tag):
        self.in_script_or_style = False
        self.result.append(f'</{tag}>')
        
    def handle_data(self, data):
        if self.in_script_or_style:
            self.result.append(data)
        else:
            # Only translate nodes containing letters or words
            if re.search(r'[A-Za-z]', data):
                leading_ws = re.match(r'^\s*', data).group(0)
                trailing_ws = re.search(r'\s*$', data).group(0)
                stripped = data.strip()
                
                # Check if it's a number or formula
                if stripped.replace('%', '').replace('.', '').replace('-', '').isdigit():
                    self.result.append(data)
                else:
                    translated = self.translate_func(stripped)
                    self.result.append(f'{leading_ws}{translated}{trailing_ws}')
            else:
                self.result.append(data)
                
    def handle_charref(self, name):
        self.result.append(f'&#{name};')
        
    def handle_entityref(self, name):
        self.result.append(f'&{name};')
        
    def handle_comment(self, data):
        self.result.append(f'<!--{data}-->')
        
    def handle_decl(self, decl):
        self.result.append(f'<!{decl}>')
        
    def get_output(self):
        return "".join(self.result)

# --- Standard Helper Functions ---
def get_clean_url_path(rel_path):
    """Converts relative file path to canonical URL path (with single trailing slashes)."""
    rel_path = rel_path.replace('\\', '/')
    clean = rel_path.replace('index.html', '')
    if not clean.startswith('/'):
        clean = '/' + clean
    return clean

def rewrite_links(html_content, country_prefix):
    """Prefixes internal relative links with the country directory (e.g. /uk/)."""
    pattern = r'href="(?!\/(assets|favicon|manifest|og-default|apple-touch-icon|3a5d9e1f2c4b7a6d8e0f1c3a5b7d9e2f|uk/|ca/|au/|nz/|zh/|ru/))\/([^"]*)"'
    def repl(match):
        path = match.group(2)
        return f'href="/{country_prefix}/{path}"'
    return re.sub(pattern, repl, html_content)

def localize_content(html_content, country_name):
    """Applies UK/Commonwealth spelling corrections and appends country names to SEO tags."""
    # 1. Update <title> tag
    title_pattern = r'(<title>)(.*?)(</title>)'
    def title_repl(match):
        title_text = match.group(2)
        if country_name not in title_text:
            if ' — ' in title_text:
                parts = title_text.split(' — ', 1)
                return f'{match.group(1)}{parts[0]} ({country_name}) — {parts[1]}{match.group(3)}'
            elif ' | ' in title_text:
                parts = title_text.split(' | ', 1)
                return f'{match.group(1)}{parts[0]} ({country_name}) | {parts[1]}{match.group(3)}'
            elif ': ' in title_text:
                parts = title_text.split(': ', 1)
                return f'{match.group(1)}{parts[0]} ({country_name}): {parts[1]}{match.group(3)}'
            else:
                return f'{match.group(1)}{title_text} ({country_name}){match.group(3)}'
        return match.group(0)
    html_content = re.sub(title_pattern, title_repl, html_content, flags=re.IGNORECASE)

    # 2. Update <h1> tag
    h1_pattern = r'(<h1[^>]*>)(.*?)(</h1>)'
    def h1_repl(match):
        h1_text = match.group(2)
        if country_name not in h1_text:
            return f'{match.group(1)}{h1_text} ({country_name}){match.group(3)}'
        return match.group(0)
    html_content = re.sub(h1_pattern, h1_repl, html_content, flags=re.IGNORECASE | re.DOTALL)

    # 3. Apply spelling replacements
    for us_spelling, local_spelling in spelling_map.items():
        html_content = html_content.replace(us_spelling, local_spelling)
        
    return html_content

def build_hreflang_tags(clean_path):
    """Generates the HTML block for hreflang alternate links."""
    tags = []
    # US / default
    tags.append(f'    <link rel="alternate" hreflang="en-us" href="{domain}{clean_path}" />')
    # Countries
    for code, info in countries.items():
        cc_path = f'/{code}{clean_path}' if clean_path != '/' else f'/{code}/'
        tags.append(f'    <link rel="alternate" hreflang="{info["hreflang"]}" href="{domain}{cc_path}" />')
    # x-default
    tags.append(f'    <link rel="alternate" hreflang="x-default" href="{domain}{clean_path}" />')
    return '\n'.join(tags)

def clean_head(html_content):
    """Cleans up existing hreflang tags to prevent duplicate additions if run again."""
    html_content = re.sub(r'\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*/>', '', html_content)
    html_content = re.sub(r'\s*<script>window\.__ROUTE_BASEPATH__\s*=\s*"[^"]+";</script>', '', html_content)
    html_content = re.sub(r'\s*<script>window\.__TRANSLATIONS__\s*=\s*.*?</script>', '', html_content)
    return html_content

def clean_footer(html_content):
    """Removes any existing language switcher block from the footer."""
    html_content = re.sub(
        r'<div class="notranslate" translate="no" style="margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-family: sans-serif;">.*?</div>',
        '',
        html_content,
        flags=re.DOTALL
    )
    return html_content

def clean_and_inject_ga(html_content):
    """Ensures Google Analytics tracks all initial and client-side SPA routing transitions."""
    # Remove any existing history router transition interceptor to prevent duplicates
    html_content = re.sub(
        r'\s*// Intercept SPA router transitions for GA tracking.*?\n\s*\}\)\(\);',
        '',
        html_content,
        flags=re.DOTALL
    )
    
    target = "gtag('config', 'G-VY7X5E6GFN');"
    interceptor = """
      // Intercept SPA router transitions for GA tracking
      (function() {
        var pushState = history.pushState;
        var replaceState = history.replaceState;
        function trackPageView() {
          if (window.gtag) {
            window.gtag('config', 'G-VY7X5E6GFN', {
              page_path: window.location.pathname
            });
          }
        }
        history.pushState = function() {
          pushState.apply(history, arguments);
          trackPageView();
        };
        history.replaceState = function() {
          replaceState.apply(history, arguments);
          trackPageView();
        };
        window.addEventListener('popstate', trackPageView);
      })();"""
      
    if target in html_content:
        if "Intercept SPA router transitions for GA tracking" not in html_content:
            html_content = html_content.replace(target, target + interceptor)
            
    return html_content

def build_language_switcher(clean_url_path, current_region):
    regions = {
        'us': {'name': 'English (US)', 'prefix': ''},
        'uk': {'name': 'English (UK)', 'prefix': '/uk'},
        'ca': {'name': 'English (CA)', 'prefix': '/ca'},
        'au': {'name': 'English (AU)', 'prefix': '/au'},
        'nz': {'name': 'English (NZ)', 'prefix': '/nz'},
        'zh': {'name': '简体中文', 'prefix': '/zh'},
        'ru': {'name': 'Русский', 'prefix': '/ru'}
    }
    
    links_html = []
    order = ['us', 'uk', 'ca', 'au', 'nz', 'zh', 'ru']
    
    for r in order:
        info = regions[r]
        name = info['name']
        prefix = info['prefix']
        
        # Build href
        if clean_url_path == '/':
            href = f"{prefix}/" if prefix else "/"
        else:
            href = f"{prefix}{clean_url_path}"
            
        # Build style
        if r == current_region:
            style = "color: #4f46e5; font-weight: 600; text-decoration: none; padding: 0.25rem 0.5rem; background: #e0e7ff; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;"
        else:
            style = "color: #64748b; font-weight: 500; text-decoration: none; padding: 0.25rem 0.5rem; display: inline-flex; align-items: center; gap: 0.25rem;"
            
        link = f'<a href="{href}" style="{style}">{name}</a>'
        links_html.append(link)
        
    separator = '<span style="color: #cbd5e1; font-size: 0.75rem;">•</span>'
    joined_links = f'\n    {separator}\n    '.join(links_html)
    
    switcher_html = (
        f'<div class="notranslate" translate="no" style="margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-family: sans-serif;">\n'
        f'  <span style="color: #64748b; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Region / Language</span>\n'
        f'  <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.875rem;">\n'
        f'    {joined_links}\n'
        f'  </div>\n'
        f'</div>'
    )
    return switcher_html

def inject_language_switcher(html_content, switcher_html):
    pattern = r'(<div style="border-top: 1px solid #1e293b; padding-top: 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">)'
    if re.search(pattern, html_content):
        return re.sub(pattern, lambda m: f'{m.group(1)}\n{switcher_html}', html_content, count=1)
    return html_content

# --- Main Script ---
def main():
    print("Starting localization & translation process...")
    
    # NOTE: Old country folder cleanup disabled to preserve
    # programmatic BMI and from-to pages already generated.
    # for code in countries.keys():
    #     if os.path.exists(code):
    #         print(f"Cleaning existing directory: {code}")
    #         shutil.rmtree(code)
    print("Preserving existing country directories (BMI and from->to pages kept intact).")
            
    # Find all HTML files to process
    html_files = []
    if os.path.exists('index.html'):
        html_files.append('index.html')
        
    for subdir in subdirs_to_process:
        if os.path.exists(subdir):
            for root, dirs, files in os.walk(subdir):
                # Skip programmatic directories
                if 'from-' in root or 'height-weight' in root:
                    continue
                for file in files:
                    if file.endswith('.html'):
                        full_path = os.path.join(root, file)
                        html_files.append(full_path)

    print(f"Found {len(html_files)} original HTML files to process.")
    
    processed_count = 0
    sitemap_urls = []
    
    for file_path in html_files:
        norm_path = os.path.normpath(file_path)
        rel_path = os.path.relpath(norm_path, start='.').replace('\\', '/')
        clean_url_path = get_clean_url_path(rel_path)
        
        # Add root URL
        sitemap_urls.append(clean_url_path)
        
        # Read file content
        with open(norm_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
            
        # Clean the file first
        cleaned_content = clean_head(original_content)
        cleaned_content = clean_footer(cleaned_content)
        cleaned_content = clean_and_inject_ga(cleaned_content)
        
        # Generate hreflang block
        hreflangs = build_hreflang_tags(clean_url_path)
        
        # 1. Update Root (US) page in-place
        us_content = cleaned_content
        if '</head>' in us_content:
            us_content = us_content.replace('</head>', f'{hreflangs}\n  </head>')
        
        # Inject language switcher for US page
        us_switcher = build_language_switcher(clean_url_path, 'us')
        us_content = inject_language_switcher(us_content, us_switcher)
        
        with open(norm_path, 'w', encoding='utf-8') as f:
            f.write(us_content)
            
        # 2. Generate Country / Translation Pages
        for code, info in countries.items():
            # Destination path
            dest_file_path = os.path.join(code, rel_path)
            dest_dir = os.path.dirname(dest_file_path)
            
            # Ensure target directory exists
            if dest_dir and not os.path.exists(dest_dir):
                os.makedirs(dest_dir)
                
            country_clean_path = f'/{code}{clean_url_path}' if clean_url_path != '/' else f'/{code}/'
            sitemap_urls.append(country_clean_path)
            
            # Base content
            country_content = cleaned_content.replace('<html lang="en">', f'<html lang="{info["hreflang"]}">')
            
            # Inject window.__ROUTE_BASEPATH__ and window.__TRANSLATIONS__
            if '<head>' in country_content:
                translations_json = "{}"
                if info['translate']:
                    translations_json = json.dumps(zh_map if info['target_lang'] == 'zh-CN' else ru_map, ensure_ascii=False)
                basepath_script = (
                    f'<head>\n'
                    f'    <script>window.__ROUTE_BASEPATH__ = "/{code}";</script>\n'
                    f'    <script>window.__TRANSLATIONS__ = {translations_json};</script>'
                )
                country_content = country_content.replace('<head>', basepath_script)
                
            # Inject hreflangs
            if '</head>' in country_content:
                country_content = country_content.replace('</head>', f'{hreflangs}\n  </head>')
                
            # Update canonical link
            canonical_pattern = r'<link rel="canonical" href="https://www\.weightlosspercentage\.com[^"]*" />'
            country_canonical = f'<link rel="canonical" href="{domain}{country_clean_path}" />'
            country_content = re.sub(canonical_pattern, country_canonical, country_content)
            
            # Rewrite relative internal links
            country_content = rewrite_links(country_content, code)
            
            # Process content (Translate vs Localize)
            if info['translate']:
                target_lang = info['target_lang']
                print(f"Translating {dest_file_path} to {info['name']}...")
                
                # Setup parser-based translator
                translator = HTMLTranslator(lambda text: translate_string(text, target_lang))
                translator.feed(country_content)
                country_content = translator.get_output()
            else:
                country_content = localize_content(country_content, info['name'])
            
            # Inject language switcher for country page
            country_switcher = build_language_switcher(clean_url_path, code)
            country_content = inject_language_switcher(country_content, country_switcher)
            
            # Write out file
            with open(dest_file_path, 'w', encoding='utf-8') as f:
                f.write(country_content)
                
        processed_count += 1
        print(f"Processed file {processed_count}/{len(html_files)}: {rel_path}")

    print("All folders generated successfully.")
    
    # 3. Rebuild sitemaps (Silo architecture)
    print("Rebuilding sitemaps into SILO architecture...")
    import datetime
    current_date = datetime.date.today().isoformat()
    
    # Initialize dictionary for sitemaps
    sitemaps_data = {
        'us': [],
        'uk': [],
        'ca': [],
        'au': [],
        'nz': [],
        'zh': [],
        'ru': []
    }
    
    sitemap_urls.sort()
    for url_path in sitemap_urls:
        matched = False
        for code in countries.keys():
            if url_path.startswith(f'/{code}/'):
                sitemaps_data[code].append(url_path)
                matched = True
                break
        if not matched:
            sitemaps_data['us'].append(url_path)
            
    # For each region, write sitemap-[region].xml
    sitemap_header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_footer = '</urlset>\n'
    
    for region, paths in sitemaps_data.items():
        sitemap_entries = []
        for url_path in paths:
            if url_path == '/' or any(url_path == f'/{c}/' for c in countries.keys()):
                priority = '1.0'
                freq = 'weekly'
            elif 'calculators/' in url_path:
                priority = '0.9'
                freq = 'monthly'
            elif 'blog/' in url_path:
                priority = '0.7'
                freq = 'monthly'
            elif 'compare/' in url_path:
                priority = '0.6'
                freq = 'monthly'
            elif 'category/' in url_path:
                priority = '0.8'
                freq = 'weekly'
            else:
                priority = '0.5'
                freq = 'monthly'
                
            entry = (
                f"  <url>\n"
                f"    <loc>{domain}{url_path}</loc>\n"
                f"    <lastmod>{current_date}</lastmod>\n"
                f"    <changefreq>{freq}</changefreq>\n"
                f"    <priority>{priority}</priority>\n"
                f"  </url>\n"
            )
            sitemap_entries.append(entry)
            
        sitemap_filename = f"sitemap-{region}.xml"
        with open(sitemap_filename, 'w', encoding='utf-8') as f:
            f.write(sitemap_header + "".join(sitemap_entries) + sitemap_footer)
        print(f"Generated {sitemap_filename} with {len(paths)} URLs.")
        
    # Write the master sitemap index: sitemap.xml
    sitemap_index_header = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_index_footer = '</sitemapindex>\n'
    
    sitemap_index_entries = []
    # Sort regions to maintain consistent ordering
    for region in sorted(sitemaps_data.keys()):
        sitemap_url = f"{domain}/sitemap-{region}.xml"
        entry = (
            f"  <sitemap>\n"
            f"    <loc>{sitemap_url}</loc>\n"
            f"    <lastmod>{current_date}</lastmod>\n"
            f"  </sitemap>\n"
        )
        sitemap_index_entries.append(entry)
        
    # Preserve other generated sitemaps if they exist
    for other_sitemap in ['sitemap-bmi.xml', 'sitemap-from-to-weight.xml']:
        if os.path.exists(other_sitemap):
            sitemap_url = f"{domain}/{other_sitemap}"
            entry = (
                f"  <sitemap>\n"
                f"    <loc>{sitemap_url}</loc>\n"
                f"    <lastmod>{current_date}</lastmod>\n"
                f"  </sitemap>\n"
            )
            sitemap_index_entries.append(entry)
        
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_index_header + "".join(sitemap_index_entries) + sitemap_index_footer)
    print("Generated master sitemap.xml index.")


if __name__ == '__main__':
    main()
