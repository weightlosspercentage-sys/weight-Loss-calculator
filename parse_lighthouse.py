import json

desktop_path = r'C:\Users\asus\AppData\Local\Temp\chrome-devtools-mcp-AxqLno\report.json'
mobile_path = r'C:\Users\asus\AppData\Local\Temp\chrome-devtools-mcp-txtjTr\report.json'

def print_fails(path, name):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            d = json.load(f)
        print(f"--- {name} Failures ---")
        for k, a in d['audits'].items():
            if a.get('score') is not None and a['score'] < 1:
                print(f"- {a['title']} (Score: {a['score']}, Weight: {a.get('weight', 'N/A')})")
                print(f"  {a.get('description', '').split('.')[0]}")
    except Exception as e:
        print(f"Error reading {name}: {e}")

print_fails(desktop_path, 'Desktop')
print_fails(mobile_path, 'Mobile')
