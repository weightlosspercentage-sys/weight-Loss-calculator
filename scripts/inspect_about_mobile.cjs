const fs = require('fs');
const s = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');

// Desktop nav trailing links region
const deskIdx = s.indexOf('children:"About"}),s.jsx("div",{id:"google_translate_element"');
console.log('desktop About+translate idx:', deskIdx);

// find other to:"/about/" occurrences
let idx = -1, n = 0;
while ((idx = s.indexOf('to:"/about/"', idx + 1)) !== -1) {
  console.log('\n=== to:"/about/" @' + idx + ' ===');
  console.log(s.slice(Math.max(0, idx - 350), idx + 150));
  n++;
}
console.log('\ntotal to:"/about/" =', n);
