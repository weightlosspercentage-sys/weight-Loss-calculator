import fs from 'fs';
import path from 'path';

export interface ParsedHtml {
  lang: string;
  headContent: string;
  bodyContent: string;
  seoProps: {
    title: string;
    description: string;
    canonical: string;
    alternates: Array<{ hreflang: string; href: string }>;
    metaTags: Array<{ name?: string; property?: string; content: string }>;
    schemas: string[];
  };
}

// A much more robust parser that avoids complex regex
export function parseHtmlPageV2(relativeFilePath: string, loadReact: boolean = false): ParsedHtml {
  const baseDir = process.cwd();
  const filePath = path.isAbsolute(relativeFilePath)
    ? relativeFilePath
    : path.join(baseDir, relativeFilePath);

  if (!fs.existsSync(filePath)) {
    // Return a valid structure with an error message to display.
    // Nothing path- or request-derived may appear in this string: callers render
    // bodyContent through <Fragment set:html>, so it ships to the browser raw.
    return {
      lang: 'en',
      headContent: '',
      bodyContent: '<h1>Error: Page not found</h1>',
      seoProps: {
        title: 'Error: Not Found | Weight Loss Percentage',
        description: 'Page not found',
        canonical: '',
        alternates: [],
        metaTags: [],
        schemas: [],
      },
    };
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  // Simple string splitting is more robust than regex
  const headStart = html.indexOf('<head>');
  const headEnd = html.indexOf('</head>');
  const bodyStart = html.indexOf('<body'); // Could have attributes
  const bodyEnd = html.indexOf('</body>');

  if (headStart === -1 || headEnd === -1 || bodyStart === -1 || bodyEnd === -1) {
    // Fallback for malformed HTML: just return the whole thing in the body
    return {
      lang: 'en',
      headContent: '',
      bodyContent: html,
      seoProps: { title: 'Weight Loss Percentage', description: '', canonical: '', alternates: [], metaTags: [], schemas: [] },
    };
  }

  // Some legacy python scripts inject styles before <head> or <html>, so we capture from the beginning
  const headContentWithTags = html.substring(0, headEnd + 7);

  // Extract lang from <html> tag
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const lang = langMatch ? langMatch[1] : 'en';

  // --- Re-use simple, reliable regex from the original parser for SEO props ---
  let title = '';
  const titleMatch = headContentWithTags.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim();

  // Fallback title from file path when none found — fixes "Missing Title" SEO issue
  if (!title) {
    const parts = relativeFilePath.replace(/\\/g, '/').split('/').filter(Boolean);
    const segment = parts.length > 1 ? parts[parts.length - 2] : (parts[0] || 'Page');
    title = segment.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) + ' | Weight Loss Percentage';
  }

  // Dynamically generate canonical and hreflang to fix SEO architecture (Hreflang Multiple Entries & Missing Return Links)
  let canonical = ''; // Let BaseLayout compute canonical from Astro.url.href to fix Canonicalised errors
  
  let cleanRoute = relativeFilePath.replace(/\\/g, '/').replace(/\/index\.html$/, '').replace(/index\.html$/, '').replace(/^\/+/, '');
  const regionPrefixes = ['uk', 'ca', 'au', 'nz', 'zh', 'ru', 'us', 'cn', 'sg', 'ae'];
  let baseRoute = cleanRoute;
  for (const prefix of regionPrefixes) {
    if (cleanRoute === prefix || cleanRoute.startsWith(prefix + '/')) {
      baseRoute = cleanRoute.substring(prefix.length).replace(/^\/+/, '');
      break;
    }
  }

  const alternates: Array<{ hreflang: string; href: string }> = [];
  const addAlt = (lang: string, pathSegment: string) => {
    let target = `https://www.weightlosspercentage.com/${pathSegment}${baseRoute}`;
    target = target.replace(/([^:])\/\//g, '$1/').replace(/\/$/, '');
    if (!target.match(/\.[a-z]+$/i) && target !== 'https://www.weightlosspercentage.com') {
      target += '/';
    } else if (target === 'https://www.weightlosspercentage.com') {
      target += '/';
    }
    alternates.push({ hreflang: lang, href: target });
  };

  addAlt('x-default', '');
  addAlt('en-us', '');
  addAlt('en-gb', 'uk/');
  addAlt('en-ca', 'ca/');
  addAlt('en-au', 'au/');
  addAlt('en-nz', 'nz/');
  addAlt('en-cn', 'cn/');
  addAlt('en-sg', 'sg/');
  addAlt('en-ae', 'ae/');

  const langs = ['es', 'ja', 'fr', 'de', 'pt', 'ko', 'it'];
  for (const l of langs) {
    addAlt(l, `${l}/`);
  }

  const metaTags: Array<{ name?: string; property?: string; content: string }> = [];
  const metaRegex = /<meta\s+([^>]*)\/?\s*>/gi;
  let metaMatch;
  while ((metaMatch = metaRegex.exec(headContentWithTags)) !== null) {
    const attrStr = metaMatch[1];
    const nameM = attrStr.match(/name=["']([^"']+)["']/i);
    const propM = attrStr.match(/property=["']([^"']+)["']/i);
    const contentM = attrStr.match(/content=["']([^"']+)["']/i);
    if (contentM) {
      metaTags.push({ name: nameM?.[1], property: propM?.[1], content: contentM[1] });
    }
  }

  const isThinLocale = lang === 'zh' || lang === 'ru' || relativeFilePath.startsWith('zh') || relativeFilePath.startsWith('ru');
  if (isThinLocale && !metaTags.some(t => t.name === 'robots')) {
    metaTags.push({ name: 'robots', content: 'noindex, follow' });
  }

  const schemas: string[] = [];
  const schemaRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let schemaMatch;
  while ((schemaMatch = schemaRegex.exec(html)) !== null) { // Schemas can be in body
    schemas.push(schemaMatch[1]);
  }

  let headInner = html.substring(0, headEnd);

  // Strip structural wrapper tags
  headInner = headInner.replace(/<!doctype[^>]*>/i, '');
  headInner = headInner.replace(/<html[^>]*>/i, '');
  headInner = headInner.replace(/<head>/i, '');

  // -----------------------------------------------------------------------
  // SEO de-duplication fixes — remove tags that BaseLayout/SEO.astro emits.
  // Fixes: Duplicate Title, Duplicate Meta Description, Multiple Canonicals,
  // Hreflang Multiple Entries from SEO audit CSV.
  // -----------------------------------------------------------------------

  // 1. Remove <title> — SEO.astro emits it
  headInner = headInner.replace(/<title>[\s\S]*?<\/title>/gi, '');

  // 2. Remove <meta name="description"> — SEO.astro emits it
  headInner = headInner.replace(/<meta\s+name=["']description["'][^>]*\/?>/gi, '');
  // The committed pages write these tags attribute-first
  // (<meta content="…" name="description">), which the patterns above cannot see, so
  // SEO.astro's copy and the committed one both shipped. Google honours the FIRST, which is
  // SEO.astro's — so on / the served snippet was the truncated one. Measure-before-you-fix:
  // 6 indexable pages (/, /about/, /calculators/, /compare/, /contact/, /nutrition/) had 2
  // canonicals, 2 robots, 2 descriptions and 2 og:title each. hreflang (:174-175) already
  // matched both orders; every other rule here did not.
  headInner = headInner.replace(/<meta\s+content=["'][^"']*["'][^>]*\bname=["']description["'][^>]*\/?>/gi, '');

  // 3. Remove <link rel="canonical"> — SEO.astro emits it
  headInner = headInner.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, '');
  headInner = headInner.replace(/<link\s+href=["'][^"']*["'][^>]*\brel=["']canonical["'][^>]*\/?>/gi, '');

  // 3a. Remove the committed robots meta — SEO.astro emits it. Only when it does not say
  // noindex: stripping a real noindex would flip a page from excluded to indexable, and a
  // duplicate robots tag is resolved to the most restrictive value by crawlers anyway.
  headInner = headInner.replace(/<meta(?![^>]*noindex)[^>]*\bname=["']robots["'][^>]*\/?>/gi, '');

  // 3b. Remove JSON-LD schema scripts from the head — they are captured into
  // `schemas` above and SEO.astro re-injects them, so leaving them here produces
  // duplicate Organization/FAQPage/WebApplication blocks (SEO audit: Duplicate JSON-LD).
  headInner = headInner.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  // 4. Remove all hreflang alternates — SEO.astro emits them
  headInner = headInner.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<link\s+hreflang[^>]*rel=["']alternate["'][^>]*\/?>/gi, '');

  // 5. Remove OG / Twitter meta — SEO.astro emits defaults
  headInner = headInner.replace(/<meta\s+property=["']og:[^"']*["'][^>]*\/?>/gi, '');
  headInner = headInner.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*\/?>/gi, '');
  headInner = headInner.replace(/<meta\s+content=["'][^"']*["'][^>]*\bproperty=["']og:[^"']*["'][^>]*\/?>/gi, '');
  headInner = headInner.replace(/<meta\s+content=["'][^"']*["'][^>]*\bname=["']twitter:[^"']*["'][^>]*\/?>/gi, '');

  // 6. Remove charset / viewport / standard head metas — SEO.astro emits them
  headInner = headInner.replace(/<meta\s+charset=[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<meta\s+name=["'](viewport|format-detection|referrer|theme-color|google-adsense-account)["'][^>]*\/?>/gi, '');

  // 7. Remove Google Analytics scripts — SEO.astro emits them
  headInner = headInner.replace(/<script[^>]*googletagmanager\.com[^>]*>[\s\S]*?<\/script>/gi, '');
  headInner = headInner.replace(/<script[^>]*>\s*window\.dataLayer[\s\S]*?<\/script>/gi, '');

  // 7b. Remove Microsoft Clarity scripts — SEO.astro emits them
  headInner = headInner.replace(/<script[^>]*clarity\.ms[^>]*>[\s\S]*?<\/script>/gi, '');
  headInner = headInner.replace(/<script[^>]*>\s*\(function\(c,l,a,r,i,t,y\)[\s\S]*?clarity[\s\S]*?<\/script>/gi, '');

  // 8. Remove AdSense scripts — SEO.astro emits them
  headInner = headInner.replace(/<script[^>]*pagead2\.googlesyndication\.com[^>]*>[\s\S]*?<\/script>/gi, '');

  // 9. Remove favicon / manifest / preconnect — SEO.astro emits them
  headInner = headInner.replace(/<link[^>]*rel=["'](icon|apple-touch-icon|manifest|preconnect|dns-prefetch)["'][^>]*\/?>/gi, '');

  // 10. Remove FOUC-prevention style blocks — BaseLayout handles this
  headInner = headInner.replace(/<style>\s*\.static-header,\s*(?:#main-content,\s*\.static-footer|\.static-footer,\s*#root\s*>\s*#main-content)\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>/gi, '');
  headInner = headInner.replace(/<noscript>\s*<style>\s*\.static-header,\s*(?:#main-content,\s*\.static-footer|\.static-footer,\s*#root\s*>\s*#main-content)\s*\{\s*display:\s*block\s*!important;\s*\}\s*<\/style>\s*<\/noscript>/gi, '');

  if (!loadReact) {
    // Remove React SPA script/modulepreload tags — conflict with Astro-rendered pages
    headInner = headInner.replace(/<script[^>]*type=["']module["'][^>]*src=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*><\/script>/gi, '');
    headInner = headInner.replace(/<script[^>]*type=["']module["'][^>]*src=["'][^"']*\/assets\/[^"']+\.js["'][^>]*><\/script>/gi, '');
    headInner = headInner.replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*\/?>/gi, '');
    headInner = headInner.replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*\/assets\/[^"']+\.js["'][^>]*\/?>/gi, '');
  } else {
    // If we need React but it's not present in headInner, inject it from the root index.html
    const hasReactScript = headInner.includes('type="module"');
    if (!hasReactScript && fs.existsSync(path.join(process.cwd(), 'index.html'))) {
      const rootHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
      
      const scriptRegex = /<script[^>]*type=["']module["'][^>]*src=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*><\/script>/gi;
      let match;
      while ((match = scriptRegex.exec(rootHtml)) !== null) {
        headInner += '\n' + match[0];
      }

      const preloadRegex = /<link[^>]*rel=["']modulepreload["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*\/?>/gi;
      while ((match = preloadRegex.exec(rootHtml)) !== null) {
        headInner += '\n' + match[0];
      }
    }
  }

  // Remove duplicate stylesheet link — BaseLayout already adds it
  headInner = headInner.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.css["'][^>]*crossorigin[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\/assets\/[^"']+\.css["'][^>]*crossorigin[^>]*\/?>/gi, '');

  // Extract only the main content area from the body
  // First, strip duplicate legacy structural elements that Astro components
  // (Header.astro, Footer.astro) will render separately, preventing FOUC/duplicates
  let strippedHtml = html;

  // Remove static-header from body if present
  strippedHtml = strippedHtml.replace(/<header\s+class=["']static-header["'][^>]*>[\s\S]*?<\/header>/gi, '');

  // Remove static-footer from body if present
  strippedHtml = strippedHtml.replace(/<footer\s+class=["']static-footer["'][^>]*>[\s\S]*?<\/footer>/gi, '');

  // Remove static-medical-disclaimer from body if present
  strippedHtml = strippedHtml.replace(/<div\s+class=["']static-medical-disclaimer["'][^>]*>[\s\S]*?<\/div>/gi, '');

  let bodyInner;

  const mainStart = strippedHtml.indexOf('<main id="main-content"');
  const mainEnd = strippedHtml.indexOf('</main>');

  if (mainStart !== -1 && mainEnd !== -1) {
    bodyInner = strippedHtml.substring(mainStart, mainEnd + 7); // +7 for `</main>`
  } else {
    // Fallback if main content not found - use the cleaned body, excluding <body> tags
    const bodyStart = strippedHtml.indexOf('<body');
    const bodyEnd = strippedHtml.indexOf('</body>', bodyStart);
    if (bodyStart !== -1 && bodyEnd !== -1) {
      bodyInner = strippedHtml.substring(bodyStart, bodyEnd + 7); // include </body>
    } else {
      bodyInner = strippedHtml;
    }
  }

  // Helper to optimize page titles to stay under 60 characters
  const optimizeTitle = (rawTitle: string): string => {
    const cleanTitle = rawTitle.trim();
    if (cleanTitle.length <= 60) return cleanTitle;

    // Try the leading clause plus any trailing locale marker ("(UK)", "(Canada)").
    const localeMatch = cleanTitle.match(/\s*\([^)]+\)\s*$/);
    const suffix = localeMatch ? localeMatch[0] : '';

    // Colon was the only separator tried, so "Weight Loss Percentage Calculator — Free
    // Percent Weight Loss Tool" (65) skipped this branch entirely and shipped as
    // "Weight Loss Percentage Calculator — Free Percent Weight..." in both <title> and
    // og:title. The em/en dashes and pipe are the separators this site's own titles use.
    for (const sep of [':', '|', '—', '–']) {
      if (!cleanTitle.includes(sep)) continue;
      const candidate = cleanTitle.split(sep)[0].trim() + suffix;
      if (candidate.length >= 20 && candidate.length <= 60) {
        return candidate;
      }
    }

    // Last resort: a clean word boundary, with no appended "...". Google renders its own
    // truncation marker; the literal one reads as machine output.
    const truncated = cleanTitle.substring(0, 57);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated;
  };

  // Helper to keep descriptions in the range Google renders without inventing an ellipsis.
  const optimizeDescription = (rawDesc: string): string => {
    const cleanDesc = rawDesc.trim();
    if (!cleanDesc) return '';

    // 155 was cutting complete human-written copy: the six parsed pages measure 100, 129,
    // 151, 152, 156 and 162 characters, so / and /nutrition/ lost their closing clause and
    // shipped "...in a..." in the SERP. 165 clears every real value while still bounding
    // bloated ones, and a cut is made at the last complete sentence, never with an
    // appended "..." — Google adds its own marker, and the literal one is a slop fingerprint.
    if (cleanDesc.length > 165) {
      const window = cleanDesc.substring(0, 162);
      const stop = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
      if (stop > 80) return window.substring(0, stop + 1);
      const lastSpace = window.lastIndexOf(' ');
      return lastSpace > 80 ? window.substring(0, lastSpace) : window;
    }

    if (cleanDesc.length < 70) {
      const suffix = " Track body weight trends, calculate healthy deficit goals, and start your weight loss journey safely today.";
      if (cleanDesc.length + suffix.length <= 165) {
        return cleanDesc + suffix;
      }
      return cleanDesc;
    }

    return cleanDesc;
  };

  const finalTitle = optimizeTitle(title);
  const rawDescription = metaTags.find(t => t.name === 'description')?.content || '';
  const finalDescription = optimizeDescription(rawDescription);

  return {
    lang,
    headContent: headInner,
    bodyContent: bodyInner,
    seoProps: {
      title: finalTitle,
      description: finalDescription,
      canonical,
      alternates,
      // Only pass through meta tags that SEO.astro doesn't handle natively
      metaTags: metaTags.filter(t =>
        !['description', 'viewport', 'format-detection', 'referrer', 'theme-color',
          'google-adsense-account', 'twitter:card', 'twitter:image', 'twitter:title',
          'twitter:description'].includes(t.name || '') &&
        !['og:site_name', 'og:type', 'og:locale', 'og:image', 'og:image:width',
          'og:image:height', 'og:title', 'og:description', 'og:url'].includes(t.property || '')
      ),
      schemas,
    },
  };
}
