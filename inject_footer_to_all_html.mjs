import fs from 'fs';
import path from 'path';

const footerHtml = fs.readFileSync(path.join(process.cwd(), 'scratch', 'extracted_footer.html'), 'utf-8');

function getHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const dirs = ['restaurants', 'calculators', 'uk', 'ca', 'au', 'nz', 'zh', 'ru', 'us'];
let updated = 0;
let skipped = 0;

dirs.forEach(d => {
  const files = getHtmlFiles(d);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('<footer')) {
      if (content.includes('</body>')) {
        content = content.replace('</body>', `${footerHtml}\n</body>`);
      } else if (content.includes('</html>')) {
        content = content.replace('</html>', `${footerHtml}\n</html>`);
      } else {
        content += `\n${footerHtml}`;
      }
      fs.writeFileSync(file, content, 'utf8');
      updated++;
    } else {
      skipped++;
    }
  });
});

console.log(`Footer injection complete! Updated: ${updated}, Skipped: ${skipped}`);
