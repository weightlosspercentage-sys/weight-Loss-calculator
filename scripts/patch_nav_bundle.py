"""Patch the SPA JS bundle to update the navigation bar.

Changes:
- Merges the separate "Restaurants" dropdown and plain "Nutrition" link
  into a single "Nutrition" dropdown containing both nutrition and restaurant links.
- Applies to both desktop and mobile nav sections.

Run from project root: python scripts/patch_nav_bundle.py
"""
import os
import re
import shutil

BUNDLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')

def find_bundle():
    for f in os.listdir(BUNDLE_DIR):
        if f.startswith('index-') and f.endswith('.js'):
            return os.path.join(BUNDLE_DIR, f)
    raise FileNotFoundError("No index-*.js bundle found in assets/")

def patch(content):
    # ── 1. Replace the Ih (restaurants) array with a combined Nutrition array ──
    old_ih = (
        'Ih=[["/restaurants/subway","Subway Nutrition"],'
        '["/restaurants/mcdonalds","McDonald\'s Nutrition"],'
        '["/restaurants/starbucks","Starbucks Nutrition"]]'
    )
    new_ih = (
        'Ih=[["/nutrition","Nutrition Hub"],'
        '["/calculators/water-intake","Water Intake"],'
        '["/calculators/keto","Keto Diet"],'
        '["/restaurants/mcdonalds","McDonald\'s Nutrition"],'
        '["/restaurants/starbucks","Starbucks Nutrition"],'
        '["/restaurants/subway","Subway Nutrition"]]'
    )
    assert old_ih in content, "Could not find old Ih array"
    content = content.replace(old_ih, new_ih)

    # ── 2. Desktop nav: Replace Restaurants dropdown + Nutrition link ──
    # The "Restaurants" dropdown with Ih.map
    old_desktop_restaurants = (
        's.jsxs("div",{className:"relative group",children:'
        '[s.jsxs("button",{className:"px-3 py-2 text-sm font-medium text-gray-700 '
        'hover:text-indigo-600 hover:bg-gray-50 rounded-md transition flex items-center '
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",'
        '"aria-haspopup":"true",children:["Restaurants",s.jsx(Bi,{className:"w-4 h-4 ml-1",'
        '"aria-hidden":"true"})]}),s.jsx("div",{className:"absolute left-0 mt-0 w-48 '
        'rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y '
        'divide-gray-100 hidden group-hover:block group-focus-within:block",'
        'children:Ih.map(([D,M])=>s.jsx(Y,{to:D,className:"block px-4 py-3 text-sm '
        'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium '
        'focus-visible:outline-none focus-visible:bg-indigo-50",children:M},D))})'
        ']}),s.jsx(Y,{to:"/nutrition",className:"px-3 py-2 text-sm font-medium '
        'text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition '
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",'
        'children:"Nutrition"})'
    )
    # Replace with a single "Nutrition" dropdown using the updated Ih array
    new_desktop_nutrition = (
        's.jsxs("div",{className:"relative group",children:'
        '[s.jsxs("button",{className:"px-3 py-2 text-sm font-medium text-gray-700 '
        'hover:text-indigo-600 hover:bg-gray-50 rounded-md transition flex items-center '
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",'
        '"aria-haspopup":"true",children:["Nutrition",s.jsx(Bi,{className:"w-4 h-4 ml-1",'
        '"aria-hidden":"true"})]}),s.jsx("div",{className:"absolute left-0 mt-0 w-56 '
        'rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y '
        'divide-gray-100 hidden group-hover:block group-focus-within:block",'
        'children:Ih.map(([D,M],L)=>s.jsx(Y,{to:D,className:L===0?"block px-4 py-3 '
        'text-sm text-orange-700 hover:bg-orange-50 hover:text-orange-800 font-semibold '
        'focus-visible:outline-none focus-visible:bg-orange-50":"block px-4 py-3 text-sm '
        'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium '
        'focus-visible:outline-none focus-visible:bg-indigo-50",children:M},D))})'
        ']})'
    )
    assert old_desktop_restaurants in content, "Could not find desktop Restaurants dropdown + Nutrition link"
    content = content.replace(old_desktop_restaurants, new_desktop_nutrition)

    # ── 3. Mobile nav: Replace Restaurants accordion + Nutrition link ──
    old_mobile_restaurants = (
        's.jsxs("div",{children:'
        '[s.jsxs("button",{onClick:()=>B("restaurants"),'
        '"aria-expanded":d==="restaurants",'
        '"aria-controls":"mobile-restaurants-menu",'
        'className:"w-full text-left px-4 py-3 min-h-11 text-sm font-medium text-gray-700 '
        'hover:bg-gray-100 rounded-md flex justify-between items-center '
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",'
        'children:["Restaurants",s.jsx(Bi,{"aria-hidden":"true",'
        'className:`w-4 h-4 transition ${d==="restaurants"?"rotate-180":""}`'
        '})]}),d==="restaurants"&&s.jsx("div",{id:"mobile-restaurants-menu",'
        'className:"pl-4 space-y-1",'
        'children:Ih.map(([D,M])=>s.jsx(Y,{to:D,'
        'className:"block px-4 py-3 min-h-11 text-sm text-gray-600 '
        'hover:bg-gray-100 rounded-md focus-visible:outline-none '
        'focus-visible:ring-2 focus-visible:ring-indigo-500",'
        'onClick:m,children:M},D))'
        '})]}),s.jsx(Y,{to:"/nutrition",'
        'className:"block px-4 py-3 min-h-11 text-sm font-medium text-gray-700 '
        'hover:bg-gray-100 rounded-md focus-visible:outline-none '
        'focus-visible:ring-2 focus-visible:ring-indigo-500",'
        'onClick:m,children:"Nutrition"})'
    )
    new_mobile_nutrition = (
        's.jsxs("div",{children:'
        '[s.jsxs("button",{onClick:()=>B("nutrition"),'
        '"aria-expanded":d==="nutrition",'
        '"aria-controls":"mobile-nutrition-menu",'
        'className:"w-full text-left px-4 py-3 min-h-11 text-sm font-medium text-gray-700 '
        'hover:bg-gray-100 rounded-md flex justify-between items-center '
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",'
        'children:["Nutrition",s.jsx(Bi,{"aria-hidden":"true",'
        'className:`w-4 h-4 transition ${d==="nutrition"?"rotate-180":""}`'
        '})]}),d==="nutrition"&&s.jsx("div",{id:"mobile-nutrition-menu",'
        'className:"pl-4 space-y-1",'
        'children:Ih.map(([D,M])=>s.jsx(Y,{to:D,'
        'className:"block px-4 py-3 min-h-11 text-sm text-gray-600 '
        'hover:bg-gray-100 rounded-md focus-visible:outline-none '
        'focus-visible:ring-2 focus-visible:ring-indigo-500",'
        'onClick:m,children:M},D))'
        '})]})'
    )
    assert old_mobile_restaurants in content, "Could not find mobile Restaurants accordion + Nutrition link"
    content = content.replace(old_mobile_restaurants, new_mobile_nutrition)

    return content


def main():
    bundle_path = find_bundle()
    print(f"Patching: {bundle_path}")

    # Backup
    backup_path = bundle_path + '.bak'
    if not os.path.exists(backup_path):
        shutil.copy2(bundle_path, backup_path)
        print(f"Backup saved: {backup_path}")

    content = open(bundle_path, encoding='utf-8').read()
    patched = patch(content)

    open(bundle_path, 'w', encoding='utf-8').write(patched)
    print("✅ Nav patched successfully!")
    print("   Desktop: Restaurants ▾ + Nutrition → Nutrition ▾ (combined dropdown)")
    print("   Mobile:  Restaurants accordion + Nutrition → Nutrition accordion (combined)")


if __name__ == '__main__':
    main()
