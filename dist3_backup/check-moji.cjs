const fs = require('fs');
const files = [
  'assets/index-Ctp2HkQJ.js',
  'public/assets/index-Ctp2HkQJ.js'
];

for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const hasMojibake = content.includes('ðŸ') || content.includes('Ã');
    console.log(`${f}: ${hasMojibake ? 'Has Mojibake' : 'Clean'}`);
  } catch (e) {
    console.log(`${f}: Not found`);
  }
}
