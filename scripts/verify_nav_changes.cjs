const fs = require('fs');
const files = [
  'dist3/restaurants/taco-bell/index.html',
  'dist3/calculators/boba-tea/index.html',
  'dist3/index.html',
  'dist3/nutrition/index.html',
];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const hdrEnd = s.indexOf('</header>');
  const hdrStart = Math.max(s.indexOf('<header'), 0);
  const header = s.slice(hdrStart, hdrEnd === -1 ? s.length : hdrEnd + 9);
  const aboutInHeader = /href="\/(?:uk|ca|au|nz|zh|ru)?\/?about\/"/i.test(header);
  const translateInHeader = header.includes('google_translate_element');
  const footer = s.slice(s.indexOf('<footer'));
  const aboutInFooter = /about\//i.test(footer);
  const guard = s.includes('__SPA_NAV_GUARD__');
  console.log(JSON.stringify({
    file: f,
    aboutInHeader, translateInHeader, aboutInFooter, guard,
  }));
}
const b = fs.readFileSync('dist3/assets/index-Ctp2HkQJ.js', 'utf8');
console.log('bundle About link gone:', !b.includes('children:"About"}'), '| spa translate id:', b.includes('google_translate_element_spa'));
