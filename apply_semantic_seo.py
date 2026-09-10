with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_faq = '''        <div style="margin-bottom:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:1.5rem;">
          <h3 style="color:#0f172a; font-size:1.1rem; font-weight:700; margin-bottom:0.5rem;">Why does weight loss percentage matter more than pounds lost?</h3>
          <p>Losing 10 pounds represents a vastly different physiological change for a 150 lb person versus a 250 lb person. Tracking percentage ensures goals are scaled safely to your body frame.</p>
        </div>
'''

target = 'margin-bottom:1rem;">Frequently Asked Questions</h2>\n'

if target in html:
    html = html.replace(target, target + '\n' + new_faq)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Semantic SEO fixes applied.")
else:
    print("Target not found")
