const fs = require('fs');
const content = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');
const regex = /path:"([^"]+)"/g;
let match;
const routes = new Set();
while ((match = regex.exec(content)) !== null) {
  routes.add(match[1]);
}
console.log(Array.from(routes).join('\n'));
