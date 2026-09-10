with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = 'margin-bottom:1rem;">Free Weight Loss &amp; Health Calculators</h2>\n        <div style="display:grid;'
replacement = 'margin-bottom:1rem;">Free Weight Loss &amp; Health Calculators</h2>\n        <h3 style="color:#334155; font-size:1.2rem; margin-bottom:1rem;">Body Composition &amp; Weight Tools</h3>\n        <div style="display:grid;'

if target in html:
    html = html.replace(target, replacement)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Interlinking fixes applied.")
else:
    print("Target string not found!")
