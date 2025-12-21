/**
 * Icy Veins Scraper
 * Extracts Blood Wave Necromancer build data using accessibility snapshots
 */

import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseIcyVeinsSnapshot } from './snapshot-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = join(__dirname, '..', '.playwright-mcp');
const SNAPSHOT_FILE = join(SNAPSHOT_DIR, 'icy_veins_snapshot.md');

const NECRO_BUILD_URL = 'https://www.icy-veins.com/d4/guides/blood-wave-necromancer-build/';

/**
 * Scrape Icy Veins Blood Wave Necromancer guide
 */
export async function icyVeinsScraper() {
  // Ensure snapshot directory exists
  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const results = {
    url: NECRO_BUILD_URL,
    scrapedAt: new Date().toISOString(),
    skills: [],
    aspects: [],
    uniques: [],
    gear: [],
    strengths: [],
    weaknesses: [],
    title: null,
    lastUpdated: null,
    tier: null,
    author: null
  };

  // First, try to use existing snapshot if available
  if (existsSync(SNAPSHOT_FILE)) {
    console.log('  Using existing snapshot file...');
    try {
      const parsed = parseIcyVeinsSnapshot(SNAPSHOT_FILE);
      Object.assign(results, parsed);
      results.scrapedAt = new Date().toISOString();
      results.fromCache = true;

      if (parsed.skills.length > 0 || parsed.aspects.length > 0) {
        console.log(
          `  Parsed from cache: ${parsed.skills.length} skills, ${parsed.aspects.length} aspects`
        );
        return results;
      }
    } catch (error) {
      console.log(`  Failed to parse cached snapshot: ${error.message}`);
    }
  }

  // Fallback to live scraping with direct extraction
  // Use named request queue to isolate from other scrapers
  const requestQueue = await RequestQueue.open('icy-veins');
  await requestQueue.addRequest({ url: NECRO_BUILD_URL });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 1,
    headless: true,
    requestHandlerTimeoutSecs: 120,
    navigationTimeoutSecs: 90,

    async requestHandler({ page, request, log }) {
      log.info(`Processing ${request.url}`);

      // Wait for main content to load
      await page.waitForSelector('article, main, .guide-content', { timeout: 60000 });
      await page.waitForTimeout(5000); // Extra time for dynamic content

      // Get page title
      results.title = await page.title();

      // Direct extraction from page
      const directData = await page.evaluate(() => {
        const data = {
          skills: [],
          aspects: [],
          uniques: [],
          strengths: [],
          weaknesses: [],
          lastUpdated: null,
          tier: null,
          author: null
        };

        // Extract skill images from skill bar
        document.querySelectorAll('img[alt]').forEach(img => {
          const alt = img.alt?.trim();
          if (!alt || alt.includes('Avatar') || alt.includes('logo') || alt.includes('Logo')) {
            return;
          }

          const skillPatterns = [
            'Blood Wave',
            'Decompose',
            'Reap',
            'Blight',
            'Corpse Tendrils',
            'Blood Mist'
          ];
          if (skillPatterns.some(s => alt.includes(s)) && !data.skills.includes(alt)) {
            data.skills.push(alt);
          }

          if (alt.includes('Aspect') && !data.aspects.includes(alt)) {
            data.aspects.push(alt);
          }

          // Known uniques
          if (alt.includes("Kessime's Legacy") || alt.includes('Bloodless Scream')) {
            if (!data.uniques.includes(alt)) data.uniques.push(alt);
          }
        });

        // Extract update date
        const updateEl = document.querySelector('[class*="update"], time, [datetime]');
        if (updateEl) {
          data.lastUpdated = updateEl.textContent?.trim() || updateEl.getAttribute('datetime');
        }

        // Look for update text in page
        const pageText = document.body.innerText;
        const updateMatch = pageText.match(/Updated:\s*([A-Za-z]+ \d+(?:st|nd|rd|th)?, \d{4})/);
        if (updateMatch) {
          data.lastUpdated = updateMatch[1];
        }

        // Extract tier
        const tierMatch = pageText.match(/([A-S])-Tier Build/);
        if (tierMatch) {
          data.tier = tierMatch[1];
        }

        // Extract strengths and weaknesses from lists
        document.querySelectorAll('li').forEach(li => {
          const text = li.textContent?.trim();
          if (text?.startsWith('+')) {
            data.strengths.push(text.substring(1).trim());
          } else if (text?.startsWith('-') && text.length < 100) {
            data.weaknesses.push(text.substring(1).trim());
          }
        });

        return data;
      });

      // Merge direct data
      results.skills = directData.skills;
      results.aspects = directData.aspects;
      results.uniques = directData.uniques;
      results.strengths = directData.strengths;
      results.weaknesses = directData.weaknesses;
      results.lastUpdated = directData.lastUpdated;
      results.tier = directData.tier;

      log.info(
        `Extracted: ${results.skills.length} skills, ${results.aspects.length} aspects, ${results.uniques.length} uniques`
      );
    }
  });

  try {
    await crawler.run();
    // Drop the queue after use to clean up for next run
    await requestQueue.drop();
  } catch (error) {
    console.error('  Crawler error:', error.message);
  }

  return results;
}

export default icyVeinsScraper;
