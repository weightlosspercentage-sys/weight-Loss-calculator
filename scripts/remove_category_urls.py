import os
import shutil
import re

def update_file_links(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        new_content = content.replace('/category/fitness/', '/calculators/fitness/')
        new_content = new_content.replace('/category/nutrition/', '/calculators/nutrition/')
        new_content = new_content.replace('/category/pregnancy/', '/calculators/pregnancy/')
        new_content = new_content.replace('/category/specialized/', '/calculators/specialized/')
        new_content = new_content.replace('/category/weight-loss/', '/calculators/weight-loss/')

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    # 1. Create new folders under calculators/
    categories = ['fitness', 'nutrition', 'pregnancy', 'specialized']
    
    for cat in categories:
        src_file = os.path.join('category', cat, 'index.html')
        dest_dir = os.path.join('calculators', cat)
        dest_file = os.path.join(dest_dir, 'index.html')
        
        os.makedirs(dest_dir, exist_ok=True)
        if os.path.exists(src_file):
            with open(src_file, 'r', encoding='utf-8', errors='ignore') as f:
                c = f.read()
            
            # Replace /category/ with /calculators/ inside page content
            c = c.replace(f'/category/{cat}/', f'/calculators/{cat}/')
            c = c.replace('/category/', '/calculators/')
            
            with open(dest_file, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f"[+] Created {dest_file}")

    # 2. Update links across all HTML files
    print("\nUpdating internal links across HTML files...")
    updated_count = 0
    for root, dirs, files in os.walk('.'):
        if any(x in root for x in ['node_modules', 'dist', 'dist2', 'dist3', '.astro', '.git']):
            continue
        for file in files:
            if file.endswith('.html') or file.endswith('.astro') or file.endswith('.xml'):
                fp = os.path.join(root, file)
                if update_file_links(fp):
                    updated_count += 1
    print(f"Updated links in {updated_count} files.")

if __name__ == '__main__':
    main()
