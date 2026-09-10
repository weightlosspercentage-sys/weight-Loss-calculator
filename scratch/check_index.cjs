const fs = require('fs');

const content = fs.readFileSync('dist3/index.html', 'utf8');
const idx = content.indexOf('/blog/');
console.log('INDEX OF /blog/:', idx);
if (idx !== -1) {
  console.log('SURROUNDING HTML:');
  console.log(content.substring(idx - 100, idx + 100));
}
