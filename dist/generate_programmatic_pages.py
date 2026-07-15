import os
import re
import shutil
import json
import urllib.request
import urllib.parse
from html.parser import HTMLParser

# 1. Configuration
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

# --- Translation cache ---
cache_file = 'translation_cache.json'
translation_cache = {}
if os.path.exists(cache_file):
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
    except Exception as e:
        print(f"Error loading cache: {e}")

def save_cache():
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving cache: {e}")

def translate(text, target_lang):
    text_stripped = text.strip()
    if not text_stripped:
        return text
    
    # Check cache
    cache_key = f"{target_lang}:{text_stripped}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
        
    # Call Google Translate API
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
        print(f"Translation failed for '{text_stripped}': {e}")
        return text_stripped

# Pre-translate templates to optimize runtime speed
def get_translated_templates():
    print("Preparing translations for templates...")
    templates = {
        'title': "Weight Loss Percentage from {start} to {target} lbs: Safe Deficit Plan",
        'description': "Calculate the weight loss percentage from {start} to {target} lbs ({pct}%). Get a customized calorie deficit, safe weekly timeline, and health guidance.",
        'h1': "Weight Loss Percentage from {start} to {target} lbs",
        'summary_title': "Calculation Summary",
        'start_weight_label': "Starting Weight",
        'target_weight_label': "Target Weight",
        'lbs_lost_label': "Total Weight Loss",
        'pct_lost_label': "Weight Loss Percentage",
        'clinical_cat_label': "Clinical Classification",
        'deficit_label': "Total Calorie Deficit",
        'interactive_title': "Interactive Weight Loss Estimator",
        'interactive_instruction': "Adjust the sliders below to calculate custom weight loss milestones dynamically:",
        'health_title': "Metabolic & Clinical Health Implications",
        'health_intro': "Shedding body weight triggers distinct biochemical adjustments in human metabolism. Understanding your weight loss percentage helps set clinically sound expectations:",
        'mild_title': "Mild Weight Loss (Less than 5%)",
        'mild_desc': "A modest reduction is a great starting milestone. Clinical studies show it reduces stress on weight-bearing joints, improves joint mobility, and initiates initial improvements in lipid profiles.",
        'mod_title': "Clinically Significant Weight Loss (5% to 9.9%)",
        'mod_desc': "Reaching this bracket is a major health achievement. It is clinically proven to reduce blood pressure, lower LDL cholesterol, improve glycemic control, and reduce risk factors for Type 2 diabetes.",
        'maj_title': "Major Metabolic Weight Loss (10% or more)",
        'maj_desc': "Losing 10% or more of your body weight provides deep, long-lasting health benefits. It is associated with significant improvements in cardiovascular function, sleep apnea, liver health, and overall metabolic stability.",
        'deficit_title': "Safe Deficit & Weekly Timeline Options",
        'deficit_desc': "To lose weight sustainably, maintain a moderate calorie deficit. Below is a breakdown of timelines based on safe weekly weight loss targets:",
        'table_header_pace': "Weekly Rate",
        'table_header_deficit': "Daily Calorie Deficit",
        'table_header_timeline': "Estimated Timeline",
        'table_header_sustain': "Sustainability Score",
        'table_header_recommended': "Recommended For",
        'rate_half_pound': "0.5 lbs / week",
        'rate_one_pound': "1.0 lbs / week",
        'rate_two_pounds': "2.0 lbs / week",
        'deficit_half_pound': "-250 kcal / day",
        'deficit_one_pound': "-500 kcal / day",
        'deficit_two_pounds': "-1000 kcal / day",
        'sustain_high': "Excellent (95%)",
        'sustain_medium': "Good (80%)",
        'sustain_low': "Moderate (50%)",
        'rec_high': "Long-term maintenance & lifestyle change",
        'rec_medium': "Standard fat loss & active individuals",
        'rec_low': "Obese profiles under medical supervision",
        'faq_title': "Frequently Asked Questions",
        'faq_q1': "Is losing {lbs} lbs from {start} lbs safe?",
        'faq_a1': "Yes, losing {lbs} lbs ({pct}%) is safe if done at a rate of 0.5 to 2.0 lbs per week. This transition should take approximately {weeks_range} weeks. Rapid weight loss can lead to muscle wasting and nutrient deficiencies.",
        'faq_q2': "How many calories should I cut to go from {start} to {target} lbs?",
        'faq_a2': "To achieve a total weight loss of {lbs} lbs, you must create a cumulative deficit of {deficit} calories. A daily deficit of 500 calories will help you reach your target weight in {weeks_1lb} weeks.",
        'faq_q3': "Why is tracking weight loss as a percentage better than pounds?",
        'faq_a3': "Tracking percentages normalized progress relative to your starting size. For example, losing 20 lbs is a 10% reduction for a 200 lb individual, but a 20% reduction for a 100 lb individual, carrying different metabolic impacts.",
        'breadcrumb_home': "Home",
        'breadcrumb_calc': "Calculators",
        'breadcrumb_weight': "Weight Loss Percentage",
        'breadcrumb_from_to': "From {start} to {target} lbs",
        'weeks_suffix': "weeks",
    }
    
    placeholders = {
        '{start}': '__START__',
        '{target}': '__TARGET__',
        '{lbs}': '__LBS__',
        '{pct}': '__PCT__',
        '{deficit}': '__DEFICIT__',
        '{weeks_range}': '__WEEKS_RANGE__',
        '{weeks_1lb}': '__WEEKS_1LB__'
    }
    
    localized = {}
    for code, info in countries.items():
        if info['translate']:
            lang = info['target_lang']
            print(f"Translating templates to {info['name']} ({lang})...")
            loc_map = {}
            for k, val in templates.items():
                temp_val = val
                for ph, tag in placeholders.items():
                    temp_val = temp_val.replace(ph, tag)
                
                translated_val = translate(temp_val, lang)
                
                for ph, tag in placeholders.items():
                    translated_val = translated_val.replace(tag, ph)
                    translated_val = translated_val.replace(tag.lower(), ph)
                    translated_val = translated_val.replace(tag.replace('_', ' '), ph)
                    translated_val = translated_val.replace(tag.lower().replace('_', ' '), ph)
                    # Handle Google Translate spacing issues like "__ START __"
                    spaced_tag = tag.replace('_', ' ')
                    translated_val = translated_val.replace(f"__ {spaced_tag.replace('__', '').strip()} __", ph)
                    translated_val = translated_val.replace(f"__ {spaced_tag.lower().replace('__', '').strip()} __", ph)
                
                loc_map[k] = translated_val
            localized[code] = loc_map
        else:
            # For English, just copy templates
            localized[code] = templates.copy()
            # If it's a specific region, apply spelling maps
            if code in ['uk', 'ca', 'au', 'nz']:
                for k, val in localized[code].items():
                    for us_term, local_term in spelling_map.items():
                        localized[code][k] = localized[code][k].replace(us_term, local_term)
                        
    # Add default US templates
    localized['us'] = templates.copy()
    return localized

