"""Apply AdSense ad units (Dharma1, 3rd Ad in-article, Dharma 2 pre-footer)
across JS bundles and Astro components.

Ad Units:
- Dharma1 (Top/Header Display): slot "8714170901"
- 3rd Ad (In-Article Fluid): slot "8863033072", layout "in-article", format "fluid"
- Dharma 2 (Pre-Footer Display): slot "9720699039"
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLES = [
    os.path.join(ROOT, 'assets', 'index-Ctp2HkQJ.js'),
    os.path.join(ROOT, 'public', 'assets', 'index-Ctp2HkQJ.js')
]

def patch_bundles():
    for bundle_path in BUNDLES:
        if not os.path.exists(bundle_path):
            print(f"Skipping non-existent bundle: {bundle_path}")
            continue

        c = open(bundle_path, encoding='utf-8').read()

        # Update default slot in Li component
        # Before: "data-ad-slot":r??"0000000000"
        # After:  "data-ad-slot":r??(u==="in-article"?"8863033072":"8714170901")
        old_slot_default = '"data-ad-slot":r??"0000000000"'
        new_slot_default = '"data-ad-slot":r??(u==="in-article"?"8863033072":"8714170901")'

        if old_slot_default in c:
            c = c.replace(old_slot_default, new_slot_default)
            print(f"  Patched default ad slot logic in {os.path.basename(bundle_path)}")
        elif new_slot_default in c:
            print(f"  Already patched default ad slot logic in {os.path.basename(bundle_path)}")
        else:
            # Fallback replace for 0000000000 if previously partially modified
            c = c.replace('"data-ad-slot":r??"0000000000"', new_slot_default)

        # Ensure in-article layout sets format="fluid" when layout="in-article"
        # "data-ad-format":g
        # -> "data-ad-format":u==="in-article"?"fluid":g
        old_fmt = '"data-ad-format":g'
        new_fmt = '"data-ad-format":u==="in-article"?"fluid":g'
        if old_fmt in c:
            c = c.replace(old_fmt, new_fmt)
            print(f"  Patched in-article fluid format in {os.path.basename(bundle_path)}")

        open(bundle_path, 'w', encoding='utf-8').write(c)

def patch_footer():
    footer_path = os.path.join(ROOT, 'src', 'components', 'Footer.astro')
    if not os.path.exists(footer_path):
        print(f"Footer file not found: {footer_path}")
        return

    content = open(footer_path, encoding='utf-8').read()
    
    ad_unit_code = '''
    <!-- AdSense Dharma 2 Pre-Footer Ad Unit -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 text-center">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-7203223934454111"
           data-ad-slot="9720699039"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script is:inline>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
'''

    if 'data-ad-slot="9720699039"' not in content:
        # Insert before footer opening tag
        target = '<footer class="static-footer"'
        if target in content:
            content = content.replace(target, ad_unit_code + '\n' + target)
            open(footer_path, 'w', encoding='utf-8').write(content)
            print("  Added Dharma 2 Pre-Footer Ad Unit to Footer.astro")
        else:
            print("  Could not find <footer tag in Footer.astro")
    else:
        print("  Footer.astro already has Dharma 2 Ad Unit")

def main():
    print("Applying AdSense ad units across site...")
    patch_bundles()
    patch_footer()
    print("AdSense ad units applied successfully!")

if __name__ == '__main__':
    main()
