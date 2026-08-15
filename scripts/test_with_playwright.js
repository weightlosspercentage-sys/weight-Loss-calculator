import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '..', 'index.html');
const distPath = path.join(__dirname, '..', 'dist3', 'index.html');

console.log("=== CHECKING FOOTER SOCIAL LINKS IN SOURCE & DIST3 HTML FILES ===");

function inspectFooter(filePath, name) {
  if (!fs.existsSync(filePath)) {
    console.log(`[-] File missing: ${name}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n--- Inspecting ${name} ---`);
  
  const matches = content.match(/href="https:\/\/(www\.)?(facebook|x|linkedin|instagram)\.com\/[^"]*"/gi);
  if (matches) {
    console.log(`[+] Found ${matches.length} Social Links in ${name}:`);
    matches.forEach(m => console.log(`    ${m}`));
  } else {
    console.log(`[-] No social links found in ${name}`);
  }
}

inspectFooter(indexPath, 'Root index.html');
inspectFooter(distPath, 'dist3/index.html');
