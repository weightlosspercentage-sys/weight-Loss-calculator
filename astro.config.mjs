// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPA_NAV_GUARD_SCRIPT, SPA_NAV_GUARD_MARKER } from './src/utils/spaNavGuard.mjs';
import { enrichEeat, hasReviewDateClaim } from './scripts/eeat-enrich.mjs';
import { pruneNoindex } from './scripts/prune-noindex.mjs';
import { applyRedirectConsolidation } from './scripts/redirect-consolidation.mjs';
import { addLocaleCoverage } from './scripts/sitemap-coverage.mjs';
import { loadContentDates } from './scripts/content-dates.mjs';
import {
  applyDateClaims, FROZEN_DATEMODIFIED, FABRICATED_DATEPUBLISHED,
} from './scripts/date-stamp.mjs';

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
      // Editor/patcher backups of the prebuilt bundle and stylesheet. Nothing links to
      // them, but copyDirSync shipped them anyway: 1.3 MB publicly downloadable at
      // /assets/index-Ctp2HkQJ.js.bak-mojibake, three extra files against Cloudflare's
      // 20k limit, and the JS copies still carry the fabricated "James Peterson, RD"
      // byline that was removed from every served page. They stay on disk as recovery
      // copies; they just stop being deployed.
      if (/\.bak[-_.]/i.test(entry.name)) {
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
  // Keep the leading clause when it is a complete thought. Colon was the only separator
  // tried, so "Biggest Loser Weight Loss Calculator (Australia) | TV Show Formula" (66)
  // fell through to blind truncation and shipped as "...(Australia) | TV".
  for (const sep of [':', '|', '—', '–']) {
    if (!t.includes(sep)) continue;
    const first = t.split(sep)[0].trim();
    if (first.length >= 20 && first.length <= 60) return first;
  }
  const cut = t.substring(0, 57);
  const sp = cut.lastIndexOf(' ');
  const trimmed = (sp > 30 ? cut.substring(0, sp) : cut).replace(/[\s|—–:-]+$/, '');
  return trimmed;
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
 * Trust/legal pages must serve no ads at all, including AdSense Auto Ads units,
 * which are injected by the client tag rather than by any markup we control.
 * The zh/ru trees are deliberately NOT in here: unlike the pages pruneNoindex
 * deletes, they are indexable and carry a self-canonical, so excluding them
 * from placements cost them every direct ad.
 * @param {string} relPath path relative to the build output dir, forward slashes
 */
function isLegalPath(relPath) {
  return /(^|\/)(privacy|terms|contact|disclaimer|cookie-policy|accessibility)(\/|$)/i.test(relPath);
}

/**
 * Replaces the eager translate element.js tag on committed HTML.
 *
 * Two jobs, both verified against local and production:
 *
 * 1. Timing. The tag no longer blocks parsing; it is appended on the first CPU
 *    idle, capped at 3s so a slow ad script cannot starve it. Deliberately not
 *    chained to window "load", which ads delay by many seconds.
 *
 * 2. Container. On SPA routes createRoot(#root).render() destroys the committed
 *    #google_translate_element, so by the time element.js invokes the page's
 *    inline googleTranslateElementInit the id is gone, TranslateElement is
 *    handed nothing, and no dropdown ever appears. The bundle renders its own
 *    surviving #google_translate_element_spa beside it. Re-creating the id next
 *    to that survivor restores the widget without touching the page's own
 *    options (pageLanguage, includedLanguages, layout, autoDisplay), which stay
 *    in the inline callback where they are parsed from.
 *
 * No `$` characters: html.replace() treats those as substitution patterns.
 */
const TRANSLATE_DEFER_SNIPPET =
  '<script>(function(){' +
  'var SRC="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";' +
  'var done=false;' +
  // The picker belongs at the foot of the page, not in the header row, which has
  // no spare width. Measured on build 11 output: once React mounts, every SPA route
  // has exactly one <footer> left — the bundle's, inside #root — because
  // createRoot(#root).render() replaces #root's children and the pre-rendered
  // .static-footer goes with them. Before that happens the only footer present IS
  // .static-footer, so a plain querySelector("footer") would attach the widget to a
  // node React is about to delete: the original dead-picker bug. Prefer a non-static
  // footer and keep polling until React produces one.
  //
  // Two hosts, because the two page types behave differently. On a SPA route the
  // container goes inside the React footer's copyright bar, and the popup opens
  // there. On a page that never loads the bundle (/calculators/calorie-deficit/ has
  // no script[src*="/assets/index-"]) it goes one node OUTSIDE .static-footer, as
  // that footer's preceding sibling. Reason, measured with raw mouse events: if
  // TranslateElement renders into a container nested inside that particular footer,
  // the gadget's click replaces the document before the popup opens; from a
  // body-level sibling it opens at 137x171. What is *not* the cause: an overlapping
  // footer link (elementFromPoint at the anchor centre returns the gadget's own
  // span), an <a> or <form> ancestor, or a transform/filter ancestor — and moving a
  // gadget that was already rendered elsewhere into the same footer works fine, so
  // it is the container's position at render time, not at click time, that matters.
  'function spa(){return !!document.querySelector("script[src*=\\"/assets/index-\\"]");}' +
  'function bar(keepStatic){' +
  'var fs=document.querySelectorAll("footer");' +
  'for(var k=0;k<fs.length;k++){' +
  'if(fs[k].className.indexOf("static-footer")<0){return {f:fs[k],stat:false};}' +
  '}' +
  'if(keepStatic||!spa()){return fs.length?{f:fs[0],stat:true}:null;}' +
  'return null;' +
  '}' +
  'function foot(f){' +
  'var ps=f.querySelectorAll("p");' +
  'for(var i=0;i<ps.length;i++){' +
  'if(/\\u00a9|All rights reserved/.test(ps[i].textContent||"")){return ps[i].parentElement||f;}' +
  '}' +
  'return f;' +
  '}' +
  // Returns true only once the container is verifiably sitting at its footer-adjacent
  // host. The gate matters: committed HTML still carries a header #google_translate_element
  // inside #root, so "the id exists" is not evidence we placed it anywhere. If it were
  // enough, the first poll tick — which runs before React mounts — would load element.js
  // against a node seconds away from being destroyed, and the widget would be dead again.
  'function ensure(keepStatic){' +
  'var t=bar(keepStatic);if(!t){return false;}' +
  'var el=document.getElementById("google_translate_element");' +
  'if(!el){el=document.createElement("div");el.id="google_translate_element";}' +
  'el.className="notranslate";' +
  'if(t.stat){' +
  'var par=t.f.parentNode||document.body;' +
  'if(el.parentNode!==par||el.nextElementSibling!==t.f){' +
  'el.style.cssText="display:flex;justify-content:flex-end;max-width:1400px;margin:14px auto 0;padding:0 24px;";' +
  'par.insertBefore(el,t.f);' +
  '}' +
  'return el.parentNode===par&&el.nextElementSibling===t.f;' +
  '}' +
  'var host=foot(t.f);' +
  'if(el.parentNode!==host){' +
  'el.style.cssText="display:flex;justify-content:flex-end;margin-top:14px;";' +
  'host.appendChild(el);' +
  '}' +
  'return el.parentNode===host;' +
  '}' +
  'function attempt(keepStatic){' +
  'if(done){return;}' +
  'if(!ensure(keepStatic)){return;}' +
  'var e=document.createElement("script");' +
  'e.id="gt-defer-src";e.src=SRC;document.head.appendChild(e);' +
  'done=true;' +
  '}' +
  'function poll(){' +
  'var n=0;' +
  'var t=setInterval(function(){n++;attempt(n>=40);if(done||n>=50){clearInterval(t);}},200);' +
  '}' +
  'function go(){attempt(false);poll();}' +
  'if(window.requestIdleCallback){requestIdleCallback(go,{timeout:3000});}' +
  'else{setTimeout(go,1200);}' +
  '})();</script>';

/**
 * Post-process all HTML files in outDir:
 * 1. Inject OG/Twitter meta tags where missing
 * 2. Inject <meta name="author"> for blog articles
 * 3. Add <meta name="robots" content="noindex, follow"> to thin zh/ru pages
 * 4. Optimize <title> tags exceeding 60 characters
 * @param {string} outDir
 */
// Labels eeat-enrich.mjs writes the ISO date after, in each UI language.
const UPDATED_LABELS = 'Updated|Updated on|Last updated|Actualizado|Mis \u00e0 jour|Aktualisiert|Aggiornato|Atualizado|\u66f4\u65b0\u65e5|\uc5c5\ub370\uc774\ud2b8|\u66f4\u65b0\u65f6\u95f4|\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e';
// The invented reviewer this site used to credit. Plain strings, not a regex: they are
// tested against ~34k pages and only the rare hit needs the expensive visible-markup pass.
const BYLINE_MARKERS = ['James Peterson', 'dietitian-reviewed', 'Dietitian-Reviewed'];

function postProcessHtml(outDir) {
  const htmlFiles = collectHtmlFiles(outDir);
  const contentDates = loadContentDates(process.cwd());
  if (!contentDates) {
    console.warn('[seo-inject] no git history and no committed manifest: unevidenced date claims will be deleted, never stamped');
  }
  let ogInjected = 0;
  let authorInjected = 0;
  let noindexInjected = 0;
  let titlesOptimized = 0;
  let guardInjected = 0;
  let aboutNavRemoved = 0;
  let adPlaceInjected = 0;
  let adLoaderInjected = 0;
  let adLoaderStripped = 0;
  let translateDeferred = 0;
  let translateLangsTrimmed = 0;
  let translateAutoDisplay = 0;
  let datesCorrected = 0;
  let publishedDatesCorrected = 0;
  let dateClaimsDropped = 0;
  let staleDateResidual = 0;
  let publishedResidual = 0;
  let bylineResidual = 0;
  let reviewClausesRemoved = 0;
  let reviewClausePages = 0;
  let reviewClauseResidual = 0;
  const residualExamples = [];
  // Freshness degeneracy: how many indexable pages ended up on each dateModified value.
  const dateHistogram = new Map();
  const publishedHistogram = new Map();

  for (const filePath of htmlFiles) {
    if (!fs.existsSync(filePath)) continue;
    let html = '';
    try {
      html = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      console.warn(`[seo-inject] unreadable ${filePath}: ${e.message}`);
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

      // zh/ru are excluded because their committed pages carry English body copy —
      // only the UI chrome is translated, at runtime, from window.__TRANSLATIONS__ —
      // so they are near-duplicates of the English page, not Chinese or Russian
      // versions. Declaring them as `zh`/`ru` alternates would tell Google the
      // opposite. (They are NOT deleted by pruneNoindex, which only removes pages
      // already marked noindex; an earlier version of this comment claimed that.)

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
      if (res.reviewDatesRemoved) {
        // Occurrences, not pages: a page can carry the clause twice (byline strip + a stray
        // footer line), so the two counts are reported separately rather than conflated.
        reviewClausesRemoved += res.reviewDatesRemoved;
        reviewClausePages++;
      }
      if (res.changed) {
        html = res.html;
        modified = true;
      }
    }

    // --- 4. Title length is handled at step 11, after the last mutation of <title>.
    // (Optimising here meant step 1 copied the untruncated title into og:title/twitter:title.)

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

    // --- 13. Freshness: dateModified in JSON-LD taken from this file's own commit history,
    //         mirrored in the visible "Updated:" line when a real date exists.
    //         Guarded for degeneracy in step 13b below.
    //
    // One hardcoded date across ~39k pages is not a freshness signal and it decays: it was
    // 34 days stale by 2026-10-19 while claiming a revision that never happened. The date
    // now comes from the last commit that touched this exact file. When this build cannot
    // know that date - a Cloudflare Pages shallow clone, which is where production is
    // actually built - the two fabricated literals are DELETED from the schema rather than
    // kept or re-stamped: under-reporting freshness is safe, inventing it is not, and a
    // shallow clone must not re-date the whole site to today. scripts/date-stamp.mjs owns
    // that call so it can be tested without a 17-minute build. ---
    if (!isThinProgrammatic) {
      const real = contentDates ? contentDates.isoFor(relPath) : null;
      const realPub = contentDates && contentDates.publishedFor ? contentDates.publishedFor(relPath) : null;
      let ldTouched = false;
      // scripts/date-stamp.mjs owns the policy: replace a fabricated literal only with this
      // file's own commit date, and delete the claim where no date can be backed. The config
      // used to fall back to stamping FROZEN_DATEMODIFIED into any schema node lacking one,
      // which is exactly what a shallow CI clone hit - see the module header.
      const claims = applyDateClaims(html, { modified: real, published: realPub });
      if (claims.warned) console.warn(`[seo-inject] unparseable JSON-LD on ${relPath}: ${claims.warned}`);
      if (claims.html !== html) {
        html = claims.html;
        modified = true;
        ldTouched = true;
      }
      if (claims.datePublishedApplied) publishedDatesCorrected++;
      if (claims.claimsDropped) dateClaimsDropped++;
      // Markup must mirror the visible page. The eeat strip prints the same date in prose,
      // so the stale literal is corrected there too - label-anchored, never a bare date.
      if (real) {
        // The labels are alternated, so they need their own non-capturing group: `|` binds
        // looser than concatenation, and bare `(A|B|C\s*:)` would apply the colon only to C.
        const visibleStaleDate = new RegExp(`((?:${UPDATED_LABELS})\\s*[:\\uFF1A]\\s*)${FROZEN_DATEMODIFIED}`, 'g');
        const withFreshDate = html.replace(visibleStaleDate, `$1${real}`);
        if (withFreshDate !== html) {
          html = withFreshDate;
          modified = true;
        }
      }
      if (ldTouched) datesCorrected++;
      // This used to inject "Last reviewed: September 2026" into any footer that lacked it.
      // No commit evidences a review event, so that line was a fact this build invented -
      // and unlike dateModified, there is no real date to substitute it with. Removed.
      // Pages whose committed HTML already carries the phrase (the E-E-A-T byline strip)
      // are untouched: this stops new text, it deletes nothing a visitor currently sees.
    }

    // --- 13b. Regression guard: neither a frozen date nor an invented reviewer may
    //          survive on a page Google can index, and the dates must still discriminate.
    // Step 13 takes dateModified from this exact file's last commit, so an indexable page
    // still carrying the marker is one that pass never reached — a silent SEO regression,
    // which is what this counts. The 428 pages that legitimately keep the marker are thin
    // programmatic and /us/ duplicates, all noindexed, so the date is not a signal there.
    // The byline test looks only at markup outside <script>: in the UI-language trees
    // "James Peterson, RD" survives as a __TRANSLATIONS__ *key*, because keys must match the
    // bundle's English literals byte for byte and the Russian *value* already credits
    // Dr. Rekha Kumar. Editing a key drops the translation and shows English instead.
    //
    // The histogram below exists because the frozen-string test alone was not enough. A bulk
    // commit that rewrites every page (cdaa9a8509 touched 39,126 HTML files) makes every
    // "last commit for this file" the same day, so the dates pass the stale-string check while
    // collapsing to one value site-wide — truthful on the day it is written, then decaying into
    // the same fake-freshness signal it replaced, with no build error to say so.
    if (!/content="noindex/i.test(html)) {
      if (html.includes(FROZEN_DATEMODIFIED)) {
        staleDateResidual++;
        if (residualExamples.length < 8) residualExamples.push(relPath + ' (frozen date)');
      }
      if (html.includes(FABRICATED_DATEPUBLISHED)) {
        publishedResidual++;
        if (residualExamples.length < 8) residualExamples.push(relPath + ' (invented datePublished)');
      }
      const pageDates = new Set();
      for (const m of html.matchAll(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/g)) pageDates.add(m[1]);
      for (const value of pageDates) dateHistogram.set(value, (dateHistogram.get(value) || 0) + 1);
      const pagePublished = new Set();
      for (const m of html.matchAll(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/g)) pagePublished.add(m[1]);
      for (const value of pagePublished) publishedHistogram.set(value, (publishedHistogram.get(value) || 0) + 1);
      if (BYLINE_MARKERS.some(marker => html.includes(marker))) {
        const visible = html.replace(/<script[\s\S]*?<\/script>/gi, '');
        if (BYLINE_MARKERS.some(marker => visible.includes(marker))) {
          bylineResidual++;
          if (residualExamples.length < 8) residualExamples.push(relPath + ' (invented byline)');
        }
      }
      // Step 3g deletes this clause; surviving means the page never reached that pass.
      if (hasReviewDateClaim(html)) {
        reviewClauseResidual++;
        if (residualExamples.length < 8) residualExamples.push(relPath + ' (unevidenced review date)');
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

    // --- 10c. AdSense anchor placement (public/ad-place.js) ---
    // Deliberately not gated on the bundle the way 10b is: static calculators such
    // as /calculators/calorie-deficit/ ship no React and so rendered zero ads, and
    // on SPA routes createRoot(#root).render() destroys any shipped <ins>.
    // Guard matches the tag, not the filename: prose mentioning ad-place.js in a
    // comment must not be mistaken for an injection that already happened.
    if (!/<script[^>]+\bsrc=["']\/ad-place\.js["']/.test(html) && !isLegalPath(relPath)) {
      // ad-place.js builds <ins> nodes and pushes them through window.adsbygoogle. With no
      // loader that push lands in an orphan array: the slot reserves its height and never
      // fills, silently. 175 locale clones (103 indexable) ship no loader in their committed
      // HTML at all, so the placement script has to bring the tag with it. Same form as
      // SEO.astro:196, so the client id cannot drift between Astro and build-injected pages.
      if (!/adsbygoogle\.js[?&]client=/i.test(html)) {
        html = insertTagIntoHead(html, '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7203223934454111" crossorigin="anonymous"></script>');
        adLoaderInjected++;
      }
      html = html.replace('</body>', '<script src="/ad-place.js" defer></script>\n</body>');
      modified = true;
      adPlaceInjected++;
    }

    // --- 10d. De-monetise trust pages ---
    // Committed HTML hardcodes the adsbygoogle client tag, and Auto Ads injects a
    // slot-less <ins> through it on every route, privacy and terms included. Removing
    // the tag is the only code-side way to honour "no ads on these pages".
    if (isLegalPath(relPath)) {
      const stripped = html
        .replace(/<script[^>]*\bsrc=["'][^"']*adsbygoogle\.js[^"']*["'][^>]*>\s*<\/script>\s*/gi, '')
        .replace(/<link[^>]*\bhref=["']https:\/\/(pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net|www\.googletagservices\.com)["'][^>]*>\s*/gi, '');
      if (stripped !== html) {
        html = stripped;
        modified = true;
        adLoaderStripped++;
      }
    }

    // --- 10e. Google Translate widget off the critical path ---
    // Committed HTML loads element.js with `defer`, which still fetches it during
    // the load window: translate.googleapis.com + www.gstatic.com + tpc is ~244 KB
    // and three scripts competing with the calculator for bandwidth, for a header
    // dropdown almost no first-time visitor uses. Astro's own Header.astro already
    // lazy-loads this widget, so this brings the committed pages to the same
    // behaviour instead of inventing a new one. The injected snippet also moves the
    // container from the header row into the footer copyright bar before
    // element.js is requested, so the widget appears in the footer rather than
    // where the committed markup put it.
    const deferred = html.replace(
      /<script\b[^>]*\bsrc=["']https:\/\/translate\.google\.com\/translate_a\/element\.js[^"']*["'][^>]*>\s*<\/script>/i,
      TRANSLATE_DEFER_SNIPPET
    );
    if (deferred !== html) {
      html = deferred;
      modified = true;
      translateDeferred++;
    }

    // --- 10f. Language picker population and visibility ---
    // The page-inline googleTranslateElementInit is what element.js actually calls,
    // so its options win over anything Header.astro sets. Two problems there: the 20
    // language list included Hindi and several locales the site has no content for,
    // and autoDisplay:false makes the gadget render nothing at all for a visitor
    // whose browser language already matches pageLanguage ('en') — which is most of
    // the traffic. The picker has to be on screen before anyone can choose a
    // language from it.
    const langs = html.replace(
      /includedLanguages:\s*['"]en,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,nl,sv,da,no,fi,pl,ru,tr,uk['"]/g,
      "includedLanguages: 'es,id,pt,fr,ar,de'"
    );
    if (langs !== html) {
      html = langs;
      modified = true;
      translateLangsTrimmed++;
    }

    const shown = html.replace(/autoDisplay:\s*false\b/g, 'autoDisplay: true');
    if (shown !== html) {
      html = shown;
      modified = true;
      translateAutoDisplay++;
    }

    // --- 11. Titles last. Step 1 copies <title> into og:title / twitter:title, and 3g/5c
    // can still rewrite it afterwards, so truncation has to run after every mutation and
    // then push the same string into the social tags. Rules.md 2.1 caps titles at 60.
    {
      const t = html.match(/<title>([\s\S]*?)<\/title>/i);
      if (t) {
        const beforeTitles = html;
        const original = t[1].trim();
        const optimized = optimizeTitleLength(original);
        if (optimized !== original) {
          html = html.replace(t[0], `<title>${optimized}</title>`);
          titlesOptimized++;
        }
        const esc = optimized.replace(/"/g, '&quot;');
        // A social tag that merely starts with the final title is the older, uncut string
        // (truncation always yields a prefix), so realigning it is safe. A tag that differs
        // in its opening words is deliberate hand-written copy and is left alone.
        html = html.replace(
          /(<meta\s+(?:property|name)=["'](?:og|twitter):title["']\s+content=)["']([^"']*)["']/gi,
          (m, pre, val) => (val.length > esc.length && val.startsWith(esc) ? `${pre}"${esc}"` : m),
        );
        if (html !== beforeTitles) modified = true;
      }
    }

    if (modified) {
      try {
        fs.writeFileSync(filePath, html);
      } catch (err) {
        // Silently dropping the write loses every SEO/ad edit for that page.
        console.error(`[seo-inject] failed to write ${filePath}: ${err.message}`);
      }
    }
  }

  console.log(`[seo-inject] OG/Twitter tags injected: ${ogInjected} pages`);
  console.log(`[seo-inject] Meta author injected: ${authorInjected} blog articles`);
  console.log(`[seo-inject] Noindex added: ${noindexInjected} thin locale pages`);
  console.log(`[seo-inject] Unevidenced "Last reviewed" clause removed: ${reviewClausesRemoved} clauses on ${reviewClausePages} pages (markup only; __TRANSLATIONS__ keys untouched)`);
  if (staleDateResidual || publishedResidual || bylineResidual || reviewClauseResidual) {
    console.warn(`[seo-inject] WARNING on indexable pages: ${staleDateResidual} frozen dateModified, ${publishedResidual} invented datePublished, ${bylineResidual} invented byline, ${reviewClauseResidual} unevidenced review date: ${residualExamples.join(', ')}`);
  } else {
    console.log('[seo-inject] Date/byline guard: 0 indexable pages carry 2026-09-15, 2025-03-01, the invented byline, or a "Last reviewed" month');
  }
  for (const [field, histogram, why] of [
    ['dateModified', dateHistogram, 'A bulk commit that rewrote every file is why; edit pages per-page, or this decays into the same site-wide frozen stamp the pass was built to remove.'],
    ['datePublished', publishedHistogram, 'One content batch entered this repository on that date and dominates the indexable set; that is the real add history, and the literal it replaced (2025-03-01) predated the first commit.'],
  ]) {
    const ranked = [...histogram.entries()].sort((a, b) => b[1] - a[1]);
    const counted = ranked.reduce((sum, [, pages]) => sum + pages, 0);
    if (counted < 100 || !ranked.length) continue;
    const [topDate, topPages] = ranked[0];
    const share = topPages / counted;
    if (share >= 0.9) {
      const ageDays = Math.floor((Date.now() - Date.parse(`${topDate}T00:00:00Z`)) / 86400000);
      console.warn(
        `[seo-inject] WARNING ${field} is not discriminating: ${Math.round(share * 100)}% of ${counted} indexable pages ` +
        `share ${topDate} (${ageDays} days old) across ${ranked.length} value(s). ${why}`
      );
    } else {
      const spread = ranked.slice(0, 4).map(([d, n]) => `${d} ${Math.round((n / counted) * 100)}%`).join(', ');
      console.log(`[seo-inject] ${field} spread: ${ranked.length} values over ${counted} indexable pages (${spread})`);
    }
  }
  console.log(`[seo-inject] Titles optimized: ${titlesOptimized} pages`);
  console.log(`[seo-inject] Regional canonical/hreflang fixes applied to all regional pages.`);
  console.log(`[seo-inject] ad-place.js injected: ${adPlaceInjected} pages`);
  console.log(`[seo-inject] AdSense loader added where placement script ran without one: ${adLoaderInjected} pages`);
  console.log(`[seo-inject] AdSense loader stripped from ${adLoaderStripped} trust/legal pages`);
  console.log(`[seo-inject] Google Translate deferred to idle: ${translateDeferred} pages`);
  console.log(`[seo-inject] Google Translate language list trimmed to 6: ${translateLangsTrimmed} pages`);
  console.log(`[seo-inject] Google Translate autoDisplay set to true: ${translateAutoDisplay} pages`);
  console.log(
    contentDates
      ? `[seo-inject] dates from ${contentDates.source}${contentDates.commits ? ` (${contentDates.commits} commit dates)` : ''}: ` +
        `dateModified corrected on ${datesCorrected} pages, invented datePublished 2025-03-01 replaced with that file's add commit on ${publishedDatesCorrected} pages, ` +
        `${dateClaimsDropped} pages had a date claim deleted because this build could not back it`
      : '[seo-inject] NO date evidence (no git history and no scripts/content-dates.manifest.txt): ' +
        `${dateClaimsDropped} pages had an unevidenced date claim deleted; nothing was stamped in its place`
  );
}

/**
 * Drop <url> blocks for pages pruneNoindex just deleted, and for locale pages whose own
 * head a client-side app rewrites. Must run after the prune: the sitemap files are
 * committed assets that still list those URLs, and a <loc> pointing at a 404 is reported
 * as a discovery error in Search Console.
 * @param {string} outDir
 * @param {string[]} prunedUrls root-relative paths with trailing slashes
 * @param {string[]} [spaUrls] locale paths that mount the React router, from
 *   addLocaleCoverage. A locale URL is only a claim if this build controls the head it
 *   serves; when the router replaces the committed self-canonical with one derived from
 *   the locale-free route (342 of 394 such pages, measured), or renders its own
 *   "Page not found" view (16 more), the sitemap and the page contradict each other.
 * @returns {{ removed: number, spaTotal: number }}
 */
function syncSitemaps(outDir, prunedUrls, spaUrls) {
  const pruned = new Set((prunedUrls || []).map((p) => (p.endsWith('/') ? p : p + '/')));
  const spa = new Set((spaUrls || []).map((p) => (p.endsWith('/') ? p : p + '/')));
  // <lastmod> is a crawl-priority claim, so it gets the same evidence rule as
  // dateModified in the JSON-LD: use the file's own commit date, never invent one.
  const dates = loadContentDates(process.cwd());

  let sitemapFiles = [];
  try {
    // sitemap.xml and sitemap-0.xml are skipped: both are replaced wholesale by the
    // alias/remove step in copy-assets, so pruning their <loc> entries is wasted I/O.
    sitemapFiles = fs.readdirSync(outDir).filter(
      (f) => /^sitemap(-[a-z0-9-]+)?\.xml$/i.test(f) && !['sitemap-index.xml', 'sitemap.xml', 'sitemap-0.xml'].includes(f)
    );
  } catch (err) {
    console.error(`[sitemaps] cannot list ${outDir}: ${err.message}`);
    return { removed: 0, spaTotal: 0 };
  }

  let removed = 0;
  let spaTotal = 0;
  const siloMax = new Map();
  for (const file of sitemapFiles) {
    const xmlPath = path.join(outDir, file);
    let xml;
    try {
      xml = fs.readFileSync(xmlPath, 'utf8');
    } catch (err) {
      console.error(`[sitemaps] cannot read ${xmlPath}: ${err.message}`);
      continue;
    }
    let dropped = 0;
    let spaDropped = 0;
    let restamped = 0;
    const next = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
      const loc = (block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/i) || [])[1];
      if (!loc) return block;
      let target;
      try {
        target = new URL(loc).pathname;
      } catch {
        return block;
      }
      const key = target.endsWith('/') ? target : target + '/';
      if (pruned.has(key)) {
        dropped++;
        return '';
      }
      if (spa.has(key)) {
        spaDropped++;
        return '';
      }
      if (!dates) return block;
      const clean = target.replace(/^\/+/, '').replace(/\/+$/, '');
      const iso = dates.isoFor(clean ? clean + '/index.html' : 'index.html');
      if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return block;
      const upd = block.includes('<lastmod>')
        ? block.replace(/<lastmod>\s*[^<\s]*\s*<\/lastmod>/i, `<lastmod>${iso}</lastmod>`)
        : block.replace(/<\/loc>/i, `</loc>\n    <lastmod>${iso}</lastmod>`);
      if (upd !== block) restamped++;
      return upd;
    });
    // Record the max even for a file we do not rewrite: the index's <lastmod>
    // claims a date for this silo, and a silo that already agrees still has to
    // be able to prove it.
    for (const m of next.matchAll(/<lastmod>\s*(\d{4}-\d{2}-\d{2})\s*<\/lastmod>/gi)) {
      if (!siloMax.get(file) || m[1] > siloMax.get(file)) siloMax.set(file, m[1]);
    }
    if (!dropped && !spaDropped && !restamped) continue;
    try {
      fs.writeFileSync(xmlPath, next);
      removed += dropped;
      spaTotal += spaDropped;
      console.log(`[sitemaps] ${file}: dropped ${dropped} pruned + ${spaDropped} SPA-mounted <loc> ${dropped + spaDropped === 1 ? 'entry' : 'entries'}, <lastmod> refreshed on ${restamped} ${restamped === 1 ? 'url' : 'urls'}`);
    } catch (err) {
      console.error(`[sitemaps] cannot write ${xmlPath}: ${err.message}`);
    }
  }

  // The index's <lastmod> is a claim about its silo, so it is derived from the
  // silo rather than left at whatever date generated the committed file.
  const indexPath = path.join(outDir, 'sitemap-index.xml');
  try {
    const idx = fs.readFileSync(indexPath, 'utf8');
    let changed = 0;
    const nextIdx = idx.replace(/<sitemap>[\s\S]*?<\/sitemap>/g, (block) => {
      const loc = (block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/i) || [])[1];
      if (!loc) return block;
      let name;
      try { name = new URL(loc).pathname.split('/').pop(); } catch { return block; }
      const max = siloMax.get(name);
      if (!max) return block;
      const upd = block.includes('<lastmod>')
        ? block.replace(/<lastmod>\s*[^<\s]*\s*<\/lastmod>/i, `<lastmod>${max}</lastmod>`)
        : block.replace(/<\/loc>/i, `</loc>\n    <lastmod>${max}</lastmod>`);
      if (upd !== block) changed++;
      return upd;
    });
    if (changed) fs.writeFileSync(indexPath, nextIdx);
    console.log(`[sitemaps] sitemap-index.xml: ${changed} of ${sitemapFiles.length} silo ${changed === 1 ? 'entry' : 'entries'} re-dated from its own <url> set`);
  } catch (err) {
    console.error(`[sitemaps] cannot re-date sitemap-index.xml: ${err.message}`);
  }
  // Fail loud rather than fail open. An empty spaUrls means addLocaleCoverage could not
  // walk the trees, in which case the committed silo's SPA entries survive this build
  // un-reviewed - which is the exact defect this pass exists to close.
  if (!spaUrls || spaUrls.length === 0) {
    console.warn('[sitemaps] WARNING: no SPA locale urls supplied by addLocaleCoverage; SPA <loc> entries were not reviewed this build');
  } else {
    console.log(`[sitemaps] SPA-mounted locale urls: ${spaUrls.length} withheld from coverage, ${spaTotal} pre-existing <loc> ${spaTotal === 1 ? 'entry' : 'entries'} dropped`);
  }
  return { removed, spaTotal };
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
        
        // Exclude system directories and files (allow .well-known).
        // .htaccess stays out of the deploy: Cloudflare Pages ignores it, serves
        // dotfiles on request, and the copy that shipped here declared a weaker
        // CSP than the operative public/_headers.
        if (
          (file.startsWith('.') && file !== '.well-known') ||
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
          file === 'utils' ||
          file === 'playwright-report' ||
          file === 'playwright-report-audit' ||
          file === 'test-results' ||
          file === 'weightlosspercentage.com-audit' ||
          file.startsWith('https___') ||
          // Client JS lives in public/ (Astro-copied) and assets/ (committed tree); a
          // full check of the tracked root found nine .js files and every one is local
          // QA tooling (audit_localhost, playwright configs, skills.js, test*.js) that
          // zero served pages reference. .log and .backup are likewise tool output.
          /\.(py|cjs|mjs|csv|js|log|backup)$/i.test(file) ||
          (/\.json$/i.test(file) && /^(audit|qa_results|competitor_analysis|interlinking_audit|deep_test|deep_sitemap|http_sitemap|detected_agents|keywords_parsed|all_gsc|all_topical|skills)/i.test(file)) ||
          (/\.png$/i.test(file) && /(^|_)(test|verified|devtools|dev|shot|screenshot|after|before|browser|mobile_test|desktop_test|applied|live_)/i.test(file)) ||
          file === 'package.json' ||
          file === 'package-lock.json' ||
          file === 'tsconfig.json' ||
          file === 'astro.config.mjs' ||
          file === 'skills-lock.json' ||
          file === 'translation_cache.json' ||
          // Internal QA artifacts and generator fragments. None is in any sitemap and a
          // full 34,398-file scan found zero links to /skills/ or /protein/, so they were
          // reachable only as direct file URLs - browser-check-report.txt published the
          // site's page inventory and nav_dump.txt published the raw homepage nav markup.
          /^(browser-check-report|nav_dump|menu_dump)\.txt$/i.test(file) ||
          /^dist3_.+\.(txt|xml)$/i.test(file) ||
          /^(footer|bottom_content|github_skill_finder|skills|protein)\.html$/i.test(file)
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
        // Measured in production, these rules do NOT take effect: /zz-does-not-exist/
        // answers HTTP 200 with the ROOT index.html, as do /.env, /wp-admin/ and
        // /cgi-bin/test.cgi (see SEC-6). The 308 that /author/dr-rekha-kumar returns
        // for a rule nothing in this file emits shows a higher-precedence
        // dashboard/zone rule is involved, and the dashboard is not readable from
        // here. So this block is the intended behaviour, not a verified one - do not
        // cite it as proof the soft-404s are fixed.
        redirectLines.push('/uk/* /uk/index.html 404');
        redirectLines.push('/ca/* /ca/index.html 404');
        redirectLines.push('/au/* /au/index.html 404');
        redirectLines.push('/nz/* /nz/index.html 404');
        redirectLines.push('/zh/* /zh/index.html 404');
        redirectLines.push('/ru/* /ru/index.html 404');
        // Global catch-all: 404 for any other unknown path
        redirectLines.push('/* /index.html 404');
        
        // A newline-terminated line. The previous writer joined with '\n', so the
        // global 404 catch-all was the file's final line with no terminator
        // (lastByte="4", endsWithNewline=false measured on the deployed artifact) -
        // the exact line whose status was not being honoured. Cheap, strictly safe
        // hygiene: every other rule was already newline-terminated by construction.
        fs.writeFileSync(path.join(outDir, '_redirects'), redirectLines.join('\n') + '\n');
        console.log(`[copy-assets] Generated ${redirectLines.length} redirects in _redirects file successfully!`);
      }
      
      // Post-process HTML: inject missing OG/Twitter tags, meta author,
      // noindex for thin locales, and optimize long titles
      console.log('[seo-inject] Post-processing HTML files for SEO fixes...');
      postProcessHtml(outDir);

      // Cloudflare Pages enforces a 20,000-file project limit: drop the noindexed
      // thin locale pages (excluded from sitemaps anyway) and repoint any kept-page
      // links that target them to their English canonical equivalents.
      const pruned = pruneNoindex(outDir);
      // Two sitemap integrity passes. addLocaleCoverage re-adds the 5,091 committed
      // locale URLs that this pipeline itself drops every deploy (it regenerates the
      // silos from the root copy, which lists fewer trees than the committed one does),
      // and reports the locale pages that mount the client router so the reconciliation
      // below can withhold a claim it cannot keep. Both run before syncSitemaps so its
      // per-silo <lastmod> is re-derived from the finished file rather than a stale one.
      const coverage = addLocaleCoverage(outDir, { fs, path, dates: loadContentDates(process.cwd()) });
      // hreflang and <link rel="alternate"> clusters are emitted for those pages
      // while they still exist, so they are reconciled here, after the deletion.
      syncSitemaps(outDir, pruned.prunedUrls, coverage.spaUrls);

      // 253 URLs in this site's own Search Console export (9,978 impressions, 12 clicks)
      // ship no file and carry no 301, so they answer HTTP 200 with the homepage shell
      // while self-canonicalising - a soft 404 Google keeps serving. Rules are added last
      // because a target is only valid once pruneNoindex has decided what actually ships:
      // locale trees keep 12 of 2,020 pages, so a rule must be able to fall back to the
      // English canonical it was translated from, and the thin-page splats need the pruned
      // URL set to know which families are gone. Cloudflare caps this file at 2,000 static
      // + 100 dynamic rules, which the module checks and throws on.
      applyRedirectConsolidation(outDir, { fs, path, prunedUrls: pruned.prunedUrls });

      // One crawl surface, one URL set. /sitemap.xml shipped a 14,177-<loc> <urlset>
      // that duplicated 14,177 of the 14,177 URLs already listed by the six silos
      // reachable from sitemap-index.xml - a byte-for-byte redundant list, plus an
      // orphaned sitemap-0.xml (116 locs, all already in the silos, linked by nothing).
      // Redundant lists make the Search Console sitemap counts disagree and split the
      // crawl report without adding a single discoverable URL.
      // /sitemap.xml is kept alive as a copy of the index because it is the URL
      // previously submitted to Google; sitemap-0.xml is removed because nothing points
      // at it. Verified 2026-10-19: unique-in-sitemap-xml = 0, unique-in-sitemap-0 = 0.
      try {
        const legacyXml = path.join(outDir, 'sitemap.xml');
        fs.copyFileSync(path.join(outDir, 'sitemap-index.xml'), legacyXml);
        console.log('[sitemaps] /sitemap.xml now serves the index; duplicate <urlset> retired');
      } catch (err) {
        console.error(`[sitemaps] could not alias /sitemap.xml to the index: ${err.message}`);
      }
      for (const orphan of ['sitemap-0.xml']) {
        const orphanPath = path.join(outDir, orphan);
        try {
          if (fs.existsSync(orphanPath)) {
            fs.rmSync(orphanPath);
            console.log(`[sitemaps] removed ${orphan} (URLs already covered by the silos, referenced by nothing)`);
          }
        } catch (err) {
          console.error(`[sitemaps] could not remove ${orphan}: ${err.message}`);
        }
      }

      // Sanitize XML sitemaps to use domain-relative XSL stylesheet path (/sitemap.xsl)
      const xmlFiles = ['sitemap-index.xml', 'sitemap.xml'];
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



