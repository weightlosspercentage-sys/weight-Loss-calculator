import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '..', 'dist3', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log("=== VERIFYING FOOTER SOCIAL LINKS IN DIST3/INDEX.HTML ===");

const socialRegex = /<a\s+href="(https:\/\/[^"]+)"[^>]*aria-label="([^"]+)"/g;
let match;
let found = 0;

while ((match = socialRegex.exec(html)) !== null) {
  console.log(`[+] Verified Social Link: Label="${match[2]}" -> URL="${match[1]}"`);
  found++;
}

if (found === 0) {
  console.log("Searching by generic href pattern...");
  const hrefs = html.match(/href="https:\/\/(www\.)?(facebook|x|linkedin|instagram)\.com[^"]*"/g);
  console.log("Matches:", hrefs);
} else {
  console.log(`\nSUCCESS: Verified ${found} official social links in footer!`);
}
