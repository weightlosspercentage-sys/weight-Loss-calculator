const fs = require('fs');
const { topical } = require('./test_copy_coverage.cjs');

const oldHtml = fs.readFileSync('dist3/index.html', 'utf-8');
const oldText = oldHtml.replace(/<[^>]+>/g, ' ').toLowerCase();

const newText = fs.readFileSync('scratch/homepage_draft_v2.md', 'utf-8').toLowerCase();

const gsc = JSON.parse(fs.readFileSync('scratch/all_gsc.json', 'utf-8'));
const sameIntentGsc = gsc.filter(k => {
  const q = k.keyword.toLowerCase();
  return q.includes('percent') || 
         q.includes('how to calculate weight loss') || 
         q.includes('figure weight loss') || 
         q.includes('how much weight have i lost') ||
         q.includes('weight loss formula') ||
         q.includes('weight loss calculator percentage') ||
         q.includes('percentage weight loss') ||
         q.includes('body weight percentage') ||
         q.includes('weight loss percentage');
});

// Old Homepage Analysis
let oldTopicalFound = 0;
const oldTopicalMissing = [];
topical.forEach(kw => {
  if (oldText.includes(kw.toLowerCase())) {
    oldTopicalFound++;
  } else {
    oldTopicalMissing.push(kw);
  }
});

let oldGscFound = 0;
sameIntentGsc.forEach(g => {
  if (oldText.includes(g.keyword.toLowerCase())) {
    oldGscFound++;
  }
});

// New Homepage Analysis
let newTopicalFound = 0;
const newTopicalMissing = [];
topical.forEach(kw => {
  if (newText.includes(kw.toLowerCase())) {
    newTopicalFound++;
  } else {
    newTopicalMissing.push(kw);
  }
});

let newGscFound = 0;
sameIntentGsc.forEach(g => {
  if (newText.includes(g.keyword.toLowerCase())) {
    newGscFound++;
  }
});

console.log('=== BEFORE (PREVIOUS HOMEPAGE) ===');
console.log(`Topical Keywords Covered: ${oldTopicalFound} / ${topical.length} (${((oldTopicalFound/topical.length)*100).toFixed(1)}%)`);
console.log(`GSC Same-Intent Queries Covered: ${oldGscFound} / ${sameIntentGsc.length} (${((oldGscFound/sameIntentGsc.length)*100).toFixed(1)}%)`);

console.log('\n=== AFTER (NEW HOMEPAGE CONTENT) ===');
console.log(`Topical Keywords Covered: ${newTopicalFound} / ${topical.length} (${((newTopicalFound/topical.length)*100).toFixed(1)}%)`);
console.log(`GSC Same-Intent Queries Covered: ${newGscFound} / ${sameIntentGsc.length} (${((newGscFound/sameIntentGsc.length)*100).toFixed(1)}%)`);
