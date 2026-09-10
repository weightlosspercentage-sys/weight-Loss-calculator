const https = require('https');
const fs = require('fs');
const path = require('path');

const globalConfigDir = 'C:\\Users\\asus\\.gemini\\config\\skills';

function fetchJson(url) {
  return new Promise((resolve) => {
    const options = {
      headers: { 'User-Agent': 'Antigravity-Agent' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: e.message, raw: data });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

function fetchRaw(url) {
  return new Promise((resolve) => {
    const options = {
      headers: { 'User-Agent': 'Antigravity-Agent' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(null));
  });
}

async function main() {
  console.log('Fetching default branch for obra/superpowers...');
  const repoInfo = await fetchJson('https://api.github.com/repos/obra/superpowers');
  const defaultBranch = repoInfo.default_branch || 'main';
  console.log(`Default branch is '${defaultBranch}'`);

  console.log(`Fetching repository tree for obra/superpowers (${defaultBranch})...`);
  const treeRes = await fetchJson(`https://api.github.com/repos/obra/superpowers/git/trees/${defaultBranch}?recursive=1`);

  if (!treeRes.tree) {
    console.error('Failed to fetch tree:', treeRes);
    return;
  }

  const skillFiles = treeRes.tree.filter(item => item.path.endsWith('SKILL.md'));
  console.log(`Found ${skillFiles.length} SKILL.md files in obra/superpowers!`);

  for (const item of skillFiles) {
    const rawUrl = `https://raw.githubusercontent.com/obra/superpowers/${defaultBranch}/${item.path}`;
    const content = await fetchRaw(rawUrl);

    if (!content) {
      console.log(`Failed to download ${item.path}`);
      continue;
    }

    // Extract skill name from frontmatter or path
    const nameMatch = content.match(/^name:\s*([^\r\n]+)/m);
    let skillName = nameMatch ? nameMatch[1].trim() : '';

    if (!skillName) {
      const parts = item.path.split('/');
      skillName = parts[parts.length - 2] || 'unknown-skill';
    }

    const skillDir = path.join(globalConfigDir, skillName);
    fs.mkdirSync(skillDir, { recursive: true });

    const targetFile = path.join(skillDir, 'SKILL.md');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`Installed global skill [${skillName}] -> ${targetFile}`);

    // Download related files in the same skill directory
    const folderPath = item.path.substring(0, item.path.lastIndexOf('/'));
    const relatedFiles = treeRes.tree.filter(f => f.path.startsWith(folderPath + '/') && !f.path.endsWith('SKILL.md') && f.type === 'blob');

    for (const refFile of relatedFiles) {
      const relPath = refFile.path.substring(folderPath.length + 1);
      const refContent = await fetchRaw(`https://raw.githubusercontent.com/obra/superpowers/${defaultBranch}/${refFile.path}`);
      if (refContent) {
        const refTarget = path.join(skillDir, relPath);
        fs.mkdirSync(path.dirname(refTarget), { recursive: true });
        fs.writeFileSync(refTarget, refContent, 'utf8');
        console.log(`  └─ Downloaded reference [${relPath}]`);
      }
    }
  }

  console.log('\nAll available skills from obra/superpowers installed globally!');
}

main();
