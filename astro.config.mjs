// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to recursively copy files, excluding only Astro-built HTML and markdown files
/**
 * @param {string} src
 * @param {string} dest
 */
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  const rootDir = process.cwd();
  
  const astroBuiltFiles = [
    'index.html',
    'about/index.html',
    'blog/index.html',
    'calculators/index.html',
    'compare/index.html',
    'contact/index.html',
    'nutrition/index.html'
  ];

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      const relPath = path.relative(rootDir.toLowerCase(), srcPath.toLowerCase()).replace(/\\/g, '/');
      if (entry.name.endsWith('.md')) {
        continue;
      }
      if (astroBuiltFiles.includes(relPath)) {
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Post-copy SEO injection: fixes OG/Twitter tags, meta author, noindex thin
// locale pages, and optimizes long titles on raw-copied HTML files.
// ---------------------------------------------------------------------------
const SITE_ORIGIN = 'https://www.weightlosspercentage.com';
const OG_DEFAULT_IMAGE = `${SITE_ORIGIN}/og-default.jpg`;

/**
 * Truncate a title to ≤60 characters on a clean word boundary.
 * @param {string} rawTitle
 * @returns {string}
 */
function optimizeTitleLength(rawTitle) {
  const t = rawTitle.trim();
  if (t.length <= 60) return t;
  // Try splitting by colon first
  if (t.includes(':')) {
    const first = t.split(':')[0].trim();
    if (first.length <= 60 && first.length >= 20) return first;
  }
  const cut = t.substring(0, 57);
  const sp = cut.lastIndexOf(' ');
  return (sp > 30 ? cut.substring(0, sp) : cut) + '...';
}

/**
 * Recursively collect all .html files under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectHtmlFiles(dir) {
  /** @type {string[]} */
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function insertTagIntoHead(html, snippet) {
  if (html.includes('<head>')) return html.replace('<head>', '<head>\n    ' + snippet);
  if (html.includes('<HEAD>')) return html.replace('<HEAD>', '<HEAD>\n    ' + snippet);
  if (html.includes('</head>')) return html.replace('</head>', snippet + '\n</head>');
  if (html.includes('</HEAD>')) return html.replace('</HEAD>', snippet + '\n</HEAD>');
  return html + '\n' + snippet;
}

/**
 * Post-process all HTML files in outDir:
 * 1. Inject OG/Twitter meta tags where missing
 * 2. Inject <meta name="author"> for blog articles
 * 3. Add <meta name="robots" content="noindex, follow"> to thin zh/ru pages
 * 4. Optimize <title> tags exceeding 60 characters
 * @param {string} outDir
 */
function postProcessHtml(outDir) {
  const htmlFiles = collectHtmlFiles(outDir);
  let ogInjected = 0;
  let authorInjected = 0;
  let noindexInjected = 0;
  let titlesOptimized = 0;

  for (const filePath of htmlFiles) {
    let html = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    const relPath = path.relative(outDir, filePath).replace(/\\/g, '/');

    // --- 1. OG / Twitter tag injection ---
    // Fix 6: Only guard the OG tag injection itself, not canonical/hreflang processing
    if (!html.includes('og:title') && !html.includes('twitter:title')) {
      // Extract existing title
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Extract existing meta description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      const desc = descMatch ? descMatch[1] : '';

      // Extract existing canonical
      const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      let canonUrl = canonMatch ? canonMatch[1] : '';

      // Build canonical from file path if missing or localhost
      if (!canonUrl || canonUrl.includes('localhost')) {
        let urlPath = '/' + relPath.replace(/\/index\.html$/, '/').replace(/index\.html$/, '/');
        if (urlPath === '//') urlPath = '/';
        canonUrl = SITE_ORIGIN + urlPath;
      }

      if (title) {
        const ogTags = [
          `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`,
          `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />`,
          `<meta property="og:url" content="${canonUrl}" />`,
          `<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`,
          `<meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />`
        ];

        // Also inject base OG defaults if missing
        if (!html.includes('og:site_name')) {
          ogTags.unshift(
            '<meta property="og:site_name" content="Weight Loss Percentage" />',
            '<meta property="og:type" content="website" />',
            '<meta property="og:locale" content="en_US" />',
            `<meta property="og:image" content="${OG_DEFAULT_IMAGE}" />`,
            '<meta property="og:image:width" content="1200" />',
            '<meta property="og:image:height" content="630" />',
            '<meta name="twitter:card" content="summary_large_image" />',
            `<meta name="twitter:image" content="${OG_DEFAULT_IMAGE}" />`
          );
        }

        const injection = ogTags.join('\n    ');
        html = insertTagIntoHead(html, injection);
        modified = true;
        ogInjected++;
      }
    }

    // --- 5. Fix regional canonicals: point to US version (Fix 2) ---
    // Regional pages (au/, uk/, ca/, nz/, zh/, ru/) should canonical to the
    // US version so Google doesn't override with its own canonical choice.
    const REGION_PREFIXES = ['au/', 'uk/', 'ca/', 'nz/', 'zh/', 'ru/'];
    const regionMatch = REGION_PREFIXES.find(p => relPath.startsWith(p));
    if (regionMatch) {
      const usPath = relPath.replace(new RegExp('^' + regionMatch), '');
      let usUrlPath = '/' + usPath.replace(/\/index\.html$/, '/').replace(/index\.html$/, '/');
      if (usUrlPath === '//') usUrlPath = '/';
      const usCanonical = SITE_ORIGIN + usUrlPath;
      const canonRegex = /<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>/i;
      if (canonRegex.test(html)) {
        html = html.replace(canonRegex, `<link rel="canonical" href="${usCanonical}" />`);
        modified = true;
      } else {
        // Insert canonical if missing entirely
        html = insertTagIntoHead(html, `<link rel="canonical" href="${usCanonical}" />`);
        modified = true;
      }
    }

    // --- 6. Fix broken hreflang on regional programmatic pages (Fix 3) ---
    // Regional pages have double-prefixed hreflang URLs like /uk/au/calculators/...
    // This corrects them to the proper single-prefixed URLs.
    if (regionMatch) {
      const basePath = '/' + relPath.replace(new RegExp('^' + regionMatch), '').replace(/\/index\.html$/, '/').replace(/index\.html$/, '/');
      const correctedBasePath = basePath === '//' ? '/' : basePath;

      const hreflangMap = {
        'en-us': correctedBasePath,
        'en-gb': '/uk' + correctedBasePath,
        'en-ca': '/ca' + correctedBasePath,
        'en-au': '/au' + correctedBasePath,
        'en-nz': '/nz' + correctedBasePath,
        'x-default': correctedBasePath
      };
      // Only fix zh/ru hreflang if they exist (some pages may not have them)
      const zhHreflang = html.match(/hreflang=["']zh["']/i);
      const ruHreflang = html.match(/hreflang=["']ru["']/i);
      if (zhHreflang) hreflangMap['zh'] = '/zh' + correctedBasePath;
      if (ruHreflang) hreflangMap['ru'] = '/ru' + correctedBasePath;

      for (const [lang, correctPath] of Object.entries(hreflangMap)) {
        const hreflangRegex = new RegExp(
          `<link\\s+rel=["']alternate["']\\s+hreflang=["']${lang}["']\\s+href=["'][^"']+["']\\s*/?>`, 'i'
        );
        const correctUrl = SITE_ORIGIN + correctPath;
        if (hreflangRegex.test(html)) {
          html = html.replace(hreflangRegex,
            `<link rel="alternate" hreflang="${lang}" href="${correctUrl}" />`);
        }
      }
      modified = true;
    }

    // --- 2. Meta author for blog articles ---
    if (relPath.startsWith('blog/') && !relPath.endsWith('blog/index.html')) {
      if (!html.includes('name="author"') && !html.includes("name='author'")) {
        const authorTag = '<meta name="author" content="James Peterson, RD" />';
        html = insertTagIntoHead(html, authorTag);
        modified = true;
        authorInjected++;
      }
    }

    // --- 7. Enforce Astro static rendering for all blog pages (strip React bundle scripts) ---
    if (relPath.includes('blog/')) {
      html = html.replace(/<script[^>]*type=["']module["'][^>]*src=["'][^"']*\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*><\/script>/gi, '');
      html = html.replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*\/?>/gi, '');
      html = html.replace(/(<html[^>]*)\bhas-react\b([^>]*>)/gi, '$1$2');
      modified = true;
    }

    // --- 3. Noindex thin locale pages (zh, ru) ---
    if ((relPath.startsWith('zh/') || relPath.startsWith('ru/')) && !html.includes('noindex')) {
      const noindexTag = '<meta name="robots" content="noindex, follow" />';
      html = insertTagIntoHead(html, noindexTag);
      modified = true;
      noindexInjected++;
    }

    // --- 4. Optimize long titles ---
    const titleMatch2 = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch2 && titleMatch2[1].trim().length > 60) {
      const original = titleMatch2[1].trim();
      const optimized = optimizeTitleLength(original);
      if (optimized !== original) {
        html = html.replace(`<title>${titleMatch2[1]}</title>`, `<title>${optimized}</title>`);
        modified = true;
        titlesOptimized++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, html);
    }
  }

  console.log(`[seo-inject] OG/Twitter tags injected: ${ogInjected} pages`);
  console.log(`[seo-inject] Meta author injected: ${authorInjected} blog articles`);
  console.log(`[seo-inject] Noindex added: ${noindexInjected} thin locale pages`);
  console.log(`[seo-inject] Titles optimized: ${titlesOptimized} pages`);
  console.log(`[seo-inject] Regional canonical/hreflang fixes applied to all regional pages.`);
}

const copyAssetsIntegration = {
  name: 'copy-assets',
  hooks: {
    /** @param {{ dir: URL }} param0 */
    'astro:build:done': async ({ dir }) => {
      const outDir = fileURLToPath(dir);
      const srcDir = process.cwd();
      
      console.log(`\n[copy-assets] Copying static assets from ${srcDir} to ${outDir}...`);
      
      const files = fs.readdirSync(srcDir);
      
      for (const file of files) {
        const fullPath = path.join(srcDir, file);
        
        // Exclude system directories and files (allow .htaccess)
        if (
          (file.startsWith('.') && file !== '.htaccess') ||
          file === 'node_modules' ||
          file === 'src' ||
          file === 'public' ||
          file.startsWith('dist') ||
          file === 'generators' ||
          file === 'scripts' ||
          file === 'docs' ||
          file === 'package.json' ||
          file === 'package-lock.json' ||
          file === 'tsconfig.json' ||
          file === 'astro.config.mjs' ||
          file === 'skills-lock.json' ||
          file === 'translation_cache.json'
        ) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        const destPath = path.join(outDir, file);
        
        if (stat.isDirectory()) {
          copyDirSync(fullPath, destPath);
        } else {
          if (file !== 'index.html' && !file.endsWith('.md')) {
            fs.copyFileSync(fullPath, destPath);
          }
        }
      }

      // Generate _redirects file for Cloudflare Pages from .htaccess redirects
      const htaccessPath = path.join(srcDir, '.htaccess');
      if (fs.existsSync(htaccessPath)) {
        console.log('[copy-assets] Compiling Cloudflare Pages _redirects from .htaccess...');
        const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
        const redirectLines = [];
        const lines = htaccessContent.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('Redirect 301 ') || trimmed.startsWith('Redirect permanent ')) {
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 4) {
              const fromPath = parts[2];
              let toUrl = parts[3];
              // Convert absolute URL to domain-relative path if targeting this website
              toUrl = toUrl.replace(/^https?:\/\/(www\.)?weightlosspercentage\.com/i, '');
              redirectLines.push(`${fromPath} ${toUrl} 301`);
            }
          }
        }
        
        // Regional catch-alls: return 404 for non-existent regional URLs (Fix 1)
        // Real pages are pre-rendered static files served with 200 before these
        // rules are ever reached. Non-existent URLs now properly return 404,
        // fixing 295+ Soft 404 errors in Google Search Console.
        redirectLines.push('/uk/* /uk/index.html 404');
        redirectLines.push('/ca/* /ca/index.html 404');
        redirectLines.push('/au/* /au/index.html 404');
        redirectLines.push('/nz/* /nz/index.html 404');
        redirectLines.push('/zh/* /zh/index.html 404');
        redirectLines.push('/ru/* /ru/index.html 404');
        // Global catch-all: 404 for any other unknown path
        redirectLines.push('/* /index.html 404');
        
        fs.writeFileSync(path.join(outDir, '_redirects'), redirectLines.join('\n'));
        console.log(`[copy-assets] Generated ${redirectLines.length} redirects in _redirects file successfully!`);
      }
      
      // Post-process HTML: inject missing OG/Twitter tags, meta author,
      // noindex for thin locales, and optimize long titles
      console.log('[seo-inject] Post-processing HTML files for SEO fixes...');
      postProcessHtml(outDir);
      
      console.log('[copy-assets] Static assets copied successfully!\n');
    }
  }
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.weightlosspercentage.com',
  server: { host: '127.0.0.1', port: 4321 },
  outDir: './dist3',
  integrations: [copyAssetsIntegration],
  vite: {
    server: {
      watch: {
        ignored: ['**/dist3/**', '**/dist2/**', '**/dist/**', '**/.astro/**']
      }
    }
  }
});


