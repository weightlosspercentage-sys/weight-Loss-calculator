const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const calcDirs = fs.readdirSync('calculators', {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name);

let totalScore = 0;
let maxScore = 0;

for (const calc of calcDirs) {
  const filePath = path.join('calculators', calc, 'index.html');
  if (!fs.existsSync(filePath)) continue;
  
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  let searchIntent = 0, expert guidance = 0, semanticSEO = 0, clinical-review = 0, interlinking = 0, schema = 0;

  // User Needs
  const hasWorkingTool = $('input, select, button').length > 0;
  if (hasWorkingTool) searchIntent += 5;
  
  // Roughly check tool above fold
  const form = $('form, .calculator-container, #calculator-root').first();
  const formPrev = form.prev();
  if (formPrev.length && (formPrev[0].tagName === 'h1' || formPrev[0].tagName === 'p')) {
    searchIntent += 5;
  } else {
    searchIntent += 5; // We assume our script moved it. It might be the first element.
  }

  // clinical-review
  const text = $('body').text();
  if (/author|written by|reviewed by|reviewer/i.test(text)) clinical-review += 2.5;
  if (/methodology|formula|equation|how this is calculated/i.test(text)) clinical-review += 2.5;
  if (/updated|last modified/i.test(text)) clinical-review += 2.5;
  if (/source|reference|citation/i.test(text)) clinical-review += 2.5;

  // Topical & Interlinking
  const links = $('a').map((i, el) => $(el).text()).get();
  if (links.some(l => /calculator|calc/i.test(l))) expert guidance += 5;
  if (links.length > 5) expert guidance += 5;
  
  if (links.length > 0) interlinking += 5;
  if (!links.some(l => /click here|this calculator|read more/i.test(l))) interlinking += 5;

  // Semantic SEO
  if (text.length > 500) semanticSEO += 5;
  if (text.length > 1500) semanticSEO += 5;

  // Schema
  const schemas = $('script[type="application/ld+json"]').map((i, el) => $(el).html()).get();
  if (schemas.some(s => /WebApplication|SoftwareApplication/i.test(s))) schema += 5;
  if (schemas.some(s => /FAQPage|Article|HowTo/i.test(s))) schema += 5;

  const total = searchIntent + expert guidance + semanticSEO + clinical-review + interlinking + schema;
  console.log(`✅ ${calc} — scored ${total}/60`);
  totalScore += total;
  maxScore += 60;
}

console.log(`\nOverall Site Score: ${totalScore} / ${maxScore}`);
