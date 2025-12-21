/**
 * D4Guide Web Scraper
 * Automated data extraction from Diablo 4 guide sites
 */

import { icyVeinsScraper } from './icy-veins.js';
import { maxrollScraper } from './maxroll.js';
import { blizzardNewsScraper } from './blizzard-news.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

// Ensure data directory exists
mkdirSync(dataDir, { recursive: true });

/**
 * Main scraper orchestration
 */
async function runScrapers() {
  console.log('🔥 D4Guide Scraper Starting...\n');

  const results = {
    timestamp: new Date().toISOString(),
    sources: {}
  };

  try {
    // Scrape Icy Veins
    console.log('📖 Scraping Icy Veins...');
    results.sources.icyVeins = await icyVeinsScraper();
    console.log('✅ Icy Veins complete\n');
  } catch (error) {
    console.error('❌ Icy Veins failed:', error.message);
    results.sources.icyVeins = { error: error.message };
  }

  try {
    // Scrape Maxroll
    console.log('📖 Scraping Maxroll...');
    results.sources.maxroll = await maxrollScraper();
    console.log('✅ Maxroll complete\n');
  } catch (error) {
    console.error('❌ Maxroll failed:', error.message);
    results.sources.maxroll = { error: error.message };
  }

  try {
    // Scrape Blizzard News for patch notes
    console.log('📖 Scraping Blizzard News...');
    results.sources.blizzard = await blizzardNewsScraper();
    console.log('✅ Blizzard News complete\n');
  } catch (error) {
    console.error('❌ Blizzard News failed:', error.message);
    results.sources.blizzard = { error: error.message };
  }

  // Validate results
  validateScrapedData(results);

  // Save combined results
  const outputPath = join(dataDir, 'scraped-data.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Data saved to ${outputPath}`);

  return results;
}

/**
 * Validate scraped data and warn about missing key fields
 */
function validateScrapedData(results) {
  console.log('\n🔍 Validating scraped data...');
  let issues = 0;

  // Check Icy Veins
  if (results.sources.icyVeins) {
    if (!results.sources.icyVeins.skills || results.sources.icyVeins.skills.length === 0) {
      console.warn('   ⚠️  Icy Veins: No skills found');
      issues++;
    }
    if (!results.sources.icyVeins.uniques || results.sources.icyVeins.uniques.length === 0) {
      console.warn('   ⚠️  Icy Veins: No uniques found');
      issues++;
    }
  }

  // Check Maxroll
  if (results.sources.maxroll) {
    if (
      !results.sources.maxroll.ratings ||
      Object.keys(results.sources.maxroll.ratings).length === 0
    ) {
      console.warn('   ⚠️  Maxroll: No ratings found');
      issues++;
    }
  }

  if (issues === 0) {
    console.log('   ✅ Data looks healthy');
  } else {
    console.log(`   ⚠️  Found ${issues} potential data issues`);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runScrapers()
    .then(() => {
      console.log('\n🎉 Scraping complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Scraping failed:', error);
      process.exit(1);
    });
}

export { runScrapers };
