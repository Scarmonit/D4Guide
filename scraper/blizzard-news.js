/**
 * Blizzard Patch Notes Scraper
 * Extracts Diablo 4 patch notes relevant to Blood Wave Necromancer
 */

import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = join(__dirname, '..', '.playwright-mcp');
const CACHE_FILE = join(SNAPSHOT_DIR, 'blizzard_news_cache.json');

// Blizzard news URLs - try both the main site and news page
const BLIZZARD_URLS = [
  'https://news.blizzard.com/en-us/diablo4',
  'https://diablo4.blizzard.com/en-us/'
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
  'blood mist',
  'patch',
  'hotfix',
  'update'
];

/**
 * Scrape Blizzard news for Diablo 4
 */
export async function blizzardNewsScraper() {
  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const results = {
    scrapedAt: new Date().toISOString(),
    patches: [],
    news: [],
    relevantChanges: [],
    latestPatch: null,
    season: null
  };

  // Check cache first (valid for 6 hours)
  if (existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
      const cacheAge = Date.now() - new Date(cached.scrapedAt).getTime();
      const sixHours = 6 * 60 * 60 * 1000;

      if (cacheAge < sixHours && cached.news?.length > 0) {
        console.log('  Using cached Blizzard news...');
        return { ...cached, fromCache: true };
      }
    } catch {
      // Cache invalid, continue with fresh scrape
    }
  }

  // Use named request queue to isolate from other scrapers
  const requestQueue = await RequestQueue.open('blizzard-news');
  for (const url of BLIZZARD_URLS) {
    await requestQueue.addRequest({ url });
  }

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 2,
    headless: true,
    requestHandlerTimeoutSecs: 90,
    navigationTimeoutSecs: 60,

    async requestHandler({ page, request, log }) {
      log.info('Processing: ' + request.url);
      const isNewsPage = request.url.includes('news.blizzard.com');

      try {
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // For news page, wait for custom web components to load
        if (isNewsPage) {
          try {
            await page.waitForSelector('blz-news-card', { timeout: 10000 });
            await page.waitForTimeout(2000); // Allow images to populate
          } catch {
            log.info('blz-news-card not found, trying fallback selectors');
          }
        }
        await page.waitForTimeout(3000);

        // Extract data directly from the page
        const pageData = await page.evaluate(isNews => {
          const data = {
            news: [],
            season: null,
            patchNotesUrl: null
          };

          // Handle Blizzard news page with custom web components (blz-news-card)
          if (isNews) {
            const cards = document.querySelectorAll('blz-news-card');
            cards.forEach(card => {
              const link = card.querySelector('a');
              const image = card.querySelector('blz-image');
              const timestamp = card.querySelector('blz-timestamp');

              const title = image?.getAttribute('alt') || '';
              if (title) {
                const lowerTitle = title.toLowerCase();
                const isPatch = lowerTitle.includes('patch') || lowerTitle.includes('hotfix');

                data.news.push({
                  title,
                  url: link?.href || null,
                  date: timestamp?.getAttribute('datetime') || null,
                  type: isPatch ? 'patch' : 'news'
                });
              }
            });
          }

          // Extract all news links (works on main site)
          const newsLinks = document.querySelectorAll('a[href*="news.blizzard.com/en-us/article"]');
          newsLinks.forEach(link => {
            const heading = link.querySelector('h4, h3, h2');
            if (heading) {
              const title = heading.textContent.trim();
              // Avoid duplicates
              if (!data.news.find(n => n.title === title)) {
                data.news.push({
                  title,
                  url: link.href,
                  type: 'news'
                });
              }
            }
          });

          // Look for patch notes link
          const patchLink = document.querySelector('a[href*="patch"], [class*="patch"]');
          if (patchLink) {
            data.patchNotesUrl = patchLink.href;
          }

          // Extract season info from page
          const seasonText = document.body.innerText;
          const seasonMatch = seasonText.match(/Season of ([A-Za-z\s]+)/);
          if (seasonMatch) {
            data.season = seasonMatch[1].trim();
          }

          // Also look for any text mentioning patches/updates
          const headings = document.querySelectorAll('h1, h2, h3, h4');
          headings.forEach(h => {
            const text = h.textContent.trim().toLowerCase();
            if (
              (text.includes('patch') || text.includes('hotfix') || text.includes('update')) &&
              !data.news.find(n => n.title.toLowerCase() === text)
            ) {
              // Find parent link if exists
              const parentLink = h.closest('a');
              data.news.push({
                title: h.textContent.trim(),
                url: parentLink ? parentLink.href : null,
                type: text.includes('patch')
                  ? 'patch'
                  : text.includes('hotfix')
                    ? 'hotfix'
                    : 'update'
              });
            }
          });

          return data;
        }, isNewsPage);

        // Merge news from this page (avoid duplicates by title)
        for (const item of pageData.news) {
          if (!results.news.find(n => n.title === item.title)) {
            results.news.push(item);
          }
        }

        // Keep season info if found
        if (pageData.season && !results.season) {
          results.season = pageData.season;
        }

        // Update patches list
        results.patches = results.news.filter(
          n =>
            n.type === 'patch' ||
            n.type === 'hotfix' ||
            n.title.toLowerCase().includes('patch') ||
            n.title.toLowerCase().includes('hotfix')
        );

        log.info(
          'Found ' +
            pageData.news.length +
            ' news on this page, total: ' +
            results.news.length +
            ' news, ' +
            results.patches.length +
            ' patches'
        );
      } catch (error) {
        log.warning('Extraction error: ' + error.message);

        // Fallback: extract from page text
        try {
          const bodyText = await page.evaluate(() => document.body.innerText);

          // Look for season info
          const seasonMatch = bodyText.match(/Season of ([A-Za-z\s]+)/);
          if (seasonMatch) {
            results.season = seasonMatch[1].trim();
          }

          // Extract any visible news titles
          const titles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h2, h3, h4'))
              .map(h => h.textContent.trim())
              .filter(t => t.length > 10 && t.length < 100);
          });

          // Merge fallback titles (avoid duplicates)
          for (const title of titles.slice(0, 10)) {
            if (!results.news.find(n => n.title === title)) {
              results.news.push({ title, url: null, type: 'news' });
            }
          }
        } catch {
          log.warning('Fallback extraction also failed');
        }
      }
    }
  });

  try {
    await crawler.run();
    // Drop the queue after use to clean up for next run
    await requestQueue.drop();

    // Set latest patch
    if (results.patches.length > 0) {
      results.latestPatch = results.patches[0];
    } else if (results.news.length > 0) {
      // Use latest news if no specific patch found
      results.latestPatch = results.news[0];
    }

    // Save to cache
    const { writeFileSync } = await import('fs');
    writeFileSync(CACHE_FILE, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('  Blizzard news crawler error:', error.message);
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
