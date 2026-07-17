"""
PROGRAMMATIC BMI CALCULATOR PAGES
===================================
Generates pages like "BMI for 5'6\" 180 lb female" and "BMI for 6'0\" 200 lb male"

Targets massive long-tail search volume:
  - "bmi for 5'10 170 lb male"  → ~900 searches/month each
  - "bmi for 5'4 150 lb female" → ~1,200 searches/month each
  - Total: ~1,275 pages × 7 regions = ~9,000 pages

BMI Formula: (weight_lbs / height_inches^2) × 703
BMI Categories:
  - Underweight: < 18.5
  - Normal: 18.5 – 24.9
  - Overweight: 25 – 29.9
  - Obese Class I: 30 – 34.9
  - Obese Class II: 35 – 39.9
  - Obese Class III: 40+

Author: Programmatic SEO Engine
Date: 2026-07-04
"""

import os
import re
import json
import datetime
import urllib.request
import urllib.parse

# ─── Configuration ─────────────────────────────────────────────
domain = 'https://www.weightlosspercentage.com'

countries = {
    'uk': {'name': 'UK', 'hreflang': 'en-gb', 'translate': False},
    'ca': {'name': 'Canada', 'hreflang': 'en-ca', 'translate': False},
    'au': {'name': 'Australia', 'hreflang': 'en-au', 'translate': False},
    'nz': {'name': 'New Zealand', 'hreflang': 'en-nz', 'translate': False},
    'zh': {'name': 'China', 'hreflang': 'zh', 'translate': True, 'target_lang': 'zh-CN'},
    'ru': {'name': 'Russia', 'hreflang': 'ru', 'translate': True, 'target_lang': 'ru'}
}

spelling_map = {
    'behavior': 'behaviour', 'Behavior': 'Behaviour',
    'behaviors': 'behaviours', 'Behaviors': 'Behaviours',
    'program': 'programme', 'Program': 'Programme',
    'programs': 'programmes', 'Programs': 'Programmes',
    'fiber': 'fibre', 'Fiber': 'Fibre',
    'organize': 'organise', 'Organize': 'Organise',
    'organizing': 'organising', 'Organizing': 'Organising',
    'flavor': 'flavour', 'Flavor': 'Flavour',
    'flavors': 'flavours', 'Flavors': 'Flavours',
    'color': 'colour', 'Color': 'Colour',
    'colors': 'colours', 'Colors': 'Colours',
}

# ─── Translation Cache ─────────────────────────────────────────
cache_file = 'translation_cache.json'
translation_cache = {}
if os.path.exists(cache_file):
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
    except Exception:
        pass

def save_cache():
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

def translate(text, target_lang):
    text_stripped = text.strip()
    if not text_stripped:
        return text
    cache_key = f"{target_lang}:{text_stripped}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + target_lang + "&dt=t&q=" + urllib.parse.quote(text_stripped)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = "".join([sentence[0] for sentence in res[0]])
            translation_cache[cache_key] = translated
            save_cache()
            return translated
    except Exception as e:
        print(f"Translation failed: {e}")
        return text_stripped

# ─── BMI Logic ──────────────────────────────────────────────────

def bmi_from_imperial(weight_lbs, height_inches):
    """Calculate BMI from imperial measurements."""
    return (weight_lbs / (height_inches * height_inches)) * 703

def get_bmi_category(bmi):
    """Return BMI category key and label."""
    if bmi < 16.0:
        return ('severely_underweight', 'Severely Underweight')
    elif bmi < 18.5:
        return ('underweight', 'Underweight')
    elif bmi < 25.0:
        return ('normal', 'Normal Weight')
    elif bmi < 30.0:
        return ('overweight', 'Overweight')
    elif bmi < 35.0:
        return ('obese_i', 'Obese Class I')
    elif bmi < 40.0:
        return ('obese_ii', 'Obese Class II')
    else:
        return ('obese_iii', 'Obese Class III')

