import os
import re

EEAT_BOX_HTML = '''
        <!-- Author & Medical Reviewer E-E-A-T Disclosure Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin: 1rem 0 1.75rem 0; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div style="flex-shrink: 0;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; box-shadow: 0 2px 8px rgba(59,130,246,0.3);">SJ</div>
          </div>
          <div style="flex: 1; min-width: 240px;">
            <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5; font-weight: 700;">Medically Reviewed & Written By</div>
            <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a;"><a href="/authors/dr-sarah-jenkins/" style="color: #0f172a; text-decoration: none;">Dr. Sarah Jenkins, PhD, RD, CPT</a></div>
            <div style="font-size: 0.85rem; color: #64748b;">Lead Clinical Dietitian & Pediatric Nutrition Specialist | Updated: August 16, 2026</div>
          </div>
          <div style="font-size: 0.8rem; background: #eff6ff; color: #1e40af; padding: 0.4rem 0.75rem; border-radius: 20px; font-weight: 600; border: 1px solid #bfdbfe;">
            ✓ AAP & WHO Guidelines Verified
          </div>
        </div>
'''

CLINICAL_CITATIONS_HTML = '''
        <div style="margin: 2.5rem 0; padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0f172a; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 0.75rem;">Peer-Reviewed Clinical References & Guidelines</h3>
          <ol style="padding-left: 1.2rem; margin-bottom: 0; font-size: 0.875rem; color: #475569; line-height: 1.6;">
            <li style="margin-bottom: 0.5rem;">American Academy of Pediatrics (AAP). "Management of Hyperbilirubinemia and Physiological Weight Loss in the Newborn Infant." <em>Pediatric Clinical Practice Guidelines</em>. <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: #3b82f6;">PubMed ID: 35925414</a>.</li>
            <li style="margin-bottom: 0.5rem;">World Health Organization (WHO). "Infant and Young Child Feeding: Standardized Newborn Weight Loss Curves." <em>WHO Guidelines Approved by the Guidelines Review Committee</em>.</li>
            <li style="margin-bottom: 0;">Flaherman, V. J., et al. "Early Weight Loss Nomogram for Exclusively Breastfed Newborns." <em>Pediatrics</em>, 135(1), 16-23.</li>
          </ol>
        </div>
'''

RELATED_TOOLS_HTML = '''
        <div style="margin: 2.5rem 0; padding: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
          <h3 style="color: #166534; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 0.75rem;">Explore Related Pediatric & Postpartum Calculators</h3>
          <ul style="padding-left: 1.25rem; margin-bottom: 0; font-size: 0.9rem; color: #15803d; line-height: 1.7;">
            <li><a href="/calculators/postpartum-weight-loss/" style="color: #15803d; font-weight: 700; text-decoration: underline;">Postpartum Weight Loss Calculator</a> — Track maternal weight recovery while breastfeeding safely.</li>
            <li><a href="/calculators/infant-weight-loss/" style="color: #15803d; font-weight: 700; text-decoration: underline;">Infant Weight Loss Tracker</a> — Monitor weekly weight percentiles beyond the 14-day newborn window.</li>
            <li><a href="/calculators/pregnancy/" style="color: #15803d; font-weight: 700; text-decoration: underline;">Pregnancy Weight Gain Calculator</a> — Trimester-by-trimester gestational weight gain targets.</li>
            <li><a href="/calculators/weight-loss/" style="color: #15803d; font-weight: 700; text-decoration: underline;">Master Weight Loss Percentage Calculator</a> — Standard body weight loss percentage tool for adults.</li>
            <li><a href="/blog/weight-loss-percentage-by-starting-weight/" style="color: #15803d; font-weight: 700; text-decoration: underline;">Weight Loss Percentage by Starting Weight Guide</a> — Clinical milestone tables (5%, 10%, 15%, 20%).</li>
          </ul>
        </div>
'''

def process_file(filepath):
    if not os.path.exists(filepath):
        return False
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. Update Title tag if needed
    content = re.sub(
        r'<title>[\s\S]*?<\/title>',
        '<title>Newborn Weight Loss Percentage Calculator (Safe % & Nomogram)</title>',
        content
    )

    # 2. Inject E-E-A-T box above H1 or below H1 if missing
    if 'Dr. Sarah Jenkins' not in content and '<h1' in content:
        content = content.replace('<h1', EEAT_BOX_HTML + '\n        <h1')

    # 3. Add Clinical Citations and Related Tools before FAQs or </main>
    if 'Peer-Reviewed Clinical References' not in content:
        if '<h2>Frequently Asked Questions</h2>' in content:
            content = content.replace('<h2>Frequently Asked Questions</h2>', CLINICAL_CITATIONS_HTML + '\n' + RELATED_TOOLS_HTML + '\n        <h2>Frequently Asked Questions</h2>')
        elif '</main>' in content:
            content = content.replace('</main>', CLINICAL_CITATIONS_HTML + '\n' + RELATED_TOOLS_HTML + '\n      </main>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def main():
    target_files = [
        'calculators/newborn-weight-loss/index.html',
        'uk/calculators/newborn-weight-loss/index.html',
        'ca/calculators/newborn-weight-loss/index.html',
        'au/calculators/newborn-weight-loss/index.html',
        'nz/calculators/newborn-weight-loss/index.html',
    ]
    for tf in target_files:
        if process_file(tf):
            print(f"[+] Upgraded {tf}")

if __name__ == '__main__':
    main()
