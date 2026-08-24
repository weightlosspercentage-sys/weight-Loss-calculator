const fs = require('fs');
const s = fs.readFileSync('dist3/restaurants/taco-bell/index.html', 'utf8');
let idx = s.indexOf('href="/about/"');
console.log('=== around About anchor ===');
console.log(s.slice(Math.max(0, idx - 500), idx + 300));
idx = s.indexOf('google_translate_element');
console.log('\n=== around google_translate_element @' + idx + ' ===');
if (idx !== -1) console.log(s.slice(Math.max(0, idx - 400), idx + 300));
else console.log('NOT PRESENT in raw page');
