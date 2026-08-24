const fs = require('fs');
const s = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');
for (const slug of ['postpartum-weight-loss-safe-guide', 'water-fasting-weight-loss']) {
  let idx = -1, n = 0;
  while ((idx = s.indexOf(slug, idx + 1)) !== -1 && n < 3) {
    console.log('=== ' + slug + ' @' + idx + ' ===');
    console.log(s.slice(Math.max(0, idx - 150), idx + 150));
    n++;
  }
  if (!n) console.log(slug + ': NOT IN BUNDLE');
}
