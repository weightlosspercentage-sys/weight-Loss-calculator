const fs = require('fs');
const s = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');

// Find the mobile nav section (after the desktop translate div)
const anchor = s.indexOf('id:"google_translate_element"');
const segment = s.slice(anchor, anchor + 4000);
console.log('=== MOBILE NAV REGION ===');
console.log(segment);
