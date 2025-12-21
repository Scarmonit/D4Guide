#!/usr/bin/env node
/**
 * D4Guide Pre-Deployment Check
 * Validates the build before pushing to production
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

let errors = 0;
let warnings = 0;

function check(condition, message, isError = true) {
  if (!condition) {
    if (isError) {
      console.log(`  [ERROR] ${message}`);
      errors++;
    } else {
      console.log(`  [WARN]  ${message}`);
      warnings++;
    }
    return false;
  }
  console.log(`  [OK]    ${message}`);
  return true;
}

function getFileSize(path) {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function runChecks() {
  console.log('\n  D4Guide Deployment Check');
  console.log('  ─────────────────────────────────────────');

  // Check dist exists
  check(existsSync(DIST), 'dist/ directory exists');
  if (!existsSync(DIST)) {
    console.log('\n  Run "npm run build" first!\n');
    process.exit(1);
  }

  // Check required files
  const requiredFiles = ['index.html', 'styles.bundle.css', 'scripts.bundle.js'];
  for (const file of requiredFiles) {
    check(existsSync(join(DIST, file)), `${file} present in dist/`);
  }

  // Check images directory
  const imagesDir = join(DIST, 'images');
  check(existsSync(imagesDir), 'images/ directory exists', false);

  if (existsSync(imagesDir)) {
    const images = readdirSync(imagesDir);
    check(images.length > 0, `Images present (${images.length} files)`);
  }

  // Check HTML content
  const indexPath = join(DIST, 'index.html');
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, 'utf8');

    // Check for required sections
    check(html.includes('sanctification'), 'Sanctification section present');
    check(html.includes('build-variants'), 'Build Variants section present', false);
    check(html.includes('Blood Wave'), 'Blood Wave content present');
    check(html.includes('Season 11') || html.includes('S11'), 'Season reference present', false);

    // Check for broken links
    const brokenLinks = html.match(/href="[^"]*undefined[^"]*"/g);
    check(!brokenLinks, 'No broken href links');

    // Check for console.log (should be removed for production)
    const hasDebugLogs = html.includes('console.log');
    check(!hasDebugLogs, 'No debug console.log in HTML', false);
  }

  // Check scripts.js
  const scriptsPath = join(DIST, 'scripts.bundle.js');
  if (existsSync(scriptsPath)) {
    const js = readFileSync(scriptsPath, 'utf8');
    const hasDebugLogs = (js.match(/console\.log/g) || []).length > 5;
    check(!hasDebugLogs, 'Minimal console.log statements', false);
  }

  // File sizes
  console.log('\n  File Sizes:');
  console.log('  ─────────────────────────────────────────');
  let totalSize = 0;
  for (const file of requiredFiles) {
    const size = getFileSize(join(DIST, file));
    totalSize += size;
    console.log(`  ${file.padEnd(20)} ${formatBytes(size)}`);
  }

  // Images total
  if (existsSync(imagesDir)) {
    let imagesSize = 0;
    for (const img of readdirSync(imagesDir)) {
      imagesSize += getFileSize(join(imagesDir, img));
    }
    totalSize += imagesSize;
    console.log(`  ${'blood_wave_images/'.padEnd(20)} ${formatBytes(imagesSize)}`);
  }
  console.log('  ─────────────────────────────────────────');
  console.log(`  ${'Total:'.padEnd(20)} ${formatBytes(totalSize)}`);

  // Summary
  console.log('\n  Summary:');
  console.log('  ─────────────────────────────────────────');
  if (errors === 0 && warnings === 0) {
    console.log('  All checks passed! Ready to deploy.\n');
    process.exit(0);
  } else if (errors === 0) {
    console.log(`  ${warnings} warning(s), but OK to deploy.\n`);
    process.exit(0);
  } else {
    console.log(`  ${errors} error(s), ${warnings} warning(s). Fix before deploying!\n`);
    process.exit(1);
  }
}

runChecks();
