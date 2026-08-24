const fs = require('fs');
const s = fs.readFileSync('dist3/restaurants/taco-bell/index.html', 'utf8');
const hdrStart = s.indexOf('static-header');
console.log('=== FIRST 3000 chars around static-header ===');
console.log(s.slice(Math.max(0, hdrStart - 400), hdrStart + 3000));
