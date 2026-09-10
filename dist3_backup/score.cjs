const fs = require('fs');

const results = JSON.parse(fs.readFileSync('audit-results.json', 'utf8'));
let totalScore = 0;
let maxScore = 0;

let siteSearchIntent = 0, siteTopicalAuthority = 0, siteSemanticSEO = 0, siteEEAT = 0, siteInterlinking = 0, siteSchema = 0;

const scoreCards = [];
const fixLists = [];

for (const {calc, data} of results) {
  let searchIntent = 0;
  let topicalAuthority = 0;
  let semanticSEO = 0;
  let eeat = 0;
  let interlinking = 0;
  let schema = 0;
  const fixes = [];
  
  // Search Intent
  if (data.hasWorkingTool) searchIntent += 5;
  else fixes.push({category: 'Search Intent', severity: 'Critical', issue: 'No working tool detected.'});
  
  if (data.toolAboveFold) searchIntent += 5;
  else fixes.push({category: 'Search Intent', severity: 'High', issue: 'Tool is not above the fold.'});
  
  const h1Match = data.h1.toLowerCase().includes(calc.replace(/-/g, ' ').split(' ')[0]);
  if (!h1Match) fixes.push({category: 'Search Intent', severity: 'Medium', issue: 'H1 does not clearly match the primary intent keyword.'});
  
  // Topical Authority & Interlinking
  const linksToOtherCalcs = data.anchors.filter(a => a.toLowerCase().includes('calculator') || a.toLowerCase().includes('calc')).length;
  if (linksToOtherCalcs > 0) topicalAuthority += 5;
  else fixes.push({category: 'Topical Authority', severity: 'High', issue: 'Isolated calculator. No links to related calculators in the cluster.'});
  
  if (data.internalLinksCount > 5) topicalAuthority += 5;
  else fixes.push({category: 'Topical Authority', severity: 'Medium', issue: 'Few internal links suggesting weak cluster connections.'});
  
  if (data.internalLinksCount === 0) {
    fixes.push({category: 'Interlinking', severity: 'Critical', issue: 'Orphan calculator page (no inbound/outbound context mapped).'});
  } else {
    interlinking += 5;
    const badAnchors = data.anchors.filter(a => /click here|this calculator|read more/i.test(a));
    if (badAnchors.length === 0) interlinking += 5;
    else fixes.push({category: 'Interlinking', severity: 'Medium', issue: 'Generic anchor text found (e.g. "click here").'});
  }

  // Semantic SEO
  if (data.textLength > 500) semanticSEO += 5;
  else fixes.push({category: 'Semantic SEO', severity: 'High', issue: 'Thin content page. Missing semantic content around the tool.'});
  if (data.textLength > 1500) semanticSEO += 5;
  else fixes.push({category: 'Semantic SEO', severity: 'Low', issue: 'Consider adding more related questions/subtopics for depth.'});

  // EEAT
  if (data.hasAuthor) eeat += 2.5; else fixes.push({category: 'EEAT', severity: 'Medium', issue: 'Missing author/reviewer byline.'});
  if (data.hasMethodology) eeat += 2.5; else fixes.push({category: 'EEAT', severity: 'High', issue: 'Missing methodology explanation.'});
  if (data.hasUpdatedDate) eeat += 2.5; else fixes.push({category: 'EEAT', severity: 'Low', issue: 'Missing last-updated date.'});
  if (data.hasCitation) eeat += 2.5; else fixes.push({category: 'EEAT', severity: 'High', issue: 'No sources or formulas cited.'});
  
  const needsDisclaimer = /glp1|bariatric|postpartum|pregnancy|infant|baby|dog/i.test(calc);
  if (needsDisclaimer && !data.hasDisclaimer) fixes.push({category: 'EEAT', severity: 'Critical', issue: 'Medical/health-adjacent calculator missing disclaimer.'});
  
  // Schema
  const hasAppSchema = data.schemas.some(s => /WebApplication|SoftwareApplication/i.test(s));
  const hasFAQSchema = data.schemas.some(s => /FAQPage/i.test(s));
  const hasArticleSchema = data.schemas.some(s => /Article|HowTo/i.test(s));
  
  if (hasAppSchema) schema += 5; else fixes.push({category: 'Schema Markup', severity: 'High', issue: 'Missing WebApplication/SoftwareApplication schema.'});
  if (hasFAQSchema || hasArticleSchema) schema += 5; else fixes.push({category: 'Schema Markup', severity: 'Medium', issue: 'Missing FAQPage or Article/HowTo schema.'});
  
  if (data.schemas.length === 0) fixes.push({category: 'Schema Markup', severity: 'Critical', issue: 'Schema missing entirely or not rendering on hydration.'});

  const total = searchIntent + topicalAuthority + semanticSEO + eeat + interlinking + schema;
  console.log(`✅ ${calc} — scored ${total}/60`);
  
  siteSearchIntent += searchIntent;
  siteTopicalAuthority += topicalAuthority;
  siteSemanticSEO += semanticSEO;
  siteEEAT += eeat;
  siteInterlinking += interlinking;
  siteSchema += schema;
  totalScore += total;
  maxScore += 60;
  
  scoreCards.push({calc, searchIntent, topicalAuthority, semanticSEO, eeat, interlinking, schema, total});
  
  if (fixes.length > 0) {
    fixLists.push({calc, fixes});
  }
}

const n = results.length;
const sortedCards = [...scoreCards].sort((a,b) => a.total - b.total);
const bottom3 = sortedCards.slice(0, 3).map(c => c.calc);

let md = `### Scorecard

| Calculator | Search Intent | Topical Authority | Semantic SEO | EEAT | Interlinking | Schema | Total /60 |
|---|---|---|---|---|---|---|---|
`;

for (const c of scoreCards) {
  md += `| ${c.calc} | ${c.searchIntent} | ${c.topicalAuthority} | ${c.semanticSEO} | ${c.eeat} | ${c.interlinking} | ${c.schema} | ${c.total} |\n`;
}

md += `
**Site-wide Averages**
- Search Intent: ${(siteSearchIntent/n).toFixed(1)}
- Topical Authority: ${(siteTopicalAuthority/n).toFixed(1)}
- Semantic SEO: ${(siteSemanticSEO/n).toFixed(1)}
- EEAT: ${(siteEEAT/n).toFixed(1)}
- Interlinking: ${(siteInterlinking/n).toFixed(1)}
- Schema: ${(siteSchema/n).toFixed(1)}

**Overall Site Score:** ${totalScore} / ${maxScore}

**Top Priority Fixes (Bottom 3 Calculators):**
1. ${bottom3[0] || 'N/A'}
2. ${bottom3[1] || 'N/A'}
3. ${bottom3[2] || 'N/A'}

### Prioritized Fix List

`;

const allFixes = [];
for (const {calc, fixes} of fixLists) {
  for (const f of fixes) {
    allFixes.push({calc, ...f});
  }
}

const severityOrder = {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3};
allFixes.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

// Group by calculator
const grouped = {};
for (const f of allFixes) {
  if (!grouped[f.calc]) grouped[f.calc] = [];
  grouped[f.calc].push(f);
}

for (const calc in grouped) {
  md += `#### ${calc}\n`;
  for (const f of grouped[calc]) {
    md += `- **[${f.severity}]** ${f.category}: ${f.issue} (Route: /calculators/${calc})\n`;
  }
  md += `\n`;
}

fs.writeFileSync('audit-artifact.md', md);
