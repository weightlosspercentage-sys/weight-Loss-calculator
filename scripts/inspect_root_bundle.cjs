const fs = require('fs');
const s = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');
console.log('root bundle len:', s.length);
for (const needle of ['children:"About"', 'children:"Glossary"', 'google_translate_element', 'mobile-nutrition-menu', 'Nutrition & Fast Food Hub', 'All Fast Food Restaurants']) {
  let idx = -1, n = 0;
  while ((idx = s.indexOf(needle, idx + 1)) !== -1 && n < 3) {
    console.log('\n=== ' + needle + ' @' + idx + ' ===');
    console.log(s.slice(Math.max(0, idx - 300), idx + 300));
    n++;
  }
  if (!n) console.log('\n=== ' + needle + ' : NOT FOUND ===');
}
