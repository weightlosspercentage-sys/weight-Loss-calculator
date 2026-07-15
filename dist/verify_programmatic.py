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

def verify_page(file_path, s, t, region):
    if not os.path.exists(file_path):
        return [f"File does not exist: {file_path}"]
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    errors = []
    
    # 1. Check title contains start and target weights
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    if not title_match:
        errors.append("Missing <title> tag")
    else:
        title_text = title_match.group(1)
        if str(s) not in title_text or str(t) not in title_text:
            errors.append(f"Title does not contain weight values '{s}' or '{t}': '{title_text}'")
            
    # 2. Check canonical link
    rel_url_path = f"/calculators/weight-loss/from-{s}-to-{t}/"
    if region == 'us':
        expected_canonical = f'<link rel="canonical" href="{domain}{rel_url_path}" />'
    else:
        expected_canonical = f'<link rel="canonical" href="{domain}/{region}{rel_url_path}" />'
        
    if expected_canonical not in content:
        canonical_match = re.search(r'<link rel="canonical" href="([^"]*)"', content)
        found_canonical = canonical_match.group(1) if canonical_match else "None"
        errors.append(f"Canonical link mismatch. Expected: '{expected_canonical}', Found: '{found_canonical}'")
        
    # 3. Check for schemas
    for schema_type in ['WebApplication', 'BreadcrumbList', 'FAQPage']:
        if f'"@type": "{schema_type}"' not in content:
            errors.append(f"Missing schema type: '{schema_type}'")
            
    # 4. Check for dynamic calculations placeholder
    if f'id="ui-start">{s} lbs' not in content:
        errors.append(f"Starting weight UI value mismatch: Expected '{s} lbs'")
    if f'id="ui-target">{t} lbs' not in content:
        errors.append(f"Target weight UI value mismatch: Expected '{t} lbs'")
        
    # 5. Check translation
    if region == 'zh':
        # Chinese characters check in the page body
        if not re.search(r'[\u4e00-\u9fa5]', content):
            errors.append("Chinese translation validation failed: No Chinese characters found in content.")
    elif region == 'ru':
        # Cyrillic characters check in the page body
        if not re.search(r'[\u0400-\u04ff]', content):
            errors.append("Russian translation validation failed: No Cyrillic characters found in content.")
            
    # 6. Check that SPA module scripts are NOT loaded
    if 'index-Ctp2HkQJ.js' in content:
        errors.append("SPA loader script 'index-Ctp2HkQJ.js' is incorrectly included (should be static-only)")
        
    # 7. Check that spa-loader spinner is NOT in the code (which causes infinite loading)
    if 'id="spa-loader"' in content:
        errors.append("spa-loader spinner is present in static page layout (will cause infinite loading screen)")
        
    return errors

def main():
    print("Verifying programmatic pages structure...")
    all_errors = {}
    
    # Test cases: Spot check start/target combinations across all regions
    spot_checks = [
        (200, 180),
        (150, 130),
        (250, 200),
        (300, 270)
    ]
    
    regions = ['us', 'uk', 'ca', 'au', 'nz', 'zh', 'ru']
    
    for s, t in spot_checks:
        for r in regions:
            if r == 'us':
                path = f"calculators/weight-loss/from-{s}-to-{t}/index.html"
            else:
                path = f"{r}/calculators/weight-loss/from-{s}-to-{t}/index.html"
                
            errors = verify_page(path, s, t, r)
            if errors:
                all_errors[path] = errors
                print(f"[-] Spot check failed: {path} with {len(errors)} errors.")
            else:
                print(f"[+] Spot check passed: {path}")
                
    # Verify sitemap-from-to-weight.xml
    print("\nVerifying sitemap-from-to-weight.xml...")
    if not os.path.exists('sitemap-from-to-weight.xml'):
        all_errors['sitemap-silo'] = ["sitemap-from-to-weight.xml does not exist!"]
    else:
        try:
            tree = ET.parse('sitemap-from-to-weight.xml')
            root = tree.getroot()
            if not root.tag.endswith('urlset'):
                all_errors['sitemap-silo'] = [f"Expected urlset root tag in silo sitemap, got {root.tag}"]
            else:
                ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                urls = [loc.text for loc in root.findall('s:url/s:loc', ns)]
                print(f"[+] sitemap-from-to-weight.xml is valid. Contains {len(urls)} URLs.")
                if len(urls) != 2457:
                    all_errors['sitemap-silo'] = [f"Expected 2457 URLs in sitemap-from-to-weight.xml, got {len(urls)}"]
        except Exception as e:
            all_errors['sitemap-silo'] = [f"Error parsing sitemap-from-to-weight.xml: {e}"]
            
    # Verify master sitemap.xml
    print("\nVerifying sitemap.xml index update...")
    if not os.path.exists('sitemap.xml'):
        all_errors['sitemap-index'] = ["sitemap.xml does not exist!"]
    else:
        try:
            tree = ET.parse('sitemap.xml')
            root = tree.getroot()
            if not root.tag.endswith('sitemapindex'):
                all_errors['sitemap-index'] = [f"Expected sitemapindex root tag in master, got {root.tag}"]
            else:
                ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                sitemaps = [loc.text for loc in root.findall('s:sitemap/s:loc', ns)]
                print(f"[+] sitemap.xml is valid. Lists {len(sitemaps)} sub-sitemaps.")
                
                silo_url = f"{domain}/sitemap-from-to-weight.xml"
                if silo_url not in sitemaps:
                    all_errors['sitemap-index'] = [f"sitemap-from-to-weight.xml link missing in sitemap.xml index. Found: {sitemaps}"]
        except Exception as e:
            all_errors['sitemap-index'] = [f"Error parsing sitemap.xml: {e}"]
            
    if all_errors:
        print("\n=== PROGRAMMATIC VALIDATION FAILED ===")
        for path, errors in all_errors.items():
            print(f"\nErrors in {path}:")
            for err in errors:
                print(f"  - {err}")
        exit(1)
    else:
        print("\n=== ALL PROGRAMMATIC VALIDATION CHECKS PASSED SUCCESSFULLY! ===")
        exit(0)

if __name__ == '__main__':
    main()
