import os
import glob
import re

HEADER_HTML = """<header class="static-header" style="position: sticky; top: 0; z-index: 50; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #ebebeb; height: 64px; display: flex; align-items: center; justify-content: center; padding: 0 16px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
  <div style="max-width: 1400px; width: 100%; display: flex; justify-content: space-between; align-items: center; height: 100%;">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <a href="/" style="display: flex; align-items: center; gap: 8px; text-decoration: none;" aria-label="Weight Loss Percentage — Home">
        <div style="height: 28px; width: 28px; background-color: #171717; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0;" aria-hidden="true">%</div>
        <span style="font-weight: 600; color: #171717; font-size: 16px; letter-spacing: -0.03em;">Weight Loss Percentage</span>
      </a>
      <nav style="display: flex; gap: 24px; align-items: center;">
        <a href="/" class="nav-link" style="color: #171717; font-weight: 500; font-size: 14px; text-decoration: none;">Home</a>
        <a href="/calculators/" class="nav-link" style="color: #171717; font-weight: 500; font-size: 14px; text-decoration: none;">Calculators</a>
        <a href="/nutrition/" class="nav-link" style="color: #171717; font-weight: 500; font-size: 14px; text-decoration: none;">Nutrition</a>
        <a href="/blog/" class="nav-link active" style="color: #171717; font-weight: 500; font-size: 14px; text-decoration: none;">Blog</a>
        <a href="/compare/" class="nav-link" style="color: #171717; font-weight: 500; font-size: 14px; text-decoration: none;">Compare</a>
      </nav>
    </div>
  </div>
</header>"""

FOOTER_HTML = """<footer class="static-footer" style="background: #ffffff; border-top: 1px solid #ebebeb; padding: 64px 24px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #4d4d4d; margin-top: 4rem;">
  <div style="max-width: 1400px; margin: 0 auto; text-align: left;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 32px; border-bottom: 1px solid #ebebeb; padding-bottom: 40px; margin-bottom: 48px;">
      <div style="flex: 1.5; min-width: 280px;">
        <div style="color: #171717; font-size: 12px; font-weight: 400; font-family: 'JetBrains Mono', monospace; margin: 0 0 8px 0; text-transform: uppercase;">Get In Touch</div>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4d4d4d;">Have questions, feedback, or need help? We'd love to hear from you.</p>
      </div>
      <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
        <span style="color: #171717; font-family: 'JetBrains Mono', monospace; font-size: 12px; text-transform: uppercase;">Join our newsletter</span>
        <div style="display: flex; width: 100%; max-width: 400px; gap: 8px;">
          <input type="email" placeholder="Enter your email" style="flex: 1; padding: 10px 16px; border-radius: 6px; border: 1px solid #ebebeb; background: #ffffff; color: #171717; font-size: 14px;" />
          <button style="padding: 10px 16px; border-radius: 6px; border: none; background: #171717; color: #ffffff; font-weight: 500; font-size: 14px; cursor: pointer;">Subscribe</button>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2.5rem; margin-bottom: 3rem;">
      <div style="flex: 2; min-width: 260px;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; letter-spacing: -0.03em;">
          <a href="/" style="text-decoration: none; color: #171717;">Weight Loss Percentage</a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #4d4d4d;">Free dietitian-reviewed health, nutrition, and fitness calculators designed to scale weight management metrics scientifically.</p>
      </div>
      <div style="flex: 1; min-width: 160px;">
        <div style="color: #171717; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">Calculators</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <li><a href="/calculators/weight-loss/" style="color: #4d4d4d; text-decoration: none;">Weight Loss %</a></li>
          <li><a href="/calculators/bmi/" style="color: #4d4d4d; text-decoration: none;">BMI Calculator</a></li>
          <li><a href="/calculators/tdee/" style="color: #4d4d4d; text-decoration: none;">TDEE Calculator</a></li>
          <li><a href="/calculators/bmr/" style="color: #4d4d4d; text-decoration: none;">BMR Calculator</a></li>
          <li><a href="/calculators/calorie/" style="color: #4d4d4d; text-decoration: none;">Calorie Calculator</a></li>
          <li><a href="/calculators/macro/" style="color: #4d4d4d; text-decoration: none;">Macro Calculator</a></li>
          <li><a href="/calculators/body-fat/" style="color: #4d4d4d; text-decoration: none;">Body Fat Calculator</a></li>
        </ul>
      </div>
      <div style="flex: 1; min-width: 160px;">
        <div style="color: #171717; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">More Tools</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <li><a href="/calculators/newborn-weight-loss/" style="color: #4d4d4d; text-decoration: none;">Newborn Weight Loss</a></li>
          <li><a href="/calculators/infant-weight-loss/" style="color: #4d4d4d; text-decoration: none;">Infant Weight Loss</a></li>
          <li><a href="/calculators/baby-weight-loss/" style="color: #4d4d4d; text-decoration: none;">Baby Weight Loss</a></li>
          <li><a href="/calculators/dog-weight-loss/" style="color: #4d4d4d; text-decoration: none;">Dog Weight Loss</a></li>
          <li><a href="/calculators/peptide-dosage/" style="color: #4d4d4d; text-decoration: none;">Peptide Dosage</a></li>
        </ul>
      </div>
      <div style="flex: 1; min-width: 160px;">
        <div style="color: #171717; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">Resources</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <li><a href="/about/" style="color: #4d4d4d; text-decoration: none;">About Us</a></li>
          <li><a href="/contact/" style="color: #4d4d4d; text-decoration: none;">Contact Us</a></li>
          <li><a href="/blog/" style="color: #4d4d4d; text-decoration: none;">Blog</a></li>
          <li><a href="/glossary/" style="color: #4d4d4d; text-decoration: none;">Glossary</a></li>
        </ul>
      </div>
      <div style="flex: 1; min-width: 160px;">
        <div style="color: #171717; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">Legal</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <li><a href="/privacy/" style="color: #4d4d4d; text-decoration: none;">Privacy Policy</a></li>
          <li><a href="/terms/" style="color: #4d4d4d; text-decoration: none;">Terms of Service</a></li>
          <li><a href="/disclaimer/" style="color: #4d4d4d; text-decoration: none;">Disclaimer</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid #ebebeb; padding-top: 32px; text-align: center;">
      <p style="color: #888888; font-size: 12px; margin: 0; font-family: 'JetBrains Mono', monospace;">
        &copy; 2026 Weight Loss Percentage. All rights reserved. Free dietitian-reviewed health and fitness tools.
      </p>
    </div>
  </div>
</footer>"""

