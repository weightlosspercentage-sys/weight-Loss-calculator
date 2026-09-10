const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/keywords_parsed.json', 'utf-8'));

// Extract all keywords from topical CSV
const topicalKeywords = data.topical.map(r => ({
  keyword: r.Keyword.trim(),
  volume: r.Volume || '0',
  difficulty: r.Difficulty || '',
  intent: r.Intents || 'Informational',
  source: 'Topical CSV'
}));

// Extract all queries from GSC CSV
const gscKeywords = data.gsc.map(r => ({
  keyword: (r['Top queries'] || Object.values(r)[0]).trim(),
  clicks: r.Clicks || 0,
  impressions: r.Impressions || 0,
  position: r.Position || 0,
  source: 'GSC'
}));

console.log('Total Topical Keywords:', topicalKeywords.length);
console.log('Total GSC Queries:', gscKeywords.length);

// Save full list
fs.writeFileSync('scratch/all_topical.json', JSON.stringify(topicalKeywords, null, 2));
fs.writeFileSync('scratch/all_gsc.json', JSON.stringify(gscKeywords, null, 2));

// Filter GSC keywords relevant to the homepage (weight loss percentage, calculations, formulas, tools)
const homepageGsc = gscKeywords.filter(k => {
  const kw = k.keyword.toLowerCase();
  return kw.includes('weight loss') || 
         kw.includes('percent') || 
         kw.includes('lost') || 
         kw.includes('formula') || 
         kw.includes('calculator') ||
         kw.includes('bmr') ||
         kw.includes('bmi') ||
         kw.includes('fat') ||
         kw.includes('body weight') ||
         kw.includes('excess weight');
});

console.log('Homepage relevant GSC queries:', homepageGsc.length);
