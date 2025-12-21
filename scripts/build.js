#!/usr/bin/env node
/**
 * D4Guide Build Script
 * Builds optimized production files with ES module bundling
 */

import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  existsSync,
  rmSync,
  readFileSync,
  writeFileSync
} from 'fs';
import { join, dirname, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SRC_JS = join(ROOT, 'src', 'js');
const SRC_CSS = join(ROOT, 'src', 'css');

// Static assets to copy
const STATIC_ASSETS = ['favicon.svg', 'favicon.ico', 'manifest.json', 'service-worker.js'];

// Run npx command safely (works on Windows and Unix)
function runNpx(args) {
  const result = spawnSync('npx', args, {
    cwd: ROOT,
    stdio: 'pipe',
    shell: true
  });
  return result.status === 0;
}

// Clean dist directory
function cleanDist() {
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true, force: true });
  }
  mkdirSync(DIST, { recursive: true });
  console.log('  Cleaned dist/');
}

// Bundle JavaScript with esbuild
function bundleJs() {
  const entryPoint = join(SRC_JS, 'main.js');
  const outFile = join(DIST, 'scripts.bundle.js');

  if (!existsSync(entryPoint)) {
    // Fallback to original scripts.js
    console.log('  Using legacy scripts.js (no modular source)');
    const legacySrc = join(ROOT, 'scripts.js');
    if (existsSync(legacySrc)) {
      const success = runNpx(['terser', legacySrc, '-o', outFile, '--compress', '--mangle']);
      if (!success) {
        copyFileSync(legacySrc, outFile);
      }
      return true;
    }
    return false;
  }

  console.log('  Bundling JavaScript modules...');
  const success = runNpx([
    'esbuild',
    entryPoint,
    '--bundle',
    '--minify',
    '--sourcemap',
    '--target=es2020',
    '--format=iife',
    `--outfile=${outFile}`
  ]);

  if (!success) {
    console.log('  esbuild failed, falling back to terser');
    const legacySrc = join(ROOT, 'scripts.js');
    if (existsSync(legacySrc)) {
      runNpx(['terser', legacySrc, '-o', outFile, '--compress', '--mangle']);
    }
  }

  return success;
}

// Bundle CSS by resolving @imports and minifying
function bundleCss() {
  const entryPoint = join(SRC_CSS, 'main.css');
  const outFile = join(DIST, 'styles.bundle.css');

  if (!existsSync(entryPoint)) {
    // Fallback to original styles.css
    console.log('  Using legacy styles.css (no modular source)');
    const legacySrc = join(ROOT, 'styles.css');
    if (existsSync(legacySrc)) {
      const success = runNpx(['clean-css-cli', '-o', outFile, legacySrc]);
      if (!success) {
        copyFileSync(legacySrc, outFile);
      }
      return true;
    }
    return false;
  }

  console.log('  Bundling CSS modules...');

  // Resolve @imports and concatenate
  const cssContent = resolveCssImports(entryPoint, SRC_CSS);

  // Write concatenated CSS to temp file
  const tempFile = join(DIST, 'styles.temp.css');
  writeFileSync(tempFile, cssContent);

  // Minify with clean-css
  const success = runNpx(['clean-css-cli', '-o', outFile, tempFile]);

  // Clean up temp file
  if (existsSync(tempFile)) {
    rmSync(tempFile);
  }

  if (!success) {
    // Just use the concatenated version
    writeFileSync(outFile, cssContent);
  }

  return true;
}

// Recursively resolve CSS @import statements
function resolveCssImports(filePath, baseDir) {
  const content = readFileSync(filePath, 'utf-8');
  const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;

  return content.replace(importRegex, (match, importPath) => {
    const absolutePath = resolve(dirname(filePath), importPath);
    if (existsSync(absolutePath)) {
      return resolveCssImports(absolutePath, baseDir);
    }
    console.log(`  Warning: Could not resolve @import "${importPath}"`);
    return `/* Could not resolve: ${importPath} */`;
  });
}

