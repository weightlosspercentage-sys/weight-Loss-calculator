const fs = require('fs');
const http = require('http');

const baseUrl = 'http://localhost:4321';

function fetchUrl(urlPath) {
  return new Promise((resolve) => {
    http.get(baseUrl + urlPath, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data, headers: res.headers }));
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function audit() {
  console.log('--- STARTING EMPIRICAL AUDIT ---');

  // 1. Homepage
  const home = await fetchUrl('/');
  const homeHtml = home.html || '';

  // Title & Meta
  const titleMatch = homeHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = homeHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const h1Matches = homeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h2Matches = [...homeHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const h3Matches = [...homeHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  console.log('Homepage Title:', titleMatch ? titleMatch[1].trim() : 'NONE');
  console.log('Homepage Title Length:', titleMatch ? titleMatch[1].trim().length : 0);
  console.log('Homepage Description:', descMatch ? descMatch[1] : 'NONE');
  console.log('Homepage Description Length:', descMatch ? descMatch[1].length : 0);
  console.log('Homepage H1 Count:', h1Matches.length);
  console.log('Homepage H1 Text:', h1Matches[0] ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : 'NONE');
  console.log('Homepage H2 Count:', h2Matches.length);
  console.log('Homepage H2s:', h2Matches);

  // OG & Twitter Tags
  const ogTitle = /property=["']og:title["']/i.test(homeHtml);
  const ogDesc = /property=["']og:description["']/i.test(homeHtml);
  const ogImage = /property=["']og:image["']/i.test(homeHtml);
  const twitterTitle = /name=["']twitter:title["']/i.test(homeHtml);

  console.log('OG Tags:', { ogTitle, ogDesc, ogImage, twitterTitle });

  // Schema Markup
  const schemaMatches = [...homeHtml.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim());
  console.log('Schema count:', schemaMatches.length);
  schemaMatches.forEach((s, idx) => console.log(`Schema ${idx + 1}:`, s.substring(0, 150) + '...'));

  // Word count & Keyword Density
  const textContent = homeHtml.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
  const words = textContent.split(/\s+/).filter(w => w.length > 0);
  console.log('Homepage Word Count:', words.length);

  const kwMatches = (textContent.match(/weight loss percentage/gi) || []).length;
  console.log('Primary Keyword Mentions:', kwMatches);
  console.log('Keyword Density:', ((kwMatches * 3 / words.length) * 100).toFixed(2) + '%');

  // Images
  const imgMatches = [...homeHtml.matchAll(/<img\s+([^>]+)>/gi)].map(m => {
    const attr = m[1];
    const src = (attr.match(/src=["']([^"']+)["']/i) || [])[1] || '';
    const alt = (attr.match(/alt=["']([^"']+)["']/i) || [])[1] || '';
    return { src, alt };
  });
  console.log('Total Images:', imgMatches.length);
  console.log('Sample Images:', imgMatches.slice(0, 5));

  // Category page check: /calculators/
  const cat = await fetchUrl('/calculators/');
  const catHtml = cat.html || '';
  const catTitle = (catHtml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const catDesc = (catHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || [])[1] || '';
  const catH1 = (catHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [])[0] || '';
  const catWords = catHtml.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;

  console.log('\nCategory Page (/calculators/):');
  console.log('Title:', catTitle, 'Length:', catTitle.length);
  console.log('Desc:', catDesc, 'Length:', catDesc.length);
  console.log('H1:', catH1.replace(/<[^>]+>/g, '').trim());
  console.log('Word Count:', catWords);

  // Sub-page check: /restaurants/taco-bell/
  const sub = await fetchUrl('/restaurants/taco-bell/');
  const subHtml = sub.html || '';
  const subTitle = (subHtml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const subDesc = (subHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || [])[1] || '';
  const subH1 = (subHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [])[0] || '';
  const subWords = subHtml.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;

  console.log('\nSub-Page (/restaurants/taco-bell/):');
  console.log('Title:', subTitle, 'Length:', subTitle.length);
  console.log('Desc:', subDesc, 'Length:', subDesc.length);
  console.log('H1:', subH1.replace(/<[^>]+>/g, '').trim());
  console.log('Word Count:', subWords);

  // Sitemap & Robots
  const sitemap = await fetchUrl('/sitemap-index.xml');
  const robots = await fetchUrl('/robots.txt');
  console.log('\nSitemap status:', sitemap.status, 'Robots status:', robots.status);

  // Check Canonicals on 5 random pages
  const testUrls = ['/', '/calculators/', '/nutrition/', '/restaurants/taco-bell/', '/calculators/salad-calories/'];
  console.log('\nCanonical Tags Check:');
  for (const u of testUrls) {
    const res = await fetchUrl(u);
    const cMatch = (res.html || '').match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    console.log(u, 'Canonical:', cMatch ? cMatch[1] : 'MISSING');
  }
}

audit();
