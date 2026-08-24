const fs = require('fs');
const s = fs.readFileSync('dist3/restaurants/taco-bell/index.html', 'utf8');
const hdrStart = s.indexOf('static-header');
const hdrEnd = s.indexOf('</header>', hdrStart);
const header = s.slice(hdrStart, hdrEnd);
// find top-level nav links
const navSection = header.slice(header.indexOf('nav-item-dropdown') !== -1 ? 2000 : 0);
console.log('=== HEADER NAV LINKS ===');
const re = /<a[^>]*href="([^"]*)"[^>]*>\s*([^<]{2,40})\s*(?:<|<\/a>)/g;
let m;
while ((m = re.exec(header)) !== null) {
  if (!m[2].includes('{')) console.log(m[1].padEnd(40), m[2].trim());
}
console.log('\n=== About occurrences in header ===');
let idx = -1;
while ((idx = header.indexOf('about', idx + 1)) !== -1) {
  console.log('...', header.slice(Math.max(0, idx - 100), idx + 60).replace(/\n/g, ' '));
}
