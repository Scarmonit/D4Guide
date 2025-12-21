/**
 * Blizzard Patch Notes Scraper
 * Extracts Diablo 4 patch notes relevant to Blood Wave Necromancer
 */

import { PlaywrightCrawler } from 'crawlee';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = join(__dirname, '..', '.playwright-mcp');

// Blizzard news URLs for Diablo 4
const BLIZZARD_NEWS_URLS = [
  'https://news.blizzard.com/en-us/diablo4',
  'https://diablo4.blizzard.com/en-us/news'
];

// Keywords to filter relevant patch notes
const RELEVANT_KEYWORDS = [
  'blood wave',
  'necromancer',
  'book of the dead',
  'corpse',
  'blood orb',
  'overpower',
  'ultimate skill',
  'minion',
  'shadow damage',
  'blight',
  'decrepify',
  'blood mist'
];

/**
 * Scrape Blizzard patch notes for D4
 */
export async function blizzardNewsScraper() {
  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const results = {
    scrapedAt: new Date().toISOString(),
    patches: [],
    relevantChanges: [],
    latestPatch: null
  };

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 3,
    headless: true,
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 45,

    async requestHandler({ page, request, log }) {
      log.info('Processing Blizzard news: ' + request.url);

      try {
        await page.waitForSelector('article, .ArticleListItem, .news-item', { timeout: 30000 });
        await page.waitForTimeout(2000);

        // Extract patch notes from page
        const pageData = await page.evaluate(() => {
          const patches = [];

          // Try various selectors for news articles
          const articles = document.querySelectorAll(
            'article, .ArticleListItem, .news-item, [class*="article"]'
          );

          articles.forEach(article => {
            const titleEl = article.querySelector('h1, h2, h3, .title, [class*="title"]');
            const dateEl = article.querySelector('time, .date, [class*="date"]');
            const linkEl = article.querySelector(
              'a[href*="patch"], a[href*="hotfix"], a[href*="update"]'
            );

            if (titleEl) {
              const title = titleEl.textContent.trim();
              const lowerTitle = title.toLowerCase();

              // Filter for patch notes
              if (
                lowerTitle.includes('patch') ||
                lowerTitle.includes('hotfix') ||
                lowerTitle.includes('update')
              ) {
                patches.push({
                  title,
                  date: dateEl ? dateEl.textContent.trim() : null,
                  url: linkEl ? linkEl.href : null
                });
              }
            }
          });

          return patches;
        });

        results.patches.push(...pageData);
        log.info('Found ' + pageData.length + ' patch articles');
      } catch (error) {
        log.warning('Failed to extract from ' + request.url + ': ' + error.message);
      }
    }
  });

  try {
    await crawler.run(BLIZZARD_NEWS_URLS);
  } catch (error) {
    console.error('  Blizzard news crawler error:', error.message);
  }

  // Set latest patch
  if (results.patches.length > 0) {
    results.latestPatch = results.patches[0];
  }

  return results;
}

/**
 * Filter changes relevant to Blood Wave Necromancer
 */
export function filterRelevantChanges(patchNotes) {
  const relevant = [];

  for (const note of patchNotes) {
    const lowerText = (note.text || note.title || '').toLowerCase();

    for (const keyword of RELEVANT_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        relevant.push({
          ...note,
          matchedKeyword: keyword
        });
        break;
      }
    }
  }

  return relevant;
}

export default blizzardNewsScraper;
