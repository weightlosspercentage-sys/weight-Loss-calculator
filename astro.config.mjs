// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPA_NAV_GUARD_SCRIPT, SPA_NAV_GUARD_MARKER } from './src/utils/spaNavGuard.mjs';
import { enrichEeat } from './scripts/eeat-enrich.mjs';

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

// Core ranking pages localized into the 7 UI-language dirs (es/fr/de/it/ja/ko/pt).
// Any other page under those dirs stays English, so it is noindexed and excluded
// from hreflang clusters until translated.
const UI_LANG_DIRS = ['es/', 'fr/', 'de/', 'it/', 'ja/', 'ko/', 'pt/'];
const TRANSLATED_CORE_PAGES = new Set([
  'index.html',
  'calculators/index.html',
  'calculators/weight-loss/index.html',
  'calculators/bmi/index.html',
  'calculators/bmr/index.html',
  'calculators/tdee/index.html',
  'calculators/calorie-deficit/index.html',
  'calculators/body-fat/index.html',
  'calculators/keto/index.html',
  'calculators/macro/index.html',
  'calculators/protein/index.html',
  'nutrition/index.html'
]);
const TRANSLATED_CORE_URLS = new Set(
  Array.from(TRANSLATED_CORE_PAGES, (p) => '/' + p.replace(/index\.html$/, ''))
);

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
  return sp > 30 ? cut.substring(0, sp) : cut;
}