# --- Helper to clean index.html ---
def extract_layout():
    """Reads index.html and extracts head and container elements to serve as a wrapper."""
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove any existing hreflangs and switcher blocks in the source index
    content = re.sub(r'\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*/>', '', content)
    content = re.sub(r'\s*<link rel="canonical" href="[^"]+"\s*/?>', '', content)
    content = re.sub(r'\s*<script>window\.__ROUTE_BASEPATH__\s*=\s*"[^"]+";</script>', '', content)
    content = re.sub(r'\s*<script>window\.__TRANSLATIONS__\s*=\s*.*?</script>', '', content)
    
    # We strip out the SPA module script so React router doesn't unmount the page
    content = content.replace('<script type="module" crossorigin src="/assets/index-Ctp2HkQJ.js"></script>', '')
    content = content.replace('<link rel="modulepreload" crossorigin href="/assets/router-BvPvcSMX.js">', '')
    content = content.replace('<link rel="modulepreload" crossorigin href="/assets/ui-BTK8ZW4o.js">', '')
    
    # Strip the spa-loader since these pages do not hydrate with SPA JS
    content = re.sub(r'\s*<div id="spa-loader".*?</style>\s*</div>', '', content, flags=re.DOTALL)
    
    # Locate header and footer wrappers
    header_idx = content.find('<header class="static-header"')
    footer_idx = content.find('<footer class="static-footer"')
    
    head_part = content[:content.find('</head>')]
    body_start = content[content.find('<body>'):header_idx]
    header_part = content[header_idx:content.find('</header>') + 9]
    footer_part = content[footer_idx:]
    
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
    
    switcher_html = (
        f'<div class="notranslate" translate="no" style="margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-family: sans-serif;">\n'
        f'  <span style="color: #64748b; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Region / Language</span>\n'
        f'  <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.875rem;">\n'
        f'    {joined_links}\n'
        f'  </div>\n'
        f'</div>'
    )
    return switcher_html

