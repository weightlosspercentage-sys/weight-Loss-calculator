import os
import re

# Complete list of calculators for the dropdown
CALCULATORS_DROPDOWN_HTML = """                  <a href="/calculators/" style="font-weight: 700; color: #4f46e5; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 4px;">All Calculators Hub (35+)</a>
                  <a href="/calculators/weight-loss/">Weight Loss Calculator</a>
                  <a href="/calculators/body-fat/">Body Fat % Calculator</a>
                  <a href="/calculators/bmi/">BMI Calculator</a>
                  <a href="/calculators/tdee/">TDEE Calculator</a>
                  <a href="/calculators/bmr/">BMR Calculator</a>
                  <a href="/calculators/macro/">Macro Calculator</a>
                  <a href="/calculators/calorie-deficit/">Calorie Deficit Calculator</a>
                  <a href="/calculators/calorie/">Calorie Calculator</a>
                  <a href="/calculators/fat-loss/">Fat Loss Calculator</a>
                  <a href="/calculators/protein/">Protein Calculator</a>
                  <a href="/calculators/water-intake/">Water Intake Calculator</a>
                  <a href="/calculators/walking/">Walking Calorie Calculator</a>
                  <a href="/calculators/cycling/">Cycling Calorie Calculator</a>
                  <a href="/calculators/rowing/">Rowing Calorie Calculator</a>
                  <a href="/calculators/elliptical/">Elliptical Calorie Calculator</a>
                  <a href="/calculators/stairmaster/">StairMaster Calorie Calculator</a>
                  <a href="/calculators/rucking/">Rucking Calorie Calculator</a>
                  <a href="/calculators/hiit-bodyweight/">HIIT & Bodyweight Calorie</a>
                  <a href="/calculators/fitness/">Fitness & Cardio Calculator</a>
                  <a href="/calculators/body-recomposition/">Body Recomposition Calculator</a>
                  <a href="/calculators/pcos-calorie/">PCOS Calorie Calculator</a>
                  <a href="/calculators/intermittent-fasting/">Intermittent Fasting Calculator</a>
                  <a href="/calculators/carnivore-diet/">Carnivore Diet Calculator</a>
                  <a href="/calculators/keto/">Keto Calculator</a>
                  <a href="/calculators/unit-converters/">Unit Converters (g to kcal)</a>
                  <a href="/calculators/glp1-weight-loss/">GLP-1 Weight Loss</a>
                  <a href="/calculators/bariatric-surgery-weight-loss/">Bariatric Surgery Weight Loss</a>
                  <a href="/calculators/postpartum-weight-loss/">Postpartum Weight Loss</a>
                  <a href="/calculators/newborn-weight-loss/">Newborn Weight Loss</a>
                  <a href="/calculators/infant-weight-loss/">Infant Weight Loss</a>
                  <a href="/calculators/baby-weight-loss/">Baby Weight Loss</a>
                  <a href="/calculators/pregnancy/">Pregnancy Weight Gain</a>
                  <a href="/calculators/dog-weight-loss/">Dog Weight Loss</a>
                  <a href="/calculators/peptide-dosage/">Peptide Dosage</a>
                  <a href="/calculators/biggest-loser/">Biggest Loser Calculator</a>"""

NUTRITION_DROPDOWN_HTML = """                  <a href="/nutrition/" style="font-weight: 700; color: #4f46e5; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 4px;">Nutrition & Fast Food Hub</a>
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
                  <a href="/calculators/smoothie/">Smoothie Calorie Calculator</a>"""

