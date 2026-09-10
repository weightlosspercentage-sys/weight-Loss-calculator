const http = require('http');

const baseUrl = 'http://localhost:4321';

function fetchUrl(urlPath) {
  return new Promise((resolve) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : baseUrl + urlPath;
    http.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data, headers: res.headers }));
    }).on('error', err => resolve({ error: err.message, status: 500 }));
  });
}

async function runAudit() {
  console.log('==================================================');
  console.log('NAVBAR, CALCULATORS & FOOTER INTERLINKING AUDIT');
  console.log('==================================================\n');

  // 1. Fetch homepage to extract header nav & footer links
  const homepage = await fetchUrl('/');
  const html = homepage.html || '';

  // Extract all navbar & header links
  const navMatches = [...html.matchAll(/<header[\s\S]*?<\/header>/gi)];
  const headerHtml = navMatches.length > 0 ? navMatches[0][0] : html;
  const headerLinks = [...headerHtml.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);

  // Extract all footer links
  const footerMatches = [...html.matchAll(/<footer[\s\S]*?<\/footer>/gi)];
  const footerHtml = footerMatches.length > 0 ? footerMatches[0][0] : html;
  const footerLinks = [...footerHtml.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);

  // Deduplicate and filter internal links
  const cleanHeaderLinks = [...new Set(headerLinks)].filter(l => l.startsWith('/') && !l.startsWith('//'));
  const cleanFooterLinks = [...new Set(footerLinks)].filter(l => l.startsWith('/') && !l.startsWith('//'));

  console.log(`📌 Found ${cleanHeaderLinks.length} Header/Nav Links to test.`);
  console.log(`📌 Found ${cleanFooterLinks.length} Footer Interlinks to test.\n`);

  console.log('--- TESTING HEADER & NAVBAR LINKS ---');
  let navSuccess = 0;
  let navFail = 0;
  for (const link of cleanHeaderLinks) {
    const res = await fetchUrl(link);
    const pass = res.status === 200;
    if (pass) navSuccess++; else navFail++;
    console.log(`[NAV LINK]: ${link.padEnd(45)} => Status: ${res.status} ${pass ? '✅ OK' : '❌ BROKEN'}`);
  }

  console.log('\n--- TESTING FOOTER INTERLINKS ---');
  let footerSuccess = 0;
  let footerFail = 0;
  for (const link of cleanFooterLinks) {
    const res = await fetchUrl(link);
    const pass = res.status === 200;
    if (pass) footerSuccess++; else footerFail++;
    console.log(`[FOOTER LINK]: ${link.padEnd(42)} => Status: ${res.status} ${pass ? '✅ OK' : '❌ BROKEN'}`);
  }

  // Also extract calculators from /calculators/ hub page to test calculator pages listed
  console.log('\n--- TESTING CALCULATOR HUB & INDIVIDUAL CALCULATORS ---');
  const hubPage = await fetchUrl('/calculators/');
  const hubHtml = hubPage.html || '';
  const calcLinks = [...hubHtml.matchAll(/href=["'](\/calculators\/[^"']+)["']/gi)].map(m => m[1]);
  const uniqueCalcLinks = [...new Set(calcLinks)];

  console.log(`📌 Found ${uniqueCalcLinks.length} Calculators listed on Hub Page.`);
  let calcSuccess = 0;
  let calcFail = 0;
  for (const link of uniqueCalcLinks) {
    const res = await fetchUrl(link);
    const pass = res.status === 200;
    if (pass) calcSuccess++; else calcFail++;
    console.log(`[CALCULATOR]: ${link.padEnd(44)} => Status: ${res.status} ${pass ? '✅ OK' : '❌ BROKEN'}`);
  }

  console.log('\n==================================================');
  console.log('SUMMARY RESULTS:');
  console.log(`Header/Nav Links: ${navSuccess} Passed, ${navFail} Failed`);
  console.log(`Footer Interlinks: ${footerSuccess} Passed, ${footerFail} Failed`);
  console.log(`Calculator Pages:  ${calcSuccess} Passed, ${calcFail} Failed`);
  console.log('==================================================');
}

runAudit();
