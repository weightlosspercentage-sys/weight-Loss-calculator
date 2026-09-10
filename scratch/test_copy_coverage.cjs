const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/keywords_parsed.json', 'utf-8'));
const topical = data.topical.map(r => r.Keyword.trim());

console.log(`Loaded ${topical.length} topical keywords.`);

function checkCoverage(text) {
  const lower = text.toLowerCase();
  const found = [];
  const missing = [];

  topical.forEach(kw => {
    const cleanKw = kw.toLowerCase();
    if (lower.includes(cleanKw)) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  });

  console.log(`\nCoverage Results:`);
  console.log(`✅ Found: ${found.length} / ${topical.length} (${((found.length/topical.length)*100).toFixed(1)}%)`);
  if (missing.length > 0) {
    console.log(`❌ Missing (${missing.length}):`);
    missing.forEach(m => console.log(`   - "${m}"`));
  } else {
    console.log(`🎉 100% Keyword Coverage Achieved!`);
  }
  return { found, missing };
}

// Export for use in draft testing
module.exports = { checkCoverage, topical };
