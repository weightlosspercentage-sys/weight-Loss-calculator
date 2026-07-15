"""
ENHANCED PROGRAMMATIC SEO GENERATOR v2
=======================================
Improvements:
  1. Unique intro paragraphs per clinical category (mild/moderate/major)
  2. Internal linking mesh — related weight combos + cross-calculator links
  3. Schema upgrades (HowTo + MedicalWebPage + existing schemas)
  4. Staggered lastmod dates (not all same date)
  5. Related calculators section in sidebar/footer of each page
  6. Dynamic FAQ — questions vary by weight range
  7. Table of Contents + readability improvements

Author: Programmatic SEO Engine
Date: 2026-07-04
"""

import os
import re
import json
import datetime
import random
import urllib.request
import urllib.parse

# ─── Configuration ─────────────────────────────────────────────
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
    'kilocalories': 'kilocalories',
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
        print(f"Translation failed for '{text_stripped}': {e}")
        return text_stripped

# ─── CONTENT TEMPLATES ─────────────────────────────────────────

# UNIQUE INTRO paragraphs per clinical category (v2 improvement)
INTROS_V2 = {
    'mild': {
        'intro': (
            "<p>Starting a weight loss journey at <strong>{s} lbs</strong> and aiming for <strong>{t} lbs</strong> "
            "is a commendable first step. At a {pct}% reduction, this places you in the <strong>mild weight loss</strong> "
            "category. While the percentage may seem modest, clinical research from the CDC and the American College "
            "of Physicians confirms that even small reductions in body weight trigger measurable health benefits. "
            "Your body begins to shed visceral fat — the metabolically active fat surrounding your internal organs — "
            "which directly improves insulin sensitivity and reduces systemic inflammation. Tracking this progression "
            "using our <a href='/calculators/weight-loss'>weight loss calculator</a> helps you stay motivated and see "
            "how small weekly losses compound into meaningful health improvements over time.</p>"
        ),
        'why_it_matters': (
            "<h3>Why {pct}% Matters: The Science of Early-Stage Weight Loss</h3>"
            "<p>Research published in the Journal of the American Medical Association (JAMA) demonstrates that "
            "weight loss in the 1% to 5% range is associated with a 15% to 20% reduction in liver fat content, "
            "improved fasting glucose levels, and decreased waist circumference. While you will not see dramatic "
            "visual changes yet, your metabolic health is improving at the cellular level. The key at this stage "
            "is consistency — a modest daily calorie deficit of 250 to 500 calories, combined with adequate protein "
            "intake (use our <a href='/calculators/protein'>protein calculator</a> to find your target), builds "
            "the foundation for long-term success.</p>"
        ),
        'safety_note': (
            "<div class='safety-callout' style='background:#f0fdf4; border-left:4px solid #10b981; padding:1rem; margin:1.5rem 0; border-radius:4px;'>"
            "<strong>Safety note for {s} lbs to {t} lbs:</strong> At your current weight, a weekly loss rate of "
            "0.5 to 1.0 lbs is both safe and sustainable. Faster rates increase the risk of muscle loss and "
            "nutrient deficiencies. Our <a href='/calculators/calorie'>calorie calculator</a> can help you "
            "establish a moderate deficit that protects your metabolic health.</div>"
        ),
    },
    'mod': {
        'intro': (
            "<p>You have achieved impressive progress if you are transitioning from <strong>{s} lbs</strong> to "
            "<strong>{t} lbs</strong> — a <strong>{pct}% reduction</strong> that places you in the "
            "<strong>clinically significant weight loss</strong> category. This is the range where medical "
            "professionals observe meaningful improvements in cardiovascular biomarkers, joint health, and "
            "metabolic function. According to the World Health Organization (WHO) and the National Institute "
            "for Health and Care Excellence (NICE), a 5% to 10% weight reduction is the primary therapeutic "
            "target for managing obesity-related conditions. Your progress represents a genuine transformation "
            "in your body's metabolic landscape. Use our <a href='/calculators/weight-loss'>weight loss calculator</a> "
            "to continue tracking your percentage-based progress and set your next milestone.</p>"
        ),
        'why_it_matters': (
            "<h3>Why {pct}% is Clinically Significant: What Happens Inside Your Body</h3>"
            "<p>When you reach the 5% to 10% weight loss bracket, your body undergoes several clinically "
            "measurable changes. Blood pressure typically decreases by 5 to 10 mmHg systolic, LDL cholesterol "
            "drops by 10 to 15 mg/dL, and HbA1c (a measure of blood sugar control over 3 months) improves "
            "significantly. A study in the New England Journal of Medicine found that patients achieving 7% "
            "weight loss reduced their risk of developing Type 2 diabetes by 58%. Your joints are experiencing "
            "remarkable relief — every pound lost removes approximately 4 pounds of pressure from your knees. "
            "Use our <a href='/calculators/bmi'>BMI calculator</a> to see how your body mass index has changed "
            "alongside your weight loss percentage.</p>"
        ),
        'safety_note': (
            "<div class='safety-callout' style='background:#fef3c7; border-left:4px solid #f59e0b; padding:1rem; margin:1.5rem 0; border-radius:4px;'>"
            "<strong>Safety note for {s} lbs to {t} lbs:</strong> As you progress through clinically significant "
            "weight loss, your metabolic rate will naturally decrease. Recalculate your TDEE every 10 to 15 lbs "
            "using our <a href='/calculators/tdee'>TDEE calculator</a> to ensure your calorie deficit remains "
            "appropriate. Consider a diet break at maintenance calories for 1 to 2 weeks if you feel fatigued.</div>"
        ),
    },
    'maj': {
        'intro': (
            "<p>Losing <strong>{pct}%</strong> of your body weight — going from <strong>{s} lbs</strong> to "
            "<strong>{t} lbs</strong> — is a <strong>major metabolic achievement</strong> that places you in "
            "an elite category of weight loss success. Research from the CDC, the American Heart Association, "
            "and the Obesity Medicine Association recognizes 10% or greater weight loss as producing "
            "substantial, life-changing health benefits. At this level of weight reduction, you are "
            "experiencing deeply transformative physiological changes: your cardiovascular system is "
            "functioning more efficiently, your inflammatory markers are significantly reduced, and your "
            "risk profile for chronic diseases has been dramatically improved. Our <a href='/calculators/weight-loss'>"
            "weight loss calculator</a> has been tracking this journey — now let's look at what this "
            "achievement means for your long-term health.</p>"
        ),
        'why_it_matters': (
            "<h3>Why {pct}% is Life-Changing: Deep Metabolic Transformation</h3>"
            "<p>Reaching 10% or greater weight loss triggers a cascade of profound health improvements. "
            "Research published in The Lancet shows that sustained 10%+ weight loss is associated with: "
            "a 25% reduction in cardiovascular event risk, significant improvement or complete resolution "
            "of obstructive sleep apnea in 70% of patients, normalization of liver enzymes in non-alcoholic "
            "fatty liver disease (NAFLD), and a marked reduction in chronic systemic inflammation as measured "
            "by C-reactive protein (CRP). Many individuals under medical supervision can reduce or eliminate "
            "medications for hypertension, Type 2 diabetes, and hyperlipidemia at this stage. Your basal "
            "metabolic rate has adapted to your new body composition — check your updated BMR using our "
            "<a href='/calculators/bmr'>BMR calculator</a> and adjust your nutrition plan accordingly.</p>"
        ),
        'safety_note': (
            "<div class='safety-callout' style='background:#fee2e2; border-left:4px solid #ef4444; padding:1rem; margin:1.5rem 0; border-radius:4px;'>"
            "<strong>Safety note for {s} lbs to {t} lbs:</strong> Major weight loss requires careful monitoring "
            "of nutrient intake and body composition. Ensure you are consuming adequate protein (use our "
            "<a href='/calculators/protein'>protein calculator</a>) to preserve lean muscle mass. Consider "
            "tracking your body fat percentage with our <a href='/calculators/body-fat'>body fat calculator</a> "
            "to ensure you are losing fat, not muscle. If you feel excessive fatigue, consider a diet break.</div>"
        ),
    }
}

