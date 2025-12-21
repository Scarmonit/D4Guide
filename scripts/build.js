#!/usr/bin/env node
/**
 * D4Guide Build Script
 * Syncs source files to dist/ directory for deployment
 */

import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Files and directories to copy
const ASSETS = [
  'blood_wave_necro_guide_advanced.html',
  'styles.css',
  'scripts.js',
  'blood_wave_images'
];

// Clean dist directory
function cleanDist() {
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true, force: true });
  }
  mkdirSync(DIST, { recursive: true });
  console.log('  Cleaned dist/');
}

// Copy a file
function copyFile(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
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
      copyFile(srcPath, destPath);
    }
  }
}

// Main build function
function build() {
  console.log('\n  D4Guide Build');
  console.log('  ─────────────────────────────');

  cleanDist();

  for (const asset of ASSETS) {
    const src = join(ROOT, asset);
    const dest = join(DIST, asset === 'blood_wave_necro_guide_advanced.html' ? 'index.html' : asset);

    if (!existsSync(src)) {
      console.log(`  Skipped: ${asset} (not found)`);
      continue;
    }

    if (statSync(src).isDirectory()) {
      copyDir(src, dest);
      console.log(`  Copied: ${asset}/ -> dist/${asset}/`);
    } else {
      copyFile(src, dest);
      const destName = asset === 'blood_wave_necro_guide_advanced.html' ? 'index.html' : asset;
      console.log(`  Copied: ${asset} -> dist/${destName}`);
    }
  }

  console.log('  ─────────────────────────────');
  console.log('  Build complete!\n');
}

build();
