const fs = require('fs');
const path = require('path');

function removeBlogFromDir(dir) {
  let count = 0;
  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      if (file.startsWith('from-') || file.includes('-to-')) continue;
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const blogRegex = /<li><a\s+href=["'](?:\/[a-z]{2})?\/blog\/["'][^>]*>Blog<\/a><\/li>/gi;
        if (blogRegex.test(content)) {
          content = content.replace(blogRegex, '');
          fs.writeFileSync(fullPath, content, 'utf8');
          count++;
        }
      }
    }
  }

  walk(dir);
  console.log(`Successfully removed legacy blog links from ${count} static HTML files in ${dir}.`);
}

removeBlogFromDir('dist3');
