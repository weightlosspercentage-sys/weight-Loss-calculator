import os
import re

file_path = "generate_programmatic_pages_v2.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject dynamic content functions
dynamic_content_code = """
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

def build_faq_schema(canonical_url, qas):
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
"""

# Insert the dynamic content code after INTROS_V2
content = content.replace("def get_related_combos(s, t):", dynamic_content_code + "\n\ndef get_related_combos(s, t):")

# 2. Update main() to use the new logic
# We need to replace `intro_content = INTROS_V2[cat_key]`
# and then replace where intro_html, why_html, safety_html are built.

old_intro_selection = """        # Select unique intro content for this combination
        intro_content = INTROS_V2[cat_key]"""

new_intro_selection = """        # V3: Select spun intro, tier context, and math explanation
        intro_html, tier_html, math_html = get_dynamic_content(s, t, f"{pct:.2f}", cat_key)
        
        # Keep old why_it_matters and safety_note for consistency
        intro_content = INTROS_V2[cat_key]"""

content = content.replace(old_intro_selection, new_intro_selection)

old_build_html = """            # Build unique intro HTML with weight-specific content
            intro_html = intro_content['intro'].format(s=s, t=t, pct=f"{pct:.2f}")
            why_html = intro_content['why_it_matters'].format(s=s, t=t, pct=f"{pct:.2f}")
            safety_html = intro_content['safety_note'].format(s=s, t=t, pct=f"{pct:.2f}")"""

new_build_html = """            # Build unique intro HTML with weight-specific content (V3 overrides intro_html)
            why_html = intro_content['why_it_matters'].format(s=s, t=t, pct=f"{pct:.2f}")
            safety_html = intro_content['safety_note'].format(s=s, t=t, pct=f"{pct:.2f}")
            
            # Combine intro + tier + math + why + safety
            full_intro_section = intro_html + tier_html + math_html + why_html + safety_html
            
            # FAQ Schema
            qas = [
                (faq_q1_text, faq_a1_text),
                (faq_q2_text, faq_a2_text),
                (faq_q3_text, faq_a3_text),
                (faq_q4, faq_a4),
                (faq_q5, faq_a5)
            ]
            faq_schema_html = build_faq_schema(canonical_path, qas)"""

content = content.replace(old_build_html, new_build_html)

# 3. We also need to inject `full_intro_section` and `faq_schema_html` into the actual HTML template render.
# Look for where `intro_html`, `why_html`, `safety_html` are used in the HTML construction.
# Let's find `intro_html` in the rest of the file using a broader regex and replace it.

old_template_injection = """            <section class="max-w-4xl mx-auto px-4 py-8 prose prose-slate">
                {intro}
                {why}
                {safety}
            </section>"""

new_template_injection = """            {faq_schema}
            <section class="max-w-4xl mx-auto px-4 py-8 prose prose-slate">
                {full_intro}
            </section>"""

content = content.replace(old_template_injection, new_template_injection)

# Also need to replace the format call that passes them
old_format = """intro=intro_html,
                                why=why_html,
                                safety=safety_html,"""

new_format = """full_intro=full_intro_section,
                                faq_schema=faq_schema_html,"""

content = content.replace(old_format, new_format)

# Write it back to a v3 file
with open("generate_programmatic_pages_v3.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Generated generate_programmatic_pages_v3.py successfully!")