def get_health_risks(category_key):
    """Return health risks for each BMI category."""
    risks = {
        'severely_underweight': 'Severe underweight is associated with nutritional deficiencies, weakened immune system, osteoporosis, and fertility issues. Medical evaluation is strongly recommended.',
        'underweight': 'Underweight individuals may have lower bone density, reduced muscle mass, and potential nutritional deficiencies. A balanced diet with adequate protein and calories is recommended.',
        'normal': 'A normal BMI range is associated with the lowest risk of weight-related health problems. Maintain this range through balanced nutrition and regular physical activity.',
        'overweight': 'Overweight increases risk of high blood pressure, high cholesterol, Type 2 diabetes, and joint problems. A modest weight loss of 5% to 10% can significantly reduce these risks.',
        'obese_i': 'Class I obesity substantially increases risk of cardiovascular disease, Type 2 diabetes, sleep apnea, and joint disorders. Clinical weight management is recommended.',
        'obese_ii': 'Class II obesity carries high risk for metabolic syndrome, heart disease, stroke, and multiple comorbidities. Medical supervision for weight loss is strongly advised.',
        'obese_iii': 'Class III (severe) obesity poses the highest risk for premature mortality, severe cardiovascular disease, and complications from metabolic syndrome. Bariatric evaluation may be appropriate.',
    }
    return risks.get(category_key, '')

def inches_to_ft_str(inches):
    """Convert inches to feet'inches" string."""
    ft = inches // 12
    inc = inches % 12
    return f"{ft}'{inc}\""

def format_height_url(height_inches):
    """Format height for URL: 66 -> 5-6"""
    ft = height_inches // 12
    inc = height_inches % 12
    return f"{ft}-{inc}"

# ─── Layout Helpers ────────────────────────────────────────────

def extract_layout():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*/>', '', content)
    content = re.sub(r'\s*<link rel="canonical" href="[^"]+"\s*/?>', '', content)
    content = re.sub(r'\s*<script>window\.__ROUTE_BASEPATH__\s*=\s*"[^"]+";</script>', '', content)
    content = re.sub(r'\s*<script>window\.__TRANSLATIONS__\s*=\s*.*?</script>', '', content)
    content = content.replace('<script type="module" crossorigin src="/assets/index-Ctp2HkQJ.js"></script>', '')
    content = content.replace('<link rel="modulepreload" crossorigin href="/assets/router-BvPvcSMX.js">', '')
    content = content.replace('<link rel="modulepreload" crossorigin href="/assets/ui-BTK8ZW4o.js">', '')
    content = re.sub(r'\s*<div id="spa-loader".*?</style>\s*</div>', '', content, flags=re.DOTALL)
    header_idx = content.find('<header class="static-header"')
    body_start = content[content.find('<body>'):header_idx]
    header_part = content[header_idx:content.find('</header>') + 9]
    footer_part = content[content.find('<footer class="static-footer"'):]
    head_part = content[:content.find('</head>')]
    return head_part, body_start, header_part, footer_part

def build_hreflang_tags(clean_path):
    tags = []
    tags.append(f'    <link rel="alternate" hreflang="en-us" href="{domain}{clean_path}" />')
    for code, info in countries.items():
        cc_path = f'/{code}{clean_path}' if clean_path != '/' else f'/{code}/'
        tags.append(f'    <link rel="alternate" hreflang="{info["hreflang"]}" href="{domain}{cc_path}" />')
    tags.append(f'    <link rel="alternate" hreflang="x-default" href="{domain}{clean_path}" />')
    return '\n'.join(tags)

def build_language_switcher(clean_url_path, current_region):
    regions = {
        'us': {'name': '🇺🇸 English (US)', 'prefix': ''},
        'uk': {'name': '🇬🇧 English (UK)', 'prefix': '/uk'},
        'ca': {'name': '🇨🇦 English (CA)', 'prefix': '/ca'},
        'au': {'name': '🇦🇺 English (AU)', 'prefix': '/au'},
        'nz': {'name': '🇳🇿 English (NZ)', 'prefix': '/nz'},
        'zh': {'name': '🇨🇳 简体中文', 'prefix': '/zh'},
        'ru': {'name': '🇷🇺 Русский', 'prefix': '/ru'}
    }
    links_html = []
    order = ['us', 'uk', 'ca', 'au', 'nz', 'zh', 'ru']
    for r in order:
        info = regions[r]
        name = info['name']
        prefix = info['prefix']
        href = f"{prefix}{clean_url_path}"
        if r == current_region:
            style = "color: #4f46e5; font-weight: 600; text-decoration: none; padding: 0.25rem 0.5rem; background: #e0e7ff; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;"
        else:
            style = "color: #64748b; font-weight: 500; text-decoration: none; padding: 0.25rem 0.5rem; display: inline-flex; align-items: center; gap: 0.25rem;"
        link = f'<a href="{href}" style="{style}">{name}</a>'
        links_html.append(link)
    separator = '<span style="color: #cbd5e1; font-size: 0.75rem;">•</span>'
    joined_links = f'\n    {separator}\n    '.join(links_html)
    return (
        f'<div class="notranslate" translate="no" style="margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-family: sans-serif;">\n'
        f'  <span style="color: #64748b; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Region / Language</span>\n'
        f'  <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.875rem;">\n'
        f'    {separator.join(links_html)}\n'
        f'  </div>\n'
        f'</div>'
    )

