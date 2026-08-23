"""Patch the SPA JS bundle (assets/index-*.js) with all 35+ calculators,
all nutrition & fast food tools, complete header nav (Home, Calculators, Nutrition,
Compare, Blog, Glossary, About), and Google Translate in navigation.
"""
import os
import json
import shutil

BUNDLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')

def find_bundle():
    for f in os.listdir(BUNDLE_DIR):
        if f.startswith('index-') and f.endswith('.js') and not f.endswith('.bak'):
            return os.path.join(BUNDLE_DIR, f)
    raise FileNotFoundError("No index-*.js bundle found in assets/")

def patch_bundle():
    bundle_path = find_bundle()
    print(f"Patching bundle: {bundle_path}")

    # Backup if not already backed up
    backup_path = bundle_path + '.pre_nav_patch.bak'
    if not os.path.exists(backup_path):
        shutil.copy2(bundle_path, backup_path)
        print(f"Created backup at {backup_path}")

    with open(bundle_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. New Jh (All 35+ Calculators) and Ih (All Nutrition & Restaurants)
    new_jh = json.dumps([
        ["/calculators/", "All Calculators Hub (35+)"],
        ["/calculators/weight-loss/", "Weight Loss Percentage"],
        ["/calculators/body-fat/", "Body Fat % Calculator"],
        ["/calculators/bmi/", "BMI Calculator"],
        ["/calculators/tdee/", "TDEE Calculator"],
        ["/calculators/bmr/", "BMR Calculator"],
        ["/calculators/macro/", "Macro Calculator"],
        ["/calculators/calorie-deficit/", "Calorie Deficit Calculator"],
        ["/calculators/calorie/", "Calorie Calculator"],
        ["/calculators/fat-loss/", "Fat Loss Calculator"],
        ["/calculators/protein/", "Protein Calculator"],
        ["/calculators/water-intake/", "Water Intake Calculator"],
        ["/calculators/walking/", "Walking Calorie Calculator"],
        ["/calculators/cycling/", "Cycling Calorie Calculator"],
        ["/calculators/rowing/", "Rowing Calorie Calculator"],
        ["/calculators/elliptical/", "Elliptical Calorie Calculator"],
        ["/calculators/stairmaster/", "StairMaster Calorie Calculator"],
        ["/calculators/rucking/", "Rucking Calorie Calculator"],
        ["/calculators/hiit-bodyweight/", "HIIT & Bodyweight Calorie"],
        ["/calculators/fitness/", "Fitness & Cardio Calculator"],
        ["/calculators/body-recomposition/", "Body Recomposition Calculator"],
        ["/calculators/pcos-calorie/", "PCOS Calorie Calculator"],
        ["/calculators/intermittent-fasting/", "Intermittent Fasting Calculator"],
        ["/calculators/carnivore-diet/", "Carnivore Diet Calculator"],
        ["/calculators/keto/", "Keto Calculator"],
        ["/calculators/unit-converters/", "Unit Converters (g to kcal)"],
        ["/calculators/glp1-weight-loss/", "GLP-1 Weight Loss"],
        ["/calculators/bariatric-surgery-weight-loss/", "Bariatric Surgery Weight Loss"],
        ["/calculators/postpartum-weight-loss/", "Postpartum Weight Loss"],
        ["/calculators/newborn-weight-loss/", "Newborn Weight Loss"],
        ["/calculators/infant-weight-loss/", "Infant Weight Loss"],
        ["/calculators/baby-weight-loss/", "Baby Weight Loss"],
        ["/calculators/pregnancy/", "Pregnancy Weight Gain"],
        ["/calculators/dog-weight-loss/", "Dog Weight Loss"],
        ["/calculators/peptide-dosage/", "Peptide Dosage"],
        ["/calculators/biggest-loser/", "Biggest Loser Calculator"]
    ])

    new_ih = json.dumps([
        ["/nutrition/", "Nutrition & Fast Food Hub"],
        ["/restaurants/fast-food-hub/", "All Fast Food Restaurants"],
        ["/restaurants/taco-bell/", "Taco Bell Calorie Calculator"],
        ["/restaurants/dutch-bros/", "Dutch Bros Calorie Calculator"],
        ["/restaurants/dominos/", "Domino's Calorie Calculator"],
        ["/restaurants/five-guys/", "Five Guys Calorie Calculator"],
        ["/restaurants/pizza-hut/", "Pizza Hut Calorie Calculator"],
        ["/restaurants/jimmy-johns/", "Jimmy John's Calorie Calculator"],
        ["/restaurants/wendys/", "Wendy's Calorie Calculator"],
        ["/restaurants/chipotle/", "Chipotle Calorie Calculator"],
        ["/restaurants/starbucks/", "Starbucks Calorie Calculator"],
        ["/restaurants/mcdonalds/", "McDonald's Calorie Calculator"],
        ["/restaurants/subway/", "Subway Calorie Calculator"],
        ["/calculators/boba-tea/", "Boba Tea Calorie Calculator"],
        ["/calculators/poke-bowl/", "Poke Bowl Calorie Calculator"],
        ["/calculators/salad-calories/", "Salad Calorie Calculator"],
        ["/calculators/sushi-calories/", "Sushi Calorie Calculator"],
        ["/calculators/beer-calories/", "Beer Calorie Calculator"],
        ["/calculators/indian-food/", "Indian Food Calorie Calculator"],
        ["/calculators/smoothie/", "Smoothie Calorie Calculator"]
    ])

    # Find the existing Jh=... and Ih=... definition
    # Pattern: const Jh=[...],Ih=[...]; or similar
    jh_pos = content.find('Jh=[')
    assert jh_pos != -1, "Could not find Jh=[ in bundle"
    
    # Find end of Ih definition (ends before next statement)
    ih_pos = content.find('Ih=[', jh_pos)
    assert ih_pos != -1, "Could not find Ih=[ in bundle"
    
    end_ih = content.find(']]', ih_pos) + 2
    
    old_defs = content[jh_pos:end_ih]
    new_defs = f"Jh={new_jh},Ih={new_ih}"
    
    content = content[:jh_pos] + new_defs + content[end_ih:]
    print("[+] Successfully updated Jh and Ih arrays with all 35+ tools!")

    # 2. Update Desktop Dropdown styling to include max-h-96 overflow-y-auto
    # Find desktop dropdowns
    old_desktop_calc_dropdown = 'className:"absolute left-0 mt-0 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden group-hover:block group-focus-within:block"'
    new_desktop_calc_dropdown = 'className:"absolute left-0 mt-0 w-64 max-h-96 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden group-hover:block group-focus-within:block"'
    if old_desktop_calc_dropdown in content:
        content = content.replace(old_desktop_calc_dropdown, new_desktop_calc_dropdown)

    old_desktop_nutr_dropdown = 'className:"absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden group-hover:block group-focus-within:block"'
    new_desktop_nutr_dropdown = 'className:"absolute left-0 mt-0 w-64 max-h-96 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden group-hover:block group-focus-within:block"'
    if old_desktop_nutr_dropdown in content:
        content = content.replace(old_desktop_nutr_dropdown, new_desktop_nutr_dropdown)

    # 3. Update Desktop navigation links to have Compare, Blog, Glossary, About, and Google Translate
    old_desktop_trailing_links = 's.jsx(Y,{to:"/blog/",reloadDocument:!0,className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"Blog"}),s.jsx(Y,{to:"/calculators",className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"All Tools"})'
    
    new_desktop_trailing_links = (
        's.jsx(Y,{to:"/compare/",className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"Compare"}),'
        's.jsx(Y,{to:"/blog/",reloadDocument:!0,className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"Blog"}),'
        's.jsx(Y,{to:"/glossary/",className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"Glossary"}),'
        's.jsx(Y,{to:"/about/",className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"About"}),'
        's.jsx("div",{id:"google_translate_element",className:"inline-flex items-center ml-2"})'
    )
    
    if old_desktop_trailing_links in content:
        content = content.replace(old_desktop_trailing_links, new_desktop_trailing_links)
        print("[+] Successfully updated desktop links to include Compare, Blog, Glossary, About, and Translate element!")

    # 4. Update Mobile menu to have max-h-72 overflow-y-auto for scrollable lists
    old_mobile_calc_div = 'id:"mobile-calculators-menu",className:"pl-4 space-y-1"'
    new_mobile_calc_div = 'id:"mobile-calculators-menu",className:"pl-4 space-y-1 max-h-72 overflow-y-auto"'
    if old_mobile_calc_div in content:
        content = content.replace(old_mobile_calc_div, new_mobile_calc_div)

    old_mobile_nutr_div = 'id:"mobile-nutrition-menu",className:"pl-4 space-y-1"'
    new_mobile_nutr_div = 'id:"mobile-nutrition-menu",className:"pl-4 space-y-1 max-h-72 overflow-y-auto"'
    if old_mobile_nutr_div in content:
        content = content.replace(old_mobile_nutr_div, new_mobile_nutr_div)

    # 5. Write back patched bundle
    with open(bundle_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[+] Bundle patch complete and written!")

if __name__ == '__main__':
    patch_bundle()
