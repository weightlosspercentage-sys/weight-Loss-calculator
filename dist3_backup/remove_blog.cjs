const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

let totalFixed = 0;

function removeBlogFromHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let html = fs.readFileSync(filePath, 'utf8');
  const originalLength = html.length;
  
  const $ = cheerio.load(html, { decodeEntities: false });
  
  // 1. Remove Blog nav links: <a href="/blog/" class="static-nav-link" ...>Blog</a>
  $('a.static-nav-link').filter((i, el) => $(el).attr('href') === '/blog/').remove();
  
  // 2. Remove Blog footer links: <li><a href="/blog/">Blog</a></li>
  $('a[href="/blog/"]').each((i, el) => {
    const parent = $(el).parent();
    if (parent.is('li')) {
      parent.remove();
    } else {
      $(el).remove();
    }
  });
  
  // 3. Remove in-content links to /blog/<slug>/ (individual blog post links)
  // Replace the entire <a> with just its text content (so surrounding sentences don't break)
  $('a').filter((i, el) => {
    const href = $(el).attr('href') || '';
    return href.match(/^\/blog\/[a-z0-9-]+\/?$/);
  }).each((i, el) => {
    $(el).replaceWith($(el).text());
  });
  
  // 4. Remove "Clinical Guides & Insights", "Educational Guides", 
  //    "Dietitian-Reviewed Guides", "Science-Backed Guides" sections
  //    that only contained blog links (now empty <ul>)
  $('ul').each((i, el) => {
    const lis = $(el).find('li');
    if (lis.length === 0) {
      // Empty list — remove the heading before it too
      const prev = $(el).prev();
      if (prev.is('h2') && /guides|insights/i.test(prev.text())) {
        prev.remove();
      }
      $(el).remove();
    }
  });
  
  const newHtml = $.html();
  if (newHtml.length !== originalLength) {
    fs.writeFileSync(filePath, newHtml);
    totalFixed++;
    return true;
  }
  return false;
}

// Process all calculator pages
const calcDirs = fs.readdirSync('calculators', {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name);
for (const calc of calcDirs) {
  const filePath = path.join('calculators', calc, 'index.html');
  const fixed = removeBlogFromHtml(filePath);
  if (fixed) console.log(`✅ ${calc}`);
}

// Process the calculators hub
if (removeBlogFromHtml('calculators/index.html')) console.log('✅ calculators/index.html');

// Process other top-level pages
const otherPages = ['about', 'compare', 'contact', 'nutrition', 'disclaimer', 'privacy', 'terms', 'glossary'];
for (const page of otherPages) {
  const filePath = path.join(page, 'index.html');
  const fixed = removeBlogFromHtml(filePath);
  if (fixed) console.log(`✅ ${page}`);
}

// Process the home page
if (removeBlogFromHtml('index.html')) console.log('✅ index.html (home)');

// Process category pages
if (fs.existsSync('category')) {
  const catDirs = fs.readdirSync('category', {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name);
  for (const cat of catDirs) {
    const filePath = path.join('category', cat, 'index.html');
    const fixed = removeBlogFromHtml(filePath);
    if (fixed) console.log(`✅ category/${cat}`);
  }
}

// Process compare pages
if (fs.existsSync('compare')) {
  const compareDirs = fs.readdirSync('compare', {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name);
  for (const comp of compareDirs) {
    const filePath = path.join('compare', comp, 'index.html');
    const fixed = removeBlogFromHtml(filePath);
    if (fixed) console.log(`✅ compare/${comp}`);
  }
}

// Process restaurant pages
if (fs.existsSync('restaurants')) {
  const restDirs = fs.readdirSync('restaurants', {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name);
  for (const rest of restDirs) {
    const filePath = path.join('restaurants', rest, 'index.html');
    const fixed = removeBlogFromHtml(filePath);
    if (fixed) console.log(`✅ restaurants/${rest}`);
  }
}

console.log(`\nDone! Fixed ${totalFixed} files total.`);