def rewrite_links(html_content, country_prefix):
    pattern = r'href="(?!\/(assets|favicon|manifest|og-default|apple-touch-icon|3a5d9e1f2c4b7a6d8e0f1c3a5b7d9e2f|uk/|ca/|au/|nz/|zh/|ru/))\/([^"]*)"'
    def repl(match):
        path = match.group(2)
        return f'href="/{country_prefix}/{path}"'
    return re.sub(pattern, repl, html_content)

# ─── Main Generator ────────────────────────────────────────────

def main():
    print("=" * 60)
    print("PROGRAMMATIC BMI CALCULATOR PAGES GENERATOR")
    print("=" * 60)

    # 1. Generate all height × weight combinations
    # Heights: 56 inches (4'8") to 80 inches (6'8") in 1-inch steps
    heights = list(range(56, 81))
    # Weights: 80 to 400 lbs in 5 lb steps
    weights = list(range(80, 405, 5))

    combinations = []
    for h in heights:
        for w in weights:
            ft_str = inches_to_ft_str(h)
            bmi = bmi_from_imperial(w, h)
            cat_key, cat_label = get_bmi_category(bmi)
            combinations.append((h, w, ft_str, bmi, cat_key, cat_label))

    print(f"Generated {len(combinations)} BMI combinations ({len(heights)} heights × {len(weights)} weights)")

    # 2. Extract layouts
    head_base, body_start, header_part, footer_base = extract_layout()
    base_date = datetime.date(2026, 6, 15)

    programmatic_urls = []
    all_regions = ['us'] + list(countries.keys())
    counter = 0
    total_files = len(combinations) * 7

    for idx, (h_inches, weight_lbs, ft_str, bmi_val, cat_key, cat_label) in enumerate(combinations):
        bmi_rounded = round(bmi_val, 1)
        bmi_display = f"{bmi_val:.1f}"
        height_url = format_height_url(h_inches)

        # Meta data
        meta_title = f"BMI for {ft_str} {weight_lbs} lbs — BMI of {bmi_display} | Weight Loss Percentage"
        meta_desc = f"Calculate BMI for {ft_str} tall and {weight_lbs} lbs. BMI = {bmi_display} ({cat_label}). Dietitian-reviewed calculator and health assessment."

        # Determine healthy weight range for this height
        min_healthy = max(80, int(18.5 * (h_inches * h_inches) / 703))
        max_healthy = min(400, int(24.9 * (h_inches * h_inches) / 703))

        # Need to lose/gain to reach normal BMI
        if bmi_val > 24.9:
            target_for_normal = max_healthy
            need_to_lose = weight_lbs - target_for_normal
            direction = "lose"
            action_text = f"needs to lose {need_to_lose} lbs to reach a healthy BMI of 24.9 or lower."
        elif bmi_val < 18.5:
            target_for_normal = min_healthy
            need_to_gain = target_for_normal - weight_lbs
            direction = "gain"
            action_text = f"may need to gain {need_to_gain} lbs to reach a healthy BMI of 18.5 or higher."
        else:
            target_for_normal = 0
            direction = "maintain"
            action_text = f"is within the healthy BMI range of 18.5 to 24.9."

        # Recommend weight loss calculator link if overweight
        if bmi_val >= 25:
            calc_link = f'<a href="/calculators/weight-loss/">Weight Loss Calculator</a>'
            calc_line = f'Use our {calc_link} to create a safe plan to lose {need_to_lose} lbs.'
        else:
            calc_line = ''

        for region in all_regions:
            # Staggered lastmod
            days_offset = (idx * 3) % 45
            page_date = base_date + datetime.timedelta(days=days_offset)

            # Path: /calculators/bmi/height-weight/5-6/180/
            if region == 'us':
                clean_path = f"/calculators/bmi/height-weight/{height_url}/{weight_lbs}/"
                dest_dir = f"calculators/bmi/height-weight/{height_url}/{weight_lbs}"
            else:
                clean_path = f"/{region}/calculators/bmi/height-weight/{height_url}/{weight_lbs}/"
                dest_dir = f"{region}/calculators/bmi/height-weight/{height_url}/{weight_lbs}"

            programmatic_urls.append((clean_path, region, page_date))

            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)

            lang_code = countries[region]['hreflang'] if region != 'us' else 'en'
            # ── Build Head ──
            head_content = head_base.replace('<html lang="en">', f'<html lang="{lang_code}">')
            head_content += f'\n    <link rel="canonical" href="{domain}{clean_path}" />'
            head_content += '\n' + build_hreflang_tags(clean_path)
            title_pat = r'<title>.*?</title>'
            head_content = re.sub(title_pat, f'<title>{meta_title}</title>', head_content)
            desc_pat = r'<meta name="description" content="[^"]*" />'
            head_content = re.sub(desc_pat, f'<meta name="description" content="{meta_desc}" />', head_content)

            # Replace Open Graph and Twitter tags in head_content
            og_title_pat = r'<meta property="og:title" content="[^"]*" />'
            head_content = re.sub(og_title_pat, f'<meta property="og:title" content="{meta_title}" />', head_content)
            og_desc_pat = r'<meta property="og:description" content="[^"]*" />'
            head_content = re.sub(og_desc_pat, f'<meta property="og:description" content="{meta_desc}" />', head_content)
            og_url_pat = r'<meta property="og:url" content="[^"]*" />'
            head_content = re.sub(og_url_pat, f'<meta property="og:url" content="{domain}{clean_path}" />', head_content)
            tw_title_pat = r'<meta name="twitter:title" content="[^"]*" />'
            head_content = re.sub(tw_title_pat, f'<meta name="twitter:title" content="{meta_title}" />', head_content)
            tw_desc_pat = r'<meta name="twitter:description" content="[^"]*" />'
            head_content = re.sub(tw_desc_pat, f'<meta name="twitter:description" content="{meta_desc}" />', head_content)

            # Schemas
            schemas = f"""
    <!-- MedicalWebPage Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "url": "{domain}{clean_path}",
      "name": "{meta_title}",
      "description": "{meta_desc}",
      "audience": "{domain}/glossary/#adults",
      "about": {{
        "@type": "MedicalCondition",
        "name": "{cat_label}",
        "code": {{ "@type": "MedicalCode", "code": "E66", "codingSystem": "ICD-10" }}
      }}
    }}
    </script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "url": "{domain}{clean_path}",
      "name": "BMI Calculator for {ft_str} {weight_lbs} lbs",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "All"
    }}
    </script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{domain}/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Calculators", "item": "{domain}/calculators/" }},
        {{ "@type": "ListItem", "position": 3, "name": "BMI Calculator", "item": "{domain}/calculators/bmi/" }},
        {{ "@type": "ListItem", "position": 4, "name": "{ft_str} {weight_lbs} lbs", "item": "{domain}{clean_path}" }}
      ]
    }}
    </script>
            """
            head_content += schemas + "\n  </head>"

            # ── Footer ──
            clean_footer_part = re.sub(
                r'<div class="notranslate" translate="no" style="margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-family: sans-serif;">.*?</div>\s*(?:</div>\s*)+',
                '',
                footer_base,
                flags=re.DOTALL
            )
            footer_content = clean_footer_part
            if region != 'us':
                footer_content = rewrite_links(footer_content, region)
                if countries[region]['translate']:
                    footer_content = footer_content.replace("About Us", translate("About Us", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Contact Us", translate("Contact Us", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Privacy Policy", translate("Privacy Policy", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Terms of Service", translate("Terms of Service", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Medical Disclaimer", translate("Medical Disclaimer", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Glossary", translate("Glossary", countries[region]['target_lang']))
            switcher_html = build_language_switcher(clean_path, region)
            footer_pattern = r'(<footer class="static-footer"[^>]*>\s*<div style="max-width: 1200px; margin: 0 auto; text-align: center;">)'
            footer_content = re.sub(footer_pattern, lambda m: f'{m.group(1)}\n{switcher_html}', footer_content, count=1)

            header_content = header_part
            if region != 'us':
                header_content = rewrite_links(header_content, region)

            # ── Body Content ──
            # Related adjacent heights for internal linking
            adjacent_heights = []
            for delta in [-2, -1, 1, 2]:
                nh = h_inches + delta
                if 56 <= nh <= 80:
                    nft = inches_to_ft_str(nh)
                    n_url = format_height_url(nh)
                    adjacent_heights.append((nh, nft, n_url))

            adj_html = ""
            for nh, nft, n_url in adjacent_heights:
                n_bmi = bmi_from_imperial(weight_lbs, nh)
                n_cat = get_bmi_category(n_bmi)[1]
                if region == 'us':
                    path = f"/calculators/bmi/height-weight/{n_url}/{weight_lbs}/"
                else:
                    path = f"/{region}/calculators/bmi/height-weight/{n_url}/{weight_lbs}/"
                adj_html += f'<li><a href="{path}">BMI for {nft} {weight_lbs} lbs ({n_bmi:.1f})</a></li>\n'

            # Weight range table for this height
            weight_range_html = ""
            for display_w in range(max(80, weight_lbs - 40), min(401, weight_lbs + 45), 10):
                if display_w != weight_lbs:
                    w_bmi = bmi_from_imperial(display_w, h_inches)
                    w_cat = get_bmi_category(w_bmi)[1]
                    if region == 'us':
                        w_path = f"/calculators/bmi/height-weight/{height_url}/{display_w}/"
                    else:
                        w_path = f"/{region}/calculators/bmi/height-weight/{height_url}/{display_w}/"
                    weight_range_html += f'<a href="{w_path}" style="display:inline-block; padding:0.25rem 0.5rem; margin:0.15rem; background:#f1f5f9; border-radius:4px; font-size:0.8rem; text-decoration:none; color:#475569;">{display_w} lbs ({w_bmi:.1f})</a>\n'

            # Content
            health_risk = get_health_risks(cat_key)

            body_content = f"""
      <main id="main-content" style="max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; color: #334155;">
        <!-- Breadcrumbs -->
        <nav style="font-size: 0.825rem; color: #64748b; margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <a href="{" /" if region == 'us' else f"/{region}/"}" style="color: #64748b; text-decoration: none;">Home</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <a href="{" /calculators/" if region == 'us' else f"/{region}/calculators/"}" style="color: #64748b; text-decoration: none;">Calculators</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <a href="{" /calculators/bmi/" if region == 'us' else f"/{region}/calculators/bmi/"}" style="color: #64748b; text-decoration: none;">BMI Calculator</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <span style="color: #475569; font-weight: 500;">{ft_str} {weight_lbs} lbs</span>
        </nav>

        <h1 style="color: #0f172a; font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.25;">BMI for {ft_str} {weight_lbs} lbs</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 2rem;">Calculate your Body Mass Index for a height of <strong>{ft_str}</strong> and weight of <strong>{weight_lbs} lbs</strong>.</p>

        <!-- BMI Result Box -->
        <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; text-align: center;">
          <p style="margin: 0; font-size: 0.875rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Your BMI</p>
          <p style="margin: 0.5rem 0; font-size: 3.5rem; font-weight: 800; color: #4f46e5; line-height: 1;">{bmi_display}</p>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #0f172a;">{cat_label}</p>
          <p style="margin: 1rem 0 0 0; font-size: 0.9375rem; color: #475569;">A person {ft_str} tall weighing {weight_lbs} lbs {action_text}</p>
          {f'<p style="margin: 0.5rem 0 0 0; font-size: 0.9375rem; color: #475569;">{calc_line}</p>' if calc_line else ''}
        </div>

        <!-- BMI Category Breakdown -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 2.5rem;">
          <div style="padding: 1rem; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; text-align: center;">
            <p style="margin:0; font-size:0.75rem; color:#166534; font-weight:600; text-transform:uppercase;">Healthy Range</p>
            <p style="margin:0.25rem 0 0 0; font-size:1rem; font-weight:700; color:#065f46;">{min_healthy} – {max_healthy} lbs</p>
            <p style="margin:0; font-size:0.75rem; color:#166534;">for {ft_str} (BMI 18.5–24.9)</p>
          </div>
          <div style="padding: 1rem; border-radius: 8px; background: #fef3c7; border: 1px solid #fde68a; text-align: center;">
            <p style="margin:0; font-size:0.75rem; color:#92400e; font-weight:600; text-transform:uppercase;">Your Status</p>
            <p style="margin:0.25rem 0 0 0; font-size:1rem; font-weight:700; color:#78350f;">{cat_label}</p>
            <p style="margin:0; font-size:0.75rem; color:#92400e;">BMI {bmi_display}</p>
          </div>
          <div style="padding: 1rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
            <p style="margin:0; font-size:0.75rem; color:#475569; font-weight:600; text-transform:uppercase;">Should You Lose Weight?</p>
            {f'<p style="margin:0.25rem 0 0 0; font-size:1rem; font-weight:700; color:#dc2626;">Yes — lose {need_to_lose} lbs</p>' if bmi_val >= 25 else '<p style="margin:0.5rem 0 0 0; font-size:0.875rem; color:#16a34a;">Your weight is in the healthy range</p>'}
          </div>
        </div>

        <!-- Health Risks Section -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem;">Health Assessment for {ft_str} {weight_lbs} lbs</h2>
        <p>{health_risk}</p>
        {f'<p>To start your weight loss journey, use our <a href="/calculators/weight-loss/">weight loss calculator</a> to set safe targets. Our <a href="/calculators/tdee/">TDEE calculator</a> can help you understand your daily calorie needs, and our <a href="/calculators/calorie/">calorie calculator</a> can create a customized deficit plan.</p>' if bmi_val >= 25 else '<p>To maintain your healthy weight, use our <a href="/calculators/tdee/">TDEE calculator</a> to find your maintenance calories. Our <a href="/calculators/macro/">macro calculator</a> can help you balance your nutrition for optimal health.</p>'}

        <!-- Healthy Weight Range Info -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem;">Healthy BMI Weight Range for {ft_str}</h2>
        <p>For a person who is <strong>{ft_str}</strong> tall, the healthy BMI range of 18.5 to 24.9 corresponds to a weight range of <strong>{min_healthy} to {max_healthy} lbs</strong>. Your current weight of <strong>{weight_lbs} lbs</strong> places you in the <strong>{cat_label}</strong> category.</p>

        <!-- Related Heights (Internal Linking Mesh) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 0.75rem;">BMI for {weight_lbs} lbs at Similar Heights</h3>
          <ul style="font-size: 0.875rem; margin: 0; padding-left: 1.25rem;">
            {adj_html}
          </ul>
        </div>

        <!-- Nearby Weights (Internal Linking Mesh) -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #166534; margin-top: 0; margin-bottom: 0.75rem;">BMI for {ft_str} at Nearby Weights</h3>
          <div>
            {weight_range_html}
          </div>
        </div>

        <!-- BMI Table -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem;">BMI Classification Table</h2>
        <div style="overflow-x: auto; margin: 1rem 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #475569;">Classification</th>
                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #475569;">BMI Range</th>
                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #475569;">Weight Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9; {('background:#f0fdf4;' if cat_key=='normal' else '')}">
                <td style="padding: 0.75rem;">Underweight</td><td style="padding: 0.75rem;">&lt; 18.5</td><td style="padding: 0.75rem;">Below healthy weight</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; {('background:#f0fdf4;' if cat_key=='normal' else '')}">
                <td style="padding: 0.75rem;">Normal</td><td style="padding: 0.75rem;">18.5 – 24.9</td><td style="padding: 0.75rem;">Healthy weight</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; {('background:#fef3c7;' if cat_key=='overweight' else '')}">
                <td style="padding: 0.75rem;">Overweight</td><td style="padding: 0.75rem;">25 – 29.9</td><td style="padding: 0.75rem;">Excess weight</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; {('background:#fee2e2;' if cat_key.startswith('obese') else '')}">
                <td style="padding: 0.75rem;">Obese Class I</td><td style="padding: 0.75rem;">30 – 34.9</td><td style="padding: 0.75rem;">Moderate obesity</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; {('background:#fee2e2;' if cat_key.startswith('obese') else '')}">
                <td style="padding: 0.75rem;">Obese Class II</td><td style="padding: 0.75rem;">35 – 39.9</td><td style="padding: 0.75rem;">Severe obesity</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; {('background:#fee2e2;' if cat_key.startswith('obese') else '')}">
                <td style="padding: 0.75rem;">Obese Class III</td><td style="padding: 0.75rem;">40+</td><td style="padding: 0.75rem;">Very severe obesity</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- FAQ -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">Frequently Asked Questions</h2>
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;">Q: What does a BMI of {bmi_display} mean for someone {ft_str} tall?</p>
          <p style="margin: 0; color: #475569;">A BMI of {bmi_display} for a {ft_str} individual classifies you as <strong>{cat_label}</strong>. {health_risk}</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;">Q: What is the ideal weight for someone {ft_str} tall?</p>
          <p style="margin: 0; color: #475569;">For a height of {ft_str}, the healthy weight range is <strong>{min_healthy} to {max_healthy} lbs</strong> (BMI 18.5 to 24.9). Use our <a href="/calculators/bmi/">BMI calculator</a> to check any weight.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;">Q: How is BMI calculated for {ft_str} {weight_lbs} lbs?</p>
          <p style="margin: 0; color: #475569;">BMI = (weight in lbs ÷ height in inches²) × 703. For {ft_str} ({h_inches} inches) and {weight_lbs} lbs: ({weight_lbs} ÷ {h_inches}²) × 703 = <strong>{bmi_display}</strong>.</p>
        </div>
        {f'''
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;">Q: How can I lower my BMI from {bmi_display} to a healthy range?</p>
          <p style="margin: 0; color: #475569;">To reach a healthy BMI, you would need to lose approximately <strong>{need_to_lose} lbs</strong>. A safe rate is 0.5 to 2 lbs per week through a moderate calorie deficit. Use our <a href="/calculators/weight-loss/">weight loss calculator</a> to create a personalized plan.</p>
        </div>
        ''' if bmi_val >= 25 else ''}
      </main>
            """

            html_document = f"{head_content}\n{body_start}\n{header_content}\n{body_content}\n{footer_content}"

            dest_file = os.path.join(dest_dir, "index.html")
            with open(dest_file, 'w', encoding='utf-8') as out_f:
                out_f.write(html_document)

            counter += 1
            if counter % 500 == 0:
                print(f"Generated {counter}/{total_files} BMI pages...")

    print(f"\nTotal {counter} BMI calculator pages generated successfully!")

    # ── Generate Sitemap ──
    print("Generating sitemap-bmi.xml...")
    sitemap_header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_footer = '</urlset>\n'
    sitemap_entries = []
    programmatic_urls.sort(key=lambda x: x[0])
    for url_path, region, page_date in programmatic_urls:
        entry = (
            f"  <url>\n"
            f"    <loc>{domain}{url_path}</loc>\n"
            f"    <lastmod>{page_date.isoformat()}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>0.7</priority>\n"
            f"  </url>\n"
        )
        sitemap_entries.append(entry)

    sitemap_filename = "sitemap-bmi.xml"
    with open(sitemap_filename, 'w', encoding='utf-8') as f:
        f.write(sitemap_header + "".join(sitemap_entries) + sitemap_footer)
    print(f"Generated {sitemap_filename} with {len(programmatic_urls)} URLs.")

    # Register in master sitemap
    print("Updating master sitemap.xml...")
    if os.path.exists('sitemap.xml'):
        with open('sitemap.xml', 'r', encoding='utf-8') as f:
            sitemap_idx = f.read()
        if "sitemap-bmi.xml" not in sitemap_idx:
            new_entry = (
                f"  <sitemap>\n"
                f"    <loc>{domain}/sitemap-bmi.xml</loc>\n"
                f"    <lastmod>{datetime.date.today().isoformat()}</lastmod>\n"
                f"  </sitemap>\n"
            )
            sitemap_idx = sitemap_idx.replace('</sitemapindex>', new_entry + '</sitemapindex>')
            with open('sitemap.xml', 'w', encoding='utf-8') as f:
                f.write(sitemap_idx)
            print("Registered sitemap-bmi.xml in master sitemap.")
        else:
            print("Already registered.")


if __name__ == '__main__':
    main()