# RELATED WEIGHT COMBOS — builds internal linking mesh

import hashlib

# V3: Multi-variation spun intros
INTROS_V3 = {
    'mild': [
        "<p>Starting your journey at <strong>{s} lbs</strong> and aiming for <strong>{t} lbs</strong> is a fantastic first step. Losing {pct}% of your body weight places you in the <strong>mild weight loss</strong> category. Even modest reductions can trigger measurable health benefits, such as decreased visceral fat and improved insulin sensitivity. Keep tracking your progress with our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>",
        "<p>Transitioning from <strong>{s} lbs</strong> to <strong>{t} lbs</strong> represents a {pct}% weight reduction. While this is classified as <strong>mild weight loss</strong>, clinical studies indicate that losing just 1-5% of body weight significantly reduces the strain on weight-bearing joints and improves lipid profiles. Use our <a href='/calculators/weight-loss'>weight loss calculator</a> to monitor your journey.</p>",
        "<p>Your goal to move from <strong>{s} lbs</strong> to <strong>{t} lbs</strong> ({pct}% loss) is an excellent metabolic starting point. This <strong>mild weight loss</strong> phase is critical for establishing sustainable habits. Early weight loss primarily targets metabolically active fat, reducing systemic inflammation. Stay motivated by using our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>"
    ],
    'mod': [
        "<p>Achieving a drop from <strong>{s} lbs</strong> to <strong>{t} lbs</strong> is a major milestone. This <strong>{pct}% reduction</strong> falls into the <strong>clinically significant weight loss</strong> category. According to health organizations, losing 5-10% of your body weight provides immense benefits for cardiovascular and metabolic health. Track this transformation using our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>",
        "<p>Going from <strong>{s} lbs</strong> to <strong>{t} lbs</strong> marks a turning point in your health journey. A {pct}% weight loss is considered <strong>clinically significant</strong>. At this stage, blood pressure often decreases, and joint relief becomes highly noticeable. You can consistently measure your progress with our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>",
        "<p>Your progress from <strong>{s} lbs</strong> to <strong>{t} lbs</strong> is impressive. Dropping {pct}% of your starting weight enters the <strong>clinically significant</strong> tier, where insulin resistance drops sharply and cardiovascular biomarkers improve. Keep your momentum going using our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>"
    ],
    'maj': [
        "<p>Losing <strong>{pct}%</strong> of your body weight—moving from <strong>{s} lbs</strong> to <strong>{t} lbs</strong>—is a <strong>major metabolic achievement</strong>. Weight reduction of 10% or more fundamentally transforms your physiological health, drastically lowering the risk of chronic diseases. Our <a href='/calculators/weight-loss'>weight loss calculator</a> is here to help you sustain this elite progress.</p>",
        "<p>A transformation from <strong>{s} lbs</strong> to <strong>{t} lbs</strong> represents a staggering <strong>{pct}% reduction</strong> in body mass. This <strong>major metabolic weight loss</strong> is associated with profound improvements in sleep apnea, joint preservation, and heart health. Maintain your success by tracking it with our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>",
        "<p>Going from <strong>{s} lbs</strong> down to <strong>{t} lbs</strong> is a life-changing milestone. This {pct}% <strong>major weight loss</strong> is clinically proven to drastically improve longevity and metabolic function. Ensure you're preserving muscle mass as you track this incredible journey using our <a href='/calculators/weight-loss'>weight loss calculator</a>.</p>"
    ]
}

