with open("assets/index-Ctp2HkQJ.js", "r", encoding="utf-8") as f:
    content = f.read()

# Search for imports of jsx-runtime
pos = content.find("react/jsx-runtime")
if pos != -1:
    print(f"Found 'react/jsx-runtime' at {pos}")
    print(content[max(0, pos-200):min(len(content), pos+200)])
else:
    # Let's search for "jsx" import signatures
    print("'react/jsx-runtime' not found. Searching for 'jsx' assignments...")
    # Print the first 2000 chars of the file to see imports
    print(content[:1500])
