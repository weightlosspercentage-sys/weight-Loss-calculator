const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/keywords_parsed.json', 'utf-8'));

console.log('=== ALL TOPICAL KEYWORDS (p2) ===');
data.topical.forEach((r, idx) => {
  console.log(`${idx + 1}. "${r.Keyword}" | Vol: ${r.Volume} | Difficulty: ${r.Difficulty || 'N/A'} | Intent: ${r.Intents} | Parent: ${r['Parent Keyword'] || 'None'}`);
});

console.log('\n=== TOP GSC QUERIES (p1 - Top 40 by clicks/impressions) ===');
// GSC rows usually have columns: Top queries, Clicks, Impressions, CTR, Position
data.gsc.sort((a, b) => {
  const impA = parseFloat(a.Impressions || a.impressions || 0);
  const impB = parseFloat(b.Impressions || b.impressions || 0);
  return impB - impA;
});

data.gsc.slice(0, 40).forEach((r, idx) => {
  const query = r['Top queries'] || r.Query || r.query || Object.values(r)[0];
  const clicks = r.Clicks || r.clicks || 0;
  const imp = r.Impressions || r.impressions || 0;
  const pos = r.Position || r.position || 'N/A';
  console.log(`${idx + 1}. "${query}" | Clicks: ${clicks} | Imp: ${imp} | Pos: ${pos}`);
});