blog_dirs = ['blog', 'au/blog', 'uk/blog', 'ca/blog', 'nz/blog', 'zh/blog', 'ru/blog']

processed = 0

for b_dir in blog_dirs:
    if not os.path.exists(b_dir):
        continue
    for root, _, files in os.walk(b_dir):
        for f in files:
            if f.endswith('.html'):
                fpath = os.path.join(root, f)
                with open(fpath, 'r', encoding='utf-8') as fh:
                    html = fh.read()

                orig_html = html

                # 1. Remove React SPA scripts
                html = re.sub(r'<script[^>]*type=["\']module["\'][^>]*src=["\'][^"\']*/assets/[^"\']+\.js["\'][^>]*></script>', '', html, flags=re.IGNORECASE)
                html = re.sub(r'<link[^>]*rel=["\']modulepreload["\'][^>]*href=["\'][^"\']*/assets/[^"\']+\.js["\'][^>]*\s*/?>', '', html, flags=re.IGNORECASE)

                # 2. Remove FOUC hide styles
                html = re.sub(r'<style>\s*\.static-header,\s*(?:#main-content,\s*\.static-footer|\.static-footer,\s*#root\s*>\s*#main-content)\s*\{\s*display:\s*none\s*!important;\s*\}\s*</style>', '', html, flags=re.IGNORECASE)
                html = re.sub(r'<noscript>\s*<style>\s*\.static-header,\s*(?:#main-content,\s*\.static-footer|\.static-footer,\s*#root\s*>\s*#main-content)\s*\{\s*display:\s*block\s*!important;\s*\}\s*<\/style>\s*<\/noscript>', '', html, flags=re.IGNORECASE)

                # 3. Remove spa-loader and layout-loader divs
                html = re.sub(r'<div\s+id=["\'](?:spa|layout)-loader["\'][\s\S]*?<\/div>\s*<\/div>', '', html, flags=re.IGNORECASE)

                # 4. Replace legacy static header with standardized home page header
                if '<header class="static-header"' in html or '<header' in html:
                    html = re.sub(r'<header[^>]*class=["\']static-header["\'][^>]*>[\s\S]*?</header>', HEADER_HTML, html, flags=re.IGNORECASE)

                # 5. Replace legacy static footer with standardized home page footer
                if '<footer class="static-footer"' in html:
                    html = re.sub(r'<footer[^>]*class=["\']static-footer["\'][^>]*>[\s\S]*?</footer>', FOOTER_HTML, html, flags=re.IGNORECASE)
                elif '</body>' in html and '<footer' not in html:
                    html = html.replace('</body>', f'{FOOTER_HTML}\n</body>')

                if html != orig_html:
                    with open(fpath, 'w', encoding='utf-8') as fh:
                        fh.write(html)
                    processed += 1

print(f"Successfully processed and standardized {processed} blog HTML files!")
