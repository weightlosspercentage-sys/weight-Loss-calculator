const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let relPath = urlPath.replace(/^\/+/, '');
  if (!relPath || relPath.endsWith('/')) {
    relPath += 'index.html';
  }

  let fullPath = path.join(DIST_DIR, relPath);
  if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '.html')) {
    fullPath += '.html';
  } else if (!fs.existsSync(fullPath) && fs.existsSync(path.join(fullPath, 'index.html'))) {
    fullPath = path.join(fullPath, 'index.html');
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(5173, () => {
  console.log('Dist3 server running at http://localhost:5173/');
});
