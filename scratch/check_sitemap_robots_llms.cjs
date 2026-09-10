const fs = require('fs');
const http = require('http');
const https = require('https');

function fetchLocal(pathStr) {
  return new Promise((resolve) => {
    http.get('http://localhost:4321' + pathStr, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', e => resolve({ error: e.message }));
  });
}

function fetchLive(pathStr) {
  return new Promise((resolve) => {
    https.get('https://www.weightlosspercentage.com' + pathStr, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function check() {
  console.log('=== CHECKING SITEMAP, ROBOTS.TXT, LLMS.TXT & OTHER CORE FILES ===');

  const files = ['/sitemap.xml', '/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt', '/llms.txt', '/llms-full.txt', '/manifest.json', '/.well-known/security.txt'];

  for (const f of files) {
    console.log(`\n--- File: ${f} ---`);
    const loc = await fetchLocal(f);
    const liv = await fetchLive(f);

    console.log(`Local  => Status: ${loc.status || 'ERR'}, Length: ${(loc.data || '').length}`);
    if (loc.data && loc.data.length < 500) {
      console.log('Local Preview:', loc.data.trim());
    }

    console.log(`Live   => Status: ${liv.status || 'ERR'}, Length: ${(liv.data || '').length}`);
    if (liv.data && liv.data.length < 500) {
      console.log('Live Preview:', liv.data.trim());
    }
  }
}

check();
