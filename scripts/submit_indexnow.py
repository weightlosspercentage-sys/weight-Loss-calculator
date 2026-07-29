"""IndexNow Submission Script for Bing & Search Engines.

Submits site URLs to IndexNow API so Bing Webmaster Tools recognizes active IndexNow setup.
"""
import urllib.request
import json

HOST = "www.weightlosspercentage.com"
KEY = "00dfa8f0386944318ce70588075062c0"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

URLS = [
    f"https://{HOST}/",
    f"https://{HOST}/calculators/",
    f"https://{HOST}/calculators/weight-loss",
    f"https://{HOST}/calculators/bmi",
    f"https://{HOST}/calculators/tdee",
    f"https://{HOST}/calculators/bmr",
    f"https://{HOST}/calculators/calorie",
    f"https://{HOST}/calculators/body-fat",
    f"https://{HOST}/calculators/protein",
    f"https://{HOST}/calculators/water-intake",
    f"https://{HOST}/blog/",
    f"https://{HOST}/blog/5-percent-weight-loss",
    f"https://{HOST}/blog/how-to-calculate-weight-loss-percentage",
    f"https://{HOST}/nutrition/",
    f"https://{HOST}/compare/",
]

def submit_indexnow():
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": URLS
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"IndexNow submission response status: {resp.status}")
            if resp.status in (200, 202):
                print("Successfully submitted URLs to IndexNow!")
    except Exception as e:
        print(f"Error submitting to IndexNow: {e}")

if __name__ == '__main__':
    submit_indexnow()
