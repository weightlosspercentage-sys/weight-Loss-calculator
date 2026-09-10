const fs = require('fs');
let code = fs.readFileSync('src/pages/[...fallback].astro', 'utf8');
code = code.replace(/const folders = \[[\s\S]*?\];/m, "const folders = ['restaurants'];");
fs.writeFileSync('src/pages/[...fallback].astro', code);
