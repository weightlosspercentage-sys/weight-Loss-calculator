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
    // Return a valid structure with an error message to display
    return {
      lang: 'en',
      headContent: '',
      bodyContent: `<h1>Error: Page not found</h1><p>The file could not be found at: ${filePath}</p>`,
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

  let canonical = '';
  const canonicalMatch = headContentWithTags.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch) canonical = canonicalMatch[1];

  const alternates: Array<{ hreflang: string; href: string }> = [];
  const alternateRegex = /<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi;
  let altMatch;
  while ((altMatch = alternateRegex.exec(headContentWithTags)) !== null) {
    alternates.push({ hreflang: altMatch[1], href: altMatch[2] });
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

  // 3. Remove <link rel="canonical"> — SEO.astro emits it
  headInner = headInner.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, '');

  // 4. Remove all hreflang alternates — SEO.astro emits them
  headInner = headInner.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<link\s+hreflang[^>]*rel=["']alternate["'][^>]*\/?>/gi, '');

  // 5. Remove OG / Twitter meta — SEO.astro emits defaults
  headInner = headInner.replace(/<meta\s+property=["']og:[^"']*["'][^>]*\/?>/gi, '');
  headInner = headInner.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*\/?>/gi, '');

  // 6. Remove charset / viewport / standard head metas — SEO.astro emits them
  headInner = headInner.replace(/<meta\s+charset=[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<meta\s+name=["'](viewport|format-detection|referrer|theme-color|google-adsense-account)["'][^>]*\/?>/gi, '');

  // 7. Remove Google Analytics scripts — SEO.astro emits them
  headInner = headInner.replace(/<script[^>]*googletagmanager\.com[^>]*>[\s\S]*?<\/script>/gi, '');
  headInner = headInner.replace(/<script[^>]*>\s*window\.dataLayer[\s\S]*?<\/script>/gi, '');

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
  }

  // Remove duplicate stylesheet link — BaseLayout already adds it
  headInner = headInner.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.css["'][^>]*crossorigin[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\/assets\/[^"']+\.css["'][^>]*crossorigin[^>]*\/?>/gi, '');

  // Extract only the main content area from the body
  const mainStart = html.indexOf('<main id="main-content"');
  const mainEnd = html.indexOf('</main>');
  let bodyInner;

  if (mainStart !== -1 && mainEnd !== -1) {
    bodyInner = html.substring(mainStart, mainEnd + 7); // +7 for `</main>`
  } else {
    // Fallback if main content not found
    const bodyTagEnd = html.indexOf('>', bodyStart);
    bodyInner = html.substring(bodyTagEnd + 1, bodyEnd);
  }

  return {
    lang,
    headContent: headInner,
    bodyContent: bodyInner,
    seoProps: {
      title,
      description: metaTags.find(t => t.name === 'description')?.content || '',
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
