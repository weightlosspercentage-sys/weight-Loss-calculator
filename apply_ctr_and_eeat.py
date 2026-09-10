import os
import re
import shutil

REKHA_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Dr. Rekha Kumar, M.D., M.S.",
    "givenName": "Rekha",
    "familyName": "Kumar",
    "honorificPrefix": "Dr.",
    "honorificSuffix": "M.D., M.S.",
    "jobTitle": "Lead Medical Reviewer & Board-Certified Obesity Medicine Specialist",
    "worksFor": [
        {
            "@type": "MedicalOrganization",
            "name": "Weill Cornell Medicine",
            "url": "https://weillcornell.org/"
        },
        {
            "@type": "Organization",
            "name": "Weight Loss Percentage",
            "url": "https://www.weightlosspercentage.com/"
        }
    ],
    "alumniOf": [
        { "@type": "CollegeOrUniversity", "name": "Duke University" },
        { "@type": "CollegeOrUniversity", "name": "Columbia University Institute of Human Nutrition" },
        { "@type": "MedicalSchool", "name": "New York Medical College" }
    ],
    "hasCredential": [
        {
            "@type": "EducationalOccupationalCredential",
            "name": "Board Certification in Endocrinology, Diabetes & Metabolism",
            "credentialCategory": "Medical Board Certification"
        },
        {
            "@type": "EducationalOccupationalCredential",
            "name": "Diplomate of the American Board of Obesity Medicine (ABOM)",
            "credentialCategory": "Medical Board Certification"
        },
        {
            "@type": "EducationalOccupationalCredential",
            "name": "Board Certification in Internal Medicine",
            "credentialCategory": "Medical Board Certification"
        }
    ],
    "knowsAbout": [
        "Clinical Obesity Medicine",
        "Endocrinology & Metabolic Health",
        "Weight Loss Percentage Calculation & Clinical Milestones",
        "GLP-1 Receptor Agonists & Medical Weight Management",
        "Pediatric & Adolescent Weight Trends",
        "Basal Metabolic Rate & Energy Expenditure"
    ],
    "sameAs": [
        "https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/",
        "https://weillcornell.org/rkumar"
    ],
    "image": "https://www.weightlosspercentage.com/images/dr-rekha-kumar.png",
    "url": "https://www.weightlosspercentage.com/authors/dr-rekha-kumar/",
    "description": "Dr. Rekha Kumar, M.D., M.S. is an Associate Professor of Clinical Medicine at Weill Cornell Medicine, former Medical Director of the American Board of Obesity Medicine, and Lead Medical Reviewer at Weight Loss Percentage."
}

EEAT_BANNER_HTML = '''<div class="eeat-review-banner" style="margin-bottom: 1.75rem; font-size: 0.925rem; color: #64748b; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.875rem 1.25rem;">
  <a href="/authors/dr-rekha-kumar/" style="display: flex; align-items: center; text-decoration: none;">
    <img src="/images/dr-rekha-kumar.png" alt="Dr. Rekha Kumar, M.D., M.S." style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);" />
  </a>
  <div style="flex: 1; min-width: 260px;">
    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2px;">
      <span style="font-weight: 700; color: #0f172a;">Medically Reviewed by <a href="/authors/dr-rekha-kumar/" style="color: #4f46e5; text-decoration: none;">Dr. Rekha Kumar, M.D., M.S.</a></span>
      <a href="https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/" target="_blank" rel="noopener noreferrer" aria-label="Dr. Rekha Kumar LinkedIn" style="display: inline-flex; align-items: center; color: #0a66c2; text-decoration: none;">
        <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
      </a>
    </div>
    <div style="font-size: 0.8rem; color: #64748b;">
      Assoc. Professor of Clinical Medicine, Weill Cornell • Former Medical Director, ABOM
    </div>
  </div>
  <div style="display: flex; gap: 0.5rem; align-items: center;">
    <span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 6px; font-size: 0.775rem; font-weight: 600;">✓ Clinically Verified</span>
    <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 0.775rem; font-weight: 500;">Updated: September 2026</span>
  </div>
</div>'''

PAGES_CTR = {
    "index.html": {
        "title": "Weight Loss Percentage Calculator (% Lost Progress Tracker [2026])",
        "description": "Calculate your exact weight loss percentage instantly in lbs or kg. Track body weight progress, set healthy 5% & 10% milestone goals, and see doctor-approved safe weekly targets."
    },
    "calculators/newborn-weight-loss/index.html": {
        "title": "Newborn Weight Loss Calculator (% Loss Check | Lbs, Oz & Grams)",
        "description": "Calculate infant weight loss % instantly. Compare against AAP pediatric guidelines (5%, 7%, 10% thresholds) to verify safe baby feeding progress. Medically reviewed."
    },
    "calculators/bmr/index.html": {
        "title": "BMR Calculator: Basal Metabolic Rate & Daily Calorie Deficit",
        "description": "Calculate your exact Basal Metabolic Rate (BMR) with the Mifflin-St Jeor formula. See daily calorie burn at rest and determine ideal weight loss deficit."
    },
    "restaurants/subway/index.html": {
        "title": "Subway Calorie & Macro Calculator (2026 Menu Items & Meal Builder)",
        "description": "Build custom Subway meals and calculate total calories, fat, carbs & protein instantly. Compare 6-inch & Footlong options for weight loss goals."
    }
}

def update_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    rel_path = os.path.relpath(filepath, '.').replace('\\', '/')
    
    # 1. Update Title & Description if configured
    if rel_path in PAGES_CTR:
        meta_info = PAGES_CTR[rel_path]
        title_tag = f"<title>{meta_info['title']}</title>"
        desc_tag = f'<meta name="description" content="{meta_info["description"]}">'
        
        content = re.sub(r'<title>.*?</title>', title_tag, content, flags=re.DOTALL)
        content = re.sub(r'<meta\s+name="description"\s+content=".*?">', desc_tag, content, flags=re.DOTALL)
        print(f"Updated Title & Meta Description for {rel_path}")

    # 2. Inject E-E-A-T banner if missing and h1 present
    if '<h1' in content and 'eeat-review-banner' not in content:
        # Find closing </h1> tag
        h1_match = re.search(r'</h1>', content, flags=re.IGNORECASE)
        if h1_match:
            pos = h1_match.end()
            content = content[:pos] + '\n' + EEAT_BANNER_HTML + content[pos:]
            print(f"Injected E-E-A-T banner into {rel_path}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Target core html files
html_files = [
    "index.html",
    "calculators/newborn-weight-loss/index.html",
    "calculators/bmr/index.html",
    "restaurants/subway/index.html"
]

for hf in html_files:
    update_file(hf)

# Sync to public/ and dist3/
for hf in html_files:
    if os.path.exists(hf):
        for target_dir in ["public", "dist3"]:
            dest = os.path.join(target_dir, hf)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy2(hf, dest)
            print(f"Synced {hf} -> {dest}")

print("CTR & E-E-A-T updates applied and synced successfully.")
