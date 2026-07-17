import re

with open('assets/index-Ctp2HkQJ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Search for localStorage
matches_ls = [m.start() for m in re.finditer(r'localStorage', content)]
print(f"Found {len(matches_ls)} occurrences of 'localStorage'")
for idx, m in enumerate(matches_ls[:5]):
    start = max(0, m - 50)
    end = min(len(content), m + 150)
    print(f"\nMatch {idx+1}:\n{content[start:end]}")

# Search for metric or imperial preferences
matches_units = [m.start() for m in re.finditer(r'(metric|imperial|system)', content, re.IGNORECASE)]
print(f"\nFound {len(matches_units)} occurrences of unit terms")
for idx, m in enumerate(matches_units[:5]):
    start = max(0, m - 50)
    end = min(len(content), m + 150)
    print(f"\nMatch {idx+1}:\n{content[start:end]}")
