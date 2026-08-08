import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'www.weightlosspercentage.com';
const KEY = '00dfa8f0386944318ce70588075062c0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_API = 'api.indexnow.org';
const INDEXNOW_PATH = '/indexnow';

/**
 * Sends a list of URLs to the IndexNow API.
 * @param {string[]} urls 
 */
export function submitToIndexNow(urls) {
  if (!urls || urls.length === 0) {
    console.error('No URLs provided for submission.');
    return;
  }

  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  });

  const options = {
    hostname: INDEXNOW_API,
    path: INDEXNOW_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  console.log(`Submitting ${urls.length} URLs to IndexNow...`);
  
  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`Success! Response: ${res.statusCode} OK`);
      } else if (res.statusCode === 202) {
        console.log(`Accepted! Response: ${res.statusCode} Accepted (URLs queued for processing)`);
      } else {
        console.error(`Error! Status Code: ${res.statusCode}`);
        console.error(`Response details: ${responseData}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

/**
 * Extracts URLs from public/sitemap.xml or root sitemap.xml
 * @returns {string[]}
 */
export function getUrlsFromSitemap() {
  const sitemapPath = fs.existsSync(path.join(__dirname, '..', 'public', 'sitemap.xml'))
    ? path.join(__dirname, '..', 'public', 'sitemap.xml')
    : path.join(__dirname, '..', 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.error(`Sitemap not found at ${sitemapPath}`);
    return [];
  }

  const content = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [];
  const regex = /<loc>(https:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length > 0) {
  if (args[0] === '--sitemap') {
    const urls = getUrlsFromSitemap();
    console.log(`Extracted ${urls.length} URLs from sitemap.`);
    submitToIndexNow(urls);
  } else {
    const urls = args.map(url => {
      if (!url.startsWith('http')) {
        return `https://${HOST}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      return url;
    });
    submitToIndexNow(urls);
  }
}
