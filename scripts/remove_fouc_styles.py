import os
import re

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Remove FOUC inline styles hiding header/main/footer
        pattern1 = r'<style>\s*\.static-header[^{]*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>'
        pattern2 = r'\.static-header,\s*#main-content,\s*\.static-footer\s*\{\s*display:\s*none\s*!important;\s*\}'
        pattern3 = r'\.static-footer\s*\{\s*display:\s*none\s*!important;\s*\}'

        new_content = re.sub(pattern1, '', content, flags=re.IGNORECASE)
        new_content = re.sub(pattern2, '', new_content, flags=re.IGNORECASE)
        new_content = re.sub(pattern3, '', new_content, flags=re.IGNORECASE)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Error {filepath}: {e}")
    return False

def main():
    cleaned = 0
    for root, dirs, files in os.walk('.'):
        if any(x in root for x in ['node_modules', 'dist', 'dist2', 'dist3', '.astro', '.git']):
            continue
        for file in files:
            if file.endswith('.html'):
                fp = os.path.join(root, file)
                if clean_file(fp):
                    cleaned += 1
    print(f"Removed FOUC display:none styles from {cleaned} HTML files.")

if __name__ == '__main__':
    main()
