import sys, os
sys.path.insert(0, r'D:\projects\Weight Loss Percentage\Live\Weight Loss Percentage- Upload 1\scripts')
from rebuild_sitemaps import base_of, page_exists, hreflang_block, REGIONS, ROOT

for path in ['/', '/calculators/', '/calculators/weight-loss/', '/restaurants/taco-bell/', '/blog/', '/blog/5-percent-weight-loss/', '/nutrition/', '/restaurants/fast-food-hub/']:
    base = base_of(path)
    existing = [r if r else 'us' for r in REGIONS if page_exists(r if r else '', base)]
    print(f"{path:45s} base={base:30s} existing_regions={existing}")
    hb = hreflang_block(path)
    print(f"    hreflang lines: {len(hb.splitlines()) if hb else 0}")
