"""Patch blog article pages to include left and right sticky side ads on desktop
(where blank space exists on screens >= 1280px wide).

Left Ad:  Dharma1 (slot "8714170901")
Right Ad: Dharma 2 (slot "9720699039")
"""
import os
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SIDEBAR_CSS = """
      /* Desktop Global Sidebar Ads (Left & Right margins) */
      .article-outer-wrapper {
        max-width: 1400px !important;
        margin: 0 auto !important;
        display: flex !important;
        justify-content: center !important;
        gap: 32px !important;
        align-items: flex-start !important;
        padding: 0 16px !important;
      }
      .article-sidebar-ad {
        width: 220px !important;
        position: sticky !important;
        top: 90px !important;
        flex-shrink: 0 !important;
        z-index: 10 !important;
      }
      @media (max-width: 1279px) {
        .article-sidebar-ad {
          display: none !important;
        }
        .article-outer-wrapper {
          display: block !important;
          padding: 0 !important;
        }
        .blog-container {
          margin: 2rem auto !important;
        }
      }
"""

LEFT_AD_HTML = """
      <aside class="article-sidebar-ad article-ad-left" aria-label="Advertisement">
        <ins class="adsbygoogle"
             style="display:block; width:100%; min-height:600px;"
             data-ad-client="ca-pub-7203223934454111"
             data-ad-slot="8714170901"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </aside>
"""

RIGHT_AD_HTML = """
      <aside class="article-sidebar-ad article-ad-right" aria-label="Advertisement">
        <ins class="adsbygoogle"
             style="display:block; width:100%; min-height:600px;"
             data-ad-client="ca-pub-7203223934454111"
             data-ad-slot="9720699039"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </aside>
"""

def patch_static_blog_files():
    pattern = os.path.join(ROOT, '**', 'blog', '**', 'index.html')
    files = glob.glob(pattern, recursive=True)
    print(f"Found {len(files)} blog HTML pages to process.")

    count = 0
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already patched
        if 'article-outer-wrapper' in content:
            continue

        # 1. Inject CSS before </style>
        if '</style>' in content:
            content = content.replace('</style>', SIDEBAR_CSS + '\n    </style>', 1)

        # 2. Wrap <main id="main-content" class="blog-container">
        target = '<main id="main-content" class="blog-container">'
        if target in content:
            replacement = (
                '<div class="article-outer-wrapper">\n'
                + LEFT_AD_HTML
                + '\n        ' + target
            )
            content = content.replace(target, replacement, 1)

            # Close wrapper after </main>
            if '</main>' in content:
                content = content.replace(
                    '</main>',
                    '</main>\n' + RIGHT_AD_HTML + '\n    </div>',
                    1
                )
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1

    print(f"Patched {count} static blog HTML pages with left & right sidebar ads!")

def main():
    print("Starting article global sidebar ad placement...")
    patch_static_blog_files()
    print("Sidebar ad placement completed!")

if __name__ == '__main__':
    main()
