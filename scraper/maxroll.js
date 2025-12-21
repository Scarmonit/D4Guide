/**
 * Maxroll Scraper
 * Extracts Blood Wave Necromancer build data using accessibility snapshots
 */

import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseMaxrollSnapshot } from './snapshot-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = join(__dirname, '..', '.playwright-mcp');
const SNAPSHOT_FILE = join(SNAPSHOT_DIR, 'maxroll_snapshot.md');

const MAXROLL_BUILD_URL = 'https://maxroll.gg/d4/build-guides/blood-wave-necromancer-guide';

/**
 * Scrape Maxroll Blood Wave Necromancer guide
 */
export async function maxrollScraper() {
  // Ensure snapshot directory exists
  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const results = {
    url: MAXROLL_BUILD_URL,
    scrapedAt: new Date().toISOString(),
    skills: [],
    aspects: [],
    uniques: [],
    gear: [],
    ratings: {},
    variants: [],
    title: null,
    lastUpdated: null,
    author: null,
    season: null
  };

  // First, try to use existing snapshot if available
  if (existsSync(SNAPSHOT_FILE)) {
    console.log('  Using existing snapshot file...');
    try {
      const parsed = parseMaxrollSnapshot(SNAPSHOT_FILE);
      Object.assign(results, parsed);
      results.scrapedAt = new Date().toISOString();
      results.fromCache = true;

      if (parsed.skills.length > 0 || Object.keys(parsed.ratings).length > 0) {
        console.log(
          `  Parsed from cache: ${parsed.skills.length} skills, ${Object.keys(parsed.ratings).length} ratings`
        );
        return results;
      }
    } catch (error) {
      console.log(`  Failed to parse cached snapshot: ${error.message}`);
    }
  }

  // Fallback to live scraping with direct extraction
  // Use named request queue to isolate from other scrapers
  const requestQueue = await RequestQueue.open('maxroll');
  await requestQueue.addRequest({ url: MAXROLL_BUILD_URL });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 1,
    headless: true,
    requestHandlerTimeoutSecs: 120,
    navigationTimeoutSecs: 90,

    async requestHandler({ page, request, log }) {
      log.info(`Processing ${request.url}`);

      // Wait for Maxroll's React app to hydrate
      await page.waitForSelector('article, main', { timeout: 60000 });
      await page.waitForTimeout(5000); // Extra time for dynamic content

      // Get page title
      results.title = await page.title();

      // Direct extraction from page
      const directData = await page.evaluate(() => {
        const data = {
          skills: [],
          aspects: [],
          uniques: [],
          ratings: {},
          variants: [],
          lastUpdated: null,
          author: null,
          season: null
        };

        const pageText = document.body.innerText;

        // Extract skills
        const skillNames = [
          'Blood Wave',
          'Decrepify',
          'Blight',
          'Corpse Explosion',
          'Blood Mist',
          'Bone Storm',
          'Corpse Tendrils'
        ];
        skillNames.forEach(skill => {
          if (pageText.includes(skill) && !data.skills.includes(skill)) {
            data.skills.push(skill);
          }
        });

        // Extract aspects from images and text
        document.querySelectorAll('img[alt*="Aspect"]').forEach(img => {
          const alt = img.alt?.trim();
          if (alt && !data.aspects.includes(alt)) {
            data.aspects.push(alt);
          }
        });

        // Also extract from page text
        const aspectMatches = pageText.match(/(?:Aspect of [A-Za-z\s]+|[A-Za-z]+ Aspect)/g) || [];
        aspectMatches.forEach(aspect => {
          const clean = aspect.trim();
          if (clean && !data.aspects.includes(clean)) {
            data.aspects.push(clean);
          }
        });

        // Extract uniques
        const uniqueNames = ["Kessime's Legacy", 'Bloodless Scream', 'Harlequin Crest'];
        uniqueNames.forEach(unique => {
          if (pageText.includes(unique) && !data.uniques.includes(unique)) {
            data.uniques.push(unique);
          }
        });

        // Extract ratings
        const ratingCategories = ['Push', 'Speed', 'Bossing', 'Surviability', 'Playability'];
        const ratingValues = ['Excellent', 'Great', 'Good', 'Moderate', 'Poor'];

        ratingCategories.forEach(cat => {
          ratingValues.forEach(val => {
            // Look for nearby text
            const pattern = new RegExp(cat + '[\\s\\S]{0,50}' + val, 'i');
            if (pattern.test(pageText)) {
              data.ratings[cat.toLowerCase()] = val;
            }
          });
        });

        // Extract variants
        const variantNames = ['Starter', 'Ancestral', 'Mythic', 'Sanctified'];
        variantNames.forEach(variant => {
          if (pageText.includes(variant) && !data.variants.includes(variant)) {
            data.variants.push(variant);
          }
        });

        // Extract update date
        const updateMatch = pageText.match(/Last Updated:\s*([A-Za-z]+ \d+, \d{4})/);
        if (updateMatch) {
          data.lastUpdated = updateMatch[1];
        }

        // Extract season
        const seasonMatch = pageText.match(/Season (\d+)\s*[-–]\s*([A-Za-z\s]+)/);
        if (seasonMatch) {
          data.season = {
            number: parseInt(seasonMatch[1]),
            name: seasonMatch[2].trim()
          };
        }

        return data;
      });

      // Merge direct data
      results.skills = directData.skills;
      results.aspects = [...new Set(directData.aspects)].slice(0, 20); // Limit to avoid duplicates
      results.uniques = directData.uniques;
      results.ratings = directData.ratings;
      results.variants = directData.variants;
      results.lastUpdated = directData.lastUpdated;
      results.season = directData.season;

      log.info(
        `Extracted: ${results.skills.length} skills, ${Object.keys(results.ratings).length} ratings, ${results.variants.length} variants`
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

export default maxrollScraper;