// Minify HTML
function minifyHtml(src, dest) {
  const success = runNpx([
    'html-minifier-terser',
    '--collapse-whitespace',
    '--remove-comments',
    '--minify-css',
    'true',
    '--minify-js',
    'true',
    '-o',
    dest,
    src
  ]);
  if (!success) {
    copyFileSync(src, dest);
  }
  return success;
}

// Copy a directory recursively
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Get file size in KB
function getSize(path) {
  try {
    return (statSync(path).size / 1024).toFixed(1);
  } catch {
    return '?';
  }
}

// Update HTML to use bundled files
function updateHtmlReferences(htmlContent) {
  // Generate cache-busting version based on timestamp
  const version = Date.now().toString(36);

  // Replace original CSS with bundle (with cache-busting)
  htmlContent = htmlContent.replace(/href="styles\.css"/g, `href="styles.bundle.css?v=${version}"`);
  htmlContent = htmlContent.replace(
    /href="src\/css\/main\.css"/g,
    `href="styles.bundle.css?v=${version}"`
  );

  // Replace original JS with bundle (with cache-busting)
  htmlContent = htmlContent.replace(
    /<script\s+src="scripts\.js"[^>]*><\/script>/g,
    `<script src="scripts.bundle.js?v=${version}" defer></script>`
  );
  htmlContent = htmlContent.replace(
    /<script\s+type="module"\s+src="src\/js\/main\.js"[^>]*><\/script>/g,
    `<script src="scripts.bundle.js?v=${version}" defer></script>`
  );

  // Update image paths from blood_wave_images to public/images
  htmlContent = htmlContent.replace(/blood_wave_images\//g, 'images/');

  return htmlContent;
}

// Main build function
async function build() {
  console.log('\n  D4Guide Production Build (Modular)');
  console.log('  ────────────────────────────────────');

  cleanDist();

  // Bundle JavaScript
  bundleJs();
  if (existsSync(join(DIST, 'scripts.bundle.js'))) {
    console.log(`  Bundled: scripts.bundle.js (${getSize(join(DIST, 'scripts.bundle.js'))}KB)`);
  }

  // Bundle CSS
  bundleCss();
  if (existsSync(join(DIST, 'styles.bundle.css'))) {
    console.log(`  Bundled: styles.bundle.css (${getSize(join(DIST, 'styles.bundle.css'))}KB)`);
  }

  // Process HTML
  const htmlSrc = join(ROOT, 'blood_wave_necro_guide_advanced.html');
  const htmlDest = join(DIST, 'index.html');
  if (existsSync(htmlSrc)) {
    let htmlContent = readFileSync(htmlSrc, 'utf-8');
    htmlContent = updateHtmlReferences(htmlContent);

    // Write updated HTML temporarily
    const tempHtml = join(DIST, 'index.temp.html');
    writeFileSync(tempHtml, htmlContent);

    // Minify
    minifyHtml(tempHtml, htmlDest);
    rmSync(tempHtml);
    console.log(`  Minified: index.html (${getSize(htmlDest)}KB)`);
  }

  // Copy static assets
  for (const asset of STATIC_ASSETS) {
    const src = join(ROOT, asset);
    const dest = join(DIST, asset);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`  Copied: ${asset}`);
    }
  }

  // Copy images from public/images or blood_wave_images
  const publicImages = join(ROOT, 'public', 'images');
  const legacyImages = join(ROOT, 'blood_wave_images');
  const destImages = join(DIST, 'images');

  if (existsSync(publicImages)) {
    copyDir(publicImages, destImages);
    console.log('  Copied: images/ (from public/)');
  } else if (existsSync(legacyImages)) {
    copyDir(legacyImages, destImages);
    console.log('  Copied: images/ (from blood_wave_images/)');
  }

  console.log('  ────────────────────────────────────');
  console.log('  Build complete!\n');
}

build();
