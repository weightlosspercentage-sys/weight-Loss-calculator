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

UNIFIED_FOOTER = """


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

<footer class="static-footer" style="background: #0f172a; border-top: 1px solid #1e293b; padding: 64px 24px; font-family: sans-serif; color: #94a3b8;">
  <div style="max-width: 1400px; margin: 0 auto; text-align: center;">
    

    <!-- Rest of Footer - Aligned Left for desktop grid -->
    <div style="text-align: left; margin-top: 2rem;">
      
      <!-- Top Row: Get in Touch & Newsletter -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 32px; border-bottom: 1px solid #1e293b; padding-bottom: 40px; margin-bottom: 48px;">
        <div style="flex: 1.5; min-width: 280px;">
          <div style="color: #ffffff; font-size: 12px; font-weight: 400; font-family: monospace; margin: 0 0 8px 0; text-transform: uppercase;">Get In Touch</div>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #94a3b8;">
            Have questions, feedback, or need help? We'd love to hear from you.
          </p>
        </div>
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
          <span style="color: #ffffff; font-family: monospace; font-size: 12px; text-transform: uppercase;">Join our newsletter</span>
          <div style="display: flex; width: 100%; max-width: 400px; gap: 8px;">
            <input type="email" placeholder="Enter your email" style="flex: 1; padding: 10px 16px; border-radius: 6px; border: 1px solid #1e293b; background: #0f172a; color: #ffffff; font-size: 14px;" />
            <button style="padding: 10px 16px; border-radius: 6px; border: none; background: #3b82f6; color: #ffffff; font-weight: 500; font-size: 14px; cursor: pointer;">Subscribe</button>
          </div>
        </div>
      </div>

      <!-- Main Column Content Grid -->
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2.5rem; margin-bottom: 3rem;">
        
        <!-- Brand Info Column -->
        <div style="flex: 2; min-width: 260px; margin-bottom: 16px;">
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; letter-spacing: -0.03em;">
            <a href="/" style="text-decoration: none; color: #ffffff;">
              Weight Loss Percentage
            </a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #94a3b8;">
            Free dietitian-reviewed health, nutrition, and fitness calculators designed to scale weight management metrics scientifically.
          </p>
          <div style="display: flex; gap: 16px; align-items: center;">
            <a href="https://www.facebook.com/weightlossnewborn/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style="color: #64748b; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#64748b'">
              <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="https://x.com/weightlossperce" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" style="color: #64748b; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#64748b'">
              <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/weightloss-percentage/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style="color: #64748b; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#64748b'">
              <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            </a>
            <a href="https://www.instagram.com/weightlosspercentage/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color: #64748b; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#64748b'">
              <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>

        <!-- Column 1: Calculators -->
        <div style="flex: 1; min-width: 160px;">
          <div style="color: #ffffff; font-family: monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">Calculators</div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
            <li><a href="/calculators/weight-loss/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Weight Loss %</a></li>
            <li><a href="/calculators/bmi/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">BMI Calculator</a></li>
            <li><a href="/calculators/tdee/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">TDEE Calculator</a></li>
            <li><a href="/calculators/bmr/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">BMR Calculator</a></li>
            <li><a href="/calculators/calorie/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Calorie Calculator</a></li>
            <li><a href="/calculators/macro/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Macro Calculator</a></li>
            <li><a href="/calculators/body-fat/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Body Fat Calculator</a></li>
          </ul>
        </div>

        <!-- Column 2: Pediatric & Pet -->
        <div style="flex: 1; min-width: 160px;">
          <div style="color: #ffffff; font-family: monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">More Tools</div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
            <li><a href="/calculators/newborn-weight-loss/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Newborn Weight Loss</a></li>
            <li><a href="/calculators/infant-weight-loss/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Infant Weight Loss</a></li>
            <li><a href="/calculators/baby-weight-loss/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Baby Weight Loss</a></li>
            <li><a href="/calculators/dog-weight-loss/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Dog Weight Loss</a></li>
            <li><a href="/calculators/peptide-dosage/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Peptide Dosage</a></li>
          </ul>
        </div>

        <!-- Column 3: Resources -->
        <div style="flex: 1; min-width: 160px;">
          <div style="color: #ffffff; font-family: monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">Resources</div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
            <li><a href="/about/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">About Us</a></li>
            <li><a href="/contact/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Contact Us</a></li>
            <li><a href="/blog/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Blog</a></li>
            <li><a href="/glossary/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Glossary</a></li>
          </ul>
        </div>

        <!-- Column 4: Legal -->
        <div style="flex: 1; min-width: 160px;">
          <div style="color: #ffffff; font-family: monospace; font-size: 12px; font-weight: 400; margin: 0 0 16px 0; text-transform: uppercase;">Legal</div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
            <li><a href="/privacy/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Privacy Policy</a></li>
            <li><a href="/terms/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Terms of Service</a></li>
            <li><a href="/disclaimer/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">Disclaimer</a></li>
          </ul>
        </div>
      </div>

      <!-- Copyright Section -->
      <div style="border-top: 1px solid #1e293b; padding-top: 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 24px;">
        <!-- Region / Language Selector -->
        <div class="notranslate" translate="no" style="margin-bottom: 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; font-family: sans-serif;">
          <span style="color: #64748b; font-size: 12px; font-weight: 400; text-transform: uppercase; font-family: monospace;">Region / Language</span>
          <div style="display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 14px;">
            
                <a href="/" style="color: #ffffff; font-weight: 500; text-decoration: none; padding: 4px 8px; background: #1e293b; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">???? English (US)</a>
                <span style="color: #334155; font-size: 12px;">•</span>
                <a href="/uk/" style="color: #94a3b8; font-weight: 400; text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">???? English (UK)</a>
                <span style="color: #334155; font-size: 12px;">•</span>
                <a href="/ca/" style="color: #94a3b8; font-weight: 400; text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">???? English (CA)</a>
                <span style="color: #334155; font-size: 12px;">•</span>
                <a href="/au/" style="color: #94a3b8; font-weight: 400; text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">???? English (AU)</a>
                <span style="color: #334155; font-size: 12px;">•</span>
                <a href="/nz/" style="color: #94a3b8; font-weight: 400; text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">???? English (NZ)</a>
                <span style="color: #334155; font-size: 12px;">•</span>
                <a href="/zh/" style="color: #94a3b8; font-weight: 400; text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">???? ????</a>
                <span style="color: #334155; font-size: 12px;">•</span>
                <a href="/ru/" style="color: #94a3b8; font-weight: 400; text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">???? ???????</a>

          </div>
        </div>

        <p style="color: #64748b; font-size: 12px; margin: 0; font-family: monospace;">
          &copy; 2026 Weight Loss Percentage. All rights reserved. Free dietitian-reviewed health and fitness tools.
        </p>
      </div>

    </div>

  </div>
</footer>





"""

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