/**
 * Recursively collect all .html files under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectHtmlFiles(dir) {
  /** @type {string[]} */
  let results = [];
  try {
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(collectHtmlFiles(full));
      } else if (entry.name.endsWith('.html')) {
        results.push(full);
      }
    }
  } catch (err) {
    // Gracefully handle locked or permission-denied directories on Windows
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
  let guardInjected = 0;
  let aboutNavRemoved = 0;

  for (const filePath of htmlFiles) {
    if (!fs.existsSync(filePath)) continue;
    let html = '';
    try {
      html = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      continue;
    }
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

    // --- 5. Fix regional canonicals: self-referential canonicals for localized URLs ---
    // Localized pages (au/, uk/, ca/, nz/, zh/, ru/, cn/, sg/, ae/) must canonicalize to themselves
    // so hreflang and canonical tags agree 100% per Google guidelines.
    const REGION_PREFIXES = ['au/', 'uk/', 'ca/', 'nz/', 'zh/', 'ru/', 'cn/', 'sg/', 'ae/'];
    const regionMatch = REGION_PREFIXES.find(p => relPath.startsWith(p));

    // --- 5b. Fix <html lang> attribute on localized pages ---
    // Copied regional/language directories inherit the source page's lang (e.g. "en-gb").
    // Correct it to the appropriate locale so HTML validation and SEO are accurate.
    const LANG_PREFIXES = ['es/', 'ja/', 'fr/', 'de/', 'pt/', 'ko/', 'it/'];
    const langMatch = LANG_PREFIXES.find(p => relPath.startsWith(p));
    if (langMatch) {
      const correctLang = langMatch.replace('/', '');
      const htmlLangRegex = /<html[^>]*\blang=["'][^"']*["'][^>]*>/gi;
      html = html.replace(htmlLangRegex, `<html lang="${correctLang}">`);
      modified = true;
    }
    const REGION_LANG_PREFIXES = ['uk/', 'ca/', 'au/', 'nz/', 'sg/', 'ae/', 'cn/'];
    const regionLangMatch = REGION_LANG_PREFIXES.find(p => relPath.startsWith(p));
    if (regionLangMatch) {
      const correctLang = 'en-' + regionLangMatch.replace('/', '');
      const htmlLangRegex = /<html[^>]*\blang=["'][^"']*["'][^>]*>/gi;
      html = html.replace(htmlLangRegex, `<html lang="${correctLang}">`);
      modified = true;
    }

    // --- 5c. Country branding: cn/, sg/, ae/ are English copies of the UK site.
    // Localize visible country tokens (titles, H1s, metas) to the target market.
    // "English (UK)" in the region switcher is left untouched (it labels /uk/).
    const COUNTRY_BRAND = { 'cn/': 'China', 'sg/': 'Singapore', 'ae/': 'UAE' };
    const COUNTRY_LOCALE = { 'cn/': 'en_CN', 'sg/': 'en_SG', 'ae/': 'en_AE' };
    const brandCountry = regionMatch ? COUNTRY_BRAND[regionMatch] : null;
    if (brandCountry) {
      const before = html;
      html = html.replace(/(?<!English )\(UK\)/g, `(${brandCountry})`);
      html = html.replace(/Tailored for UK users/g, `Tailored for ${brandCountry} users`);
      html = html.replace(/\bUK users\b/g, `${brandCountry} users`);
      html = html.replace(/(<meta\s+property=["']og:locale["']\s+content=["'])en_(?:US|GB)(["'])/i, `$1${COUNTRY_LOCALE[regionMatch]}$2`);
      if (html !== before) modified = true;
    }

    // --- 5d. React-router basepath: locale copies ship with the hardcoded
    // "/uk" base the UK site used; rewrite it to the page's own directory so
    // the bundled router matches routes instead of rendering the 404 view.
    const baseDir = regionMatch || langMatch;
    if (baseDir) {
      const before = html;
      html = html.replace(/(__ROUTE_BASEPATH__\s*=\s*)"\/[a-z]{2}"/, `$1"/${baseDir.replace('/', '')}"`);
      if (html !== before) modified = true;
    }

    // Handle regional canonicals and hreflang fixes
    if (regionMatch || langMatch) {
      let regUrlPath = '/' + relPath.replace(/\/index\.html$/, '/').replace(/index\.html$/, '/');
      if (regUrlPath === '//') regUrlPath = '/';
      const regCanonical = SITE_ORIGIN + regUrlPath;
      const canonRegex = /<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>/i;
      if (canonRegex.test(html)) {
        html = html.replace(canonRegex, `<link rel="canonical" href="${regCanonical}" />`);
        modified = true;
      } else {
        html = insertTagIntoHead(html, `<link rel="canonical" href="${regCanonical}" />`);
        modified = true;
      }
    }

    // --- 6. Enforce a complete, symmetric hreflang cluster on every page ---
    // Google drops non-reciprocal hreflang sets; every page (root included)
    // must declare the same cluster. Targets are verified per-path so we never
    // emit hreflang to a 404 (e.g. root-only paths that regions lack).
    if (relPath === 'index.html' || relPath.endsWith('/index.html')) {
      const prefix = regionMatch || langMatch || '';
      const basePath = ('/' + relPath.slice(prefix.length)).replace(/index\.html$/, '');
      const correctedBasePath = basePath === '//' ? '/' : basePath;

      // Complete hreflang set: English regions + supported UI languages + zh/ru.
      const hreflangMap = {
        'x-default': correctedBasePath,
        'en-us': correctedBasePath,
        'en-gb': '/uk' + correctedBasePath,
        'en-ca': '/ca' + correctedBasePath,
        'en-au': '/au' + correctedBasePath,
        'en-nz': '/nz' + correctedBasePath,
        'en-cn': '/cn' + correctedBasePath,
        'en-sg': '/sg' + correctedBasePath,
        'en-ae': '/ae' + correctedBasePath,
      };

      // New UI-language routes (Astro i18n recipe): only emit language
      // hreflang for the 12 localized core pages; every other path in those
      // dirs is noindexed (step 3b) so it must not join the cluster.
      if (TRANSLATED_CORE_URLS.has(correctedBasePath)) {
        ['es', 'ja', 'fr', 'de', 'pt', 'ko', 'it'].forEach(lang => {
          hreflangMap[lang] = '/' + lang + correctedBasePath;
        });
      }

      // Fully localized thin locales (Russian / Chinese app).
      hreflangMap['zh'] = '/zh' + correctedBasePath;
      hreflangMap['ru'] = '/ru' + correctedBasePath;

      // Strip every pre-existing hreflang link regardless of attribute order
      // (legacy copies use <link href="..." hreflang="..." rel="alternate"/>).
      html = html.replace(/<link\b[^>]*\bhreflang=[^>]*\/?>/gi, '');
      for (const [lang, correctPath] of Object.entries(hreflangMap)) {
        // Only inject links whose target page actually exists on the site;
        // otherwise we'd emit hreflang to 404s.
        const targetFile = path.join(outDir, correctPath.replace(/^\/+/, ''), 'index.html');
        if (!fs.existsSync(targetFile)) continue;
        const correctUrl = SITE_ORIGIN + correctPath;
        html = insertTagIntoHead(html, `<link rel="alternate" hreflang="${lang}" href="${correctUrl}" />`);
        modified = true;
      }
    }

    // --- 2. Meta author for blog articles & E-E-A-T Author standardization ---
    if (html.includes('Dr. Rekha Kumar, MS, RD')) {
      html = html.replace(/Dr\.\s*Rekha Kumar,\s*MS,\s*RD/gi, 'Dr. Rekha Kumar, M.D., M.S.');
      modified = true;
    }
    if (relPath.startsWith('blog/') && !relPath.endsWith('blog/index.html')) {
      if (!html.includes('name="author"') && !html.includes("name='author'")) {
        const authorTag = '<meta name="author" content="Dr. Rekha Kumar, M.D., M.S." />';
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

    // --- 3. Noindex thin programmatic calculator pages ---
    // zh/ and ru/ are fully translated locales targeting China & Russia — indexable.
    // height-weight deep pages are indexable again (user decision 2026-09-26);
    // they carry the money-page footer anchor and are in sitemap-calculators.
    const isThinProgrammatic = relPath.includes('calculators/weight-loss/from-');
    // --- 3b. Untranslated deep pages inside the 7 UI-language dirs: only the
    // 12 core pages carry localized title/description/H1, noindex the rest.
    const uiLangDir = UI_LANG_DIRS.find(p => relPath.startsWith(p));
    const isUntranslatedLangPage = uiLangDir && !TRANSLATED_CORE_PAGES.has(relPath.slice(uiLangDir.length));
    if (isThinProgrammatic || isUntranslatedLangPage) {
      if (!html.includes('noindex')) {
        // Strip any existing index robots/googlebot tags to prevent conflicting directives
        html = html.replace(/<meta\s+name=["']robots["'][^>]*>/gi, '');
        html = html.replace(/<meta\s+name=["']googlebot["'][^>]*>/gi, '');
        const noindexTag = '<meta name="robots" content="noindex, follow" />\n    <meta name="googlebot" content="noindex, follow" />';
        html = insertTagIntoHead(html, noindexTag);
        modified = true;
        noindexInjected++;
      }
    }

    // --- 3c. De-duplicate robots meta (keep first occurrence) ---
    {
      let seenRobots = false;
      html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, (m) => {
        if (!seenRobots) { seenRobots = true; return m; }
        modified = true;
        return '';
      });
    }

    // --- 3d. The SPA shell pattern hides .static-header/#main-content/.static-footer
    // expecting React hydration to re-render its own chrome. Thin programmatic pages
    // ship no bundle, so the shell would stay hidden — un-hide it on bundle-less pages.
    if (html.includes('.static-header, #main-content') && !/<script[^>]*src="\/assets\/index-[A-Za-z0-9_-]{6,}\.js"/.test(html)) {
      const before = html;
      html = html.replace(/\.static-header,\s*#main-content,\s*\.static-footer\s*\{([^}]*)\}/g, (m, body) => {
        return /display:\s*none/.test(body) ? m.replace(/display:\s*none\s*!important/, 'display: block !important') : m;
      });
      if (html !== before) modified = true;
    }

    // --- 3e. Money-page anchor: every page must carry exactly one footer link
    // "weight loss percentage calculator" pointing at the homepage.
    if (html.includes('</footer>') && !/<a\b[^>]*>\s*(?:<[^>]+>\s*)*weight loss percentage calculator\s*(?:<[^>]+>\s*)*<\/a>/i.test(html)) {
      const anchor = '<p style="text-align:center;padding:12px 16px;font-size:13px;">Use the free <a href="/" style="text-decoration:underline;">weight loss percentage calculator</a> to track your progress.</p>';
      html = html.replace(/<\/footer>/i, anchor + '</footer>');
      modified = true;
    }

    // --- 3f. Legacy static-header mobile wrap: the older inline-style header
    // variant (font-family: sans-serif, ~68k programmatic/regional pages) keeps its
    // nav as a no-wrap flex row, which overflows below ~700px. CSS-only media
    // query; desktop unchanged. Modern Tailwind header is already responsive.
    {
      const legacyOpen = /<header class="static-header"[^>]*(padding:\s*1rem;|padding:\s*0\.75rem 1\.5rem)[^>]*>/;
      if (!html.includes('/* mobile-nav-wrap */') && legacyOpen.test(html)) {
        const wrapCss = '<style>/* mobile-nav-wrap */@media (max-width:700px){.static-header nav{flex-wrap:wrap!important;justify-content:flex-start;row-gap:8px}.static-header>div>div{flex-wrap:wrap!important;row-gap:8px}}</style>';
        html = html.replace(legacyOpen, (m) => m + '\n      ' + wrapCss);
        modified = true;
      }
    }

    // --- 3g. E-E-A-T enrichment: datePublished in JSON-LD, BreadcrumbList and
    // FAQPage schema where missing, visible reviewed-by strip with topic .gov
    // references, and inch-quote escaping in description metas / JSON-LD.
    // All pieces are marker-guarded inside scripts/eeat-enrich.mjs (idempotent).
    {
      let urlPath3g = '/' + relPath.replace(/(^|\/)[^/]*\.html$/, '$1');
      if (!urlPath3g.endsWith('/')) urlPath3g += '/';
      const res = enrichEeat(html, urlPath3g);
      if (res.changed) {
        html = res.html;
        modified = true;
      }
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

    // --- Inject Google WebSite & Organization Schema for Site Name & Brand Entity recognition ---
    if (!html.includes('"@type":"WebSite"') && !html.includes('"@type": "WebSite"')) {
      const websiteSchema = `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://www.weightlosspercentage.com/#website",
            "name": "Weight Loss Percentage Calculator",
            "alternateName": ["Weight Loss Percentage", "WeightLossPercentage"],
            "url": "https://www.weightlosspercentage.com/"
          },
          {
            "@type": "Organization",
            "@id": "https://www.weightlosspercentage.com/#organization",
            "name": "Weight Loss Percentage",
            "url": "https://www.weightlosspercentage.com/",
            "logo": "https://www.weightlosspercentage.com/apple-touch-icon.png",
            "sameAs": [
              "https://www.facebook.com/weightlossnewborn/",
              "https://x.com/weightlossperce",
              "https://www.linkedin.com/in/weightloss-percentage/",
              "https://www.instagram.com/weightlosspercentage/"
            ]
          },
          {
            "@type": "Person",
            "@id": "https://www.weightlosspercentage.com/#author",
            "name": "Dr. Rekha Kumar, M.D., M.S.",
            "jobTitle": "Lead Medical Reviewer & Board-Certified Obesity Medicine Specialist",
            "url": "https://www.weightlosspercentage.com/authors/dr-rekha-kumar/",
            "sameAs": [
              "https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/",
              "https://weillcornell.org/rkumar",
              "https://www.facebook.com/weightlossnewborn/",
              "https://x.com/weightlossperce",
              "https://www.instagram.com/weightlosspercentage/"
            ]
          }
        ]
      }
      </script>`;
      html = insertTagIntoHead(html, websiteSchema);
      modified = true;
    }

    // --- 8. SPA nav guard: fix client-side 404s when navigating from a React
    //    SPA page to static routes the client router does not know ---
    if ((html.includes('has-react') || html.includes('/assets/index-') || html.includes('assets/index-')) && !html.includes(SPA_NAV_GUARD_MARKER)) {
      const bodyClose = html.lastIndexOf('</body>');
      if (bodyClose !== -1) {
        html = html.slice(0, bodyClose) + SPA_NAV_GUARD_SCRIPT + html.slice(bodyClose);
        modified = true;
        guardInjected++;
      }
    }

    // --- 9. Remove "About" from header navigation (moved to footer; Google
    //    Translate occupies the nav spot instead). Idempotent across all pages. ---
    const aboutNavRegex = /\s*<a\b[^>]*href="\/(?:[a-z]{2}\/)?about\/"[^>]*>\s*About\s*<\/a>/gi;
    const withoutAboutNav = html.replace(aboutNavRegex, '');
    if (withoutAboutNav !== html) {
      html = withoutAboutNav;
      modified = true;
      aboutNavRemoved++;
    }

    // --- 11. Remove dropdowns from all static headers ---
    const cleanNoDropdowns = html
      .replace(/\.nav-item-dropdown:hover\s+\.nav-dropdown-content\s*\{\s*display:\s*(?:block|none\s*!important);?\s*\}/gi, '.nav-item-dropdown:hover .nav-dropdown-content { display: block; }')
      .replace(/<!--\s*Calculators Dropdown\s*-->\s*<div class="nav-item-dropdown">[\s\S]*?Calculators[\s\S]*?<\/div>\s*<\/div>/gi, '<a href="/calculators/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Calculators</a>')
      .replace(/<!--\s*Nutrition Dropdown\s*-->\s*<div class="nav-item-dropdown">[\s\S]*?Nutrition[\s\S]*?<\/div>\s*<\/div>/gi, '<a href="/nutrition/" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Nutrition</a>')
      .replace(/<div class="nav-item-dropdown">\s*<a href="([^"]*\/calculators\/[^"]*)"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '<a href="$1" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Calculators</a>')
      .replace(/<div class="nav-item-dropdown">\s*<a href="([^"]*\/nutrition\/[^"]*)"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '<a href="$1" class="static-nav-link" style="text-decoration: none; color: #475569; font-weight: 500; font-size: 0.875rem;">Nutrition</a>');
    if (cleanNoDropdowns !== html) {
      html = cleanNoDropdowns;
      modified = true;
    }

    // --- 12. Ensure static footer exists on all pages ---
    if (!html.includes('<footer')) {
      const footerHtmlPath = path.join(process.cwd(), 'scratch', 'extracted_footer.html');
      if (fs.existsSync(footerHtmlPath)) {
        let footerHtml = fs.readFileSync(footerHtmlPath, 'utf-8');
        // Localize injected footer links for regional pages (skip the
        // language/region switcher, which intentionally links to other roots)
        const relTop = path.relative(outDir, filePath).split(path.sep)[0];
        const REGION_PREFIXES = ['uk', 'ca', 'au', 'nz', 'sg', 'ae', 'cn', 'ru', 'zh', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt'];
        if (REGION_PREFIXES.includes(relTop)) {
          footerHtml = footerHtml.replace(/href="(\/[^"#]*?\/)"/g, (m, href) => {
            if (href === '/' || href === '') return m;
            const first = href.slice(1).split('/')[0];
            if (REGION_PREFIXES.includes(first)) return m;
            if (/^\/(assets|images)\//.test(href)) return m;
            const localized = `/${relTop}${href}`;
            const targetDir = path.join(outDir, localized.slice(1, -1));
            if (!fs.existsSync(path.join(targetDir, 'index.html')) && !fs.existsSync(targetDir + '.html')) return m;
            return `href="${localized}"`;
          });
        }
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${footerHtml}\n</body>`);
        } else if (html.includes('</html>')) {
          html = html.replace('</html>', `${footerHtml}\n</html>`);
        } else {
          html += `\n${footerHtml}`;
        }
        modified = true;
      }
    }

    // --- 13. Freshness: dateModified on primary JSON-LD nodes + visible
    //         "Last reviewed" line in the footer (E-E-A-T signal for YMYL) ---
    if (!isThinProgrammatic) {
      let ldTouched = false;
      html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (block, inner) => {
        try {
          const data = JSON.parse(inner);
          const nodes = Array.isArray(data) ? data : (data['@graph'] || [data]);
          let touched = false;
          for (const n of nodes) {
            const t = n && n['@type'];
            const types = Array.isArray(t) ? t : [t];
            if (types.some((x) => ['WebApplication', 'SoftwareApplication', 'MedicalWebPage', 'FAQPage', 'HowTo'].includes(x)) && !n.dateModified) {
              n.dateModified = '2026-09-15';
              touched = true;
            }
          }
          if (touched) { ldTouched = true; return `<script type="application/ld+json">${JSON.stringify(data)}</script>`; }
        } catch (err) {}
        return block;
      });
      if (ldTouched) modified = true;
      if (html.includes('</footer>') && !/last reviewed/i.test(html)) {
        html = html.replace('</footer>', '<div style="text-align:center;padding:10px 16px;font-size:12px;color:#94a3b8;">Last reviewed: September 2026</div>\n</footer>');
        modified = true;
      }
    }

    // --- 10. Sitemap discovery: <link rel="sitemap"> in page heads ---
    if (!html.includes('rel="sitemap"')) {
      html = insertTagIntoHead(html, '<link rel="sitemap" href="/sitemap-index.xml" />');
      modified = true;
    }

    // --- 10b. Nav normalization: pages where the legacy React bundle renders its own header/footer ---
    if (/assets\/index-[A-Za-z0-9_-]+\.js/.test(html) && !html.includes('nav-normalize.js')) {
      html = html.replace('</body>', '<script src="/nav-normalize.js" defer></script>\n</body>');
      modified = true;
    }

    if (modified) {
      try {
        fs.writeFileSync(filePath, html);
      } catch (err) {}
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
        
        // Exclude system directories and files (allow .htaccess and .well-known)
        if (
          (file.startsWith('.') && file !== '.htaccess' && file !== '.well-known') ||
          file === 'node_modules' ||
          file === 'src' ||
          file === 'public' ||
          file.startsWith('dist') ||
          file === 'generators' ||
          file === 'scripts' ||
          file === 'docs' ||
          file === 'agent' ||
          file === 'scratch' ||
          file === 'tests' ||
          file === 'artifacts' ||
          file === 'seo-strategy' ||
          file === 'backlink-campaign' ||
          file === 'playwright-report' ||
          file === 'playwright-report-audit' ||
          file === 'test-results' ||
          file === 'weightlosspercentage.com-audit' ||
          file.startsWith('https___') ||
          /\.(py|cjs|mjs|csv)$/i.test(file) ||
          (/\.json$/i.test(file) && /^(audit|qa_results|competitor_analysis|interlinking_audit|deep_test|http_sitemap|detected_agents|keywords_parsed|all_gsc|all_topical)/i.test(file)) ||
          (/\.png$/i.test(file) && /(^|_)(test|verified|devtools|dev|shot|screenshot|after|before|browser|mobile_test|desktop_test)/i.test(file)) ||
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
              // Normalize internal path targets to the trailing-slash canonical form
              // so redirect chains don't take a second hop to add the slash.
              if (toUrl.startsWith('/') && !toUrl.endsWith('/') && !/\.[a-z0-9]+$/i.test(toUrl)) {
                toUrl += '/';
              }
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

      // Sanitize XML sitemaps to use domain-relative XSL stylesheet path (/sitemap.xsl)
      const xmlFiles = ['sitemap-index.xml', 'sitemap-0.xml', 'sitemap.xml'];
      for (const xmlFile of xmlFiles) {
        const xmlPath = path.join(outDir, xmlFile);
        if (fs.existsSync(xmlPath)) {
          let xmlContent = fs.readFileSync(xmlPath, 'utf8');
          xmlContent = xmlContent.replace(/href=["']https?:\/\/[^\/]+\/sitemap\.xsl["']/gi, 'href="/sitemap.xsl"');
          if (!xmlContent.includes('xml-stylesheet')) {
            xmlContent = xmlContent.replace(/(<\?xml[^>]*\?>)/i, '$1\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
          }
          fs.writeFileSync(xmlPath, xmlContent);
        }
      }

      // Ensure .htaccess with security headers is synced to outDir
      const rootHtaccess = path.join(process.cwd(), '.htaccess');
      if (fs.existsSync(rootHtaccess)) {
        fs.copyFileSync(rootHtaccess, path.join(outDir, '.htaccess'));
      }

      console.log('[copy-assets] Static assets copied successfully!\n');
    }
  }
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.weightlosspercentage.com',
  server: { host: true, port: 4321 },
  outDir: './dist3',
  integrations: [
    sitemap({
      xslURL: '/sitemap.xsl',
      filter: (page) => {
        // Exclude zh/, ru/, blog, and thin programmatic pages
        if (page.includes('/zh/') || page.includes('/ru/')) return false;
        if (page.includes('/blog/')) return false;
        if (page.includes('/calculators/bmi/height-weight/')) return false;
        if (page.includes('/calculators/weight-loss/from-')) return false;
        return true;
      },
      customPages: [
        // US pages
        'https://www.weightlosspercentage.com/about/',
        'https://www.weightlosspercentage.com/accessibility/',
        'https://www.weightlosspercentage.com/contact/',
        'https://www.weightlosspercentage.com/cookie-policy/',
        'https://www.weightlosspercentage.com/disclaimer/',
        'https://www.weightlosspercentage.com/editorial-policy/',
        'https://www.weightlosspercentage.com/glossary/',
        'https://www.weightlosspercentage.com/nutrition/',
        'https://www.weightlosspercentage.com/privacy/',
        'https://www.weightlosspercentage.com/terms/',
        'https://www.weightlosspercentage.com/authors/dr-rekha-kumar/',
        // US calculators
        'https://www.weightlosspercentage.com/calculators/',
        'https://www.weightlosspercentage.com/calculators/baby-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/bariatric-surgery-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/beer-calories/',
        'https://www.weightlosspercentage.com/calculators/biggest-loser/',
        'https://www.weightlosspercentage.com/calculators/bmi/',
        'https://www.weightlosspercentage.com/calculators/bmr/',
        'https://www.weightlosspercentage.com/calculators/boba-tea/',
        'https://www.weightlosspercentage.com/calculators/body-fat/',
        'https://www.weightlosspercentage.com/calculators/body-recomposition/',
        'https://www.weightlosspercentage.com/calculators/calorie/',
        'https://www.weightlosspercentage.com/calculators/calorie-deficit/',
        'https://www.weightlosspercentage.com/calculators/carnivore-diet/',
        'https://www.weightlosspercentage.com/calculators/cycling/',
        'https://www.weightlosspercentage.com/calculators/dog-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/elliptical/',
        'https://www.weightlosspercentage.com/calculators/fat-loss/',
        'https://www.weightlosspercentage.com/calculators/fitness/',
        'https://www.weightlosspercentage.com/calculators/glp1-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/hiit-bodyweight/',
        'https://www.weightlosspercentage.com/calculators/indian-food/',
        'https://www.weightlosspercentage.com/calculators/infant-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/intermittent-fasting/',
        'https://www.weightlosspercentage.com/calculators/keto/',
        'https://www.weightlosspercentage.com/calculators/macro/',
        'https://www.weightlosspercentage.com/calculators/newborn-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/nutrition/',
        'https://www.weightlosspercentage.com/calculators/pcos-calorie/',
        'https://www.weightlosspercentage.com/calculators/peptide-dosage/',
        'https://www.weightlosspercentage.com/calculators/poke-bowl/',
        'https://www.weightlosspercentage.com/calculators/postpartum-weight-loss/',
        'https://www.weightlosspercentage.com/calculators/pregnancy/',
        'https://www.weightlosspercentage.com/calculators/protein/',
        'https://www.weightlosspercentage.com/calculators/rowing/',
        'https://www.weightlosspercentage.com/calculators/rucking/',
        'https://www.weightlosspercentage.com/calculators/salad-calories/',
        'https://www.weightlosspercentage.com/calculators/smoothie/',
        'https://www.weightlosspercentage.com/calculators/specialized/',
        'https://www.weightlosspercentage.com/calculators/stairmaster/',
        'https://www.weightlosspercentage.com/calculators/sushi-calories/',
        'https://www.weightlosspercentage.com/calculators/tdee/',
        'https://www.weightlosspercentage.com/calculators/unit-converters/',
        'https://www.weightlosspercentage.com/calculators/walking/',
        'https://www.weightlosspercentage.com/calculators/water-intake/',
        'https://www.weightlosspercentage.com/calculators/weight-loss/',
        // US categories
        'https://www.weightlosspercentage.com/category/',
        'https://www.weightlosspercentage.com/category/fitness/',
        'https://www.weightlosspercentage.com/category/nutrition/',
        'https://www.weightlosspercentage.com/category/pregnancy/',
        'https://www.weightlosspercentage.com/category/specialized/',
        'https://www.weightlosspercentage.com/category/weight-loss/',
        // US compare
        'https://www.weightlosspercentage.com/compare/',
        'https://www.weightlosspercentage.com/compare/bmi-vs-body-fat/',
        'https://www.weightlosspercentage.com/compare/bmr-vs-tdee/',
        'https://www.weightlosspercentage.com/compare/calories-vs-macros/',
        'https://www.weightlosspercentage.com/compare/keto-vs-low-carb/',
        // US restaurants
        'https://www.weightlosspercentage.com/restaurants/chipotle/',
        'https://www.weightlosspercentage.com/restaurants/dominos/',
        'https://www.weightlosspercentage.com/restaurants/dutch-bros/',
        'https://www.weightlosspercentage.com/restaurants/fast-food-hub/',
        'https://www.weightlosspercentage.com/restaurants/five-guys/',
        'https://www.weightlosspercentage.com/restaurants/jimmy-johns/',
        'https://www.weightlosspercentage.com/restaurants/mcdonalds/',
        'https://www.weightlosspercentage.com/restaurants/pizza-hut/',
        'https://www.weightlosspercentage.com/restaurants/starbucks/',
        'https://www.weightlosspercentage.com/restaurants/subway/',
        'https://www.weightlosspercentage.com/restaurants/taco-bell/',
        'https://www.weightlosspercentage.com/restaurants/wendys/',
        // UK pages
        'https://www.weightlosspercentage.com/uk/',
        'https://www.weightlosspercentage.com/uk/about/',
        'https://www.weightlosspercentage.com/uk/calculators/',
        'https://www.weightlosspercentage.com/uk/contact/',
        'https://www.weightlosspercentage.com/uk/disclaimer/',
        'https://www.weightlosspercentage.com/uk/glossary/',
        'https://www.weightlosspercentage.com/uk/nutrition/',
        'https://www.weightlosspercentage.com/uk/privacy/',
        'https://www.weightlosspercentage.com/uk/terms/',
        // CA pages
        'https://www.weightlosspercentage.com/ca/',
        'https://www.weightlosspercentage.com/ca/about/',
        'https://www.weightlosspercentage.com/ca/calculators/',
        'https://www.weightlosspercentage.com/ca/contact/',
        'https://www.weightlosspercentage.com/ca/disclaimer/',
        'https://www.weightlosspercentage.com/ca/glossary/',
        'https://www.weightlosspercentage.com/ca/nutrition/',
        'https://www.weightlosspercentage.com/ca/privacy/',
        'https://www.weightlosspercentage.com/ca/terms/',
        // AU pages
        'https://www.weightlosspercentage.com/au/',
        'https://www.weightlosspercentage.com/au/about/',
        'https://www.weightlosspercentage.com/au/calculators/',
        'https://www.weightlosspercentage.com/au/contact/',
        'https://www.weightlosspercentage.com/au/disclaimer/',
        'https://www.weightlosspercentage.com/au/glossary/',
        'https://www.weightlosspercentage.com/au/nutrition/',
        'https://www.weightlosspercentage.com/au/privacy/',
        'https://www.weightlosspercentage.com/au/terms/',
        // NZ pages
        'https://www.weightlosspercentage.com/nz/',
        'https://www.weightlosspercentage.com/nz/about/',
        'https://www.weightlosspercentage.com/nz/calculators/',
        'https://www.weightlosspercentage.com/nz/contact/',
        'https://www.weightlosspercentage.com/nz/disclaimer/',
        'https://www.weightlosspercentage.com/nz/glossary/',
        'https://www.weightlosspercentage.com/nz/nutrition/',
        'https://www.weightlosspercentage.com/nz/privacy/',
        'https://www.weightlosspercentage.com/nz/terms/',
      ],
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-ES',
          ja: 'ja-JP',
          fr: 'fr-FR',
          de: 'de-DE',
          pt: 'pt-BR',
          ko: 'ko-KR',
          it: 'it-IT',
          uk: 'en-GB',
          ca: 'en-CA',
          au: 'en-AU',
          nz: 'en-NZ',
        },
      },
    }),
    copyAssetsIntegration,
  ],
  vite: {
    server: {
      watch: {
        ignored: [
          '**/dist3/**', '**/dist2/**', '**/dist/**', '**/.astro/**',
          '**/uk/**', '**/ca/**', '**/au/**', '**/nz/**', '**/zh/**', '**/ru/**',
          '**/cn/**', '**/sg/**', '**/ae/**', '**/es/**', '**/ja/**', '**/fr/**',
          '**/de/**', '**/pt/**', '**/ko/**', '**/it/**', '**/calculators/**',
          '**/category/**', '**/restaurants/**', '**/blog/**', '**/about/**',
          '**/compare/**', '**/contact/**', '**/nutrition/**', '**/disclaimer/**',
          '**/glossary/**', '**/privacy/**', '**/terms/**'
        ]
      }
    }
  }
});



