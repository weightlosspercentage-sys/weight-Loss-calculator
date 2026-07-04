"""
Update the React SPA bundle with the complete blog post listing.
This injects all 29 blog posts into the hardcoded array.
"""

import re

BUNDLE_PATH = 'assets/index-Ctp2HkQJ.js'

# All blog entries in order (newest / most important first)
BLOG_ENTRIES = [
    ('calorie-deficit-weight-loss', 'Calorie Deficit for Weight Loss: Complete Guide', 'Learn how to calculate and maintain a calorie deficit using TDEE formulas, deficit targets, and free tools.', 'Weight Loss', '9 min', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'),
    ('best-diet-for-weight-loss', 'Best Diet for Weight Loss: Mediterranean vs Keto vs Low-Carb', 'Evidence-based comparison of popular diets with clinical data on results and long-term health.', 'Nutrition', '10 min', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'),
    ('exercise-for-weight-loss', 'Exercise for Weight Loss: Cardio vs Strength Training', 'The best weekly workout plan combining HIIT, strength training, NEAT optimization, and more.', 'Fitness', '9 min', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800&q=80'),
    ('sleep-and-weight-loss', 'Sleep and Weight Loss: The Surprising Connection', 'How poor sleep reduces fat loss by 55% and disrupts leptin, ghrelin, cortisol, and growth hormone.', 'Weight Loss', '8 min', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-plateau', 'Weight Loss Plateau: How to Break Through', 'Science-backed strategies including metabolic adaptation, diet breaks, and 7 proven methods to restart fat loss.', 'Weight Loss', '8 min', 'https://images.unsplash.com/photo-1531180614310-37033e64c090?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-percentage-at-100-to-130-lbs', 'Weight Loss Percentage at 100-130 lbs', 'Every pound counts more at lower body weights. Learn what 5%, 10%, and 15% loss means at this range.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f1?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-percentage-at-130-to-170-lbs', 'Weight Loss Percentage at 130-170 lbs', 'The sweet spot for progress. Optimal calorie deficits and milestone tracking for balanced weight loss.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-percentage-at-170-to-230-lbs', 'Weight Loss Percentage at 170-230 lbs', 'Major milestones ahead. What 5-25% loss looks like at 200 lbs with clinical health data and timelines.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-percentage-at-230-to-300-lbs', 'Weight Loss Percentage at 230-300 lbs', 'Rapid, safe, life-saving progress. At 250 lbs, 5% loss is 12.5 lbs with profound health improvements.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1531180614310-37033e64c090?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-percentage-at-300-to-400-lbs', 'Weight Loss Percentage at 300-400 lbs', 'Major impact weight loss. What 5-30% loss looks like at 300+ lbs with medical guidance and strategies.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'),
    ('how-to-calculate-weight-loss-percentage', 'How to Calculate Weight Loss Percentage (Step-by-Step)', 'The exact formula, real examples, and what counts as a healthy result.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&w=800&q=80'),
    ('healthy-weight-loss-per-month', 'How Much Weight Can You Healthily Lose in a Month?', 'What science says about losing 1-2 lbs a week safely without muscle loss.', 'Weight Loss', '5 min', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'),
    ('calories-vs-weight-loss', 'Calories vs Weight Loss: What the Research Shows', 'Why a deficit works, food quality matters, and common mistakes to avoid.', 'Nutrition', '7 min', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-formulas-explained', 'Every Weight Loss Formula Explained', 'Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, US Navy - which to use.', 'Fitness', '8 min', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'),
    ('weight-tracking-guide', 'The Smart Way to Track Your Weight', 'How to weigh in for accurate trends without losing your mind.', 'Weight Loss', '5 min', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'),
    ('weight-loss-percentage-chart', 'Weight Loss Percentage Chart: Track Your Milestones', 'Use this month-by-month chart and milestone tracker to gauge your progress accurately.', 'Weight Loss', '5 min', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'),
    ('fat-loss-vs-weight-loss', 'Fat Loss vs Weight Loss: Definitive Guide', 'Losing body fat while protecting muscle is the real key to physical transformation.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'),
    ('signs-body-burning-fat', 'Signs Your Body Is Burning Fat (Beyond the Scale)', 'Physical, energetic, and metabolic indicators of fat burn to look for daily.', 'Fitness', '6 min', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'),
    ('5-percent-weight-loss', '5% Weight Loss: The First Major Health Milestone', 'Losing 5% triggers massive clinical health benefits recognized by the CDC.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80'),
    ('biggest-loser-formula', 'The Biggest Loser Weight Loss Formula: How It Works', 'The math behind the competition and why percentage is the fairest metric.', 'Weight Loss', '5 min', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'),
    ('keto-diet-weight-loss', 'Keto Diet Weight Loss: Mechanisms and Reality', 'How keto drives fat loss, water weight drops, and long-term sustainability.', 'Nutrition', '6 min', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'),
    ('walking-for-weight-loss', 'Walking for Weight Loss: Steps, Calories, and Consistency', 'The science of steps, calorie burn rates, and joint preservation for all ages.', 'Fitness', '5 min', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80'),
    ('lifestyle-changes-weight-loss-guide', 'Sustainable Lifestyle Changes for Permanent Weight Loss', 'Build the sleep, activity, and psychological habits that keep weight off permanently.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'),
    ('water-fasting-weight-loss', 'Water Fasting for Weight Loss: Scientific Truths & Risks', 'What metabolic science says about fat loss, muscle wasting, growth hormone, and safety.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1548839140-29a88022b7a8?auto=format&fit=crop&w=800&q=80'),
    ('newborn-weight-loss', 'Newborn Weight Loss: How Much Is Normal?', 'Clinical science explaining safe boundaries for newborns in the first days.', 'Weight Loss', '6 min', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80'),
    ('glp1-medications-weight-loss-guide', 'GLP-1 Medications for Weight Loss: Clinical Guide', 'Wegovy, Ozempic, Zepbound - clinical differences and weight loss expectations.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'),
    ('peptide-therapy-weight-loss-guide', 'Peptide Therapy for Weight Loss: Science & Safety', 'Beyond FDA-approved medications - the science, safety, and reconstitution dosing.', 'Nutrition', '6 min', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80'),
    ('postpartum-weight-loss-safe-guide', 'Postpartum Weight Loss: Safe Timeline & Lactation', 'Navigate caloric deficits safely while breastfeeding after pregnancy.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1531983412531-1f49a365f698?auto=format&fit=crop&w=800&q=80'),
    ('bariatric-surgery-weight-loss-timeline', 'Bariatric Surgery Weight Loss Timeline & Milestones', 'What to expect at 3, 6, and 12 months post-surgery with excess weight loss tracking.', 'Weight Loss', '7 min', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'),
]

# Build JS array string
js_objects = []
for slug, title, desc, cat, read, img in BLOG_ENTRIES:
    js = f'{{title:"{title}",desc:"{desc}",category:"{cat}",read:"{read}",slug:"/blog/{slug}",image:"{img}"}}'
    js_objects.append(js)

new_array = '[' + ','.join(js_objects) + ']'

# Read bundle
with open(BUNDLE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the old blog array
pattern = r'\[\{title:"How to Calculate Weight Loss Percentage[^\]]+\]'
match = re.search(pattern, content)
if not match:
    print("ERROR: Could not find blog array in bundle!")
    exit(1)

old_array = match.group(0)
start = match.start()
end = match.end()

print(f"Found old array at position {start}-{end} ({len(old_array)} chars, {old_array.count('slug:')} entries)")
print(f"New array has {len(BLOG_ENTRIES)} entries ({len(new_array)} chars)")

# Replace
new_content = content[:start] + new_array + content[end:]

# Write
with open(BUNDLE_PATH, 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
verify_count = new_content.count('slug:"/blog/')
print(f"Bundle updated. Total slug references: {verify_count}")
print("Done!")
