const fs = require('fs');
const content = fs.readFileSync('assets/index-Ctp2HkQJ.js', 'utf8');
const sample = content.substring(content.indexOf('BMI Calculator') - 20, content.indexOf('BMI Calculator') + 20);
console.log('Sample:', sample);
