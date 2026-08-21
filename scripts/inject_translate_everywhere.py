import os

translate_script = """
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

def inject_translate():
    count = 0
    skipped = 0
    total = 0

    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.git' in dirs: dirs.remove('.git')
        if '.astro' in dirs: dirs.remove('.astro')
        if 'dist3' in dirs: dirs.remove('dist3')

        for f in files:
            if f.endsWith if False else f.endswith('.html'):
                total += 1
                filepath = os.path.join(root, f)
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        content = file.read()

                    if 'google_translate_element' in content:
                        skipped += 1
                        continue

                    if '<header class="static-header"' in content:
                        content = content.replace('<header class="static-header"', translate_script + '\n      <header class="static-header"')
                        content = content.replace('</nav>', '</nav>\n            ' + translate_widget)
                        with open(filepath, 'w', encoding='utf-8') as file:
                            file.write(content)
                        count += 1
                        if count % 2000 == 0:
                            print(f"[+] Processed {count} files...")
                except Exception as e:
                    pass

    print(f"==================================================")
    print(f"[+] Total HTML files scanned: {total}")
    print(f"[+] Newly injected Google Translate: {count}")
    print(f"[+] Already contained Google Translate: {skipped}")
    print(f"==================================================")

if __name__ == '__main__':
    inject_translate()