def rewrite_links(html_content, country_prefix):
    pattern = r'href="(?!\/(assets|favicon|manifest|og-default|apple-touch-icon|3a5d9e1f2c4b7a6d8e0f1c3a5b7d9e2f|uk/|ca/|au/|nz/|zh/|ru/))\/([^"]*)"'
    def repl(match):
        path = match.group(2)
        return f'href="/{country_prefix}/{path}"'
    return re.sub(pattern, repl, html_content)

# --- Generator Loop ---
def main():
    print("Initializing programmatic SEO generator...")
    
    # 1. Prepare weight list
    # Start Weight: 100 to 350 in steps of 10
    # Target Weight: 90 to 340 in steps of 10
    start_weights = range(100, 360, 10)
    target_weights = range(90, 350, 10)
    
    combinations = []
    for s in start_weights:
        for t in target_weights:
            if t < s:
                combinations.append((s, t))
    print(f"Generated {len(combinations)} weight-loss combinations.")
    
    # 2. Extract layouts and translations
    head_base, body_start, header_part, footer_base = extract_layout()
    localized_templates = get_translated_templates()
    
    # 3. Clean existing paths if run again
    # Clear sitemap entries
    programmatic_urls = []
    
    # Base layout assets paths (fix relative links for deeper folders)
    # Since our files are inside calculators/weight-loss/from-start-to-target/index.html (3 levels down),
    # absolute paths (starting with /) are fine since they are served from root.
    
    counter = 0
    total_files = len(combinations) * 7 # 7 regions
    
    # We will generate US first, then UK, CA, AU, NZ, ZH, RU
    all_regions = ['us'] + list(countries.keys())
    
    for s, t in combinations:
        lbs = s - t
        pct = (lbs / s) * 100
        deficit = lbs * 3500
        
        # Clinical classification thresholds
        if pct < 5:
            cat_key = 'mild_title'
            cat_desc_key = 'mild_desc'
            cat_name_en = "Mild Weight Loss"
        elif pct < 10:
            cat_key = 'mod_title'
            cat_desc_key = 'mod_desc'
            cat_name_en = "Clinically Significant Weight Loss"
        else:
            cat_key = 'maj_title'
            cat_desc_key = 'maj_desc'
            cat_name_en = "Major Metabolic Weight Loss"
            
        weeks_05 = lbs / 0.5
        weeks_1 = lbs / 1.0
        weeks_2 = lbs / 2.0
        
        for region in all_regions:
            lang_tpl = localized_templates[region]
            
            # Format text templates
            meta_title = lang_tpl['title'].format(start=s, target=t, pct=f"{pct:.2f}")
            meta_desc = lang_tpl['description'].format(start=s, target=t, pct=f"{pct:.2f}")
            h1_text = lang_tpl['h1'].format(start=s, target=t)
            
            # Format FAQs
            faq_q1_text = lang_tpl['faq_q1'].format(lbs=lbs, start=s, pct=f"{pct:.2f}")
            faq_a1_text = lang_tpl['faq_a1'].format(lbs=lbs, start=s, pct=f"{pct:.2f}", weeks_range=f"{weeks_1:.1f}-{weeks_05:.1f}")
            
            faq_q2_text = lang_tpl['faq_q2'].format(start=s, target=t, lbs=lbs)
            faq_a2_text = lang_tpl['faq_a2'].format(start=s, target=t, lbs=lbs, deficit=f"{deficit:,}", weeks_1lb=f"{weeks_1:.1f}")
            
            faq_q3_text = lang_tpl['faq_q3'].format(start=s, target=t)
            faq_a3_text = lang_tpl['faq_a3'].format(start=s, target=t, lbs=lbs)
            
            # Determine path
            rel_url_path = f"/calculators/weight-loss/from-{s}-to-{t}/"
            if region == 'us':
                canonical_path = rel_url_path
                dest_dir = f"calculators/weight-loss/from-{s}-to-{t}"
            else:
                canonical_path = f"/{region}{rel_url_path}"
                dest_dir = f"{region}/calculators/weight-loss/from-{s}-to-{t}"
                
            programmatic_urls.append(canonical_path)
            
            # Create directory
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)
                
            lang_code = countries[region]['hreflang'] if region != 'us' else 'en'
            # Build Head
            head_content = head_base.replace('<html lang="en">', f'<html lang="{lang_code}">')
            # Add canonical
            head_content += f'\n    <link rel="canonical" href="{domain}{canonical_path}" />'
            # Add hreflangs
            head_content += '\n' + build_hreflang_tags(rel_url_path)
            # Add title
            title_pat = r'<title>.*?</title>'
            head_content = re.sub(title_pat, f'<title>{meta_title}</title>', head_content)
            # Add meta description
            desc_pat = r'<meta name="description" content="[^"]*" />'
            head_content = re.sub(desc_pat, f'<meta name="description" content="{meta_desc}" />', head_content)
            
            # Replace Open Graph and Twitter tags in head_content
            og_title_pat = r'<meta property="og:title" content="[^"]*" />'
            head_content = re.sub(og_title_pat, f'<meta property="og:title" content="{meta_title}" />', head_content)
            og_desc_pat = r'<meta property="og:description" content="[^"]*" />'
            head_content = re.sub(og_desc_pat, f'<meta property="og:description" content="{meta_desc}" />', head_content)
            og_url_pat = r'<meta property="og:url" content="[^"]*" />'
            head_content = re.sub(og_url_pat, f'<meta property="og:url" content="{domain}{canonical_path}" />', head_content)
            tw_title_pat = r'<meta name="twitter:title" content="[^"]*" />'
            head_content = re.sub(tw_title_pat, f'<meta name="twitter:title" content="{meta_title}" />', head_content)
            tw_desc_pat = r'<meta name="twitter:description" content="[^"]*" />'
            head_content = re.sub(tw_desc_pat, f'<meta name="twitter:description" content="{meta_desc}" />', head_content)
            
            # Build Schemas
            schemas_js = f"""
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": "{domain}{canonical_path}#webapp",
      "url": "{domain}{canonical_path}",
      "name": "{meta_title}",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "about": {{
        "@type": "HealthTopic",
        "name": "{lang_tpl['breadcrumb_weight']}",
        "description": "{meta_desc}"
      }}
    }}
    </script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{
          "@type": "ListItem",
          "position": 1,
          "name": "{lang_tpl['breadcrumb_home']}",
          "item": "{domain}/{'' if region == 'us' else region + '/'}"
        }},
        {{
          "@type": "ListItem",
          "position": 2,
          "name": "{lang_tpl['breadcrumb_calc']}",
          "item": "{domain}{'/' if region == 'us' else '/' + region + '/'}calculators/"
        }},
        {{
          "@type": "ListItem",
          "position": 3,
          "name": "{lang_tpl['breadcrumb_weight']}",
          "item": "{domain}{'/' if region == 'us' else '/' + region + '/'}calculators/weight-loss/"
        }},
        {{
          "@type": "ListItem",
          "position": 4,
          "name": "{lang_tpl['breadcrumb_from_to'].format(start=s, target=t)}",
          "item": "{domain}{canonical_path}"
        }}
      ]
    }}
    </script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{
          "@type": "Question",
          "name": "{faq_q1_text}",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "{faq_a1_text}"
          }}
        }},
        {{
          "@type": "Question",
          "name": "{faq_q2_text}",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "{faq_a2_text}"
          }}
        }},
        {{
          "@type": "Question",
          "name": "{faq_q3_text}",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "{faq_a3_text}"
          }}
        }}
      ]
    }}
    </script>
            """
            head_content += schemas_js + "\n  </head>"
            
            # Clean footer base
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
                    # Simple translate terms inside footer for CN/RU
                    footer_content = footer_content.replace("About Us", translate("About Us", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Contact Us", translate("Contact Us", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Privacy Policy", translate("Privacy Policy", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Terms of Service", translate("Terms of Service", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Medical Disclaimer", translate("Medical Disclaimer", countries[region]['target_lang']))
                    footer_content = footer_content.replace("Glossary", translate("Glossary", countries[region]['target_lang']))
                    footer_content = footer_content.replace("All rights reserved. Free dietitian-reviewed health and fitness tools.", 
                                                            translate("All rights reserved. Free dietitian-reviewed health and fitness tools.", countries[region]['target_lang']))
                else:
                    # Apply UK/CA spellings in footer
                    for us_term, local_term in spelling_map.items():
                        footer_content = footer_content.replace(us_term, local_term)

            # Build Language Switcher
            switcher_html = build_language_switcher(rel_url_path, region)
            
            # Re-insert the switcher in the footer
            footer_pattern = r'(<footer class="static-footer"[^>]*>\s*<div style="max-width: 1200px; margin: 0 auto; text-align: center;">)'
            footer_content = re.sub(footer_pattern, lambda m: f'{m.group(1)}\n{switcher_html}', footer_content, count=1)
            
            # Prefix header links
            header_content = header_part
            if region != 'us':
                header_content = rewrite_links(header_content, region)

            # Build body main content (Static template + Slider JS)
            main_body_content = f"""
      <main id="main-content" style="max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; color: #334155;">
        <!-- Breadcrumbs UI -->
        <nav style="font-size: 0.825rem; color: #64748b; margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <a href="{"/" if region == 'us' else f"/{region}/"}" style="color: #64748b; text-decoration: none;">{lang_tpl['breadcrumb_home']}</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <a href="{"/calculators/" if region == 'us' else f"/{region}/calculators/"}" style="color: #64748b; text-decoration: none;">{lang_tpl['breadcrumb_calc']}</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <a href="{"/calculators/weight-loss/" if region == 'us' else f"/{region}/calculators/weight-loss/"}" style="color: #64748b; text-decoration: none;">{lang_tpl['breadcrumb_weight']}</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <span style="color: #475569; font-weight: 500;">{lang_tpl['breadcrumb_from_to'].format(start=s, target=t)}</span>
        </nav>

        <h1 style="color: #0f172a; font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; line-height: 1.25;">{h1_text}</h1>
        
        <!-- Calculation Summary Box -->
        <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <h2 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem;">{lang_tpl['summary_title']}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <div>
              <p style="margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">{lang_tpl['start_weight_label']}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #334155;" id="ui-start">{s} lbs</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">{lang_tpl['target_weight_label']}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #334155;" id="ui-target">{t} lbs</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">{lang_tpl['lbs_lost_label']}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #10b981;" id="ui-lost">{lbs} lbs</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">{lang_tpl['pct_lost_label']}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 1.5rem; font-weight: 800; color: #4f46e5;" id="ui-pct">{pct:.2f}%</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">{lang_tpl['clinical_cat_label']}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; font-weight: 700; color: #f97316;" id="ui-cat">{lang_tpl[cat_key]}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">{lang_tpl['deficit_label']}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 1.125rem; font-weight: 700; color: #0284c7;" id="ui-deficit">{deficit:,} kcal</p>
            </div>
          </div>
        </div>

        <!-- Interactive Estimator Sliders -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2.5rem;">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 0.5rem;">{lang_tpl['interactive_title']}</h3>
          <p style="font-size: 0.875rem; color: #64748b; margin-top: 0; margin-bottom: 1.5rem;">{lang_tpl['interactive_instruction']}</p>
          
          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">
              <span>{lang_tpl['start_weight_label']}:</span>
              <span id="slider-start-val">{s} lbs</span>
            </div>
            <input type="range" id="start-weight-slider" min="100" max="350" step="10" value="{s}" style="width: 100%; height: 6px; background: #cbd5e1; border-radius: 3px; outline: none; cursor: pointer; accent-color: #4f46e5;">
          </div>
          
          <div style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">
              <span>{lang_tpl['target_weight_label']}:</span>
              <span id="slider-target-val">{t} lbs</span>
            </div>
            <input type="range" id="target-weight-slider" min="90" max="340" step="10" value="{t}" style="width: 100%; height: 6px; background: #cbd5e1; border-radius: 3px; outline: none; cursor: pointer; accent-color: #4f46e5;">
          </div>
        </div>

        <!-- Section 1: Health implications -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem;">{lang_tpl['health_title']}</h2>
        <p>{lang_tpl['health_intro']}</p>
        
        <ul style="list-style-type: none; padding-left: 0;">
          <li style="margin-bottom: 1.25rem; padding-left: 1.5rem; border-left: 4px solid #10b981;">
            <strong style="color: #0f172a; display: block; margin-bottom: 0.25rem;">{lang_tpl['mild_title']}</strong>
            <span style="color: #475569; font-size: 0.9375rem;">{lang_tpl['mild_desc']}</span>
          </li>
          <li style="margin-bottom: 1.25rem; padding-left: 1.5rem; border-left: 4px solid #f97316;">
            <strong style="color: #0f172a; display: block; margin-bottom: 0.25rem;">{lang_tpl['mod_title']}</strong>
            <span style="color: #475569; font-size: 0.9375rem;">{lang_tpl['mod_desc']}</span>
          </li>
          <li style="margin-bottom: 1.25rem; padding-left: 1.5rem; border-left: 4px solid #4f46e5;">
            <strong style="color: #0f172a; display: block; margin-bottom: 0.25rem;">{lang_tpl['maj_title']}</strong>
            <span style="color: #475569; font-size: 0.9375rem;">{lang_tpl['maj_desc']}</span>
          </li>
        </ul>

        <!-- Section 2: Deficit Pace -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">{lang_tpl['deficit_title']}</h2>
        <p>{lang_tpl['deficit_desc']}</p>

        <!-- Deficit Pace Table -->
        <div style="overflow-x: auto; margin: 1.5rem 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: #475569;">{lang_tpl['table_header_pace']}</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: #475569;">{lang_tpl['table_header_deficit']}</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: #475569;">{lang_tpl['table_header_timeline']}</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: #475569;">{lang_tpl['table_header_sustain']}</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: #475569;">{lang_tpl['table_header_recommended']}</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500; color: #0f172a;">{lang_tpl['rate_half_pound']}</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">{lang_tpl['deficit_half_pound']}</td>
                <td style="padding: 0.75rem 1rem; color: #475569; font-weight: 600;" id="table-weeks-05">{weeks_05:.1f} {lang_tpl['weeks_suffix']}</td>
                <td style="padding: 0.75rem 1rem; color: #10b981; font-weight: 500;">{lang_tpl['sustain_high']}</td>
                <td style="padding: 0.75rem 1rem; color: #64748b;">{lang_tpl['rec_high']}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500; color: #0f172a;">{lang_tpl['rate_one_pound']}</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">{lang_tpl['deficit_one_pound']}</td>
                <td style="padding: 0.75rem 1rem; color: #475569; font-weight: 600;" id="table-weeks-1">{weeks_1:.1f} {lang_tpl['weeks_suffix']}</td>
                <td style="padding: 0.75rem 1rem; color: #f59e0b; font-weight: 500;">{lang_tpl['sustain_medium']}</td>
                <td style="padding: 0.75rem 1rem; color: #64748b;">{lang_tpl['rec_medium']}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500; color: #0f172a;">{lang_tpl['rate_two_pounds']}</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">{lang_tpl['deficit_two_pounds']}</td>
                <td style="padding: 0.75rem 1rem; color: #475569; font-weight: 600;" id="table-weeks-2">{weeks_2:.1f} {lang_tpl['weeks_suffix']}</td>
                <td style="padding: 0.75rem 1rem; color: #ef4444; font-weight: 500;">{lang_tpl['sustain_low']}</td>
                <td style="padding: 0.75rem 1rem; color: #64748b;">{lang_tpl['rec_low']}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section 3: FAQ -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem;">{lang_tpl['faq_title']}</h2>
        
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;" id="faq-q1">Q: {faq_q1_text}</p>
          <p style="margin: 0; color: #475569;" id="faq-a1">{faq_a1_text}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;" id="faq-q2">Q: {faq_q2_text}</p>
          <p style="margin: 0; color: #475569;" id="faq-a2">{faq_a2_text}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;" id="faq-q3">Q: {faq_q3_text}</p>
          <p style="margin: 0; color: #475569;" id="faq-a3">{faq_a3_text}</p>
        </div>
      </main>

      <!-- Slider JavaScript logic -->
      <script>
      document.addEventListener("DOMContentLoaded", function() {{
        var startSlider = document.getElementById("start-weight-slider");
        var targetSlider = document.getElementById("target-weight-slider");
        
        var startLabelVal = document.getElementById("slider-start-val");
        var targetLabelVal = document.getElementById("slider-target-val");
        
        var uiStart = document.getElementById("ui-start");
        var uiTarget = document.getElementById("ui-target");
        var uiLost = document.getElementById("ui-lost");
        var uiPct = document.getElementById("ui-pct");
        var uiCat = document.getElementById("ui-cat");
        var uiDeficit = document.getElementById("ui-deficit");
        
        var weeks05 = document.getElementById("table-weeks-05");
        var weeks1 = document.getElementById("table-weeks-1");
        var weeks2 = document.getElementById("table-weeks-2");
        
        var faqQ1 = document.getElementById("faq-q1");
        var faqA1 = document.getElementById("faq-a1");
        var faqQ2 = document.getElementById("faq-q2");
        var faqA2 = document.getElementById("faq-a2");
        var faqA3 = document.getElementById("faq-a3");
        
        var catTitles = {{
          mild: "{lang_tpl['mild_title']}",
          mod: "{lang_tpl['mod_title']}",
          maj: "{lang_tpl['maj_title']}"
        }};
        
        var langTerms = {{
          weeks_suffix: "{lang_tpl['weeks_suffix']}",
          faq_q1_tpl: {json.dumps(lang_tpl['faq_q1'], ensure_ascii=False)},
          faq_a1_tpl: {json.dumps(lang_tpl['faq_a1'], ensure_ascii=False)},
          faq_q2_tpl: {json.dumps(lang_tpl['faq_q2'], ensure_ascii=False)},
          faq_a2_tpl: {json.dumps(lang_tpl['faq_a2'], ensure_ascii=False)},
          faq_a3_tpl: {json.dumps(lang_tpl['faq_a3'], ensure_ascii=False)}
        }};

        function calculate() {{
          var s = parseFloat(startSlider.value);
          var t = parseFloat(targetSlider.value);
          
          if (t >= s) {{
            t = s - 10;
            targetSlider.value = t;
          }}
          
          startLabelVal.textContent = s + " lbs";
          targetLabelVal.textContent = t + " lbs";
          
          uiStart.textContent = s + " lbs";
          uiTarget.textContent = t + " lbs";
          
          var lbs = s - t;
          var pct = (lbs / s) * 100;
          var deficit = lbs * 3500;
          
          uiLost.textContent = lbs + " lbs";
          uiPct.textContent = pct.toFixed(2) + "%";
          uiDeficit.textContent = deficit.toLocaleString() + " kcal";
          
          // Categorization
          var catText = catTitles.mild;
          if (pct >= 5 && pct < 10) {{
            catText = catTitles.mod;
          }} else if (pct >= 10) {{
            catText = catTitles.maj;
          }}
          uiCat.textContent = catText;
          
          // Timelines
          var w05 = lbs / 0.5;
          var w1 = lbs / 1.0;
          var w2 = lbs / 2.0;
          
          weeks05.textContent = w05.toFixed(1) + " " + langTerms.weeks_suffix;
          weeks1.textContent = w1.toFixed(1) + " " + langTerms.weeks_suffix;
          weeks2.textContent = w2.toFixed(1) + " " + langTerms.weeks_suffix;
          
          // FAQs update
          faqQ1.innerHTML = "Q: " + langTerms.faq_q1_tpl.replace("{{lbs}}", lbs).replace("{{start}}", s).replace("{{pct}}", pct.toFixed(2));
          faqA1.innerHTML = langTerms.faq_a1_tpl.replace("{{lbs}}", lbs).replace("{{start}}", s).replace("{{pct}}", pct.toFixed(2)).replace("{{weeks_range}}", w1.toFixed(1) + "-" + w05.toFixed(1));
          
          faqQ2.innerHTML = "Q: " + langTerms.faq_q2_tpl.replace("{{start}}", s).replace("{{target}}", t).replace("{{lbs}}", lbs);
          faqA2.innerHTML = langTerms.faq_a2_tpl.replace("{{start}}", s).replace("{{target}}", t).replace("{{lbs}}", lbs).replace("{{deficit}}", deficit.toLocaleString()).replace("{{weeks_1lb}}", w1.toFixed(1));
          
          faqA3.innerHTML = langTerms.faq_a3_tpl.replace("{{start}}", s).replace("{{target}}", t).replace("{{lbs}}", lbs);
        }}
        
        startSlider.addEventListener("input", calculate);
        targetSlider.addEventListener("input", calculate);
      }});
      </script>
            """
            
            # Combine into final document
            html_document = f"{head_content}\n{body_start}\n{header_content}\n{main_body_content}\n{footer_content}"
            
            # Write to disk
            dest_file = os.path.join(dest_dir, "index.html")
            with open(dest_file, 'w', encoding='utf-8') as out_f:
                out_f.write(html_document)
                
            counter += 1
            if counter % 100 == 0:
                print(f"Generated {counter}/{total_files} files...")
                
    print(f"Total {counter} programmatic landing pages generated successfully.")
    
    # 4. Generate Silo Sitemap
    print("Generating sitemap-from-to-weight.xml...")
    import datetime
    current_date = datetime.date.today().isoformat()
    
    sitemap_header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_footer = '</urlset>\n'
    
    sitemap_entries = []
    programmatic_urls.sort()
    for url in programmatic_urls:
        entry = (
            f"  <url>\n"
            f"    <loc>{domain}{url}</loc>\n"
            f"    <lastmod>{current_date}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>0.6</priority>\n"
            f"  </url>\n"
        )
        sitemap_entries.append(entry)
        
    sitemap_filename = "sitemap-from-to-weight.xml"
    with open(sitemap_filename, 'w', encoding='utf-8') as f:
        f.write(sitemap_header + "".join(sitemap_entries) + sitemap_footer)
    print(f"Generated {sitemap_filename} with {len(programmatic_urls)} URLs.")
    
    # 5. Update master sitemap index: sitemap.xml
    print("Updating master sitemap.xml index to reference new sitemap...")
    if os.path.exists('sitemap.xml'):
        with open('sitemap.xml', 'r', encoding='utf-8') as f:
            sitemap_idx_content = f.read()
            
        # Check if sitemap-from-to-weight.xml is already in there
        if "sitemap-from-to-weight.xml" not in sitemap_idx_content:
            new_entry = (
                f"  <sitemap>\n"
                f"    <loc>{domain}/sitemap-from-to-weight.xml</loc>\n"
                f"    <lastmod>{current_date}</lastmod>\n"
                f"  </sitemap>\n"
            )
            # Insert before </sitemapindex>
            sitemap_idx_content = sitemap_idx_content.replace('</sitemapindex>', new_entry + '</sitemapindex>')
            with open('sitemap.xml', 'w', encoding='utf-8') as f:
                f.write(sitemap_idx_content)
            print("Successfully registered sitemap-from-to-weight.xml in master sitemap.xml.")
        else:
            print("Sitemap-from-to-weight.xml is already registered in sitemap.xml.")

if __name__ == '__main__':
    main()
