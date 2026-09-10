import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const SCREENSHOT_DIR = 'D:/projects/Weight Loss Percentage/Live/Weight Loss Percentage- Upload 1/dist3';

const browser = await chromium.launch({ headless: false, slowMo: 100 });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log('\n═══════════════════════════════════════════════════════════');
console.log('INVESTIGATING FOOTER VISIBILITY ON HOMEPAGE');
console.log('═══════════════════════════════════════════════════════════\n');

await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

const footerInfo = await page.evaluate(() => {
  const footer = document.querySelector('.static-footer, footer');
  const hasReactClass = document.documentElement.classList.contains('has-react');
  const footerStyle = footer ? window.getComputedStyle(footer) : null;
  
  const socialLinks = Array.from(document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"], a[href*="x.com"]'));
  const visibleSocialLinks = socialLinks.filter(a => {
    const rect = a.getBoundingClientRect();
    const style = window.getComputedStyle(a);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  });
  
  return {
    hasFooter: !!footer,
    hasReactClass,
    footerDisplay: footerStyle?.display,
    footerVisibility: footerStyle?.visibility,
    footerOpacity: footerStyle?.opacity,
    totalSocialLinks: socialLinks.length,
    visibleSocialLinks: visibleSocialLinks.length,
    socialLinkDetails: visibleSocialLinks.map(a => ({
      href: a.getAttribute('href'),
      ariaLabel: a.getAttribute('aria-label'),
      boundingBox: a.getBoundingClientRect()
    }))
  };
});

console.log('Homepage Footer Analysis:');
console.log(`  Has Footer Element: ${footerInfo.hasFooter}`);
console.log(`  Has React Class on <html>: ${footerInfo.hasReactClass}`);
console.log(`  Footer Display: ${footerInfo.footerDisplay}`);
console.log(`  Footer Visibility: ${footerInfo.footerVisibility}`);
console.log(`  Footer Opacity: ${footerInfo.footerOpacity}`);
console.log(`  Total Social Links in DOM: ${footerInfo.totalSocialLinks}`);
console.log(`  Visible Social Links: ${footerInfo.visibleSocialLinks}`);

if (footerInfo.visibleSocialLinks > 0) {
  console.log('\n✅ Social Links ARE Visible:');
  footerInfo.socialLinkDetails.forEach((link, i) => {
    console.log(`  ${i + 1}. ${link.ariaLabel}: ${link.href}`);
    console.log(`     Position: x=${Math.round(link.boundingBox.x)}, y=${Math.round(link.boundingBox.y)}, width=${Math.round(link.boundingBox.width)}, height=${Math.round(link.boundingBox.height)}`);
  });
} else {
  console.log('\n❌ Social Links are NOT visible (hidden by CSS)');
}

// Scroll to footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/social-debug-footer-scrolled.png`, fullPage: false });

// Try to find the React-rendered footer
const reactFooterInfo = await page.evaluate(() => {
  const allFooters = Array.from(document.querySelectorAll('footer'));
  return allFooters.map(f => ({
    className: f.className,
    display: window.getComputedStyle(f).display,
    visibility: window.getComputedStyle(f).visibility,
    hasContent: f.innerHTML.length > 100,
    preview: f.innerHTML.substring(0, 200)
  }));
});

console.log(`\nTotal Footer Elements Found: ${reactFooterInfo.length}`);
reactFooterInfo.forEach((f, i) => {
  console.log(`  Footer ${i + 1}:`);
  console.log(`    Class: ${f.className}`);
  console.log(`    Display: ${f.display}`);
  console.log(`    Visibility: ${f.visibility}`);
  console.log(`    Has Content: ${f.hasContent}`);
});

await browser.close();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('DIAGNOSIS');
console.log('═══════════════════════════════════════════════════════════\n');

if (footerInfo.hasReactClass && footerInfo.footerDisplay === 'none') {
  console.log('⚠️  ISSUE FOUND: The static footer is hidden by CSS');
  console.log('    - The <html> element has class="has-react"');
  console.log('    - CSS rule: html.has-react .static-footer { display: none !important; }');
  console.log('    - The React SPA is supposed to render its own footer');
  console.log('    - The React footer may not include social media icons\n');
  console.log('📌 SOLUTION: Add social media icons to the React-rendered footer');
} else if (footerInfo.visibleSocialLinks > 0) {
  console.log('✅ Social media icons ARE visible on the homepage!');
} else {
  console.log('⚠️  Social media links exist but are not visible for an unknown reason');
}
