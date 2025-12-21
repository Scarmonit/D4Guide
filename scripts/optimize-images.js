#!/usr/bin/env node
/**
 * D4Guide Image Optimization Script
 * Converts images to WebP and compresses for optimal web performance
 */

import { readdirSync, statSync, existsSync, mkdirSync, unlinkSync, renameSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMAGES_DIR = join(ROOT, 'blood_wave_images');
const BACKUP_DIR = join(ROOT, 'blood_wave_images_backup');

// Run npx command
function runNpx(args) {
  const result = spawnSync('npx', args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true
  });
  return result.status === 0;
}

// Get file size in KB
function getSize(path) {
  try {
    return (statSync(path).size / 1024).toFixed(1);
  } catch {
    return '?';
  }
}

// Optimize images using Sharp via npx
async function optimizeImages() {
  console.log('\n  D4Guide Image Optimization');
  console.log('  ─────────────────────────────');

  if (!existsSync(IMAGES_DIR)) {
    console.log('  No images directory found');
    return;
  }

  const files = readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('  No PNG/JPG images to optimize (already WebP)');
    console.log('  ─────────────────────────────\n');
    return;
  }

  // Create backup directory
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imageFiles) {
    const src = join(IMAGES_DIR, file);
    const ext = extname(file).toLowerCase();
    const name = basename(file, ext);
    const webpDest = join(IMAGES_DIR, `${name}.webp`);
    const backupDest = join(BACKUP_DIR, file);

    const originalSize = statSync(src).size;
    totalOriginal += originalSize;

    console.log(`  Converting: ${file}...`);

    // Use sharp-cli to convert to WebP
    const success = runNpx([
      'sharp-cli',
      '-i',
      src,
      '-o',
      webpDest,
      '-f',
      'webp',
      '--quality',
      '80'
    ]);

    if (success && existsSync(webpDest)) {
      const newSize = statSync(webpDest).size;
      totalOptimized += newSize;
      const saved = ((1 - newSize / originalSize) * 100).toFixed(0);
      console.log(`    -> ${name}.webp (${getSize(src)}KB -> ${getSize(webpDest)}KB, -${saved}%)`);

      // Backup original
      renameSync(src, backupDest);
    } else {
      console.log('    -> Failed, keeping original');
      totalOptimized += originalSize;
    }
  }

  console.log('  ─────────────────────────────');
  if (totalOriginal > 0) {
    const totalSaved = ((1 - totalOptimized / totalOriginal) * 100).toFixed(0);
    console.log(
      `  Total: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB -> ${(totalOptimized / 1024 / 1024).toFixed(1)}MB (-${totalSaved}%)`
    );
    console.log('  Originals backed up to: blood_wave_images_backup/');
  }
  console.log('  Optimization complete!\n');
}

optimizeImages();
