const fs = require('fs');
const content = fs.readFileSync('assets/index-Ctp2HkQJ.js.bak-mojibake', 'utf8');
const regex = /icon:"([^"]+)"/g;
let match;
const icons = new Set();
while ((match = regex.exec(content)) !== null) {
  icons.add(match[1]);
}
console.log(Array.from(icons));
