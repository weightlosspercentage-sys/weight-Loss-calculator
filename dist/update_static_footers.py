import os
import re

def extract_footer_from_dist():
    dist_index = os.path.join('dist', 'index.html')
    if not os.path.exists(dist_index):
        raise FileNotFoundError(f"Could not find {dist_index}. Please run 'npm run build' first.")
    
    with open(dist_index, 'r', encoding='utf-8') as f:
        content = f.read()
        
    start_idx = content.find('<footer class="static-footer"')
    if start_idx == -1:
        raise ValueError("Could not find '<footer class=\"static-footer\"' in dist/index.html")
        
    end_idx = content.find('</footer>', start_idx)
    if end_idx == -1:
        raise ValueError("Could not find '</footer>' in dist/index.html")
        
    # Include the closing tag </footer>
    return content[start_idx:end_idx + 9]

def update_footers_in_dir(new_footer):
    exclude_dirs = {'.git', '.vscode', '.agents', '.astro', 'node_modules', 'dist', 'modern-clone'}
    
    html_files_updated = 0
    
    for root, dirs, files in os.walk('.'):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                start_idx = content.find('<footer class="static-footer"')
                if start_idx != -1:
                    end_idx = content.find('</footer>', start_idx)
                    if end_idx != -1:
                        old_footer = content[start_idx:end_idx + 9]
                        updated_content = content.replace(old_footer, new_footer)
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(updated_content)
                            
                        html_files_updated += 1
                        
    print(f"Successfully updated footer in {html_files_updated} HTML files.")

def main():
    print("Extracting new footer from dist/index.html...")
    try:
        new_footer = extract_footer_from_dist()
        print("Syncing new footer to all root and static HTML files...")
        update_footers_in_dir(new_footer)
        print("Footer sync completed successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
