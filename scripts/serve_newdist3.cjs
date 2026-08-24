const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'dist3');
const PORT = 8123;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2', '.xsl': 'application/xml' };

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }
  if (p.includes('..')) { res.writeHead(403); return res.end(); }
  let fp = path.join(ROOT, p);
  if (fp.endsWith(path.sep) || !path.extname(fp)) fp = path.join(fp, 'index.html');
  fs.readFile(fp, (err, data) => {
    if (err) {
      const soft = path.join(ROOT, 'index.html');
      return fs.readFile(soft, (e2, d2) => {
        if (e2) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('serving rebuilt dist3 on http://localhost:' + PORT));
