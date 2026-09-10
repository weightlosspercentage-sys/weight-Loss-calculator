import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const SCREENSHOT_DIR = 'D:/projects/Weight Loss Percentage/Live/Weight Loss Percentage- Upload 1/dist3';

const browser = await chromium.launch({ headless: false, slowMo: 100 });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log('\n═══════════════════════════════════════════════════════════');
console.log('CHECKING HOME PAGE FOR SOCIAL MEDIA LINKS');
console.log('═══════════════════════════════════════════════════════════\n');

// Load homepage
await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/social-check-homepage.png`, fullPage: true });

// Check for social media links
const socialMediaInfo = await page.evaluate(() => {
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  
  const socialDomains = [
    'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
    'pinterest.com', 'youtube.com', 'tiktok.com', 'x.com',
    'fb.com', 'fb.me', 'youtu.be'
  ];
  
  const socialLinks = allLinks.filter(a => {
    const href = a.getAttribute('href') || '';
    return socialDomains.some(domain => href.includes(domain));
  }).map(a => ({
    href: a.getAttribute('href'),
    text: a.innerText.trim(),
    ariaLabel: a.getAttribute('aria-label'),
    classList: a.className,
    parent: a.parentElement?.tagName
  }));
  
  // Check for social media icons (SVG, images with social keywords)
  const socialIcons = [];
  document.querySelectorAll('svg, img').forEach(el => {
    const parent = el.closest('a');
    if (parent) {
      const href = parent.getAttribute('href') || '';
      if (socialDomains.some(domain => href.includes(domain))) {
        socialIcons.push({
          type: el.tagName,
          href: href,
          src: el.getAttribute('src'),
          ariaLabel: parent.getAttribute('aria-label'),
          title: parent.getAttribute('title')
        });
      }
    }
  });
  
  // Check footer content
  const footer = document.querySelector('footer');
  const footerHTML = footer ? footer.innerHTML.substring(0, 1000) : 'No footer found';
  
  // Check blog section
  const blogSection = document.querySelector('[class*="blog"], [id*="blog"], section:has(a[href*="/blog/"])');
  const blogHTML = blogSection ? blogSection.innerHTML.substring(0, 1000) : 'No blog section found';
  
  return {
    socialLinks,
    socialIcons,
    hasSocialLinks: socialLinks.length > 0,
    hasSocialIcons: socialIcons.length > 0,
    footerPreview: footerHTML,
    blogPreview: blogHTML
  };
});

console.log('📊 SOCIAL MEDIA ANALYSIS:\n');
console.log(`Social Links Found: ${socialMediaInfo.socialLinks.length}`);
console.log(`Social Icons Found: ${socialMediaInfo.socialIcons.length}`);

if (socialMediaInfo.socialLinks.length > 0) {
  console.log('\n✅ Social Media Links:');
  socialMediaInfo.socialLinks.forEach((link, i) => {
    console.log(`  ${i + 1}. ${link.href}`);
    console.log(`     Text: "${link.text}"`);
    console.log(`     Aria-label: ${link.ariaLabel || 'none'}`);
    console.log(`     Parent: ${link.parent}\n`);
  });
} else {
  console.log('\n❌ NO social media links found on homepage');
}

if (socialMediaInfo.socialIcons.length > 0) {
  console.log('\n✅ Social Media Icons:');
  socialMediaInfo.socialIcons.forEach((icon, i) => {
    console.log(`  ${i + 1}. ${icon.type} → ${icon.href}`);
    console.log(`     Aria-label: ${icon.ariaLabel || 'none'}\n`);
  });
}

console.log('\n📄 Footer Preview:');
console.log(socialMediaInfo.footerPreview.substring(0, 300) + '...\n');

console.log('\n📝 Blog Section Preview:');
console.log(socialMediaInfo.blogPreview.substring(0, 300) + '...\n');

// Scroll to footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/social-check-footer.png`, fullPage: false });

// Check blog page
console.log('\n═══════════════════════════════════════════════════════════');
console.log('CHECKING BLOG PAGE FOR SOCIAL MEDIA LINKS');
console.log('═══════════════════════════════════════════════════════════\n');

await page.goto(BASE + '/blog/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/social-check-blog.png`, fullPage: true });

const blogSocialInfo = await page.evaluate(() => {
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  const socialDomains = [
    'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
    'pinterest.com', 'youtube.com', 'tiktok.com', 'x.com'
  ];
  
  const socialLinks = allLinks.filter(a => {
    const href = a.getAttribute('href') || '';
    return socialDomains.some(domain => href.includes(domain));
  }).map(a => ({
    href: a.getAttribute('href'),
    text: a.innerText.trim(),
    ariaLabel: a.getAttribute('aria-label')
  }));
  
  return { socialLinks };
});

console.log(`Social Links Found on Blog Page: ${blogSocialInfo.socialLinks.length}`);

if (blogSocialInfo.socialLinks.length > 0) {
  console.log('\n✅ Social Media Links on Blog Page:');
  blogSocialInfo.socialLinks.forEach((link, i) => {
    console.log(`  ${i + 1}. ${link.href}`);
    console.log(`     Text: "${link.text}"\n`);
  });
} else {
  console.log('\n❌ NO social media links found on blog page');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('RECOMMENDATIONS');
console.log('═══════════════════════════════════════════════════════════\n');

if (!socialMediaInfo.hasSocialLinks && !socialMediaInfo.hasSocialIcons) {
  console.log('⚠️  No social media links found on the homepage or blog.');
  console.log('📌 Recommendation: Add social media icons to the footer for:');
  console.log('   - Facebook');
  console.log('   - Twitter/X');
  console.log('   - Instagram');
  console.log('   - Pinterest');
  console.log('   - YouTube\n');
} else {
  console.log('✅ Social media links are present.');
}

console.log('Screenshots saved:');
console.log('  - social-check-homepage.png (full page)');
console.log('  - social-check-footer.png (footer view)');
console.log('  - social-check-blog.png (blog page)\n');

await browser.close();
