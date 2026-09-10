const fs = require('fs');
let code = fs.readFileSync('src/pages/[...fallback].astro', 'utf8');

const replacement = `
  const isBlog = Astro.url.pathname.includes('/blog/');
  const isInfo = ['/about/', '/contact/', '/privacy/', '/terms/', '/disclaimer/', '/glossary/'].some(p => Astro.url.pathname.includes(p));
  const isCategory = Astro.url.pathname.includes('/category/');
  const isNonSpaRestaurant = Astro.url.pathname.includes('/restaurants/') && !['/restaurants/mcdonalds', '/restaurants/starbucks', '/restaurants/subway'].some(p => Astro.url.pathname.includes(p));
  
  const loadReact = !isBlog && !isInfo && !isCategory && !isNonSpaRestaurant;
`;

code = code.replace(/const isBlog = Astro\.url\.pathname\.includes\('\/blog\/'\);\s*const isInfo = \['\/about\/', '.*?\.some\(p => Astro\.url\.pathname\.includes\(p\)\);\s*const loadReact = !isBlog && !isInfo;/s, replacement.trim());

fs.writeFileSync('src/pages/[...fallback].astro', code);
console.log('Patched fallback.astro loadReact logic');
