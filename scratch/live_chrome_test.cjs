const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\cc6d9166-9a05-49c0-b95f-6c9881c038bf';

(async () => {
  console.log('--- LIVE CHROME DEVTOOLS EVALUATION ---');
  
  // Read new draft content
  const newContentMd = fs.readFileSync('scratch/homepage_draft_v2.md', 'utf-8');
  
  // Convert markdown to clean HTML structure for live preview
  let contentHtml = newContentMd
    .replace(/^# (.*$)/gim, '<h1 style="font-weight: 800; font-size: 2.25rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #1e293b; font-size: 1.15rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">$1</a>')
    .replace(/\n\n/gim, '</p><p style="margin-bottom: 1rem; line-height: 1.7; color: #334155; font-size: 1rem;">')
    .replace(/---/gim, '<hr style="border: 0; height: 1px; background: #e2e8f0; margin: 2rem 0;">');

  contentHtml = `<div id="seo-optimized-content" style="max-width: 900px; margin: 2rem auto; padding: 2rem; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">` + contentHtml + `</div>`;

  // Read base index.html and inject new content into main
  let indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  
  // Replace the text inside <main> with the new enriched content
  indexHtml = indexHtml.replace(/<main[\s\S]*?<\/main>/, `<main id="main-content" style="max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; color: #334155;">${contentHtml}</main>`);

  // Write temporary test page
  fs.writeFileSync(path.join(DIST_DIR, 'optimized_preview.html'), indexHtml, 'utf-8');

  // Launch browser and connect via CDP / DevTools
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/optimized_preview.html ...');
  await page.goto('http://localhost:5173/optimized_preview.html', { waitUntil: 'domcontentloaded' });
  
  // Remove spinner
  await page.evaluate(() => {
    const loader = document.getElementById('layout-loader');
    if (loader) loader.remove();
  });
  await page.waitForTimeout(1000);

  // Live Chrome DevTools DOM queries
  const liveStats = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText;
    const h2s = Array.from(document.querySelectorAll('h2')).map(el => el.innerText);
    const internalLinks = Array.from(document.querySelectorAll('#seo-optimized-content a')).map(a => ({
      text: a.innerText,
      href: a.getAttribute('href')
    }));
    const totalWords = document.querySelector('#seo-optimized-content')?.innerText.split(/\s+/).length || 0;

    return {
      h1,
      h2Count: h2s.length,
      h2s,
      internalLinksCount: internalLinks.length,
      internalLinks,
      totalWords
    };
  });

  console.log('\n--- LIVE CHROME DEVTOOLS INSPECTION RESULTS ---');
  console.log('H1:', liveStats.h1);
  console.log('H2s Count:', liveStats.h2Count);
  console.log('H2s:', liveStats.h2s);
  console.log('Internal Links Count:', liveStats.internalLinksCount);
  console.log('Internal Links Sample:', liveStats.internalLinks.slice(0, 10));
  console.log('Total Word Count:', liveStats.totalWords);

  // Take full screenshot of the new live content in Chrome
  const contentEl = await page.$('#seo-optimized-content');
  if (contentEl) {
    await contentEl.screenshot({ path: path.join(ARTIFACT_DIR, 'live_seo_content_screenshot.png') });
    console.log(`✅ Saved live screenshot to: ${path.join(ARTIFACT_DIR, 'live_seo_content_screenshot.png')}`);
  }

  // Cleanup
  if (fs.existsSync(path.join(DIST_DIR, 'optimized_preview.html'))) {
    fs.unlinkSync(path.join(DIST_DIR, 'optimized_preview.html'));
  }

  await browser.close();
  console.log('Live Chrome DevTools evaluation completed successfully!');
})();
