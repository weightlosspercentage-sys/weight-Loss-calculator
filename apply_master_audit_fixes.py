from bs4 import BeautifulSoup
import json
import os
import re

def apply_fixes(file_path):
    print(f"Applying fixes to {file_path}")
    if not os.path.exists(file_path):
        print("File not found.")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    # Phase 1: Inject MedicalWebPage Schema
    medical_schema = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "@id": "https://www.weightlosspercentage.com/#webpage",
        "url": "https://www.weightlosspercentage.com/",
        "name": "Weight Loss Percentage Calculator & Medical Progress Guide",
        "description": "Accurately compute percentage of body weight lost over time with scientific health benchmarks.",
        "medicalAudience": "Patients, Athletes, General Public",
        "aspect": "Diagnosis and Evaluation"
    }
    
    # Check if already exists
    schema_exists = False
    for script in soup.find_all("script", type="application/ld+json"):
        if script.string and "MedicalWebPage" in script.string:
            schema_exists = True
            break
            
    if not schema_exists:
        script_tag = soup.new_tag("script", type="application/ld+json")
        script_tag.string = "\n" + json.dumps(medical_schema, indent=4) + "\n"
        if soup.head:
            soup.head.append(script_tag)

    # Phase 1: Fix heading hierarchy
    # Look for H1s. If more than 1, make the rest H2s.
    h1s = soup.find_all("h1")
    if len(h1s) > 1:
        for extra_h1 in h1s[1:]:
            extra_h1.name = "h2"

    # Phase 1: Accessibility Patch Script for React Inputs
    patch_script_content = """
      (function() {
        if(typeof MutationObserver !== 'undefined') {
          const observer = new MutationObserver((mutations) => {
            const inputs = document.querySelectorAll('#root input');
            inputs.forEach(input => {
              if (!input.hasAttribute('role')) {
                input.setAttribute('role', 'spinbutton');
              }
            });
            const formWrappers = document.querySelectorAll('#root .calculator-container, #root .grid');
            formWrappers.forEach(wrap => {
              if (!wrap.hasAttribute('role')) {
                wrap.setAttribute('role', 'form');
                wrap.setAttribute('aria-label', 'Weight Loss Calculator');
              }
            });
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      })();
    """
    
    patch_exists = False
    for script in soup.find_all("script"):
        if script.string and "spinbutton" in script.string and "MutationObserver" in script.string:
            patch_exists = True
            break
            
    if not patch_exists:
        patch_tag = soup.new_tag("script")
        patch_tag.string = patch_script_content
        if soup.body:
            soup.body.append(patch_tag)

    # Phase 2: Scientific References Section
    references_html = """
    <section class="scientific-references" style="margin-top: 3rem; margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; font-size: 1.3rem; font-weight: 700; margin-top: 0; margin-bottom: 1rem;">Scientific References & Clinical Guidelines</h2>
      <ul style="padding-left: 1.5rem; line-height: 1.6; color: #475569; font-size: 0.95rem;">
        <li style="margin-bottom: 0.5rem;"><a href="https://www.cdc.gov/healthyweight/losing_weight/index.html" target="_blank" rel="noopener noreferrer nofollow" style="color: #4f46e5;">CDC Healthy Weight Guidelines</a> - Centers for Disease Control and Prevention</li>
        <li style="margin-bottom: 0.5rem;"><a href="https://www.nhlbi.nih.gov/health/educational/lose_wt/index.htm" target="_blank" rel="noopener noreferrer nofollow" style="color: #4f46e5;">NIH National Heart, Lung, and Blood Institute (NHLBI) Obesity Guidelines</a></li>
        <li style="margin-bottom: 0.5rem;"><a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer nofollow" style="color: #4f46e5;">PubMed studies on rate of fat mass vs. lean mass loss</a></li>
      </ul>
    </section>
    """
    
    if not soup.find(class_="scientific-references"):
        ref_soup = BeautifulSoup(references_html, "html.parser")
        all_calcs_heading = soup.find(lambda tag: tag.name == "h2" and tag.text and "All Calculators" in tag.text)
        if all_calcs_heading:
            all_calcs_heading.insert_before(ref_soup)
        else:
            main = soup.find("main")
            if main:
                main.append(ref_soup)

    # Phase 2: Clean up duplicate reviewer blocks
    reviewer_blocks = soup.find_all("div", style=lambda s: s and "background: #f8fafc" in s and "border: 1px solid #e2e8f0" in s)
    reviewers = []
    for block in reviewer_blocks:
        if "Medically Reviewed by" in block.text:
            reviewers.append(block)
            
    if len(reviewers) > 1:
        # Keep the first, decompose the rest
        for block in reviewers[1:]:
            block.decompose()

    # Phase 3: Topical Clusters HTML Section
    clusters_html = """
    <section class="topical-clusters" style="margin-top: 3rem; margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; font-size: 1.4rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem;">Related Clinical & Fitness Hubs</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 0.75rem;">Formulas & Math</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/body-fat/" style="color: #475569; text-decoration: none;">Body fat percentage vs Total weight</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/bmi/" style="color: #475569; text-decoration: none;">BMI Calculation Formulas</a></li>
          </ul>
        </div>

        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 0.75rem;">Challenge & Group Rules</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/weight-loss/" style="color: #475569; text-decoration: none;">Weight loss percentage contest goals</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/calorie-deficit/" style="color: #475569; text-decoration: none;">Deficit planning for groups</a></li>
          </ul>
        </div>

        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 0.75rem;">Clinical & Safety Benchmarks</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/tdee/" style="color: #475569; text-decoration: none;">Metabolic adaptation (TDEE)</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/bmr/" style="color: #475569; text-decoration: none;">Healthy baseline energy rates</a></li>
          </ul>
        </div>

      </div>
    </section>
    """
    
    if not soup.find(class_="topical-clusters"):
        cluster_soup = BeautifulSoup(clusters_html, "html.parser")
        main = soup.find("main")
        if main:
            main.append(cluster_soup)

    # Phase 3: Update explanatory text with contextual internal links
    # Replace instances of "Body Mass Index" with a link if it doesn't already have one
    for p in soup.find_all("p"):
        if not p.find("a"):
            html_text = str(p)
            new_html = re.sub(r'\b(Body Mass Index)\b', r'<a href="/calculators/bmi/" style="color: #2563eb; text-decoration: underline;">\1</a>', html_text, count=1)
            new_html = re.sub(r'\b(Basal Metabolic Rate)\b', r'<a href="/calculators/bmr/" style="color: #2563eb; text-decoration: underline;">\1</a>', new_html, count=1)
            new_html = re.sub(r'\b(Total Daily Energy Expenditure)\b', r'<a href="/calculators/tdee/" style="color: #2563eb; text-decoration: underline;">\1</a>', new_html, count=1)
            
            if new_html != html_text:
                new_p = BeautifulSoup(new_html, "html.parser")
                p.replace_with(new_p)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"✅ Successfully updated {file_path}")

if __name__ == "__main__":
    apply_fixes("index.html")
    if os.path.exists("dist3/index.html"):
        apply_fixes("dist3/index.html")
    
    # Apply schema to calculators if needed
    calculators_dir = "calculators"
    if os.path.exists(calculators_dir):
        for calc in os.listdir(calculators_dir):
            calc_path = os.path.join(calculators_dir, calc, "index.html")
            if os.path.exists(calc_path):
                apply_fixes(calc_path)
