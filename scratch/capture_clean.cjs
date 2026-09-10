const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\cc6d9166-9a05-49c0-b95f-6c9881c038bf';

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

server.listen(8765, async () => {
  console.log('HTTP Server listening on http://127.0.0.1:8765');

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    // Block external network calls to make loading instant
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith('http://127.0.0.1:8765') || url.startsWith('http://localhost:8765')) {
        route.continue();
      } else {
        route.abort();
      }
    });

    // 1. Desktop Viewport
    const page = await context.newPage();
    await page.setViewportSize({ width: 1300, height: 900 });
    console.log('Opening desktop page...');
    await page.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded' });
    
    // Remove spinner
    await page.evaluate(() => {
      const loader = document.getElementById('layout-loader');
      if (loader) loader.remove();
    });
    await page.waitForTimeout(500);

    // Screenshot Desktop Navigation
    const header = await page.$('header');
    if (header) {
      await header.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-navbar-desktop.png') });
      console.log('Captured: dist3-navbar-desktop.png');
    }

    // Scroll down and screenshot Desktop Footer
    const footer = await page.$('footer');
    if (footer) {
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await footer.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-footer-desktop.png') });
      console.log('Captured: dist3-footer-desktop.png');
    }

    // Full page screenshot top view
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-hero-desktop.png'), clip: { x: 0, y: 0, width: 1300, height: 600 } });
    console.log('Captured: dist3-hero-desktop.png');

    await page.close();

    // 2. Mobile Viewport
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    console.log('Opening mobile page...');
    await mobilePage.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded' });

    await mobilePage.evaluate(() => {
      const loader = document.getElementById('layout-loader');
      if (loader) loader.remove();
    });
    await mobilePage.waitForTimeout(300);

    // Mobile Navbar (closed)
    const mobileHeader = await mobilePage.$('header');
    if (mobileHeader) {
      await mobileHeader.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-navbar-mobile.png') });
      console.log('Captured: dist3-navbar-mobile.png');

      // Click mobile hamburger
      const menuBtn = await mobilePage.$('#mobile-menu-btn');
      if (menuBtn) {
        await menuBtn.click();
        await mobilePage.waitForTimeout(400);
        await mobileHeader.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-navbar-mobile-expanded.png') });
        console.log('Captured: dist3-navbar-mobile-expanded.png');
      }
    }

    // Mobile Footer
    const mobileFooter = await mobilePage.$('footer');
    if (mobileFooter) {
      await mobileFooter.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(300);
      await mobileFooter.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-footer-mobile.png') });
      console.log('Captured: dist3-footer-mobile.png');
    }

    await mobilePage.close();
    console.log('SUCCESS: All screenshots saved!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
});
