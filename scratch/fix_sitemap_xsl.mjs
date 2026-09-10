import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'dist3');

['sitemap-index.xml', 'sitemap-0.xml', 'sitemap.xml'].forEach(file => {
  const filePath = path.join(outDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace full domain URL with relative /sitemap.xsl
    content = content.replace(/href=["']https?:\/\/[^\/]+\/sitemap\.xsl["']/gi, 'href="/sitemap.xsl"');
    
    // If missing xml-stylesheet tag, inject it after <?xml ...?>
    if (!content.includes('xml-stylesheet')) {
      content = content.replace(/(<\?xml[^>]*\?>)/i, '$1\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}: Relative XSL stylesheet set`);
  }
});
