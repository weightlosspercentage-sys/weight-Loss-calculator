const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\cc6d9166-9a05-49c0-b95f-6c9881c038bf';

(async () => {
  console.log('Preparing HTML for instant local rendering...');
  let html = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  
  // Strip external script tags that cause Windows UNC hangs on file://
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match) => {
    if (match.includes('src=')) return '<!-- stripped script -->';
    return match;
  });

  // Fix absolute CSS paths to point directly to dist3 assets on disk
  const assetsDirUrl = pathToFileURL(path.join(DIST_DIR, 'assets')).href;
  const astroDirUrl = pathToFileURL(path.join(DIST_DIR, '_astro')).href;
  
  html = html.replace(/href="\/assets\//g, `href="${assetsDirUrl}/`);
  html = html.replace(/src="\/assets\//g, `src="${assetsDirUrl}/`);
  html = html.replace(/href="\/_astro\//g, `href="${astroDirUrl}/`);

  // Remove layout-loader
  html = html.replace(/<div id="layout-loader"[\s\S]*?<\/div><\/div>/, '');

  const tempHtmlPath = path.join(DIST_DIR, '_temp_preview.html');
  fs.writeFileSync(tempHtmlPath, html, 'utf-8');

  const fileUrl = pathToFileURL(tempHtmlPath).href;
  console.log('File URL:', fileUrl);

  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 1. Desktop Viewport
  await page.setViewportSize({ width: 1280, height: 900 });
  console.log('Navigating...');
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // Desktop Header
  const header = await page.$('header');
  if (header) {
    await header.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-navbar-desktop.png') });
    console.log('✅ Captured: dist3-navbar-desktop.png');
  }

  // Desktop Footer
  const footer = await page.$('footer');
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await footer.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-footer-desktop.png') });
    console.log('✅ Captured: dist3-footer-desktop.png');
  }

  // Full top overview
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-overview.png') });
  console.log('✅ Captured: dist3-overview.png');

  // 2. Mobile Viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);

  // Mobile Navbar (Closed)
  const mobileHeader = await page.$('header');
  if (mobileHeader) {
    await mobileHeader.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-navbar-mobile.png') });
    console.log('✅ Captured: dist3-navbar-mobile.png');

    // Expand mobile menu
    await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      if (menu) {
        menu.classList.remove('hidden');
        menu.style.maxHeight = '500px';
        menu.style.opacity = '1';
        menu.style.display = 'block';
      }
    });
    await page.waitForTimeout(300);
    await mobileHeader.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-navbar-mobile-expanded.png') });
    console.log('✅ Captured: dist3-navbar-mobile-expanded.png');
  }

  // Mobile Footer
  if (footer) {
    const mFooter = await page.$('footer');
    if (mFooter) {
      await mFooter.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await mFooter.screenshot({ path: path.join(ARTIFACT_DIR, 'dist3-footer-mobile.png') });
      console.log('✅ Captured: dist3-footer-mobile.png');
    }
  }

  // Cleanup
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  await browser.close();
  console.log('🎉 ALL SCREENSHOTS SAVED SUCCESSFULLY!');
})();
