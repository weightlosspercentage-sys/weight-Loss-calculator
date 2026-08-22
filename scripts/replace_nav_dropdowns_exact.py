import os

target_nav_old = """<nav style="display: flex; gap: 1.25rem; align-items: center;">
              <a href="/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Home</a>
              <a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Calculators</a>
              <a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Nutrition</a>
              <a href="/blog/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Blog</a>
              <a href="/compare/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Compare</a>
            </nav>"""

new_nav = """<nav style="display: flex; gap: 1.25rem; align-items: center;">
              <a href="/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Home</a>
              
              <div class="nav-item-dropdown" style="position: relative; display: inline-block;">
                <a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
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

              <div class="nav-item-dropdown" style="position: relative; display: inline-block;">
                <a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;">
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

              <a href="/compare/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Compare</a>
              <a href="/blog/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Blog</a>
            </nav>"""

def replace_exact(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if target_nav_old in content:
            content = content.replace(target_nav_old, new_nav)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
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
                if replace_exact(p):
                    count += 1
    print(f"Replaced exact nav in {count} HTML files!")

if __name__ == '__main__':
    main()
