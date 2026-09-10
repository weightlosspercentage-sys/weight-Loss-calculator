import fs from 'fs';
import path from 'path';

const folders = [
  'about', 'calculators', 'category', 'compare', 'contact',
  'disclaimer', 'glossary', 'nutrition', 'privacy', 'restaurants',
  'terms', 'uk', 'ca', 'au', 'nz', 'zh', 'ru', 'us'
];

function getHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  let list = [];
  try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch(e) { return results; }

  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('from-') || entry.name.includes('-to-') || entry.name === 'height-weight') continue;
      results = results.concat(getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const rootDir = process.cwd();
let allFiles = ['index.html'];
for (const folder of folders) {
  allFiles = allFiles.concat(getHtmlFiles(path.join(rootDir, folder)));
}

let updatedCount = 0;

for (const file of allFiles) {
  const absPath = path.isAbsolute(file) ? file : path.join(rootDir, file);
  if (!fs.existsSync(absPath)) continue;

  let html = fs.readFileSync(absPath, 'utf-8');
  let original = html;

  // 1. Remove hover dropdown CSS rule
  html = html.replace(/\.nav-item-dropdown:hover\s+\.nav-dropdown-content\s*\{\s*display:\s*block;?\s*\}/gi, '.nav-item-dropdown:hover .nav-dropdown-content { display: none !important; }');
  html = html.replace(/\.nav-item-dropdown:hover\s+\.nav-dropdown-content\s*\{\s*display:\s*block\s*!important;?\s*\}/gi, '.nav-item-dropdown:hover .nav-dropdown-content { display: none !important; }');

  // 2. Replace Calculators Dropdown div block with simple static link
  const calculatorsDropdownRegex = /<!--\s*Calculators Dropdown\s*-->\s*<div class="nav-item-dropdown">[\s\S]*?Calculators[\s\S]*?<\/div>\s*<\/div>/gi;
  html = html.replace(calculatorsDropdownRegex, '<a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Calculators</a>');

  // 3. Replace Nutrition Dropdown div block with simple static link
  const nutritionDropdownRegex = /<!--\s*Nutrition Dropdown\s*-->\s*<div class="nav-item-dropdown">[\s\S]*?Nutrition[\s\S]*?<\/div>\s*<\/div>/gi;
  html = html.replace(nutritionDropdownRegex, '<a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Nutrition</a>');

  // Generic fallback replacement for any remaining nav-item-dropdown div wrappers around Calculators / Nutrition
  html = html.replace(/<div class="nav-item-dropdown">\s*<a href="([^"]*\/calculators\/[^"]*)"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '<a href="$1" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Calculators</a>');
  html = html.replace(/<div class="nav-item-dropdown">\s*<a href="([^"]*\/nutrition\/[^"]*)"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '<a href="$1" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Nutrition</a>');

  if (html !== original) {
    fs.writeFileSync(absPath, html);
    updatedCount++;
  }
}

console.log(`Successfully updated ${updatedCount} HTML files to remove all dropdowns!`);
