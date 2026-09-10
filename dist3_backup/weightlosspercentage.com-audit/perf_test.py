import asyncio, json, sys
from playwright.async_api import async_playwright

URLS = {
    "homepage": "https://www.weightlosspercentage.com/",
    "blog-post": "https://www.weightlosspercentage.com/blog/how-to-calculate-weight-loss-percentage/",
    "calculator": "https://www.weightlosspercentage.com/calculators/bmi/",
}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        results = {}
        for name, url in URLS.items():
            for vp, label in [({"width": 390, "height": 844}, "mobile"), ({"width": 1440, "height": 900}, "desktop")]:
                ctx = await browser.new_context(viewport=vp, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36")
                page = await ctx.new_page()
                vitals = {}
                await page.add_init_script("""
                    window.__vitals = {};
                    new PerformanceObserver((list) => {
                        for (const e of list.getEntries()) {
                            if (e.entryType === 'largest-contentful-paint' && !window.__vitals.lcp) window.__vitals.lcp = e.startTime;
                        }
                    }).observe({type: 'largest-contentful-paint', buffered: true});
                    new PerformanceObserver((list) => {
                        for (const e of list.getEntries()) window.__vitals.cls = (window.__vitals.cls||0) + e.value;
                    }).observe({type: 'layout-shift', buffered: true});
                """)
                t0 = asyncio.get_event_loop().time()
                await page.goto(url, wait_until="networkidle", timeout=60000)
                load_ms = (asyncio.get_event_loop().time() - t0) * 1000
                await page.wait_for_timeout(2000)
                vitals = await page.evaluate("window.__vitals")
                await page.screenshot(path=f"weightlosspercentage.com-audit/screenshots/{name}-{label}.png", full_page=False)
                rscount = len(await page.evaluate("performance.getEntriesByType('resource')"))
                bytes_total = await page.evaluate("performance.getEntriesByType('resource').reduce((a,e)=>a+(e.transferSize||0),0)")
                results[f"{name}-{label}"] = {"load_ms": round(load_ms), "lcp_ms": round(vitals.get('lcp') or 0), "cls": round(vitals.get('cls') or 0, 3), "resources": rscount, "transfer_bytes": bytes_total}
                await ctx.close()
        await browser.close()
        print(json.dumps(results, indent=1))
        json.dump(results, open("weightlosspercentage.com-audit/performance-lab.json", "w"), indent=1)

asyncio.run(main())
