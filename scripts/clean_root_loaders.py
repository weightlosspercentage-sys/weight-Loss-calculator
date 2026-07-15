import os
import re

subdirs_to_process = [
    'about',
    'blog',
    'calculators',
    'category',
    'compare',
    'contact',
    'disclaimer',
    'glossary',
    'nutrition',
    'privacy',
    'restaurants',
    'terms'
]

def clean_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    # Regex to find the text div inside spa-loader
    text_div_pattern = r'\s*<div style="font-size: 1.25rem; font-weight: 700; background: linear-gradient\(135deg, #3b82f6, #8b5cf6, #f97316\); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: sans-serif; letter-spacing: -0.025em;">.*?</div>'
    
    modified = False
    
    if re.search(text_div_pattern, content):
        content = re.sub(text_div_pattern, '', content)
        modified = True
        
    spinner_pattern = r'animation: spa-spin 1s linear infinite; margin-bottom: 1rem;'
    if spinner_pattern in content:
        content = content.replace(spinner_pattern, 'animation: spa-spin 1s linear infinite;')
        modified = True
        
    if modified:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleaned loader in: {file_path}")
        except Exception as e:
            print(f"Error writing {file_path}: {e}")

def main():
    print("Scanning workspace source folders to clean loader text...")
    
    html_files = []
    if os.path.exists('index.html'):
        html_files.append('index.html')
        
    for subdir in subdirs_to_process:
        if os.path.exists(subdir):
            for root, dirs, files in os.walk(subdir):
                # Skip programmatic directories
                if 'from-' in root or 'height-weight' in root:
                    continue
                for file in files:
                    if file.endswith('.html'):
                        full_path = os.path.join(root, file)
                        html_files.append(full_path)
                        
    print(f"Found {len(html_files)} source HTML files to clean.")
    
    for file_path in html_files:
        clean_file(file_path)
                
    print("Source files cleanup complete.")

if __name__ == '__main__':
    main()
