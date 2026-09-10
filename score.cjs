const fs = require('fs');

const results = JSON.parse(fs.readFileSync('audit-results.json', 'utf8'));
let totalScore = 0;
let maxScore = 0;

let siteSearchIntent = 0, siteexpert guidance = 0, siteSemanticSEO = 0, siteclinical-review = 0, siteInterlinking = 0, siteSchema = 0;

const scoreCards = [];
const fixLists = [];

for (const {calc, data} of results) {
  let searchIntent = 0;
  let expert guidance = 0;
  let semanticSEO = 0;
  let clinical-review = 0;
  let interlinking = 0;
  let schema = 0;
  const fixes = [];
  
  // User Needs
  if (data.hasWorkingTool) searchIntent += 5;
  else fixes.push({category: 'User Needs', severity: 'Critical', issue: 'No working tool detected.'});
  
  if (data.toolAboveFold) searchIntent += 5;
  else fixes.push({category: 'User Needs', severity: 'High', issue: 'Tool is not above the fold.'});
  
  const h1Match = data.h1.toLowerCase().includes(calc.replace(/-/g, ' ').split(' ')[0]);
  if (!h1Match) fixes.push({category: 'User Needs', severity: 'Medium', issue: 'H1 does not clearly match the primary intent keyword.'});
  
  // expert guidance & Interlinking
  const linksToOtherCalcs = data.anchors.filter(a => a.toLowerCase().includes('calculator') || a.toLowerCase().includes('calc')).length;
  if (linksToOtherCalcs > 0) expert guidance += 5;
  else fixes.push({category: 'expert guidance', severity: 'High', issue: 'Isolated calculator. No links to related calculators in the cluster.'});
  
  if (data.internalLinksCount > 5) expert guidance += 5;
  else fixes.push({category: 'expert guidance', severity: 'Medium', issue: 'Few internal links suggesting weak cluster connections.'});
  
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

  // clinical-review
  if (data.hasAuthor) clinical-review += 2.5; else fixes.push({category: 'clinical-review', severity: 'Medium', issue: 'Missing author/reviewer byline.'});
  if (data.hasMethodology) clinical-review += 2.5; else fixes.push({category: 'clinical-review', severity: 'High', issue: 'Missing methodology explanation.'});
  if (data.hasUpdatedDate) clinical-review += 2.5; else fixes.push({category: 'clinical-review', severity: 'Low', issue: 'Missing last-updated date.'});
  if (data.hasCitation) clinical-review += 2.5; else fixes.push({category: 'clinical-review', severity: 'High', issue: 'No sources or formulas cited.'});
  
  const needsDisclaimer = /glp1|bariatric|postpartum|pregnancy|infant|baby|dog/i.test(calc);
  if (needsDisclaimer && !data.hasDisclaimer) fixes.push({category: 'clinical-review', severity: 'Critical', issue: 'Medical/health-adjacent calculator missing disclaimer.'});
  
  // Schema
  const hasAppSchema = data.schemas.some(s => /WebApplication|SoftwareApplication/i.test(s));
  const hasFAQSchema = data.schemas.some(s => /FAQPage/i.test(s));
  const hasArticleSchema = data.schemas.some(s => /Article|HowTo/i.test(s));
  
  if (hasAppSchema) schema += 5; else fixes.push({category: 'Schema Markup', severity: 'High', issue: 'Missing WebApplication/SoftwareApplication schema.'});
  if (hasFAQSchema || hasArticleSchema) schema += 5; else fixes.push({category: 'Schema Markup', severity: 'Medium', issue: 'Missing FAQPage or Article/HowTo schema.'});
  
  if (data.schemas.length === 0) fixes.push({category: 'Schema Markup', severity: 'Critical', issue: 'Schema missing entirely or not rendering on hydration.'});

  const total = searchIntent + expert guidance + semanticSEO + clinical-review + interlinking + schema;
  console.log(`✅ ${calc} — scored ${total}/60`);
  
  siteSearchIntent += searchIntent;
  siteexpert guidance += expert guidance;
  siteSemanticSEO += semanticSEO;
  siteclinical-review += clinical-review;
  siteInterlinking += interlinking;
  siteSchema += schema;
  totalScore += total;
  maxScore += 60;
  
  scoreCards.push({calc, searchIntent, expert guidance, semanticSEO, clinical-review, interlinking, schema, total});
  
  if (fixes.length > 0) {
    fixLists.push({calc, fixes});
  }
}

const n = results.length;
const sortedCards = [...scoreCards].sort((a,b) => a.total - b.total);
const bottom3 = sortedCards.slice(0, 3).map(c => c.calc);

let md = `### Scorecard

| Calculator | User Needs | expert guidance | Semantic SEO | clinical-review | Interlinking | Schema | Total /60 |
|---|---|---|---|---|---|---|---|
`;

for (const c of scoreCards) {
  md += `| ${c.calc} | ${c.searchIntent} | ${c.expert guidance} | ${c.semanticSEO} | ${c.clinical-review} | ${c.interlinking} | ${c.schema} | ${c.total} |\n`;
}

md += `
**Site-wide Averages**
- User Needs: ${(siteSearchIntent/n).toFixed(1)}
- expert guidance: ${(siteexpert guidance/n).toFixed(1)}
- Semantic SEO: ${(siteSemanticSEO/n).toFixed(1)}
- clinical-review: ${(siteclinical-review/n).toFixed(1)}
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
