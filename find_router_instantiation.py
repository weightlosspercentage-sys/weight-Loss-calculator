import re

with open('assets/router-BvPvcSMX.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for "new Sr" or occurrences of Sr class instantiation
matches = [m.start() for m in re.finditer(r'new\s+Sr', content)]
print(f"Found {len(matches)} occurrences of 'new Sr'")

for idx, m in enumerate(matches):
    start = max(0, m - 100)
    end = min(len(content), m + 100)
    snippet = content[start:end]
    print(f"\nMatch {idx+1}:\n{snippet}")

# Also let's check for any createRouter calls
matches2 = [m.start() for m in re.finditer(r'createRouter', content)]
print(f"Found {len(matches2)} occurrences of 'createRouter'")
for idx, m in enumerate(matches2):
    start = max(0, m - 100)
    end = min(len(content), m + 100)
    snippet = content[start:end]
    print(f"\nMatch {idx+1}:\n{snippet}")
