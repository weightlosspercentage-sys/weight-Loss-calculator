import os
import re

# 1. NEWBORN PAGE HIGH-VOLUME CONTENT GAP BLOCK
NEWBORN_GAP_BLOCK = '''
        <!-- Content Gap High-Volume Keywords & Ounces Unit Conversion Section -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 0; margin-bottom: 1rem;">Infant Weight Percentiles & Baby Weight Charts (Ounces to Pounds)</h2>
          <p>When tracking your <strong>baby weight</strong> and evaluating <strong>newborn weight percentile</strong> shifts, pediatricians rely on standardized WHO & CDC <strong>infant weight charts</strong>. Understanding <strong>how many ounces in a pound baby weight</strong> calculations require (16 ounces = 1 pound = 453.592 grams) ensures accurate entry into your <strong>birth weight percentile calculator</strong>.</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <div style="font-weight: 700; color: #1e40af; margin-bottom: 0.25rem;">⚖️ Quick Unit Conversion Guide for Baby Weight:</div>
            <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem; color: #334155; line-height: 1.6;">
              <li><strong>1 Pound (lb)</strong> = 16 Ounces (oz) = 453.592 Grams (g)</li>
              <li><strong>7 lbs 8 oz Birth Weight</strong> = 120 oz = 3,402 Grams</li>
              <li><strong>Average Newborn Birth Weight</strong>: 5.5 lbs to 8.8 lbs (2,500g to 4,000g)</li>
              <li><strong>Normal Infant Weight Percentile Range</strong>: 10th to 90th percentile</li>
            </ul>
          </div>

          <h3 style="color: #0f172a; font-size: 1.2rem; font-weight: 700; margin-top: 1.25rem;">How Much Weight Do Babies Lose After Birth?</h3>
          <p>It is completely normal for parents to ask: <em>how much weight do newborns lose after birth?</em> On average, term newborns drop between <strong>5% and 7% of their initial birth weight</strong> within the first 48 to 72 hours. Exclusively breastfed infants may drop up to 8–9% before maternal colostrum transitions to mature milk. Most healthy babies regain their original birth weight by <strong>10 to 14 days of age</strong>.</p>
        </div>
'''

# 2. MASTER WEIGHT LOSS CALCULATOR PAGE SYNONYM BLOCK
MASTER_GAP_BLOCK = '''
        <!-- Content Gap Keywords: Percent Weight Loss Calculator & Weight Change -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
          <h2 style="color: #0f172a; font-size: 1.4rem; font-weight: 700; margin-top: 0; margin-bottom: 0.75rem;">Percent Weight Loss Calculator & Body Weight Change Formula</h2>
          <p>Our free <strong>percentage weight loss calculator</strong> (also known as a <strong>percent weight change calculator</strong> or <strong>body weight loss percentage calculator</strong>) computes your exact body mass reduction percentage instantly. Whether tracking fitness milestones, Bariatric/GLP-1 progress, or pediatric metrics, calculating your <strong>weight loss percentage</strong> provides a far more accurate representation of body composition change than raw scale weight alone.</p>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
            <a href="/calculators/newborn-weight-loss/" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 0.75rem 1rem; border-radius: 8px; text-decoration: none; color: #4f46e5; font-weight: 600; font-size: 0.875rem;">👶 Newborn Weight Loss % Tool</a>
            <a href="/calculators/bmi/" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 0.75rem 1rem; border-radius: 8px; text-decoration: none; color: #4f46e5; font-weight: 600; font-size: 0.875rem;">📊 BMI Calculator</a>
            <a href="/calculators/macro/" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 0.75rem 1rem; border-radius: 8px; text-decoration: none; color: #4f46e5; font-weight: 600; font-size: 0.875rem;">🥗 Macro & Calorie Deficit Tool</a>
          </div>
        </div>
'''

def update_newborn_pages():
    files = [
        'calculators/newborn-weight-loss/index.html',
        'uk/calculators/newborn-weight-loss/index.html',
        'ca/calculators/newborn-weight-loss/index.html',
        'au/calculators/newborn-weight-loss/index.html',
        'nz/calculators/newborn-weight-loss/index.html',
    ]
    for fp in files:
        if not os.path.exists(fp):
            continue
        with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if 'Infant Weight Percentiles & Baby Weight Charts' not in content:
            if '<h2>Frequently Asked Questions</h2>' in content:
                content = content.replace('<h2>Frequently Asked Questions</h2>', NEWBORN_GAP_BLOCK + '\n        <h2>Frequently Asked Questions</h2>')
            elif '</main>' in content:
                content = content.replace('</main>', NEWBORN_GAP_BLOCK + '\n      </main>')
            
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[+] Added Content Gap Keywords to {fp}")

def update_master_pages():
    files = [
        'calculators/weight-loss/index.html',
        'uk/calculators/weight-loss/index.html',
        'ca/calculators/weight-loss/index.html',
        'au/calculators/weight-loss/index.html',
        'nz/calculators/weight-loss/index.html',
        'index.html'
    ]
    for fp in files:
        if not os.path.exists(fp):
            continue
        with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if 'Percent Weight Loss Calculator & Body Weight Change Formula' not in content:
            if '</main>' in content:
                content = content.replace('</main>', MASTER_GAP_BLOCK + '\n      </main>')
            elif '<footer' in content:
                content = content.replace('<footer', MASTER_GAP_BLOCK + '\n      <footer')
            
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[+] Added Content Gap Synonyms to {fp}")

def main():
    update_newborn_pages()
    update_master_pages()

if __name__ == '__main__':
    main()