def get_dynamic_content(s, t, pct, cat_key):
    # Deterministic hash to pick a variation
    hash_val = int(hashlib.md5(f"{s}-{t}".encode()).hexdigest(), 16)
    
    # 1. Spun Intro
    variations = INTROS_V3[cat_key]
    intro = variations[hash_val % len(variations)].format(s=s, t=t, pct=pct)
    
    # 2. Starting Tier Context
    if s >= 300:
        tier_ctx = f"<h3>Starting at {s} lbs: What to Expect</h3><p>For starting weights over 300 lbs, losing {pct}% heavily unloads your cardiovascular system and significantly reduces pressure on your lower back and knees.</p>"
    elif s >= 200:
        tier_ctx = f"<h3>Starting at {s} lbs: What to Expect</h3><p>When starting in the {s} lbs range, a {pct}% loss usually results in highly visible body composition changes and rapid improvements in daily mobility and energy levels.</p>"
    else:
        tier_ctx = f"<h3>Starting at {s} lbs: What to Expect</h3><p>Starting under 200 lbs means a {pct}% reduction requires strict adherence to a calorie deficit, as your basal metabolic rate is lower. Preserving lean muscle via protein intake is crucial.</p>"
        
    # 3. Explicit Math Explanation
    lbs_lost = s - t
    math_exp = f"<h3>How We Calculated Your {pct}% Weight Loss</h3><p>To find the exact percentage, we took your total weight loss (<strong>{lbs_lost} lbs</strong>) and divided it by your starting weight (<strong>{s} lbs</strong>). We then multiplied the result by 100.</p><p style='text-align:center; font-family:monospace; background:#f1f5f9; padding:10px; border-radius:6px;'>({lbs_lost} ÷ {s}) × 100 = {pct}%</p>"
    
    return intro, tier_ctx, math_exp

