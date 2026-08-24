const fs = require('fs');
const s = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');
let idx = -1, n = 0;
while ((idx = s.indexOf('"/about/"', idx + 1)) !== -1 && n < 20) {
  console.log('@', idx, '=>', JSON.stringify(s.slice(Math.max(0, idx - 150), idx + 80)));
  n++;
}
console.log('\noccurrences of "/about/":', n);
// also check mobile menu About link
idx = -1; n = 0;
while ((idx = s.indexOf('to:"/about/"', idx + 1)) !== -1) n++;
console.log('links with to:"/about/":', n);
