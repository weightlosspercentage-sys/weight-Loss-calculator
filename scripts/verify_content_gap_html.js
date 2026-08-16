import fs from 'fs';
import path from 'path';

const targetPath = path.join(process.cwd(), 'dist3', 'calculators', 'newborn-weight-loss', 'index.html');

console.log("=== VERIFYING DIST3 NEWBORN WEIGHT LOSS HTML ===");
if (fs.existsSync(targetPath)) {
  const html = fs.readFileSync(targetPath, 'utf-8');
  
  const keywords = [
    "Infant Weight Percentiles & Baby Weight Charts",
    "how many ounces in a pound baby weight",
    "Dr. Sarah Jenkins",
    "Peer-Reviewed Clinical References",
    "Postpartum Weight Loss Calculator"
  ];

  for (const kw of keywords) {
    if (html.includes(kw)) {
      console.log(`[+] Found Keyword/Section: "${kw}"`);
    } else {
      console.log(`[-] MISSING: "${kw}"`);
    }
  }
} else {
  console.log(`[-] Target file not found: ${targetPath}`);
}
