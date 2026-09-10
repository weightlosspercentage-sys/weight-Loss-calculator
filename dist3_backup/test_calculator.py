from playwright.sync_api import sync_playwright

print("Starting calculator webapp test...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:4321')
    
    print("Waiting for network idle...")
    page.wait_for_load_state('networkidle')
    
    print("Checking title...")
    assert "Weight Loss Percentage Calculator" in page.title()
    
    print("Checking H1 styling...")
    h1 = page.locator('h1').first
    assert "Weight Loss Percentage Calculator" in h1.text_content()
    
    # Check if font-weight is 900
    font_weight = h1.evaluate("element => window.getComputedStyle(element).fontWeight")
    print(f"H1 font-weight: {font_weight}")
    assert font_weight == "900", f"Expected font-weight 900, got {font_weight}"
    
    print("Checking Footer flags...")
    us_link = page.locator('footer a:has-text("🇺🇸 English (US)")')
    assert us_link.is_visible(), "US footer link with flag not found"
    
    uk_link = page.locator('footer a:has-text("🇬🇧 English (UK)")')
    assert uk_link.is_visible(), "UK footer link with flag not found"
    
    print("All tests passed successfully! The styling updates and flags are live on the preview build.")
    browser.close()
