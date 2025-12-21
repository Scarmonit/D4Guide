#!/usr/bin/env node
/**
 * D4Guide Source Snapshot Script
 * Uses Playwright to capture snapshots of authoritative guide sources
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SOURCES, UPDATE_CONFIG } from './sources.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data', 'sources');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

async function snapshotPage(browser, source, key) {
  console.log(`  Snapshotting ${source.name}...`);

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    await page.goto(source.url, {
      waitUntil: 'domcontentloaded',
      timeout: UPDATE_CONFIG.snapshotTimeout
    });

    // Wait for content to render (ads-heavy sites need time)
    await page.waitForTimeout(8000);

    // Get page content
    const content = await page.evaluate(() => {
      // Remove ads, scripts, and non-content elements
      const removeSelectors = [
        'script',
        'style',
        'iframe',
        'noscript',
        '[class*="ad"]',
        '[class*="Ad"]',
        '[id*="ad"]',
        '[class*="banner"]',
        '[class*="popup"]',
        'header nav',
        'footer',
        '.cookie-banner'
      ];

      removeSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });

      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText,
        html: document.body.innerHTML
      };
    });

    // Extract structured data based on source type
    let structuredData = {};

    if (source.type === 'guide') {
      structuredData = await page.evaluate(selectors => {
        const data = {};

        // Try to get last updated date
        if (selectors.lastUpdated) {
          const el = document.querySelector(selectors.lastUpdated);
          if (el) data.lastUpdated = el.textContent.trim();
        }

        // Extract skill section
        if (selectors.skillSection) {
          const el = document.querySelector(selectors.skillSection);
          if (el) data.skills = el.textContent.trim();
        }

        // Extract gear section
        if (selectors.gearSection) {
          const el = document.querySelector(selectors.gearSection);
          if (el) data.gear = el.textContent.trim();
        }

        return data;
      }, source.selectors || {});
    }

    // Create snapshot object
    const snapshot = {
      source: key,
      name: source.name,
      url: source.url,
      timestamp: new Date().toISOString(),
      title: content.title,
      textContent: content.text.substring(0, 100000),
      structuredData,
      contentLength: content.text.length
    };

    // Save snapshot
    const snapshotPath = join(DATA_DIR, `${key}.json`);
    writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

    console.log(`    Done: ${key}.json (${(content.text.length / 1024).toFixed(1)}KB)`);

    return snapshot;
  } catch (error) {
    console.error(`    Error snapshotting ${source.name}:`, error.message);
    return null;
  } finally {
    await context.close();
  }
}

async function snapshotRSS(source, key) {
  console.log(`  Fetching RSS: ${source.name}...`);

  try {
    const response = await fetch(source.rssUrl, {
      headers: { 'User-Agent': 'D4Guide Bot/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();

    // Simple RSS parsing - extract items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';

      // Check if item matches keywords
      const content = `${title} ${description}`.toLowerCase();
      const matchesKeywords = source.keywords?.some(kw => content.includes(kw.toLowerCase()));

      if (!source.keywords || matchesKeywords) {
        items.push({
          title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1'),
          link,
          pubDate,
          description: description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').substring(0, 500)
        });
      }
    }

    const snapshot = {
      source: key,
      name: source.name,
      url: source.rssUrl,
      timestamp: new Date().toISOString(),
      type: 'rss',
      items: items.slice(0, 10)
    };

    const snapshotPath = join(DATA_DIR, `${key}.json`);
    writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

    console.log(`    Done: ${key}.json (${items.length} items)`);

    return snapshot;
  } catch (error) {
    console.error(`    Error fetching RSS ${source.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n  D4Guide Source Snapshot');
  console.log('  ---------------------------------\n');

  const browser = await chromium.launch({ headless: true });

  const results = {
    timestamp: new Date().toISOString(),
    sources: {}
  };

  for (const [key, source] of Object.entries(SOURCES)) {
    try {
      let snapshot;

      if (source.rssUrl) {
        snapshot = await snapshotRSS(source, key);
      } else {
        snapshot = await snapshotPage(browser, source, key);
      }

      if (snapshot) {
        results.sources[key] = {
          success: true,
          timestamp: snapshot.timestamp,
          contentLength: snapshot.contentLength || snapshot.items?.length || 0
        };
      } else {
        results.sources[key] = { success: false, error: 'Snapshot failed' };
      }
    } catch (error) {
      results.sources[key] = { success: false, error: error.message };
    }
  }

  await browser.close();

  // Save summary
  const summaryPath = join(DATA_DIR, 'snapshot-summary.json');
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log('\n  ---------------------------------');
  console.log('  Snapshot complete!\n');
}

main().catch(console.error);
