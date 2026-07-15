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
      headContent: '<title>Error: Not Found</title>',
      bodyContent: `<h1>Error: Page not found</h1><p>The file could not be found at: ${filePath}</p>`,
      seoProps: {
        title: 'Error: Not Found',
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
      headContent: '<title>Error: Malformed HTML</title>',
      bodyContent: html,
      seoProps: { title: 'Error: Malformed HTML', description: '', canonical: '', alternates: [], metaTags: [], schemas: [] },
    };
  }

  const headContentWithTags = html.substring(headStart, headEnd + 7);

  // Extract lang from <html> tag
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const lang = langMatch ? langMatch[1] : 'en';

  // --- Re-use simple, reliable regex from the original parser for SEO props ---
  let title = '';
  const titleMatch = headContentWithTags.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim();

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
  const metaRegex = /<meta\s+([^>]*)\/?>/gi;
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

  let headInner = html.substring(headStart + 6, headEnd);
  // Remove the FOUC-prevention style blocks (both old and new selectors)
  headInner = headInner.replace(/<style>\s*\.static-header,\s*(?:#main-content,\s*\.static-footer|\.static-footer,\s*#root\s*>\s*#main-content)\s*\{\s*display:\s*none\s*!important;\s*\}\s*<\/style>/gi, '');
  // Remove the noscript fallback style block (BaseLayout handles this)
  headInner = headInner.replace(/<noscript>\s*<style>\s*\.static-header,\s*(?:#main-content,\s*\.static-footer|\.static-footer,\s*#root\s*>\s*#main-content)\s*\{\s*display:\s*block\s*!important;\s*\}\s*<\/style>\s*<\/noscript>/gi, '');
  
  if (!loadReact) {
    // Remove React SPA script/modulepreload tags — these conflict with Astro-rendered pages
    // and cause the blank screen (they try to mount React into #root, fail, and #main-content stays hidden)
    headInner = headInner.replace(/<script[^>]*type=["']module["'][^>]*src=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*><\/script>/gi, '');
    headInner = headInner.replace(/<script[^>]*type=["']module["'][^>]*src=["'][^"']*\/assets\/[^"']+\.js["'][^>]*><\/script>/gi, '');
    headInner = headInner.replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.js["'][^>]*\/?>/gi, '');
    headInner = headInner.replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*\/assets\/[^"']+\.js["'][^>]*\/?>/gi, '');
  }
  
  // Also remove the duplicate stylesheet link (BaseLayout already adds it)
  headInner = headInner.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']\/(?:assets|us\/assets)\/[^"']+\.css["'][^>]*crossorigin[^>]*\/?>/gi, '');
  headInner = headInner.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\/assets\/[^"']+\.css["'][^>]*crossorigin[^>]*\/?>/gi, '');

  // Extract only the main content, not the whole body
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
      metaTags,
      schemas,
    },
  };
}
