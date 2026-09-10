const fs = require('fs');

const p1 = 'D:/projects/Weight Loss- Master/https___www.weightlosspercentage.com_-Performance-on-Search-2026-09-06/Queries.csv';
const p2 = 'D:/projects/Weight Loss Topical/google_us_weight-loss-percenta_matching-terms_2026-08-27_10-34-45 - google_us_weight-loss-percenta_matching-terms_2026-08-27_10-34-45.csv';

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  
  // Custom CSV parser handling quotes
  const parseLine = (line) => {
    const row = [];
    let inQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    row.push(current.trim());
    return row;
  };

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i]);
    if (row.length >= 1) {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx] || '';
      });
      rows.push(obj);
    }
  }
  return { headers, rows };
}

console.log('--- GSC Queries (p1) ---');
const gscData = parseCSV(fs.readFileSync(p1, 'utf-8'));
console.log('GSC Headers:', gscData.headers);
console.log('GSC Total Rows:', gscData.rows.length);
console.log('Sample GSC Rows (top 15):', gscData.rows.slice(0, 15));

console.log('\n--- Topical / Matching Terms (p2) ---');
const topicalData = parseCSV(fs.readFileSync(p2, 'utf-8'));
console.log('Topical Headers:', topicalData.headers);
console.log('Topical Total Rows:', topicalData.rows.length);
console.log('Sample Topical Rows (top 15):', topicalData.rows.slice(0, 15));

// Write full parsed analysis to a JSON file for deep inspection
fs.writeFileSync('scratch/keywords_parsed.json', JSON.stringify({
  gsc: gscData.rows,
  topical: topicalData.rows
}, null, 2));

console.log('\nParsed data saved to scratch/keywords_parsed.json');