UNIFIED_HEADER = f"""      <!-- Unified Header with Google Translate & All Calculators Dropdown -->
      <header class="static-header" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); font-family: sans-serif;">
        <style>
          .static-nav-link {{ position: relative; padding: 0.25rem 0; }}
          .static-nav-link:hover {{ color: #4f46e5 !important; }}
          .goog-te-gadget-simple {{
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 20px !important;
            padding: 4px 10px !important;
            font-size: 13px !important;
            display: inline-flex !important;
            align-items: center !important;
            cursor: pointer !important;
            font-family: inherit !important;
          }}
          .goog-te-gadget-simple .goog-te-menu-value span {{ color: #334155 !important; font-weight: 500 !important; }}
          .goog-te-gadget-icon {{ display: inline-block !important; margin-right: 4px !important; }}
          body {{ top: 0px !important; }}
          .goog-te-banner-frame {{ display: none !important; }}

          /* Navigation Dropdowns */
          .nav-item-dropdown {{ position: relative; display: inline-block; }}
          .nav-dropdown-content {{
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            min-width: 260px;
            max-height: 480px;
            overflow-y: auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            padding: 0.5rem 0;
            z-index: 100;
          }}
          .nav-item-dropdown:hover .nav-dropdown-content {{ display: block; }}
          .nav-dropdown-content a {{
            display: block;
            padding: 0.45rem 1rem;
            color: #334155;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 400;
          }}
          .nav-dropdown-content a:hover {{
            background: #f1f5f9;
            color: #4f46e5;
          }}
        </style>

        <div style="max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <!-- Logo -->
          <a href="/" style="font-weight: 700; font-size: 1.25rem; text-decoration: none; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
            <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316); color: white; border-radius: 8px; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; font-weight: 800;">%</span>
            <span style="font-weight: 700; color: #0f172a; font-size: 1.125rem;">Weight Loss Percentage</span>
          </a>

          <!-- Desktop Navigation -->
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <nav style="display: flex; gap: 1.25rem; align-items: center;">
              <a href="/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Home</a>
              
              <!-- Calculators Dropdown -->
              <div class="nav-item-dropdown">
                <a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
                  Calculators <span style="font-size: 10px;">▼</span>
                </a>
                <div class="nav-dropdown-content">
{CALCULATORS_DROPDOWN_HTML}
                </div>
              </div>

              <!-- Nutrition Dropdown -->
              <div class="nav-item-dropdown">
                <a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
                  Nutrition <span style="font-size: 10px;">▼</span>
                </a>
                <div class="nav-dropdown-content">
{NUTRITION_DROPDOWN_HTML}
                </div>
              </div>

              <a href="/compare/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Compare</a>
              <a href="/blog/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Blog</a>
              <a href="/glossary/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Glossary</a>
              <a href="/about/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">About</a>
            </nav>

            <!-- Google Translate Element Container in Nav Bar -->
            <div id="google_translate_element" style="display: inline-flex; align-items: center;"></div>
          </div>
        </div>

        <script type="text/javascript">
          function googleTranslateElementInit() {{
            if (document.getElementById('google_translate_element')) {{
              new google.translate.TranslateElement({{
                pageLanguage: 'en',
                includedLanguages: 'en,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,nl,sv,da,no,fi,pl,ru,tr,uk',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }}, 'google_translate_element');
            }}
          }}
        </script>
        <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>
      </header>"""

UNIFIED_FOOTER = """      <!-- Unified 4-Column Footer matching Home Page -->
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
      </footer>"""

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Clean duplicate/broken translate scripts and headers
        # Remove any style + header or nested broken headers
        pattern_header = r'(<style>\s*\.goog-te-gadget-simple[\s\S]*?</header>(\s*<!-- Google Translate Init Script[\s\S]*?</script>)*|<header class="static-header"[\s\S]*?</header>(\s*<!-- Google Translate Init Script[\s\S]*?</script>)*)'
        
        # We need to replace all header instances and surrounding translate junk before <main
        if '<header class="static-header"' in content or '.goog-te-gadget-simple' in content:
            # First clean up any duplicate translate scripts above or below header
            content = re.sub(r'<!-- Google Translate Init Script AFTER #google_translate_element in DOM -->\s*<script[\s\S]*?</script>\s*<script[\s\S]*?</script>', '', content)
            
            # Find and replace the header section
            if '<main' in content:
                parts = content.split('<main', 1)
                before_main = parts[0]
                after_main = '<main' + parts[1]
                
                if '<div id="spa-loader"' in before_main:
                    loader_split = before_main.split('</div>\n    \n      \n      ', 1)
                    if len(loader_split) == 2:
                        before_main = loader_split[0] + '</div>\n\n' + UNIFIED_HEADER + '\n    \n      '
                    else:
                        before_main = re.sub(r'(<div id="spa-loader"[\s\S]*?</div>)[\s\S]*$', r'\1\n\n' + UNIFIED_HEADER + '\n', before_main)
                elif '<body>\n    <div>' in before_main or '<body>\n    <div id="root">' in before_main:
                    before_main = re.sub(r'(<body>\s*<div[^>]*>)[\s\S]*$', r'\1\n\n' + UNIFIED_HEADER + '\n', before_main)
                else:
                    before_main = re.sub(pattern_header, UNIFIED_HEADER, before_main)
                
                content = before_main + after_main
            else:
                content = re.sub(pattern_header, UNIFIED_HEADER, content)

        # Replace footer
        if '<footer class="static-footer"' in content:
            content = re.sub(r'<footer class="static-footer"[\s\S]*?</footer>', UNIFIED_FOOTER, content)
        elif '<footer' in content:
            content = re.sub(r'<footer[\s\S]*?</footer>', UNIFIED_FOOTER, content)
        elif '</main>' in content:
            content = content.replace('</main>', '</main>\n\n' + UNIFIED_FOOTER)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    count = 0
    for root, dirs, files in os.walk('.'):
        for skip_dir in ['node_modules', '.git', '.astro', 'dist3', '.vscode', '.wrangler']:
            if skip_dir in dirs:
                dirs.remove(skip_dir)

        for f in files:
            if f.endswith('.html'):
                p = os.path.join(root, f)
                if update_file(p):
                    count += 1
                    if count % 2000 == 0:
                        print(f"[+] Processed {count} pages...")
    print(f"==================================================")
    print(f"[+] Successfully unified header & footer across {count} HTML pages!")
    print(f"==================================================")

if __name__ == '__main__':
    main()
