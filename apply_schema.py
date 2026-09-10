with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

article_schema = """    <!-- Article Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Weight Loss Percentage Calculator",
      "author": { "@type": "Person", "name": "Jane Doe", "url": "https://www.weightlosspercentage.com/author/jane-doe" },
      "publisher": { "@type": "Organization", "name": "Weight Loss Percentage" },
      "reviewer": { "@type": "Person", "name": "Dr. John Smith", "url": "https://www.weightlosspercentage.com/reviewer/john-smith" }
    }
    </script>
"""

target = '<!-- WebApplication Schema -->'
if target in html:
    html = html.replace(target, article_schema + target)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Schema fixes applied.")
else:
    print("Target not found")
