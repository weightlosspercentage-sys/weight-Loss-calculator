// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to recursively copy files, excluding only Astro-built HTML and markdown files
/**
 * @param {string} src
 * @param {string} dest
 */
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  const rootDir = process.cwd();
  
  const astroBuiltFiles = [
    'index.html',
    'about/index.html',
    'blog/index.html',
    'calculators/index.html',
    'compare/index.html',
    'contact/index.html',
    'nutrition/index.html'
  ];

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      const relPath = path.relative(rootDir.toLowerCase(), srcPath.toLowerCase()).replace(/\\/g, '/');
      if (entry.name.endsWith('.md')) {
        continue;
      }
      if (astroBuiltFiles.includes(relPath)) {
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const copyAssetsIntegration = {
  name: 'copy-assets',
  hooks: {
    /** @param {{ dir: URL }} param0 */
    'astro:build:done': async ({ dir }) => {
      const outDir = fileURLToPath(dir);
      const srcDir = process.cwd();
      
      console.log(`\n[copy-assets] Copying static assets from ${srcDir} to ${outDir}...`);
      
      const files = fs.readdirSync(srcDir);
      
      for (const file of files) {
        const fullPath = path.join(srcDir, file);
        
        // Exclude system directories and files
        if (
          file.startsWith('.') ||
          file === 'node_modules' ||
          file === 'src' ||
          file === 'public' ||
          file === 'dist' ||
          file === 'generators' ||
          file === 'scripts' ||
          file === 'docs' ||
          file === 'package.json' ||
          file === 'package-lock.json' ||
          file === 'tsconfig.json' ||
          file === 'astro.config.mjs' ||
          file === 'skills-lock.json' ||
          file === 'translation_cache.json'
        ) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        const destPath = path.join(outDir, file);
        
        if (stat.isDirectory()) {
          copyDirSync(fullPath, destPath);
        } else {
          if (file !== 'index.html' && !file.endsWith('.md')) {
            fs.copyFileSync(fullPath, destPath);
          }
        }
      }
      console.log('[copy-assets] Static assets copied successfully!\n');
    }
  }
};

// https://astro.build/config
export default defineConfig({
  integrations: [copyAssetsIntegration]
});


