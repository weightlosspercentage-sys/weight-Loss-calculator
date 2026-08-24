const fs = require('fs');
const s = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');

// find the dropdown data arrays definitions
const ihIdx = s.indexOf('Ih=[[');
const jhIdx = s.indexOf('Jh=[[');
const calcIdx = Math.min.apply(null, [ihIdx, jhIdx].filter(i => i !== -1));

console.log('=== region before dropdown data (nav items & translate) ===');
console.log(s.slice(Math.max(0, calcIdx - 6500), calcIdx + 200));
