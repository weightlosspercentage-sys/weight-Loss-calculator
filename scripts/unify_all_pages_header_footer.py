import os
import re

UNIFIED_HEADER = """
        <style>
          .goog-te-gadget-simple {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 20px !important;
            padding: 4px 10px !important;
            font-size: 13px !important;
            display: inline-flex !important;
            align-items: center !important;
            cursor: pointer !important;
            font-family: inherit !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value span {
            color: #334155 !important;
            font-weight: 500 !important;
          }
          .goog-te-gadget-icon { display: inline-block !important; margin-right: 4px !important; }
          body { top: 0px !important; }
          .goog-te-banner-frame { display: none !important; }

          /* Navigation Dropdowns */
          .nav-item-dropdown { position: relative; display: inline-block; }
          .nav-dropdown-content {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            min-width: 240px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            padding: 0.5rem 0;
            z-index: 100;
          }
          .nav-item-dropdown:hover .nav-dropdown-content { display: block; }
          .nav-dropdown-content a {
            display: block;
            padding: 0.5rem 1rem;
            color: #334155;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 400;
          }
          .nav-dropdown-content a:hover {
            background: #f1f5f9;
            color: #4f46e5;
          }
        </style>

      <header class="static-header" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); font-family: sans-serif;">
        <div style="max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          
          <!-- Logo -->
          <a href="/" style="font-weight: 700; font-size: 1.25rem; text-decoration: none; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: #171717; color: white; border-radius: 6px; width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem;">%</span>
            <span style="font-weight: 700; color: #0f172a; font-size: 1.125rem;">Weight Loss Percentage</span>
          </a>

          <!-- Desktop Navigation -->
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <nav style="display: flex; gap: 1.25rem; align-items: center;">
              <a href="/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Home</a>
              
              <!-- Calculators Dropdown -->
              <div class="nav-item-dropdown">
                <a href="/calculators/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
                  Calculators <span style="font-size: 10px;">▼</span>
                </a>
                <div class="nav-dropdown-content">
                  <a href="/calculators/">All Calculators Hub</a>
                  <a href="/calculators/weight-loss/">Weight Loss Calculator</a>
                  <a href="/calculators/body-fat/">Body Fat % Calculator</a>
                  <a href="/calculators/bmi/">BMI Calculator</a>
                  <a href="/calculators/tdee/">TDEE Calculator</a>
                  <a href="/calculators/bmr/">BMR Calculator</a>
                  <a href="/calculators/macro/">Macro Calculator</a>
                  <a href="/calculators/calorie-deficit/">Calorie Deficit Calculator</a>
                  <a href="/calculators/rucking/">Rucking Calorie Calculator</a>
                  <a href="/calculators/stairmaster/">StairMaster Calorie Calculator</a>
                  <a href="/calculators/elliptical/">Elliptical Calorie Calculator</a>
                  <a href="/calculators/rowing/">Rowing Calorie Calculator</a>
                  <a href="/calculators/cycling/">Cycling Calorie Calculator</a>
                  <a href="/calculators/hiit-bodyweight/">HIIT & Bodyweight Calorie</a>
                  <a href="/calculators/pcos-calorie/">PCOS Calorie Calculator</a>
                  <a href="/calculators/body-recomposition/">Body Recomposition Calculator</a>
                  <a href="/calculators/unit-converters/">Unit Converters (g to kcal)</a>
                </div>
              </div>

              <!-- Nutrition Dropdown -->
              <div class="nav-item-dropdown">
                <a href="/nutrition/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
                  Nutrition <span style="font-size: 10px;">▼</span>
                </a>
                <div class="nav-dropdown-content">
                  <a href="/nutrition/">Nutrition & Fast Food Hub</a>
                  <a href="/restaurants/fast-food-hub/">All Fast Food Restaurants</a>
                  <a href="/restaurants/taco-bell/">Taco Bell Calorie Calculator</a>
                  <a href="/restaurants/dutch-bros/">Dutch Bros Calorie Calculator</a>
                  <a href="/restaurants/dominos/">Domino's Calorie Calculator</a>
                  <a href="/restaurants/five-guys/">Five Guys Calorie Calculator</a>
                  <a href="/restaurants/pizza-hut/">Pizza Hut Calorie Calculator</a>
                  <a href="/restaurants/jimmy-johns/">Jimmy John's Calorie Calculator</a>
                  <a href="/restaurants/wendys/">Wendy's Calorie Calculator</a>
                  <a href="/restaurants/chipotle/">Chipotle Calorie Calculator</a>
                  <a href="/restaurants/starbucks/">Starbucks Calorie Calculator</a>
                  <a href="/restaurants/mcdonalds/">McDonald's Calorie Calculator</a>
                  <a href="/restaurants/subway/">Subway Calorie Calculator</a>
                  <a href="/calculators/boba-tea/">Boba Tea Calorie Calculator</a>
                  <a href="/calculators/poke-bowl/">Poke Bowl Calorie Calculator</a>
                  <a href="/calculators/salad-calories/">Salad Calorie Calculator</a>
                  <a href="/calculators/sushi-calories/">Sushi Calorie Calculator</a>
                  <a href="/calculators/beer-calories/">Beer Calorie Calculator</a>
                  <a href="/calculators/indian-food/">Indian Food Calorie Calculator</a>
                  <a href="/calculators/smoothie/">Smoothie Calorie Calculator</a>
                </div>
              </div>

              <a href="/compare/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Compare</a>
              <a href="/blog/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Blog</a>
              <a href="/glossary/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Glossary</a>
              <a href="/about/" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">About</a>
            </nav>

            <!-- Google Translate Element Container -->
            <div id="google_translate_element" style="display: inline-flex; align-items: center;"></div>
          </div>
        </div>
      </header>

      <!-- Google Translate Init Script AFTER #google_translate_element in DOM -->
      <script type="text/javascript">
        function googleTranslateElementInit() {
          if (document.getElementById('google_translate_element')) {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,nl,sv,da,no,fi,pl,ru,tr,uk',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: true
            }, 'google_translate_element');
          }
        }
      </script>
      <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>
"""

