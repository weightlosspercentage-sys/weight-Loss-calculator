const fs = require('fs');
let config = fs.readFileSync('astro.config.mjs', 'utf8');

const injectionCode = `
      // --- X. Footer Injection ---
      if (!html.includes('<!-- Global Medical Disclaimer') && !html.includes('<footer')) {
        let footerHtml = '';
        try {
          footerHtml = fs.readFileSync('bottom_content.html', 'utf8');
        } catch(e) {}
        if (footerHtml) {
          const insertPoint = html.lastIndexOf('</div>');
          if (insertPoint !== -1) {
             html = html.substring(0, insertPoint) + '\\n' + footerHtml + '\\n' + html.substring(insertPoint);
             modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, html);
      }
`;

config = config.replace(/if \(modified\) \{\s*fs\.writeFileSync\(filePath, html\);\s*\}/, injectionCode);
fs.writeFileSync('astro.config.mjs', config);
console.log('Successfully patched!');
