import re

for filename in ['assets/router-BvPvcSMX.js', 'assets/index-Ctp2HkQJ.js']:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        matches = [m.start() for m in re.finditer(r'routeTree', content)]
        print(f"\n--- {filename} ---")
        print(f"Found {len(matches)} occurrences of 'routeTree'")
        
        for idx, m in enumerate(matches[:5]):
            start = max(0, m - 100)
            end = min(len(content), m + 100)
            snippet = content[start:end]
            print(f"\nMatch {idx+1}:\n{snippet}")
    except FileNotFoundError:
        print(f"File {filename} not found.")
