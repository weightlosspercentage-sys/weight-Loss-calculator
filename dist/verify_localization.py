import os
import re
import xml.etree.ElementTree as ET

countries = ['uk', 'ca', 'au', 'nz', 'zh', 'ru']
domain = 'https://www.weightlosspercentage.com'

# Mapping from country code in path to standard hreflang code
hreflang_map = {
    'uk': 'en-gb',
    'ca': 'en-ca',
    'au': 'en-au',
    'nz': 'en-nz',
    'zh': 'zh',
    'ru': 'ru'
}

def verify_file(file_path, country):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # 1. Check window.__ROUTE_BASEPATH__
    expected_script = f'window.__ROUTE_BASEPATH__ = "/{country}";'
    if expected_script not in content:
        errors.append(f"Missing __ROUTE_BASEPATH__ script for '{country}'")

    # 2. Check canonical link
    rel_path = os.path.relpath(file_path, start=country).replace('\\', '/')
    clean_url_path = rel_path.replace('index.html', '')
    if not clean_url_path.startswith('/'):
        clean_url_path = '/' + clean_url_path
        
    expected_canonical = f'<link rel="canonical" href="{domain}/{country}{clean_url_path}" />'
    expected_canonical_alt = f'<link rel="canonical" href="{domain}/{country}{clean_url_path[:-1]}" />' if clean_url_path.endswith('/') and clean_url_path != '/' else None
    
    if expected_canonical not in content and (expected_canonical_alt is None or expected_canonical_alt not in content):
        canonical_match = re.search(r'<link rel="canonical" href="([^"]*)"', content)
        found_canonical = canonical_match.group(1) if canonical_match else "None"
        errors.append(f"Canonical link mismatch. Expected: '{expected_canonical}', Found: '{found_canonical}'")

    # 3. Check hreflangs
    for c in countries:
        lang_code = hreflang_map[c]
        expected_hreflang = f'hreflang="{lang_code}"'
        if expected_hreflang not in content:
            errors.append(f"Missing hreflang link for '{c}' ({lang_code})")
    if 'hreflang="en-us"' not in content:
        errors.append("Missing hreflang link for country 'us'")
    if 'hreflang="x-default"' not in content:
        errors.append("Missing x-default hreflang link")

    # 4. Check content translation / localization
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    if body_match:
        body_content = body_match.group(1)
        # Strip script tags in body
        body_content = re.sub(r'<script[^>]*>.*?</script>', '', body_content, flags=re.DOTALL | re.IGNORECASE)
        
        if country == 'zh':
            # Check for Chinese characters: [\u4e00-\u9fa5]
            if not re.search(r'[\u4e00-\u9fa5]', body_content):
                errors.append("Chinese translation validation failed: No Chinese characters found in body text.")
        elif country == 'ru':
            # Check for Cyrillic characters: [\u0400-\u04FF]
            if not re.search(r'[\u0400-\u04ff]', body_content):
                errors.append("Russian translation validation failed: No Cyrillic characters found in body text.")
        else:
            # For English subdirectories, check that US spelling variants are localized
            country_name = {'uk': 'UK', 'ca': 'Canada', 'au': 'Australia', 'nz': 'New Zealand'}[country]
            
            # Check title suffix
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            if not title_match:
                errors.append("Missing <title> tag")
            else:
                title_text = title_match.group(1)
                if country_name not in title_text:
                    errors.append(f"Country name '{country_name}' not found in title: '{title_text}'")
                    
            # Check spelling (ignore HTML tags and attributes like style="color:...")
            body_text_only = re.sub(r'<[^>]+>', ' ', body_content)
            for us_term in ['behavior', 'organize', 'flavor', 'color']:
                if us_term in body_text_only.lower():
                    match_pos = body_text_only.lower().find(us_term)
                    context = body_text_only[max(0, match_pos - 30):min(len(body_text_only), match_pos + 40)]
                    errors.append(f"Found US spelling '{us_term}' in body text context: '...{context.strip()}...'")

    # 5. Check that internal links are prefixed (ignore language switcher block)
    content_for_link_check = re.sub(
        r'<div class="notranslate" translate="no".*?</div>\s*',
        '',
        content,
        flags=re.DOTALL
    )
    unprefixed_links = re.findall(r'href="(?!\/(assets|favicon|manifest|og-default|apple-touch-icon|3a5d9e1f2c4b7a6d8e0f1c3a5b7d9e2f|' + country + r'))\/([^"]*)"', content_for_link_check)
    if unprefixed_links:
        errors.append(f"Found {len(unprefixed_links)} unprefixed internal links: {[l[1] for l in unprefixed_links[:3]]}")

    return errors

