const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\cc6d9166-9a05-49c0-b95f-6c9881c038bf';

(async () => {
  console.log('--- LIVE CHROME DEVTOOLS INSPECTION & SCREENSHOT ---');
  
  const newContentMd = fs.readFileSync('scratch/homepage_draft_v2.md', 'utf-8');
  
  let contentHtml = newContentMd
    .replace(/^# (.*$)/gim, '<h1 style="font-weight: 800; font-size: 2.25rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; line-height: 1.2;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #0f172a; font-size: 1.45rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #1e293b; font-size: 1.15rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">$1</a>')
    .replace(/\n\n/gim, '</p><p style="margin-bottom: 1rem; line-height: 1.7; color: #334155; font-size: 0.95rem;">')
    .replace(/---/gim, '<hr style="border: 0; height: 1px; background: #e2e8f0; margin: 1.75rem 0;">');

  const formattedSection = `
  <section id="seo-authoritative-copy" style="max-width: 860px; margin: 2.5rem auto; padding: 2rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    ${contentHtml}
  </section>`;

  let indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  
  // Strip external tracking scripts to make rendering instantaneous
  indexHtml = indexHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match) => {
    if (match.includes('src=')) return '<!-- script -->';
    return match;
  });

  // Fix assets to absolute file:// URLs
  const assetsDirUrl = pathToFileURL(path.join(DIST_DIR, 'assets')).href;
  const astroDirUrl = pathToFileURL(path.join(DIST_DIR, '_astro')).href;
  indexHtml = indexHtml.replace(/href="\/assets\//g, `href="${assetsDirUrl}/`);
  indexHtml = indexHtml.replace(/src="\/assets\//g, `src="${assetsDirUrl}/`);
  indexHtml = indexHtml.replace(/href="\/_astro\//g, `href="${astroDirUrl}/`);
  indexHtml = indexHtml.replace(/<div id="layout-loader"[\s\S]*?<\/div><\/div>/, '');

  // Inject optimized section into main
  indexHtml = indexHtml.replace(/<main[\s\S]*?<\/main>/, `<main id="main-content" style="max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif;">${formattedSection}</main>`);

  const previewFile = path.join(DIST_DIR, '_live_seo_test.html');
  fs.writeFileSync(previewFile, indexHtml, 'utf-8');

  const fileUrl = pathToFileURL(previewFile).href;
  console.log('Navigating to:', fileUrl);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Live CDP inspection
  const liveData = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText;
    const h2s = Array.from(document.querySelectorAll('#seo-authoritative-copy h2')).map(el => el.innerText);
    const links = Array.from(document.querySelectorAll('#seo-authoritative-copy a')).map(a => ({
      anchor: a.innerText,
      href: a.getAttribute('href')
    }));
    const paragraphs = Array.from(document.querySelectorAll('#seo-authoritative-copy p')).length;
    const textContent = document.querySelector('#seo-authoritative-copy')?.innerText || '';
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

    return {
      h1,
      h2Count: h2s.length,
      h2s,
      internalLinksCount: links.length,
      links,
      paragraphs,
      wordCount
    };
  });

  console.log('\n=== LIVE CHROME DEVTOOLS VERIFICATION ===');
  console.log('H1:', liveData.h1);
  console.log('H2 Headings Count:', liveData.h2Count);
  console.log('H2s:', liveData.h2s);
  console.log('Internal Links Count:', liveData.internalLinksCount);
  console.log('Internal Links Detail:', liveData.links);
  console.log('Paragraphs Count:', liveData.paragraphs);
  console.log('Total Word Count:', liveData.wordCount);

  // Capture screenshot of the optimized content rendered live
  const section = await page.$('#seo-authoritative-copy');
  if (section) {
    const shotPath = path.join(ARTIFACT_DIR, 'live_seo_optimized_homepage.png');
    await section.screenshot({ path: shotPath });
    console.log(`\n📸 Live Screenshot Captured: ${shotPath}`);
  }

  // Cleanup
  if (fs.existsSync(previewFile)) {
    fs.unlinkSync(previewFile);
  }

  await browser.close();
  console.log('Live inspection finished with code 0!');
})();
