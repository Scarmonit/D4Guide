#!/usr/bin/env node
/**
 * D4Guide Build Script
 * Builds optimized production files with minification
 */

import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Files and directories to copy
const ASSETS = [
  'blood_wave_necro_guide_advanced.html',
  'styles.css',
  'scripts.js',
  'favicon.svg',
  'blood_wave_images'
];

// Run npx command safely (works on Windows and Unix)
function runNpx(args) {
  const result = spawnSync('npx', args, {
    cwd: ROOT,
    stdio: 'pipe',
    shell: true // Required for Windows batch files
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

// Minify CSS
function minifyCss(src, dest) {
  const success = runNpx(['cleancss', '-o', dest, src]);
  if (!success) {
    copyFileSync(src, dest);
  }
  return success;
}

// Minify JS
function minifyJs(src, dest) {
  const success = runNpx(['terser', src, '-o', dest, '--compress', '--mangle']);
  if (!success) {
    copyFileSync(src, dest);
  }
  return success;
}

// Copy a file (with optional minification)
function copyFile(src, dest, minify = true) {
  mkdirSync(dirname(dest), { recursive: true });

  if (!minify) {
    copyFileSync(src, dest);
    return { minified: false };
  }

  const ext = extname(src).toLowerCase();
  let minified = false;

  switch (ext) {
    case '.html':
      minified = minifyHtml(src, dest);
      break;
    case '.css':
      minified = minifyCss(src, dest);
      break;
    case '.js':
      minified = minifyJs(src, dest);
      break;
    default:
      copyFileSync(src, dest);
  }

  return { minified };
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
      copyFile(srcPath, destPath, false); // Don't minify images
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

// Main build function
function build() {
  console.log('\n  D4Guide Production Build');
  console.log('  ─────────────────────────────');

  cleanDist();

  let totalOriginal = 0;
  let totalMinified = 0;

  for (const asset of ASSETS) {
    const src = join(ROOT, asset);
    const dest = join(
      DIST,
      asset === 'blood_wave_necro_guide_advanced.html' ? 'index.html' : asset
    );

    if (!existsSync(src)) {
      console.log(`  Skipped: ${asset} (not found)`);
      continue;
    }

    if (statSync(src).isDirectory()) {
      copyDir(src, dest);
      console.log(`  Copied: ${asset}/`);
    } else {
      const originalSize = statSync(src).size;
      const { minified } = copyFile(src, dest);
      const newSize = statSync(dest).size;

      const destName = asset === 'blood_wave_necro_guide_advanced.html' ? 'index.html' : asset;

      if (minified && newSize < originalSize) {
        const saved = ((1 - newSize / originalSize) * 100).toFixed(0);
        console.log(
          `  Minified: ${destName} (${getSize(src)}KB -> ${getSize(dest)}KB, -${saved}%)`
        );
        totalOriginal += originalSize;
        totalMinified += newSize;
      } else {
        console.log(`  Copied: ${destName} (${getSize(dest)}KB)`);
      }
    }
  }

  console.log('  ─────────────────────────────');

  if (totalOriginal > 0) {
    const totalSaved = ((1 - totalMinified / totalOriginal) * 100).toFixed(0);
    console.log(
      `  Total savings: ${(totalOriginal / 1024).toFixed(1)}KB -> ${(totalMinified / 1024).toFixed(1)}KB (-${totalSaved}%)`
    );
  }

  console.log('  Build complete!\n');
}

build();
