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
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('from-') || entry.name.includes('-to-')) continue;
      results = results.concat(getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const rootDir = process.cwd();
let allFiles = ['index.html', 'skills.html'];
for (const folder of folders) {
  allFiles = allFiles.concat(getHtmlFiles(path.join(rootDir, folder)));
}

const dropdownFiles = [];
for (const file of allFiles) {
  const absPath = path.isAbsolute(file) ? file : path.join(rootDir, file);
  if (fs.existsSync(absPath)) {
    const content = fs.readFileSync(absPath, 'utf-8');
    if (content.includes('nav-item-dropdown') || content.includes('nav-dropdown-content')) {
      dropdownFiles.push(path.relative(rootDir, absPath));
    }
  }
}

console.log(`Found ${dropdownFiles.length} HTML files with nav-item-dropdown:`);
console.log(JSON.stringify(dropdownFiles, null, 2));
