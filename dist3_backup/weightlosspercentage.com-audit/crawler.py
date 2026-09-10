import json
import re
import sys
import time
import urllib.parse
from collections import OrderedDict

import requests
from bs4 import BeautifulSoup

BASE = "https://www.weightlosspercentage.com"
START = "https://www.weightlosspercentage.com/"
UA = "Mozilla/5.0 (compatible; SEOAuditBot/1.0; +https://www.weightlosspercentage.com)"
MAX_PAGES = 500
TIMEOUT = 30

session = requests.Session()
session.headers["User-Agent"] = UA

disallow_patterns = []
try:
    r = session.get(BASE + "/robots.txt", timeout=20)
    for line in r.text.splitlines():
        line = line.strip()
        if line.lower().startswith("disallow") and "/" in line:
            disallow_patterns.append(line.split(":", 1)[1].strip())
except Exception as e:
    print(f"robots fetch error: {e}", file=sys.stderr)

def allowed(path):
    parsed = urllib.parse.urlparse(path)
    q = parsed.path
    if parsed.query and any("?" in p and p.replace("*", "").strip() in ("/", "") for p in disallow_patterns):
        return False
    for pat in disallow_patterns:
        if not pat or pat == "/" or "?" in pat:
            continue
        if pat.endswith("*"):
            if q.startswith(pat.rstrip("*")):
                return False
        else:
            if q.startswith(pat):
                return False
    return True

def extract(page, html, url, status, rt, final_url):
    soup = BeautifulSoup(html, "lxml")
    def meta(name):
        el = soup.find("meta", attrs={"name": name})
        return el.get("content", "").strip() if el else ""
    def prop(name):
        el = soup.find("meta", attrs={"property": name})
        return el.get("content", "").strip() if el else ""
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    canon = ""
    cl = soup.find("link", rel="canonical")
    if cl and cl.get("href"):
        canon = cl["href"].strip()
    robots = meta("robots")
    desc = meta("description")
    lang = soup.html.get("lang", "") if soup.html else ""
    og_title = prop("og:title")
    og_desc = prop("og:description")
    og_image = prop("og:image")
    twitter_card = meta("twitter:card")
    hreflangs = [l.get("href") for l in soup.find_all("link", rel="alternate") if l.get("hreflang")]
    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
    h2s = len(soup.find_all("h2"))
    text = soup.get_text(" ", strip=True)
    words = len(text.split())
    links_internal = []
    links_external = []
    for a in soup.find_all("a", href=True):
        h = a["href"].strip()
        if h.startswith("#") or h.startswith("mailto:") or h.startswith("tel:") or h.startswith("javascript:"):
            continue
        if h.startswith("/") or BASE.rstrip("/") in h or "weightlosspercentage.com" in h:
            links_internal.append(h)
        elif h.startswith("http"):
            links_external.append(h)
    imgs = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        alt = img.get("alt", "").strip()
        imgs.append({"src": src, "alt": alt, "has_alt": bool(alt), "lazy": bool(img.get("loading") == "lazy")})
    schema_blocks = 0
    schema_types = set()
    schema_valid = True
    for sc in soup.find_all("script", type="application/ld+json"):
        schema_blocks += 1
        try:
            data = json.loads(sc.string or "")
            def walk(d):
                if isinstance(d, dict):
                    if "@type" in d:
                        schema_types.update(d["@type"] if isinstance(d["@type"], list) else [d["@type"]])
                    for v in d.values():
                        walk(v)
                elif isinstance(d, list):
                    for v in d:
                        walk(v)
            walk(data)
        except Exception:
            schema_valid = False
    iframes = len(soup.find_all("iframe"))
    scripts = [s.get("src", "") for s in soup.find_all("script") if s.get("src")]
    third_party = set()
    for s in scripts:
        if s.startswith("http") and "weightlosspercentage.com" not in s:
            try:
                third_party.add(urllib.parse.urlparse(s).netloc)
            except Exception:
                pass
    page["title"] = title
    page["meta_description"] = desc
    page["robots"] = robots
    page["canonical"] = canon
    page["lang"] = lang
    page["og_title"] = og_title
    page["og_desc"] = og_desc
    page["og_image"] = og_image
    page["twitter_card"] = twitter_card
    page["hreflangs"] = hreflangs
    page["h1"] = h1s
    page["h2_count"] = h2s
    page["words"] = words
    page["links_internal"] = links_internal
    page["links_external"] = links_external
    page["img_total"] = len(imgs)
    page["img_no_alt"] = sum(1 for i in imgs if not i["has_alt"])
    page["img_lazy"] = sum(1 for i in imgs if i["lazy"])
    page["schema_blocks"] = schema_blocks
    page["schema_types"] = sorted(schema_types)
    page["schema_valid"] = schema_valid
    page["iframes"] = iframes
    page["third_party_domains"] = sorted(third_party)
    page["status"] = status
    page["response_ms"] = rt
    page["final_url"] = final_url
    page["internal_links_count"] = len(links_internal)
    page["external_links_count"] = len(links_external)
    return page

queue = [START]
seen = OrderedDict()
headers_meta = {}

while queue and len(seen) < MAX_PAGES:
    url = queue.pop(0)
    if url in seen:
        continue
    path = urllib.parse.urlparse(url).path
    if not allowed(path):
        continue
    try:
        t0 = time.time()
        r = session.get(url, timeout=TIMEOUT, allow_redirects=True)
        rt = int((time.time() - t0) * 1000)
        final_url = r.url
        html = r.text
        status = r.status_code
        ctype = r.headers.get("content-type", "")
        if "html" not in ctype:
            seen[url] = {"status": status, "content_type": ctype, "redirect": final_url}
            continue
    except requests.exceptions.RequestException as e:
        seen[url] = {"status": "ERROR", "error": str(e)}
        continue

    page = {"url": url}
    try:
        extract(page, html, url, status, rt, final_url)
    except Exception as e:
        page["status"] = "PARSE_ERROR"
        page["error"] = str(e)
    seen[url] = page

    if status in (200, 404, 301, 302):
        for link in page.get("links_internal", []):
            if link.startswith("/"):
                target = BASE + link
            elif "weightlosspercentage.com" in link:
                target = link
            else:
                continue
            target = target.split("#")[0].split("?")[0]
            if target not in seen and target not in queue:
                queue.append(target)
    time.sleep(0.4)

out = {
    "crawled": [v for v in seen.values() if isinstance(v, dict)],
    "robots_disallow": disallow_patterns,
    "total_considered": len(seen),
}
with open("weightlosspercentage.com-audit/crawl-data.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(json.dumps({"crawled": len(seen), "ok": sum(1 for v in seen.values() if isinstance(v, dict) and v.get("status") == 200), "errors": sum(1 for v in seen.values() if isinstance(v, dict) and v.get("status") not in (200,))}))
