const fs = require('fs');
const s = fs.readFileSync('public/assets/index-Ctp2HkQJ.js', 'utf8');
console.log('bundle len:', s.length);

// find "Glossary" link node then show surrounding nav structure
for (const needle of ['children:"Glossary"', 'children:"About"', 'children:"Compare"', 'google_translate_element']) {
  let idx = -1, n = 0;
  while ((idx = s.indexOf(needle, idx + 1)) !== -1 && n < 6) {
    console.log('\n=== ' + needle + ' @' + idx + ' ===');
    console.log(s.slice(Math.max(0, idx - 400), idx + 200));
    n++;
  }
  if (!n) console.log('\n=== ' + needle + ' : NOT FOUND ===');
}
