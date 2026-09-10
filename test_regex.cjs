const fs = require('fs');
const rootHtml = fs.readFileSync('index.html', 'utf-8');
const scriptRegex = /<script[^>]*type=["']module["'][^>]*src=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*><\/script>/gi;
let match;
while ((match = scriptRegex.exec(rootHtml)) !== null) {
  console.log('MATCH:', match[0]);
}
