const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const workspace = process.cwd();
const dirs = ['about', 'accessibility', 'calculators', 'category', 'compare', 'contact', 'disclaimer', 'glossary', 'nutrition', 'privacy', 'restaurants', 'terms', 'au', 'ca', 'nz', 'ru', 'uk', 'zh'];

let modifiedCount = 0;

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // regex to remove the static footer
      // the static footer is usually <footer class="static-footer" ... </footer>
      const originalLength = content.length;
      
      // Cheerio approach is safer but slower. Regex is faster.
      // Let's use a robust regex that matches the static footer.
      content = content.replace(/<!-- Unified 4-Column Footer matching Home Page -->\s*/g, '');
      content = content.replace(/<footer class="static-footer"[\s\S]*?<\/footer>/i, '');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content);
        modifiedCount++;
      }
    }
  }
}

console.log('Scanning and removing static footers...');
// process root index.html too
if (fs.existsSync('index.html')) {
    let content = fs.readFileSync('index.html', 'utf8');
    const originalLength = content.length;
    content = content.replace(/<!-- Unified 4-Column Footer matching Home Page -->\s*/g, '');
    content = content.replace(/<footer class="static-footer"[\s\S]*?<\/footer>/i, '');
    if (content.length !== originalLength) {
        fs.writeFileSync('index.html', content);
        modifiedCount++;
    }
}

for (const d of dirs) {
  processDirectory(path.join(workspace, d));
}
console.log(`Successfully removed static footer from ${modifiedCount} files.`);
