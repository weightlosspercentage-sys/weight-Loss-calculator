from playwright.sync_api import sync_playwright
import os
import json

PAGES_TO_VERIFY = [
    ("/calculators/rucking/index.html", "Rucking Calorie Calculator"),
    ("/calculators/stairmaster/index.html", "StairMaster Calorie Calculator"),
    ("/restaurants/taco-bell/index.html", "Taco Bell Calorie Calculator"),
    ("/restaurants/dutch-bros/index.html", "Dutch Bros Calorie Calculator"),
    ("/calculators/boba-tea/index.html", "Boba Tea Calorie Calculator"),
    ("/calculators/pcos-calorie/index.html", "PCOS Calorie Calculator"),
    ("/calculators/unit-converters/index.html", "Unit Converters"),
    ("/calculators/index.html", "Calculators Hub"),
    ("/index.html", "Homepage"),
]

def main():
    print("=== WEBAPP TESTING SKILL: VERIFYING ALL OPTIONS & CALCULATOR INTERACTION ===")
    
    artifact_dir = r"C:\Users\asus\.gemini\antigravity\brain\d7412226-ee78-458d-bbe5-d1e4d37b613e"
    os.makedirs(artifact_dir, exist_ok=True)
    
    report = {
        "verified_pages": [],
        "passed": 0,
        "failed": 0
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        for path_url, name in PAGES_TO_VERIFY:
            full_url = f"http://localhost:8080{path_url}"
            print(f"Testing {name} ({full_url})...")
            
            page.goto(full_url)
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_timeout(500)
            
            has_header = page.locator(".static-header").count() > 0
            has_translate = page.locator("#google_translate_element").count() > 0
            
            calc_weight = page.locator("#calc-weight")
            calc_btn = page.locator("#calc-btn")
            result_val = page.locator("#result-val")
            
            interactive = False
            result_text = ""
            
            if calc_weight.count() > 0 and calc_btn.count() > 0:
                calc_weight.fill("185")
                page.locator("#calc-duration").fill("50")
                if page.locator("#calc-intensity").count() > 0:
                    page.locator("#calc-intensity").select_option("vigorous")
                
                calc_btn.click()
                page.wait_for_timeout(300)
                
                result_text = result_val.inner_text() if result_val.count() > 0 else ""
                if result_text and result_text != "0 kcal":
                    interactive = True
            
            page_status = {
                "name": name,
                "path": path_url,
                "has_header": has_header,
                "has_translate": has_translate,
                "interactive_calc": interactive,
                "result_output": result_text
            }
            report["verified_pages"].append(page_status)
            if has_header and has_translate and (interactive or "Hub" in name or "Homepage" in name):
                report["passed"] += 1
            else:
                report["failed"] += 1

        # Take screenshot of live calculator
        page.goto("http://localhost:8080/calculators/rucking/index.html")
        page.wait_for_load_state("domcontentloaded")
        page.locator("#calc-weight").fill("200")
        page.locator("#calc-duration").fill("60")
        page.locator("#calc-intensity").select_option("vigorous")
        page.locator("#calc-btn").click()
        page.wait_for_timeout(300)
        
        screenshot_path = os.path.join(artifact_dir, "webapp_testing_verified_screenshot.png")
        page.screenshot(path=screenshot_path)
        print(f"[+] Saved screenshot: {screenshot_path}")

        browser.close()

    print("\n==================================================")
    print(f"VERIFICATION SUMMARY: {report['passed']}/{len(PAGES_TO_VERIFY)} Passed")
    print("==================================================")

if __name__ == "__main__":
    main()
