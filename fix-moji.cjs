const fs = require('fs');

function fixMojibake(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('ðŸ') || content.includes('Ã')) {
    console.log(`Fixing mojibake in ${filePath}...`);
    try {
      // Mojibake happens when UTF-8 bytes are read as Windows-1252 (or ISO-8859-1).
      // We convert the string to a Buffer using 'binary' (latin1) to get the original bytes,
      // then decode those bytes as 'utf8'.
      const originalBytes = Buffer.from(content, 'binary');
      const fixedContent = originalBytes.toString('utf8');
      
      // Safety check: if it still has mojibake or is completely broken, we might need a different approach.
      if (fixedContent.includes('')) {
         console.log('Warning: Found replacement character after conversion, might be lossy.');
      }
      
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log('Fixed!');
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log(`No mojibake found in ${filePath}`);
  }
}

fixMojibake('assets/index-Ctp2HkQJ.js');
