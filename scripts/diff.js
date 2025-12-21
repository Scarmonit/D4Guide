#!/usr/bin/env node
/**
 * D4Guide Change Detection Script
 * Compares current snapshots against previous hashes to detect updates
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SOURCES, UPDATE_CONFIG } from './sources.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const SOURCES_DIR = join(DATA_DIR, 'sources');
const HASHES_DIR = join(DATA_DIR, 'hashes');

// Ensure directories exist
[DATA_DIR, SOURCES_DIR, HASHES_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

function normalizeText(text) {
  // Normalize whitespace and remove timestamps/dynamic content
  return text
    .replace(/\s+/g, ' ')
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '[DATE]')
    .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/gi, '[TIME]')
    .replace(/\d+ (minutes?|hours?|days?) ago/gi, '[RELATIVE_TIME]')
    .trim()
    .toLowerCase();
}

function calculateSimilarity(text1, text2) {
  // Simple word-based similarity
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return intersection / union;
}

function detectChanges() {
  console.log('\n  D4Guide Change Detection');
  console.log('  ---------------------------------\n');

  const changes = [];
  let hasSignificantChanges = false;

  for (const [key, source] of Object.entries(SOURCES)) {
    const snapshotPath = join(SOURCES_DIR, `${key}.json`);
    const hashPath = join(HASHES_DIR, `${key}.hash`);
    const prevContentPath = join(HASHES_DIR, `${key}.prev`);

    if (!existsSync(snapshotPath)) {
      console.log(`  [SKIP] ${source.name}: No snapshot found`);
      continue;
    }

    try {
      const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));

      // Get content to compare
      let contentToHash;
      if (snapshot.type === 'rss') {
        // For RSS, hash the titles and links
        contentToHash = snapshot.items.map(item => `${item.title}|${item.link}`).join('\n');
      } else {
        // For pages, normalize and hash text content
        contentToHash = normalizeText(snapshot.textContent || '');
      }

      const newHash = hashContent(contentToHash);

      // Check against previous hash
      if (existsSync(hashPath)) {
        const oldHash = readFileSync(hashPath, 'utf-8').trim();

        if (newHash !== oldHash) {
          // Calculate how different the content is
          let changeScore = 1.0;

          if (existsSync(prevContentPath)) {
            const prevContent = readFileSync(prevContentPath, 'utf-8');
            const similarity = calculateSimilarity(prevContent, contentToHash);
            changeScore = 1 - similarity;
          }

          const isSignificant = changeScore >= UPDATE_CONFIG.diffThreshold;

          changes.push({
            source: key,
            name: source.name,
            changeScore: changeScore,
            significant: isSignificant,
            timestamp: snapshot.timestamp
          });

          if (isSignificant) {
            hasSignificantChanges = true;
            console.log(`  [CHANGED] ${source.name}: ${(changeScore * 100).toFixed(1)}% different`);
          } else {
            console.log(
              `  [MINOR] ${source.name}: ${(changeScore * 100).toFixed(1)}% different (below threshold)`
            );
          }

          // Update hash and previous content
          writeFileSync(hashPath, newHash);
          writeFileSync(prevContentPath, contentToHash);
        } else {
          console.log(`  [OK] ${source.name}: No changes`);
        }
      } else {
        // First run - save initial hash and trigger extraction
        console.log(`  [NEW] ${source.name}: Initial snapshot saved`);
        writeFileSync(hashPath, newHash);
        writeFileSync(prevContentPath, contentToHash);

        hasSignificantChanges = true;
        changes.push({
          source: key,
          name: source.name,
          changeScore: 1.0,
          significant: true,
          initial: true,
          timestamp: snapshot.timestamp
        });
      }
    } catch (error) {
      console.error(`  [ERROR] ${source.name}:`, error.message);
    }
  }

  // Write changes summary
  const changesSummary = {
    timestamp: new Date().toISOString(),
    hasSignificantChanges,
    changes
  };

  writeFileSync(join(DATA_DIR, 'changes.json'), JSON.stringify(changesSummary, null, 2));

  // Write flag file for GitHub Actions
  const flagPath = join(DATA_DIR, '.changes-detected');
  if (hasSignificantChanges) {
    writeFileSync(flagPath, 'true');
    console.log('\n  Significant changes detected!');
  } else {
    if (existsSync(flagPath)) {
      unlinkSync(flagPath);
    }
    console.log('\n  No significant changes detected.');
  }

  console.log('  ---------------------------------\n');

  return changesSummary;
}

// Run detection
detectChanges();