def main():
    print("Verifying localized pages and configuration...")
    all_errors = {}

    # Check directories
    for country in countries:
        if not os.path.exists(country):
            print(f"ERROR: Country directory '{country}' does not exist!")
            all_errors[country] = ["Directory missing"]
            continue

        # Spot check some files
        spot_checks = [
            os.path.join(country, 'index.html'),
            os.path.join(country, 'calculators/bmi/index.html'),
            os.path.join(country, 'blog/how-to-calculate-weight-loss-percentage/index.html')
        ]

        country_errors = []
        for file in spot_checks:
            if not os.path.exists(file):
                country_errors.append(f"Spot-check file missing: {file}")
                continue
            file_errors = verify_file(file, country)
            if file_errors:
                country_errors.extend([f"{os.path.basename(file)}: {e}" for e in file_errors])

        if country_errors:
            all_errors[country] = country_errors
            print(f"[-] Country '{country}' failed validation with {len(country_errors)} errors.")
        else:
            print(f"[+] Country '{country}' passed validation successfully.")

    # Verify sitemaps (SILO structure)
    print("Verifying SILO sitemaps structure...")
    if not os.path.exists('sitemap.xml'):
        print("ERROR: sitemap.xml is missing!")
        all_errors['sitemap'] = ["sitemap.xml missing"]
    else:
        try:
            tree = ET.parse('sitemap.xml')
            root = tree.getroot()
            if not root.tag.endswith('sitemapindex'):
                all_errors['sitemap'] = [f"Expected sitemapindex root tag, got {root.tag}"]
            else:
                ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                sitemaps_in_index = [loc.text for loc in root.findall('s:sitemap/s:loc', ns)]
                print(f"[+] sitemap.xml is a valid Sitemap Index. It lists {len(sitemaps_in_index)} sub-sitemaps.")
                
                expected_sitemaps = [f"{domain}/sitemap-{r}.xml" for r in ['au', 'ca', 'nz', 'ru', 'uk', 'us', 'zh']]
                for es in expected_sitemaps:
                    if es not in sitemaps_in_index:
                        if 'sitemap' not in all_errors:
                            all_errors['sitemap'] = []
                        all_errors['sitemap'].append(f"Missing expected sub-sitemap in index: {es}")
                
                # Verify each sub-sitemap file
                for region in ['us', 'uk', 'ca', 'au', 'nz', 'zh', 'ru']:
                    filename = f"sitemap-{region}.xml"
                    if not os.path.exists(filename):
                        if 'sitemap' not in all_errors:
                            all_errors['sitemap'] = []
                        all_errors['sitemap'].append(f"Sub-sitemap file missing: {filename}")
                        continue
                    
                    try:
                        subtree = ET.parse(filename)
                        subroot = subtree.getroot()
                        if not subroot.tag.endswith('urlset'):
                            if 'sitemap' not in all_errors:
                                all_errors['sitemap'] = []
                            all_errors['sitemap'].append(f"{filename}: Expected urlset root tag, got {subroot.tag}")
                            continue
                            
                        urls = [loc.text for loc in subroot.findall('s:url/s:loc', ns)]
                        print(f"  - {filename} is valid. Contains {len(urls)} URLs.")
                        
                        # Verify total counts (updated for new blog posts and category links)
                        expected = 75
                        if len(urls) != expected:
                            if 'sitemap' not in all_errors:
                                all_errors['sitemap'] = []
                            all_errors['sitemap'].append(f"{filename}: Expected {expected} URLs, got {len(urls)}")
                            
                        # Verify path prefix correctness
                        for u in urls:
                            if region == 'us':
                                # Verify that US urls do not contain any country prefix
                                for other_r in ['uk', 'ca', 'au', 'nz', 'zh', 'ru']:
                                    if f"/{other_r}/" in u:
                                        if 'sitemap' not in all_errors:
                                            all_errors['sitemap'] = []
                                        all_errors['sitemap'].append(f"{filename}: URL {u} contains unauthorized prefix /{other_r}/")
                            else:
                                if f"/{region}/" not in u:
                                    if 'sitemap' not in all_errors:
                                        all_errors['sitemap'] = []
                                    all_errors['sitemap'].append(f"{filename}: URL {u} is missing required prefix /{region}/")
                                    
                    except Exception as sub_e:
                        if 'sitemap' not in all_errors:
                            all_errors['sitemap'] = []
                        all_errors['sitemap'].append(f"Error parsing {filename}: {sub_e}")
                        
        except Exception as e:
            print(f"ERROR parsing sitemap.xml: {e}")
            all_errors['sitemap'] = [f"XML parse error: {e}"]

    # Summarize results
    if all_errors:
        print("\n=== VALIDATION FAILED ===")
        for section, errors in all_errors.items():
            print(f"\nErrors in {section}:")
            for err in errors:
                print(f"  - {err}")
        exit(1)
    else:
        print("\n=== ALL VALIDATION CHECKS PASSED SUCCESSFULLY! ===")
        exit(0)

if __name__ == '__main__':
    main()
