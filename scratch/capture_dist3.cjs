const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\cc6d9166-9a05-49c0-b95f-6c9881c038bf';

function serveStatic(req, res) {
  let cleanPath = decodeURI(req.url.split('?')[0]).replace(/^\/+/, '');
  if (!cleanPath || cleanPath.endsWith('/')) {
    cleanPath += 'index.html';
  }
  
  let filePath = path.join(DIST_DIR, cleanPath);
  
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
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

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

const server = http.createServer(serveStatic);

server.listen(8097, async () => {
  console.log('Server started on http://127.0.0.1:8097');

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  try {
    // 1. Desktop captures
    const desktopPage = await browser.newPage();
    await desktopPage.setViewportSize({ width: 1300, height: 900 });
    console.log('Navigating to http://127.0.0.1:8097/ ...');
    await desktopPage.goto('http://127.0.0.1:8097/', { waitUntil: 'load', timeout: 10000 }).catch(e => console.log('Load event reached or timed:', e.message));
    
    // Remove layout loader if still present
    await desktopPage.evaluate(() => {
      const loader = document.getElementById('layout-loader');
      if (loader) loader.remove();
    });
    await desktopPage.waitForTimeout(1000);

    // Desktop Header / Nav
    const headerEl = await desktopPage.$('header');
    if (headerEl) {
      await headerEl.screenshot({ path: path.join(ARTIFACT_DIR, 'navbar-desktop.png') });
      console.log('Desktop header captured successfully!');
    } else {
      await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'navbar-desktop.png'), clip: { x: 0, y: 0, width: 1300, height: 100 } });
    }

    // Scroll to footer and capture Desktop Footer
    const footerEl = await desktopPage.$('footer');
    if (footerEl) {
      await footerEl.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(500);
      await footerEl.screenshot({ path: path.join(ARTIFACT_DIR, 'footer-desktop.png') });
      console.log('Desktop footer captured successfully!');
    }

    // Capture overall page overview
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-overview.png') });
    console.log('Overview page captured successfully!');

    await desktopPage.close();

    // 2. Mobile captures
    const mobilePage = await browser.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto('http://127.0.0.1:8097/', { waitUntil: 'load', timeout: 10000 }).catch(e => console.log('Load event reached or timed:', e.message));
    
    await mobilePage.evaluate(() => {
      const loader = document.getElementById('layout-loader');
      if (loader) loader.remove();
    });
    await mobilePage.waitForTimeout(500);

    // Mobile Header
    const mobileHeaderEl = await mobilePage.$('header');
    if (mobileHeaderEl) {
      await mobileHeaderEl.screenshot({ path: path.join(ARTIFACT_DIR, 'navbar-mobile.png') });
      console.log('Mobile header captured!');

      // Click hamburger
      const hamburger = await mobilePage.$('#mobile-menu-btn, button[aria-label*="menu" i]');
      if (hamburger) {
        await hamburger.click();
        await mobilePage.waitForTimeout(500);
        await mobileHeaderEl.screenshot({ path: path.join(ARTIFACT_DIR, 'navbar-mobile-expanded.png') });
        console.log('Mobile menu expanded captured!');
      }
    }

    // Mobile Footer
    const mobileFooterEl = await mobilePage.$('footer');
    if (mobileFooterEl) {
      await mobileFooterEl.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(500);
      await mobileFooterEl.screenshot({ path: path.join(ARTIFACT_DIR, 'footer-mobile.png') });
      console.log('Mobile footer captured!');
    }

    await mobilePage.close();
    console.log('ALL SCREENSHOTS COMPLETED!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
});
