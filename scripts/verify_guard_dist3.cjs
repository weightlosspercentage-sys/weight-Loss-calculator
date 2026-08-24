const fs = require('fs');
const path = require('path');
const DIST = path.resolve(__dirname, '..', 'dist3');
const SKIP = new Set(['playwright-report', 'test-results', 'node_modules', '.git']);
let total = 0, guard = 0, withBundle = 0, missing = 0;
const missingFiles = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(path.join(dir, e.name));
    } else if (e.name === 'index.html') {
      total++;
      const html = fs.readFileSync(path.join(dir, e.name), 'utf8');
      const hasGuard = html.includes('__SPA_NAV_GUARD__');
      const count = (html.split('__SPA_NAV_GUARD__').length - 1);
      if (hasGuard) guard++;
      if (html.includes('has-react') && !hasGuard) { missing++; if (missingFiles.length < 15) missingFiles.push(path.relative(DIST, path.join(dir, e.name))); }
      if (count > 2) console.log('DUPLICATE:', path.relative(DIST, path.join(dir, e.name)), count);
    }
  }
}
walk(DIST);
console.log(JSON.stringify({ total, guard, reactPagesMissingGuard: missing, missingFiles }, null, 1));