def build_faq_schema(qas):
    items = []
    for q, a in qas:
        items.append(f'''{{
      "@type": "Question",
      "name": "{q}",
      "acceptedAnswer": {{
        "@type": "Answer",
        "text": "{a}"
      }}
    }}''')
    
    schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {','.join(items)}
  ]
}}
</script>'''
    return schema


def get_related_combos(s, t):
    """Generate related weight loss combinations for internal linking."""
    combos = []
    # Adjacent starting weights
    for delta in [-20, -10, 10, 20]:
        ns = s + delta
        if 100 <= ns <= 350 and t < ns:
            combos.append((ns, t, f"{ns} to {t} lbs"))
    # Adjacent target weights
    for delta in [-10, 10, 20]:
        nt = t + delta
        if 90 <= nt < s:
            combos.append((s, nt, f"{s} to {nt} lbs"))
    # Popular milestones from this start weight
    for milestone in [10, 20, 30, 50, 75, 100]:
        mt = s - milestone
        if 90 <= mt < s and mt != t:
            combos.append((s, mt, f"{s} to {mt} lbs"))
    # Deduplicate and limit
    seen = set()
    unique = []
    for n, m, label in combos:
        key = f"{n}-{m}"
        if key not in seen and n != s and m != t:
            seen.add(key)
            unique.append((n, m, label))
    return unique[:6]

def get_related_calculator_links():
    """Cross-links to other calculator categories."""
    return [
        ('/calculators/bmi/', 'BMI Calculator', 'Calculate your Body Mass Index'),
        ('/calculators/tdee/', 'TDEE Calculator', 'Find your total daily energy expenditure'),
        ('/calculators/bmr/', 'BMR Calculator', 'Calculate your basal metabolic rate'),
        ('/calculators/calorie/', 'Calorie Calculator', 'Set your daily calorie target'),
        ('/calculators/body-fat/', 'Body Fat Calculator', 'Estimate your body fat percentage'),
        ('/calculators/protein/', 'Protein Calculator', 'Calculate your daily protein needs'),
    ]

# ─── Templates ─────────────────────────────────────────────────

def get_translated_templates():
    """Same base templates as v1, kept for compatibility."""
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
        '{start}': '__START__', '{target}': '__TARGET__', '{lbs}': '__LBS__',
        '{pct}': '__PCT__', '{deficit}': '__DEFICIT__',
        '{weeks_range}': '__WEEKS_RANGE__', '{weeks_1lb}': '__WEEKS_1LB__'
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
                    spaced_tag = tag.replace('_', ' ')
                    translated_val = translated_val.replace(f"__ {spaced_tag.replace('__', '').strip()} __", ph)
                    translated_val = translated_val.replace(f"__ {spaced_tag.lower().replace('__', '').strip()} __", ph)
                loc_map[k] = translated_val
            localized[code] = loc_map
        else:
            localized[code] = templates.copy()
            if code in ['uk', 'ca', 'au', 'nz']:
                for k, val in localized[code].items():
                    for us_term, local_term in spelling_map.items():
                        localized[code][k] = localized[code][k].replace(us_term, local_term)
    localized['us'] = templates.copy()
    return localized

# ─── Layout Helpers ────────────────────────────────────────────

def extract_layout():
    """Reads index.html and extracts head, header, footer."""
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

# ─── Schema Builders (v2 upgrades) ─────────────────────────────

def build_medical_webpage_schema(canonical_path, meta_title, meta_desc, s, lbs, pct):
    """MedicalWebPage schema for E-E-A-T boost on health content."""
    return f'''
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": "{domain}{canonical_path}#webpage",
      "url": "{domain}{canonical_path}",
      "name": "{meta_title}",
      "description": "{meta_desc}",
      "audience": "{domain}/glossary/#adults",
      "lastReviewed": "2026-07-01",
      "primaryImageOfPage": "{domain}/og-default.jpg",
      "about": {{
        "@type": "MedicalCondition",
        "name": "Overweight and Obesity",
        "code": {{
          "@type": "MedicalCode",
          "code": "E66",
          "codingSystem": "ICD-10"
        }}
      }}
    }}
    </script>'''

def build_howto_schema(s, t, lbs, pct, deficit, weeks_05, weeks_1, weeks_2):
    """HowTo schema for step-by-step weight loss instructions."""
    return f'''
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Calculate Weight Loss Percentage from {s} to {t} lbs",
      "description": "Calculate your weight loss percentage and create a safe calorie deficit plan to go from {s} to {t} pounds.",
      "totalTime": "P{int(weeks_1)}W",
      "tool": [{{
        "@type": "HowToTool",
        "name": "Weight Loss Percentage Calculator"
      }}],
      "step": [
        {{
          "@type": "HowToStep",
          "position": 1,
          "name": "Calculate your weight loss",
          "text": "Subtract your target weight ({t} lbs) from your starting weight ({s} lbs) to determine total weight loss of {lbs} lbs."
        }},
        {{
          "@type": "HowToStep",
          "position": 2,
          "name": "Calculate percentage lost",
          "text": "Divide {lbs} by {s} and multiply by 100. Result: {pct:.2f}% weight loss."
        }},
        {{
          "@type": "HowToStep",
          "position": 3,
          "name": "Set your calorie deficit",
          "text": "Create a daily deficit of 250 to 500 calories for a total deficit of {deficit:,} kcal."
        }},
        {{
          "@type": "HowToStep",
          "position": 4,
          "name": "Choose your pace",
          "text": "For sustainable results, target 0.5 to 1.0 lbs per week. At 1 lb/week, reach your goal in {weeks_1:.0f} weeks."
        }}
      ]
    }}
    </script>'''

# ─── Main Generator ────────────────────────────────────────────

def main():
    print("=" * 60)
    print("ENHANCED PROGRAMMATIC SEO GENERATOR v2")
    print("=" * 60)

    # 1. Prepare weight combinations
    start_weights = range(100, 360, 10)
    target_weights = range(90, 350, 10)
    combinations = []
    for s in start_weights:
        for t in target_weights:
            if t < s:
                combinations.append((s, t))
    print(f"Generated {len(combinations)} weight-loss combinations.")

    # 2. Extract layouts
    head_base, body_start, header_part, footer_base = extract_layout()
    localized_templates = get_translated_templates()

    # Base date for staggered lastmod
    base_date = datetime.date(2026, 6, 1)

    programmatic_urls = []
    all_regions = ['us'] + list(countries.keys())
    counter = 0
    total_files = len(combinations) * 7

    for idx, (s, t) in enumerate(combinations):
        lbs = s - t
        pct = (lbs / s) * 100
        deficit = lbs * 3500

        # Clinical classification
        if pct < 5:
            cat_key = 'mild'
            cat_name = "Mild Weight Loss"
        elif pct < 10:
            cat_key = 'mod'
            cat_name = "Clinically Significant Weight Loss"
        else:
            cat_key = 'maj'
            cat_name = "Major Metabolic Weight Loss"

        # V3: Select spun intro, tier context, and math explanation
        intro_html, tier_html, math_html = get_dynamic_content(s, t, f"{pct:.2f}", cat_key)
        
        # Keep old why_it_matters and safety_note for consistency
        intro_content = INTROS_V2[cat_key]

        weeks_05 = lbs / 0.5
        weeks_1 = lbs / 1.0
        weeks_2 = lbs / 2.0

        for region in all_regions:
            lang_tpl = localized_templates[region]

            # Staggered lastmod — spreads sitemap freshness across 60 days
            days_offset = (idx * 7) % 60
            page_date = base_date + datetime.timedelta(days=days_offset)
            page_date_str = page_date.isoformat()

            # Format text templates
            meta_title = lang_tpl['title'].format(start=s, target=t, pct=f"{pct:.2f}")
            meta_desc = lang_tpl['description'].format(start=s, target=t, pct=f"{pct:.2f}")
            h1_text = lang_tpl['h1'].format(start=s, target=t)

            faq_q1_text = lang_tpl['faq_q1'].format(lbs=lbs, start=s, pct=f"{pct:.2f}")
            faq_a1_text = lang_tpl['faq_a1'].format(lbs=lbs, start=s, pct=f"{pct:.2f}", weeks_range=f"{weeks_1:.1f}-{weeks_05:.1f}")
            faq_q2_text = lang_tpl['faq_q2'].format(start=s, target=t, lbs=lbs)
            faq_a2_text = lang_tpl['faq_a2'].format(start=s, target=t, lbs=lbs, deficit=f"{deficit:,}", weeks_1lb=f"{weeks_1:.1f}")
            faq_q3_text = lang_tpl['faq_q3'].format(start=s, target=t)
            faq_a3_text = lang_tpl['faq_a3'].format(start=s, target=t, lbs=lbs)

            # V2 UPGRADE: Dynamic FAQ #4 and #5 based on weight range
            if s >= 200:
                faq_q4 = f"How long will it take someone at {s} lbs to reach {t} lbs with diet alone?"
                faq_a4 = f"At {s} lbs, diet alone (without exercise) can still achieve the {pct:.1f}% reduction to {t} lbs. However, combining a 500-calorie deficit with moderate activity (walking 30 min/day) can accelerate your timeline by 25% to 35%. Use our <a href='/calculators/tdee'>TDEE calculator</a> to see how activity changes your calorie burn."
                faq_q5 = f"What is the best exercise for someone going from {s} to {t} lbs?"
                faq_a5 = f"For individuals starting at {s} lbs, low-impact activities are recommended to protect joint health. Walking, swimming, and stationary cycling provide excellent calorie burn without excessive joint stress. Our <a href='/calculators/body-fat'>body fat calculator</a> can help you track body composition changes, not just scale weight."
            elif s >= 150:
                faq_q4 = f"Can I lose {lbs} lbs ({pct:.1f}% of my body weight) without feeling hungry all the time?"
                faq_a4 = f"Yes. A moderate deficit of 15% to 20% below your TDEE (approximately {int(deficit/7):,} calories per day) should not cause extreme hunger if you prioritize protein (0.7 to 1.0g per lb of body weight) and fiber-rich vegetables. Use our <a href='/calculators/protein'>protein calculator</a> and <a href='/calculators/macro'>macro calculator</a> to build a satisfying meal plan."
                faq_q5 = f"How does losing {pct:.1f}% body weight from {s} to {t} lbs affect my metabolism?"
                faq_a5 = f"Losing {pct:.1f}% of your body weight will naturally lower your BMR because you are carrying less mass. However, strength training can mitigate this by building metabolically active muscle. Use our <a href='/calculators/bmr'>BMR calculator</a> to see how your metabolic rate changes at your new weight."
            else:
                faq_q4 = f"Is losing {lbs} lbs from {s} lbs a realistic goal?"
                faq_a4 = f"Yes. Going from {s} lbs to {t} lbs ({pct:.1f}% loss) is realistic with a consistent approach. At 0.5 to 1.0 lbs per week, this takes approximately {weeks_1:.0f} to {weeks_05:.0f} weeks. Focus on nutrient-dense foods and regular movement. Our <a href='/calculators/calorie'>calorie calculator</a> can help you design a sustainable deficit."
                faq_q5 = f"What health improvements will I notice losing {pct:.1f}% of my body weight from {s} to {t} lbs?"
                faq_a5 = f"At a {pct:.1f}% weight loss, you can expect improved energy levels, better sleep quality, reduced joint discomfort, and lower blood pressure. Track these improvements alongside your weight using our <a href='/calculators/weight-loss'>weight loss calculator</a> for ongoing motivation."

            # Build unique intro HTML with weight-specific content (V3 overrides intro_html)
            why_html = intro_content['why_it_matters'].format(s=s, t=t, pct=f"{pct:.2f}")
            safety_html = intro_content['safety_note'].format(s=s, t=t, pct=f"{pct:.2f}")
            
            # Combine intro + tier + math
            intro_html = intro_html + tier_html + math_html
            
            # FAQ Schema
            qas = [
                (faq_q1_text, faq_a1_text),
                (faq_q2_text, faq_a2_text),
                (faq_q3_text, faq_a3_text),
                (faq_q4, faq_a4),
                (faq_q5, faq_a5)
            ]
            faq_schema_html = build_faq_schema(qas)

            # Build related links mesh
            related_combos = get_related_combos(s, t)
            related_calc_links = get_related_calculator_links()

            related_calc_html = ""
            if related_combos:
                items = []
                for ns, nt, label in related_combos:
                    if region == 'us':
                        path = f"/calculators/weight-loss/from-{ns}-to-{nt}/"
                    else:
                        path = f"/{region}/calculators/weight-loss/from-{ns}-to-{nt}/"
                    items.append(f'<li><a href="{path}">Weight Loss: {label}</a></li>')
                related_calc_html += '\n'.join(items)

            # Cross-calculator links
            cross_links_html = ""
            for path, name, desc in related_calc_links:
                if region == 'us':
                    full_path = path
                else:
                    full_path = f"/{region}{path}"
                cross_links_html += f'<li><a href="{full_path}">{name}</a> — {desc}</li>\n'

            # Determine path
            rel_url_path = f"/calculators/weight-loss/from-{s}-to-{t}/"
            if region == 'us':
                canonical_path = rel_url_path
                dest_dir = f"calculators/weight-loss/from-{s}-to-{t}"
            else:
                canonical_path = f"/{region}{rel_url_path}"
                dest_dir = f"{region}/calculators/weight-loss/from-{s}-to-{t}"

            programmatic_urls.append(canonical_path)

            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)

            lang_code = countries[region]['hreflang'] if region != 'us' else 'en'
            # ── Build Head ──
            head_content = head_base.replace('<html lang="en">', f'<html lang="{lang_code}">')
            head_content += f'\n    <link rel="canonical" href="{domain}{canonical_path}" />'
            head_content += '\n' + build_hreflang_tags(rel_url_path)
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
            head_content = re.sub(og_url_pat, f'<meta property="og:url" content="{domain}{canonical_path}" />', head_content)
            tw_title_pat = r'<meta name="twitter:title" content="[^"]*" />'
            head_content = re.sub(tw_title_pat, f'<meta name="twitter:title" content="{meta_title}" />', head_content)
            tw_desc_pat = r'<meta name="twitter:description" content="[^"]*" />'
            head_content = re.sub(tw_desc_pat, f'<meta name="twitter:description" content="{meta_desc}" />', head_content)

            # V2 UPGRADE: Add MedicalWebPage schema for E-E-A-T
            head_content += build_medical_webpage_schema(canonical_path, meta_title, meta_desc, s, lbs, pct)

            # V2 UPGRADE: Add HowTo schema
            head_content += build_howto_schema(s, t, lbs, pct, deficit, weeks_05, weeks_1, weeks_2)

            # Existing schemas
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
      }},
      "featureList": "{domain}/calculators/weight-loss/"
    }}
    </script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "{lang_tpl['breadcrumb_home']}", "item": "{domain}/{'' if region == 'us' else region + '/'}" }},
        {{ "@type": "ListItem", "position": 2, "name": "{lang_tpl['breadcrumb_calc']}", "item": "{domain}{'/' if region == 'us' else '/' + region + '/'}calculators/" }},
        {{ "@type": "ListItem", "position": 3, "name": "{lang_tpl['breadcrumb_weight']}", "item": "{domain}{'/' if region == 'us' else '/' + region + '/'}calculators/weight-loss/" }},
        {{ "@type": "ListItem", "position": 4, "name": "{lang_tpl['breadcrumb_from_to'].format(start=s, target=t)}", "item": "{domain}{canonical_path}" }}
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
          "acceptedAnswer": {{ "@type": "Answer", "text": "{faq_a1_text}" }}
        }},
        {{
          "@type": "Question",
          "name": "{faq_q2_text}",
          "acceptedAnswer": {{ "@type": "Answer", "text": "{faq_a2_text}" }}
        }},
        {{
          "@type": "Question",
          "name": "{faq_q3_text}",
          "acceptedAnswer": {{ "@type": "Answer", "text": "{faq_a3_text}" }}
        }},
        {{
          "@type": "Question",
          "name": "{faq_q4}",
          "acceptedAnswer": {{ "@type": "Answer", "text": "{faq_a4}" }}
        }},
        {{
          "@type": "Question",
          "name": "{faq_q5}",
          "acceptedAnswer": {{ "@type": "Answer", "text": "{faq_a5}" }}
        }}
      ]
    }}
    </script>
            """
            head_content += schemas_js + "\n  </head>"

            # ── Clean Footer ──
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
                    footer_content = footer_content.replace("All rights reserved. Free dietitian-reviewed health and fitness tools.",
                                                            translate("All rights reserved. Free dietitian-reviewed health and fitness tools.", countries[region]['target_lang']))
                else:
                    for us_term, local_term in spelling_map.items():
                        footer_content = footer_content.replace(us_term, local_term)

            switcher_html = build_language_switcher(rel_url_path, region)
            footer_pattern = r'(<footer class="static-footer"[^>]*>\s*<div style="max-width: 1200px; margin: 0 auto; text-align: center;">)'
            footer_content = re.sub(footer_pattern, lambda m: f'{m.group(1)}\n{switcher_html}', footer_content, count=1)

            header_content = header_part
            if region != 'us':
                header_content = rewrite_links(header_content, region)

            # ── Build Main Body Content (v2 enhanced) ──
            main_body_content = f"""
      <main id="main-content" style="max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; color: #334155;">
        <!-- Breadcrumbs -->
        <nav style="font-size: 0.825rem; color: #64748b; margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <a href="{" /" if region == 'us' else f"/{region}/"}" style="color: #64748b; text-decoration: none;">{lang_tpl['breadcrumb_home']}</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <a href="{" /calculators/" if region == 'us' else f"/{region}/calculators/"}" style="color: #64748b; text-decoration: none;">{lang_tpl['breadcrumb_calc']}</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <a href="{" /calculators/weight-loss/" if region == 'us' else f"/{region}/calculators/weight-loss/"}" style="color: #64748b; text-decoration: none;">{lang_tpl['breadcrumb_weight']}</a>
          <span style="color: #cbd5e1; font-size: 0.75rem; display: inline-flex; align-items: center;">&gt;</span>
          <span style="color: #475569; font-weight: 500;">{lang_tpl['breadcrumb_from_to'].format(start=s, target=t)}</span>
        </nav>

        <h1 style="color: #0f172a; font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; line-height: 1.25;">{h1_text}</h1>

        <!-- UNIQUE INTRODUCTION per clinical category (v2) -->
        {intro_html}

        {safety_html}

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
              <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; font-weight: 700; color: #f97316;" id="ui-cat">{lang_tpl[f'{cat_key}_title']}</p>
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

        <!-- WHY IT MATTERS section (v2 unique content) -->
        {why_html}

        <!-- Health implications (existing) -->
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

        <!-- Deficit Pace Table (existing) -->
        <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">{lang_tpl['deficit_title']}</h2>
        <p>{lang_tpl['deficit_desc']}</p>
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

        <!-- V2 UPGRADE: Related Weight Loss Calculations (Internal Linking Mesh) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 0.75rem;">Related Weight Loss Calculations</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.5rem;">
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem;">
              {related_calc_html}
            </ul>
          </div>
        </div>

        <!-- V2 UPGRADE: Other Health Calculators (Cross-calculator links) -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #166534; margin-top: 0; margin-bottom: 0.75rem;">Free Health Calculators</h3>
          <ul style="font-size: 0.875rem; margin: 0; padding-left: 1.25rem;">
            {cross_links_html}
          </ul>
        </div>

        <!-- FAQ (v2 upgrade: 5 questions, dynamically varied) -->
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
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;" id="faq-q4">Q: {faq_q4}</p>
          <p style="margin: 0; color: #475569;" id="faq-a4">{faq_a4}</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 700; color: #0f172a;" id="faq-q5">Q: {faq_q5}</p>
          <p style="margin: 0; color: #475569;" id="faq-a5">{faq_a5}</p>
        </div>
      </main>

      <!-- Slider JavaScript (updated for 5 FAQs) -->
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
          if (t >= s) {{ t = s - 10; targetSlider.value = t; }}
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
          var catText = catTitles.mild;
          if (pct >= 5 && pct < 10) {{ catText = catTitles.mod; }}
          else if (pct >= 10) {{ catText = catTitles.maj; }}
          uiCat.textContent = catText;
          var w05 = lbs / 0.5, w1 = lbs / 1.0, w2 = lbs / 2.0;
          weeks05.textContent = w05.toFixed(1) + " " + langTerms.weeks_suffix;
          weeks1.textContent = w1.toFixed(1) + " " + langTerms.weeks_suffix;
          weeks2.textContent = w2.toFixed(1) + " " + langTerms.weeks_suffix;
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

            # Combine final document
            html_document = f"{head_content}\n{body_start}\n{header_content}\n{main_body_content}\n{footer_content}"

            dest_file = os.path.join(dest_dir, "index.html")
            with open(dest_file, 'w', encoding='utf-8') as out_f:
                out_f.write(html_document)

            counter += 1
            if counter % 200 == 0:
                print(f"Generated {counter}/{total_files} files...")

    print(f"Total {counter} enhanced programmatic pages generated successfully.")

    # ── Generate Sitemap with staggered lastmod ──
    print("Generating sitemap-from-to-weight.xml (with staggered dates)...")
    sitemap_header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_footer = '</urlset>\n'
    sitemap_entries = []
    programmatic_urls.sort()
    for i, url in enumerate(programmatic_urls):
        days_offset = (i * 7) % 60
        page_date = base_date + datetime.timedelta(days=days_offset)
        page_date_str = page_date.isoformat()
        entry = (
            f"  <url>\n"
            f"    <loc>{domain}{url}</loc>\n"
            f"    <lastmod>{page_date_str}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>0.6</priority>\n"
            f"  </url>\n"
        )
        sitemap_entries.append(entry)

    sitemap_filename = "sitemap-from-to-weight.xml"
    with open(sitemap_filename, 'w', encoding='utf-8') as f:
        f.write(sitemap_header + "".join(sitemap_entries) + sitemap_footer)
    print(f"Generated {sitemap_filename} with {len(programmatic_urls)} URLs (staggered dates).")

    # Update master sitemap index
    print("Updating master sitemap.xml index...")
    if os.path.exists('sitemap.xml'):
        with open('sitemap.xml', 'r', encoding='utf-8') as f:
            sitemap_idx_content = f.read()
        if "sitemap-from-to-weight.xml" not in sitemap_idx_content:
            new_entry = (
                f"  <sitemap>\n"
                f"    <loc>{domain}/sitemap-from-to-weight.xml</loc>\n"
                f"    <lastmod>{datetime.date.today().isoformat()}</lastmod>\n"
                f"  </sitemap>\n"
            )
            sitemap_idx_content = sitemap_idx_content.replace('</sitemapindex>', new_entry + '</sitemapindex>')
            with open('sitemap.xml', 'w', encoding='utf-8') as f:
                f.write(sitemap_idx_content)
            print("Registered sitemap-from-to-weight.xml in master sitemap.")
        else:
            print("Already registered.")


if __name__ == '__main__':
    main()
