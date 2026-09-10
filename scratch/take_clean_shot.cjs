const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '..', 'dist3');
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\cc6d9166-9a05-49c0-b95f-6c9881c038bf';

(async () => {
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
  <section id="seo-authoritative-copy" style="max-width: 860px; margin: 2rem auto; padding: 2rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    ${contentHtml}
  </section>`;

  let indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  indexHtml = indexHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match) => {
    if (match.includes('src=')) return '<!-- script -->';
    return match;
  });

  const assetsDirUrl = pathToFileURL(path.join(DIST_DIR, 'assets')).href;
  const astroDirUrl = pathToFileURL(path.join(DIST_DIR, '_astro')).href;
  indexHtml = indexHtml.replace(/href="\/assets\//g, `href="${assetsDirUrl}/`);
  indexHtml = indexHtml.replace(/src="\/assets\//g, `src="${assetsDirUrl}/`);
  indexHtml = indexHtml.replace(/href="\/_astro\//g, `href="${astroDirUrl}/`);
  indexHtml = indexHtml.replace(/<div id="layout-loader"[\s\S]*?<\/div><\/div>/, '');
  indexHtml = indexHtml.replace(/<main[\s\S]*?<\/main>/, `<main id="main-content" style="max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif;">${formattedSection}</main>`);

  const previewFile = path.join(DIST_DIR, '_live_seo_shot.html');
  fs.writeFileSync(previewFile, indexHtml, 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(pathToFileURL(previewFile).href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);

  const shotPath = path.join(ARTIFACT_DIR, 'live_seo_optimized_homepage.png');
  await page.screenshot({ path: shotPath, clip: { x: 190, y: 0, width: 900, height: 1200 } });
  console.log('Saved:', shotPath);

  if (fs.existsSync(previewFile)) fs.unlinkSync(previewFile);
  await browser.close();
})();
