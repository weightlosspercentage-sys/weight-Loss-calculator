import fs from 'fs';
import path from 'path';

const files = ['sitemap.xml', 'dist3/sitemap.xml', 'dist3/sitemap-0.xml'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const originalCount = (content.match(/<url>/g) || []).length;
    
    // Remove <url>...</url> blocks that contain /blog/
    content = content.replace(/<url>(?:(?!<\/url>)[\s\S])*?\/blog\/(?:(?!<\/url>)[\s\S])*?<\/url>/gi, '');
    
    const newCount = (content.match(/<url>/g) || []).length;
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Cleaned ${f}: Reduced URLs from ${originalCount} to ${newCount} (Removed ${originalCount - newCount} blog URLs)`);
  }
});