UNIFIED_FOOTER = """
      <footer class="static-footer" style="background: #0f172a; color: #94a3b8; padding: 3rem 1.5rem 2rem; margin-top: 4rem; font-family: sans-serif;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem;">
          <div>
            <div style="font-weight: 700; color: #ffffff; font-size: 1.125rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="background: #38bdf8; color: #0f172a; border-radius: 6px; width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem;">%</span>
              Weight Loss Percentage
            </div>
            <p style="font-size: 0.875rem; line-height: 1.5; color: #94a3b8;">
              Dietitian-reviewed clinical weight calculators, calorie deficit tools, and fast-food nutrition analyzers designed for body progress tracking.
            </p>
          </div>
          <div>
            <h4 style="color: #ffffff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">Top Calculators</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
              <li><a href="/calculators/weight-loss/" style="color: #94a3b8; text-decoration: none;">Weight Loss Percentage</a></li>
              <li><a href="/calculators/body-fat/" style="color: #94a3b8; text-decoration: none;">Body Fat Percentage</a></li>
              <li><a href="/calculators/bmi/" style="color: #94a3b8; text-decoration: none;">BMI Calculator</a></li>
              <li><a href="/calculators/tdee/" style="color: #94a3b8; text-decoration: none;">TDEE & Calorie Deficit</a></li>
              <li><a href="/calculators/rucking/" style="color: #94a3b8; text-decoration: none;">Rucking Calorie Calculator</a></li>
              <li><a href="/restaurants/fast-food-hub/" style="color: #94a3b8; text-decoration: none;">Fast Food Calorie Hub</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #ffffff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">Popular Restaurants</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
              <li><a href="/restaurants/taco-bell/" style="color: #94a3b8; text-decoration: none;">Taco Bell Calculator</a></li>
              <li><a href="/restaurants/dutch-bros/" style="color: #94a3b8; text-decoration: none;">Dutch Bros Calculator</a></li>
              <li><a href="/restaurants/chipotle/" style="color: #94a3b8; text-decoration: none;">Chipotle Calculator</a></li>
              <li><a href="/restaurants/dominos/" style="color: #94a3b8; text-decoration: none;">Domino's Calculator</a></li>
              <li><a href="/restaurants/starbucks/" style="color: #94a3b8; text-decoration: none;">Starbucks Calculator</a></li>
              <li><a href="/restaurants/mcdonalds/" style="color: #94a3b8; text-decoration: none;">McDonald's Calculator</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #ffffff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">Company & Legal</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
              <li><a href="/about/" style="color: #94a3b8; text-decoration: none;">About Us</a></li>
              <li><a href="/contact/" style="color: #94a3b8; text-decoration: none;">Contact Us</a></li>
              <li><a href="/privacy/" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a></li>
              <li><a href="/terms/" style="color: #94a3b8; text-decoration: none;">Terms of Service</a></li>
              <li><a href="/disclaimer/" style="color: #94a3b8; text-decoration: none;">Medical Disclaimer</a></li>
              <li><a href="/glossary/" style="color: #94a3b8; text-decoration: none;">Fitness Glossary</a></li>
            </ul>
          </div>
        </div>
        <div style="max-width: 1200px; margin: 2rem auto 0; padding-top: 1.5rem; border-top: 1px solid #334155; text-align: center; font-size: 0.8rem; color: #64748b;">
          © 2026 Weight Loss Percentage. All rights reserved. For educational use only.
        </div>
      </footer>
"""

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove existing static header
        content = re.sub(r'<style>\s*\.goog-te-gadget-simple[\s\S]*?</header>', UNIFIED_HEADER.strip(), content)
        content = re.sub(r'<header class="static-header"[\s\S]*?</header>', UNIFIED_HEADER.strip(), content)

        # Remove existing static footer
        if '<footer class="static-footer"' in content:
            content = re.sub(r'<footer class="static-footer"[\s\S]*?</footer>', UNIFIED_FOOTER.strip(), content)
        elif '</footer>' in content:
            content = re.sub(r'<footer[\s\S]*?</footer>', UNIFIED_FOOTER.strip(), content)
        elif '</main>' in content:
            content = content.replace('</main>', '</main>\n' + UNIFIED_FOOTER.strip())

        with open(filepath, 'w', encoding='utf-8') as f:
            file.write(content) if False else f.write(content)
        return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    count = 0
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.git' in dirs: dirs.remove('.git')
        if '.astro' in dirs: dirs.remove('.astro')
        if 'dist3' in dirs: dirs.remove('dist3')

        for f in files:
            if f.endswith('.html'):
                p = os.path.join(root, f)
                if update_file(p):
                    count += 1
                    if count % 2000 == 0:
                        print(f"[+] Updated {count} pages...")
    print(f"==================================================")
    print(f"[+] Successfully unified header & footer across {count} HTML pages!")
    print(f"==================================================")

if __name__ == '__main__':
    main()
