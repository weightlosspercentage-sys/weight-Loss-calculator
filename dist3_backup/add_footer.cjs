const fs = require('fs');
const path = require('path');

const workspace = process.cwd();
const dirs = ['about', 'accessibility', 'calculators', 'category', 'compare', 'contact', 'disclaimer', 'glossary', 'nutrition', 'privacy', 'restaurants', 'terms', 'au', 'ca', 'nz', 'ru', 'uk', 'zh'];

const footerHtml = fs.readFileSync('bottom_content.html', 'utf8');
let modifiedCount = 0;
let skippedCount = 0;

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
      
      // Check if it already has the footer (e.g. Astro footer)
      if (content.includes('<!-- Global Medical Disclaimer') || content.includes('<footer')) {
        skippedCount++;
        continue;
      }
      
      // Inject footer before the closing </div> of #root, or before </body>
      // Most static files end with </main> \n\n </div> \n </body>
      const insertPoint1 = content.lastIndexOf('</div>');
      const insertPoint2 = content.lastIndexOf('</body>');
      
      let insertIndex = -1;
      
      // If we find </div> close to the end, insert before it
      if (insertPoint1 !== -1 && insertPoint2 !== -1 && insertPoint1 > insertPoint2 - 100) {
        insertIndex = insertPoint1;
      } else if (insertPoint2 !== -1) {
        insertIndex = insertPoint2;
      }
      
      if (insertIndex !== -1) {
        const newContent = content.substring(0, insertIndex) + '\n' + footerHtml + '\n' + content.substring(insertIndex);
        fs.writeFileSync(fullPath, newContent);
        modifiedCount++;
      } else {
        console.warn(`Could not find insert point in ${fullPath}`);
      }
    }
  }
}

console.log('Injecting unified footer into static HTML files...');

if (fs.existsSync('index.html')) {
    let content = fs.readFileSync('index.html', 'utf8');
    if (!content.includes('<!-- Global Medical Disclaimer') && !content.includes('<footer')) {
        const insertPoint = content.lastIndexOf('</div>');
        if (insertPoint !== -1) {
            content = content.substring(0, insertPoint) + '\n' + footerHtml + '\n' + content.substring(insertPoint);
            fs.writeFileSync('index.html', content);
            modifiedCount++;
        }
    }
}

for (const d of dirs) {
  processDirectory(path.join(workspace, d));
}
console.log(`Successfully injected footer into ${modifiedCount} files. Skipped ${skippedCount} files.`);
