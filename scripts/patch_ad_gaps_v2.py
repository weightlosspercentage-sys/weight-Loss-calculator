"""Patch the ad component (Li) in the SPA JS bundle to completely
remove gaps from unfilled ad slots.

Previous patch removed minHeight from the wrapper div but left it
on the inner <ins> element. This patch removes it from the <ins> too,
ensuring the ad container fully collapses when no ad loads.

Run from project root: python scripts/patch_ad_gaps_v2.py
"""
import os
import sys

BUNDLE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'assets', 'index-Ctp2HkQJ.js'
)

def main():
    c = open(BUNDLE, encoding='utf-8').read()

    # Remove minHeight:b from the <ins> element style
    # Before: style:{display:"block",minHeight:b,width:"100%"}
    # After:  style:{display:"block",width:"100%"}
    old = 'style:{display:"block",minHeight:b,width:"100%"},"data-ad-client"'
    new = 'style:{display:"block",width:"100%"},"data-ad-client"'
    if old not in c:
        print("ERROR: Could not find <ins> minHeight pattern")
        print("Checking if already patched...")
        if new in c:
            print("Already patched!")
        sys.exit(1)
    c = c.replace(old, new)
    print("  [1/1] Removed minHeight from <ins> element")

    open(BUNDLE, 'w', encoding='utf-8').write(c)
    print("\nAd gap fix v2 applied successfully!")


if __name__ == '__main__':
    main()
