with open('assets/index-Ctp2HkQJ.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('children:"Home"')
print("FOUND AT:", pos)
print("="*80)
print(text[max(0, pos-200):min(len(text), pos+1200)])
print("="*80)
