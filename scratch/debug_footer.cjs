const http = require('http');

http.get('http://localhost:4321/', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const footers = [...data.matchAll(/<footer[\s\S]*?<\/footer>/gi)];
    console.log(`Found ${footers.length} <footer> blocks in homepage HTML.`);
    footers.forEach((f, i) => {
      const links = [...f[0].matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
      console.log(`Footer block ${i+1} links:`, links);
    });
  });
});
