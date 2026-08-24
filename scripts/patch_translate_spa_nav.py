"""Patch React bundle: remove About from desktop nav, rename SPA translate container id."""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, 'assets', 'index-Ctp2HkQJ.js')

def main():
    with open(BUNDLE, 'r', encoding='utf-8') as f:
        content = f.read()

    backup = BUNDLE + '.pre_translate_patch.bak'
    if not os.path.exists(backup):
        shutil.copy2(BUNDLE, backup)
        print(f"[+] backup -> {os.path.basename(backup)}")

    old_about = 's.jsx(Y,{to:"/about/",className:"px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",children:"About"}),'
    count = content.count(old_about)
    assert count == 1, f"About link occurrences: {count} (expected 1)"
    content = content.replace(old_about, '')
    print('[+] removed About link from React desktop nav')

    old_t = 'id:"google_translate_element"'
    count_t = content.count(old_t)
    assert count_t >= 1, 'translate container id not found in bundle'
    content = content.replace(old_t, 'id:"google_translate_element_spa"')
    print(f'[+] renamed translate container id ({count_t} occurrence(s))')

    with open(BUNDLE, 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print('[+] bundle written')

if __name__ == '__main__':
    main()
