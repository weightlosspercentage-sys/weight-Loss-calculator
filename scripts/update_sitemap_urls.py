import os
import re
from datetime import datetime

NEW_ROUTES = [
    "calculators/rucking/",
    "calculators/stairmaster/",
    "calculators/elliptical/",
    "calculators/rowing/",
    "calculators/cycling/",
    "calculators/hiit-bodyweight/",
    "restaurants/dutch-bros/",
    "restaurants/taco-bell/",
    "restaurants/dominos/",
    "restaurants/five-guys/",
    "restaurants/pizza-hut/",
    "restaurants/jimmy-johns/",
    "restaurants/wendys/",
    "restaurants/chipotle/",
    "restaurants/fast-food-hub/",
    "calculators/boba-tea/",
    "calculators/poke-bowl/",
    "calculators/salad-calories/",
    "calculators/sushi-calories/",
    "calculators/beer-calories/",
    "calculators/indian-food/",
    "calculators/smoothie/",
    "calculators/body-recomposition/",
    "calculators/pcos-calorie/",
    "calculators/intermittent-fasting/",
    "calculators/carnivore-diet/",
    "calculators/unit-converters/"
]

def main():
    sitemap_path = os.path.join("public", "sitemap-us.xml")
    if not os.path.exists(sitemap_path):
        print(f"Error: {sitemap_path} not found.")
        return

    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()

    today = datetime.now().strftime("%Y-%m-%d")
    added_count = 0

    new_xml_entries = ""
    for route in NEW_ROUTES:
        loc = f"https://www.weightlosspercentage.com/{route}"
        if loc not in content:
            new_xml_entries += f"""  <url>
    <loc>{loc}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n"""
            added_count += 1

    if new_xml_entries:
        content = content.replace("</urlset>", new_xml_entries + "</urlset>")
        with open(sitemap_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[+] Added {added_count} new routes to {sitemap_path}")
    else:
        print(f"All {len(NEW_ROUTES)} routes already present in {sitemap_path}")

if __name__ == "__main__":
    main()
