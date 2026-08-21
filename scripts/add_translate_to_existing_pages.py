import os
import re

translate_snippet = """
        <style>
          .goog-te-gadget-simple {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 20px !important;
            padding: 3px 8px !important;
            font-size: 13px !important;
            display: inline-flex !important;
            align-items: center !important;
            cursor: pointer !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value span {
            color: #334155 !important;
            font-weight: 500 !important;
          }
          body { top: 0px !important; }
          .goog-te-banner-frame { display: none !important; }
        </style>
        <script type="text/javascript">
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,nl,sv,da,no,fi,pl,ru,tr,uk',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: true
            }, 'google_translate_element');
          }
        </script>
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
"""

translate_widget = '<div id="google_translate_element" style="display: inline-flex; align-items: center; margin-left: 0.75rem;"></div>'

def process_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'id="google_translate_element"' in content:
        return # Already has it

    # Insert script into head or top of static-header
    if '<header class="static-header"' in content:
        content = content.replace('<header class="static-header"', translate_snippet + '\n      <header class="static-header"')
        # Insert widget into header nav
        content = content.replace('</nav>', '</nav>\n            ' + translate_widget)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[+] Updated: {filepath}")

# Update core static hub pages
files_to_update = [
    'index.html',
    'calculators/index.html',
    'nutrition/index.html',
    'blog/index.html',
    'compare/index.html',
    'about/index.html',
    'contact/index.html',
    'privacy/index.html',
    'terms/index.html',
    'disclaimer/index.html',
    'glossary/index.html',
    'restaurants/starbucks/index.html',
    'restaurants/subway/index.html',
    'restaurants/mcdonalds/index.html'
]

for f in files_to_update:
    process_file(f)
