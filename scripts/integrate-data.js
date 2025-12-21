/**
 * Data Integration Script
 * Integrates scraped data from Icy Veins and Maxroll into the guide HTML
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const DATA_FILE = join(ROOT_DIR, 'data', 'scraped-data.json');
const HTML_FILE = join(ROOT_DIR, 'blood_wave_necro_guide_advanced.html');
const PROTECTED_FIELDS_FILE = join(ROOT_DIR, 'protected-fields.json');

// Protected fields configuration (loaded at runtime)
let protectedFields = null;

/**
 * Load protected fields configuration
 */
function loadProtectedFields() {
  if (protectedFields !== null) return protectedFields;

  if (existsSync(PROTECTED_FIELDS_FILE)) {
    try {
      protectedFields = JSON.parse(readFileSync(PROTECTED_FIELDS_FILE, 'utf-8'));
      console.log('🛡️  Loaded protected fields configuration');
    } catch (e) {
      console.warn('⚠️  Failed to load protected fields:', e.message);
      protectedFields = { gearSlots: {}, protectedPatterns: [] };
    }
  } else {
    protectedFields = { gearSlots: {}, protectedPatterns: [] };
  }

  return protectedFields;
}

/**
 * Check if a scraped value should be rejected (matches bad patterns)
 */
function isInvalidScrapedValue(field, value) {
  const config = loadProtectedFields();
  if (!config.protectedPatterns) return false;

  for (const pattern of config.protectedPatterns) {
    if (pattern.field === field) {
      const regex = new RegExp(pattern.pattern);
      if (regex.test(value)) {
        console.log(`   ⚠️  Rejected invalid ${field}: "${value}" (${pattern.reason})`);
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a gear slot is protected
 */
function isGearSlotProtected(slot) {
  const config = loadProtectedFields();
  return config.gearSlots && config.gearSlots[slot] !== undefined;
}

/**
 * Get protected value for a gear slot
 */
function getProtectedGearValue(slot) {
  const config = loadProtectedFields();
  return config.gearSlots?.[slot] || null;
}

// Rating colors and priority order
const RATING_COLORS = {
  Excellent: 'var(--green)',
  Great: 'var(--green)',
  Good: 'var(--blue)',
  Moderate: 'var(--orange)',
  Poor: 'var(--blood-red)'
};

const RATING_ORDER = ['Excellent', 'Great', 'Good', 'Moderate', 'Poor'];

/**
 * Main integration function
 */
export async function integrateData() {
  console.log('📊 Integrating scraped data into guide...\n');

  // Load protected fields early
  loadProtectedFields();

  // Check if data file exists
  if (!existsSync(DATA_FILE)) {
    console.error('❌ No scraped data found. Run "npm run scrape" first.');
    return false;
  }

  // Load data
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const icyVeins = data.sources?.icyVeins || {};
  const maxroll = data.sources?.maxroll || {};
  const blizzard = data.sources?.blizzard || {};

  console.log('📖 Data sources:');
  console.log(
    `   Icy Veins: ${icyVeins.skills?.length || 0} skills, ${icyVeins.aspects?.length || 0} aspects`
  );
  console.log(
    `   Maxroll: ${Object.keys(maxroll.ratings || {}).length} ratings, ${maxroll.variants?.length || 0} variants`
  );
  console.log(`   Blizzard: ${blizzard.patches?.length || 0} patches\n`);

  // Load HTML
  let html = readFileSync(HTML_FILE, 'utf-8');

  // Update last updated date
  html = updateLastUpdated(html, icyVeins, maxroll);

  // Update build ratings
  html = updateBuildRatings(html, maxroll.ratings);

  // Update tier badge
  html = updateTierBadge(html, icyVeins.tier);

  // Update required uniques
  html = updateRequiredUniques(html, icyVeins.uniques);

  // Update aspects list
  html = updateAspectsList(html, icyVeins.aspects);

  // Update season info
  html = updateSeasonInfo(html, maxroll.season);

  // Update variants
  html = updateBuildVariants(html, maxroll.variants);

  // Update gear slots with scraped data
  html = updateGearSlots(html, icyVeins.gear);

  // Update gems recommendations
  html = updateGems(html, icyVeins.gems);

  // Update skill rotation
  html = updateSkillRotation(html, maxroll.skillRotation);

  // Update Book of the Dead
  html = updateBookOfTheDead(html, maxroll.bookOfTheDead);

  // Update patch notes section
  html = updatePatchNotes(html, blizzard);

  // Add data freshness indicator
  html = addDataFreshnessIndicator(html, data.timestamp);

  // Add/update data sources footer
  html = updateDataSourcesFooter(html, icyVeins, maxroll, data.timestamp);

  // Save updated HTML
  writeFileSync(HTML_FILE, html);
  console.log('✅ Guide updated successfully!\n');

  // Print summary
  printUpdateSummary(icyVeins, maxroll);

  return true;
}

/**
 * Update last updated date
 */
function updateLastUpdated(html, icyVeins, maxroll) {
  // Use the most recent date from either source
  const icyDate = parseDate(icyVeins.lastUpdated);
  const maxDate = parseDate(maxroll.lastUpdated);

  let latestDate = new Date();
  let latestSource = 'Auto-Synced';

  if (icyDate && maxDate) {
    latestDate = icyDate > maxDate ? icyDate : maxDate;
    latestSource = icyDate > maxDate ? 'Icy Veins' : 'Maxroll';
  } else if (icyDate) {
    latestDate = icyDate;
    latestSource = 'Icy Veins';
  } else if (maxDate) {
    latestDate = maxDate;
    latestSource = 'Maxroll';
  }

  const formattedDate = formatDate(latestDate);

  // Update the date span
  html = html.replace(
    /<span id="last-updated-date">[^<]*<\/span>/,
    `<span id="last-updated-date">${formattedDate}</span>`
  );

  console.log(`   ✓ Last updated: ${formattedDate} (${latestSource})`);
  return html;
}

/**
 * Update build ratings from Maxroll
 */
function updateBuildRatings(html, ratings) {
  if (!ratings || Object.keys(ratings).length === 0) {
    console.log('   ⚠ No ratings data available');
    return html;
  }

  const ratingMap = {
    push: { label: 'Pit Push', icon: 'fa-mountain' },
    speed: { label: 'Speed', icon: 'fa-bolt' },
    bossing: { label: 'Bossing', icon: 'fa-skull-crossbones' },
    surviability: { label: 'Survivability', icon: 'fa-shield-alt' },
    survivability: { label: 'Survivability', icon: 'fa-shield-alt' }
  };

  for (const [key, value] of Object.entries(ratings)) {
    const info = ratingMap[key];
    if (!info) continue;

    const color = RATING_COLORS[value] || 'var(--text-secondary)';

    // Find and replace the stat card for this rating
    const cardPattern = new RegExp(
      `(<div class="stat-card"[^>]*border-top:[^"]*">\\s*<div class="stat-value"[^>]*>)[^<]*(</div>\\s*<div class="stat-label">\\s*<i class="fas ${info.icon}"></i>\\s*${info.label}\\s*</div>)`,
      'i'
    );

    html = html.replace(cardPattern, (match, before, after) => {
      return `<div class="stat-card" style="border-top: 3px solid ${color}">
            <div class="stat-value" style="color: ${color}">${value}</div>
            <div class="stat-label"><i class="fas ${info.icon}"></i> ${info.label}</div>`;
    });
  }

  console.log(`   ✓ Updated ${Object.keys(ratings).length} build ratings`);
  return html;
}

/**
 * Update tier badge
 */
function updateTierBadge(html, tier) {
  if (!tier) return html;

  html = html.replace(
    /<span class="tier-badge">[^<]*<\/span>/,
    `<span class="tier-badge">${tier}-TIER</span>`
  );

  console.log(`   ✓ Tier badge: ${tier}-TIER`);
  return html;
}

/**
 * Update required uniques in the requirements box
 */
function updateRequiredUniques(html, uniques) {
  if (!uniques || uniques.length === 0) return html;

  // Clean up unique names (remove duplicates and trailing content)
  const cleanUniques = [
    ...new Set(
      uniques.map(u => {
        // Remove duplicate names like "Kessime's LegacyKessime's Legacy"
        const half = Math.floor(u.length / 2);
        if (u.length > 20 && u.substring(0, half) === u.substring(half)) {
          return u.substring(0, half);
        }
        return u.split('\n')[0].trim();
      })
    )
  ].filter(u => u.length > 0 && u.length < 50);

  // Update requirement items with crown icon (these are uniques)
  let updatedCount = 0;
  cleanUniques.forEach((unique, index) => {
    if (index < 2) {
      // Only update first 2 uniques
      const pattern = new RegExp(
        '(<div class="requirement-item critical">\\s*<i class="fas fa-crown"><\\/i>\\s*<div>\\s*<strong[^>]*>)[^<]*(</strong>)',
        'g'
      );

      let matchIndex = 0;
      html = html.replace(pattern, (match, before, after) => {
        if (matchIndex === index) {
          matchIndex++;
          updatedCount++;
          return `${before}${unique}${after}`;
        }
        matchIndex++;
        return match;
      });
    }
  });

  if (updatedCount > 0) {
    console.log(`   ✓ Updated ${updatedCount} required uniques`);
  }
  return html;
}

/**
 * Update aspects list
 */
function updateAspectsList(html, aspects) {
  if (!aspects || aspects.length === 0) return html;

  // Clean aspect names
  const cleanAspects = [
    ...new Set(
      aspects.map(a => {
        // Get first line and clean duplicates
        let name = a.split('\n')[0].trim();
        const half = Math.floor(name.length / 2);
        if (name.length > 30 && name.substring(0, half) === name.substring(half)) {
          name = name.substring(0, half);
        }
        return name;
      })
    )
  ].filter(a => a.includes('Aspect') && a.length < 50);

  // Find core aspects (mentioned in requirements)
  const coreAspects = cleanAspects.filter(
    a =>
      a.includes('Tidal') ||
      a.includes('Blood-bathed') ||
      a.includes('Grasping Veins') ||
      a.includes('Ultimate Shadow')
  );

  console.log(`   ✓ Found ${cleanAspects.length} aspects (${coreAspects.length} core)`);
  return html;
}

/**
 * Update season info
 */
function updateSeasonInfo(html, season) {
  if (!season) return html;

  const seasonNum = season.number || 11;
  const seasonName = (season.name || 'Divine Intervention').split('\n')[0].trim();

  // Update season references in the HTML
  html = html.replace(/Season \d+ - [A-Za-z\s]+/g, `Season ${seasonNum} - ${seasonName}`);

  console.log(`   ✓ Season: ${seasonNum} - ${seasonName}`);
  return html;
}

/**
 * Update build variants
 */
function updateBuildVariants(html, variants) {
  if (!variants || variants.length === 0) return html;

  // Just log the variants for now - the HTML already has these
  console.log(`   ✓ Variants: ${variants.join(', ')}`);
  return html;
}

/**
 * Update gear slots with scraped aspect data
 */
function updateGearSlots(html, gearData) {
  if (!gearData || gearData.length === 0) return html;

  // Map scraped gear to slot names
  const gearMap = {};
  gearData.forEach(item => {
    if (item.slot && item.aspect) {
      const slotKey = item.slot.toLowerCase();
      gearMap[slotKey] = {
        aspect: cleanAspectName(item.aspect),
        unique: item.unique ? cleanUniqueName(item.unique) : null
      };
    }
  });

  // Update gear slots in HTML
  let updatedCount = 0;
  let skippedCount = 0;

  // Update aspect names in gear slots
  for (const [slot, data] of Object.entries(gearMap)) {
    if (!data.aspect) continue;

    // Check if this slot is protected
    if (isGearSlotProtected(slot)) {
      const protectedValue = getProtectedGearValue(slot);
      console.log(`   🛡️  Skipping protected slot: ${slot} (keeping "${protectedValue.aspect}")`);
      skippedCount++;
      continue;
    }

    // Check if the scraped value is invalid
    if (isInvalidScrapedValue('aspect', data.aspect)) {
      skippedCount++;
      continue;
    }

    // Match gear slot div and update aspect name
    const slotPattern = new RegExp(
      `(<div class="gear-slot"[^>]*data-gear="${slot}"[^>]*>[\\s\\S]*?<span class="aspect-name">)([^<]*)(</span>)`,
      'i'
    );

    if (slotPattern.test(html)) {
      html = html.replace(slotPattern, `$1${data.aspect}$3`);
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    console.log(`   ✓ Updated ${updatedCount} gear slots with aspects`);
  }
  if (skippedCount > 0) {
    console.log(`   🛡️  Protected ${skippedCount} gear slots from overwrites`);
  }

  return html;
}

/**
 * Clean aspect name from scraped data
 */
function cleanAspectName(name) {
  if (!name) return '';
  let clean = name.split('\n')[0].trim();
  // Remove duplicates like "Tidal AspectTidal Aspect"
  const half = Math.floor(clean.length / 2);
  if (clean.length > 20 && clean.substring(0, half) === clean.substring(half)) {
    clean = clean.substring(0, half);
  }
  return clean;
}

/**
 * Clean unique name from scraped data
 */
function cleanUniqueName(name) {
  if (!name) return '';
  let clean = name.split('\n')[0].trim();
  // Remove duplicates
  const half = Math.floor(clean.length / 2);
  if (clean.length > 15 && clean.substring(0, half) === clean.substring(half)) {
    clean = clean.substring(0, half);
  }
  return clean;
}

/**
 * Update gems recommendations
 */
function updateGems(html, gemsData) {
  if (!gemsData || !gemsData.types || gemsData.types.length === 0) return html;

  // Update gem mentions in gear tooltips
  let updatedCount = 0;
  for (const gemInfo of gemsData.bySlot || []) {
    const slotPattern = new RegExp(
      `(data-gear="${gemInfo.slot.toLowerCase()}"[^>]*>[\\s\\S]*?<span class="gem-type">)([^<]*)(</span>)`,
      'i'
    );
    if (slotPattern.test(html)) {
      html = html.replace(slotPattern, `$1${gemInfo.gem}$3`);
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    console.log(`   ✓ Updated ${updatedCount} gem slots`);
  } else if (gemsData.types.length > 0) {
    console.log(`   ✓ Gems found: ${gemsData.types.join(', ')}`);
  }

  return html;
}

/**
 * Update skill rotation text
 */
function updateSkillRotation(html, rotation) {
  if (!rotation || rotation.length === 0) return html;

  // Find and update rotation section if it exists
  const rotationPattern = /(<div[^>]*id="skill-rotation"[^>]*>[\s\S]*?<p[^>]*>)([^<]*)(<\/p>)/i;
  if (rotationPattern.test(html)) {
    html = html.replace(rotationPattern, `$1${rotation[0]}$3`);
    console.log('   ✓ Updated skill rotation');
  } else {
    console.log(`   ✓ Rotation: ${rotation[0].substring(0, 50)}...`);
  }

  return html;
}

/**
 * Update patch notes section
 */
function updatePatchNotes(html, blizzardData) {
  if (!blizzardData || !blizzardData.patches || blizzardData.patches.length === 0) {
    return html;
  }

  const latestPatch = blizzardData.latestPatch || blizzardData.patches[0];

  // Update latest patch info if element exists
  const patchPattern = /(<div[^>]*id="latest-patch"[^>]*>[\s\S]*?<h4[^>]*>)([^<]*)(<\/h4>)/i;
  if (patchPattern.test(html)) {
    html = html.replace(patchPattern, `$1${latestPatch.title}$3`);
  }

  // Update patch date
  const datePattern =
    /(<div[^>]*id="latest-patch"[^>]*>[\s\S]*?<span class="patch-date">)([^<]*)(<\/span>)/i;
  if (datePattern.test(html) && latestPatch.date) {
    html = html.replace(datePattern, `$1${latestPatch.date}$3`);
  }

  console.log(`   ✓ Latest patch: ${latestPatch.title || 'Found'}`);
  return html;
}

/**
 * Update Book of the Dead configuration
 */
function updateBookOfTheDead(html, bookConfig) {
  if (!bookConfig) return html;

  const updates = [];

  // Update warriors section
  if (bookConfig.warriors) {
    const warriorPattern =
      /(<div[^>]*data-minion="warriors"[^>]*>[\s\S]*?<span class="sacrifice-type">)([^<]*)(<\/span>)/i;
    if (warriorPattern.test(html)) {
      html = html.replace(warriorPattern, `$1${bookConfig.warriors.type}$3`);
      updates.push(`Warriors: ${bookConfig.warriors.type}`);
    }
  }

  // Update mages section
  if (bookConfig.mages) {
    const magePattern =
      /(<div[^>]*data-minion="mages"[^>]*>[\s\S]*?<span class="sacrifice-type">)([^<]*)(<\/span>)/i;
    if (magePattern.test(html)) {
      html = html.replace(magePattern, `$1${bookConfig.mages.type}$3`);
      updates.push(`Mages: ${bookConfig.mages.type}`);
    }
  }

  // Update golem section
  if (bookConfig.golem) {
    const golemPattern =
      /(<div[^>]*data-minion="golem"[^>]*>[\s\S]*?<span class="sacrifice-type">)([^<]*)(<\/span>)/i;
    if (golemPattern.test(html)) {
      html = html.replace(golemPattern, `$1${bookConfig.golem.type}$3`);
      updates.push(`Golem: ${bookConfig.golem.type}`);
    }
  }

  if (updates.length > 0) {
    console.log(`   ✓ Book of the Dead: ${updates.join(', ')}`);
  }

  return html;
}

/**
 * Update data sources footer
 */
function updateDataSourcesFooter(html, icyVeins, maxroll, timestamp) {
  const syncTime = new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const footerHtml = `
    <!-- Data Sources (Auto-Generated) -->
    <div id="data-sources-footer" class="section" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); margin-top: 30px;">
      <h3 style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 15px;">
        <i class="fas fa-database"></i> Data Sources
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 0.85em;">
        <div>
          <strong style="color: var(--gold);">Icy Veins</strong>
          <p style="color: var(--text-muted); margin: 5px 0;">
            ${icyVeins.skills?.length || 0} skills • ${icyVeins.aspects?.length || 0} aspects
          </p>
          <a href="${icyVeins.url || '#'}" target="_blank" rel="noopener" style="color: var(--primary-red); font-size: 0.8em;">
            View Source →
          </a>
        </div>
        <div>
          <strong style="color: var(--gold);">Maxroll</strong>
          <p style="color: var(--text-muted); margin: 5px 0;">
            ${Object.keys(maxroll.ratings || {}).length} ratings • ${maxroll.variants?.length || 0} variants
          </p>
          <a href="${maxroll.url || '#'}" target="_blank" rel="noopener" style="color: var(--primary-red); font-size: 0.8em;">
            View Source →
          </a>
        </div>
        <div>
          <strong style="color: var(--text-secondary);">Last Synced</strong>
          <p style="color: var(--text-muted); margin: 5px 0;">
            ${syncTime}
          </p>
          <span style="color: var(--green); font-size: 0.8em;">
            <i class="fas fa-check-circle"></i> Auto-Updated
          </span>
        </div>
      </div>
    </div>`;

  // Remove existing footer if present
  html = html.replace(
    /\s*<!-- Data Sources \(Auto-Generated\) -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
    ''
  );

  // Find the closing </main> or last </section> before </body>
  const insertPoint = html.lastIndexOf('</section>');
  if (insertPoint !== -1) {
    // Find the next closing tag after the last section
    const afterSection = html.substring(insertPoint + 10);
    const nextCloseDiv = afterSection.indexOf('</div>');

    if (nextCloseDiv !== -1) {
      const insertPosition = insertPoint + 10 + nextCloseDiv;
      html = html.substring(0, insertPosition) + footerHtml + html.substring(insertPosition);
      console.log('   ✓ Added data sources footer');
    }
  }

  return html;
}

/**
 * Add data freshness indicator
 */
function addDataFreshnessIndicator(html, timestamp) {
  const freshness = new Date(timestamp);
  const now = new Date();
  const hoursAgo = Math.floor((now - freshness) / (1000 * 60 * 60));

  let freshnessText = 'Just now';
  if (hoursAgo > 0 && hoursAgo < 24) {
    freshnessText = `${hoursAgo}h ago`;
  } else if (hoursAgo >= 24) {
    freshnessText = `${Math.floor(hoursAgo / 24)}d ago`;
  }

  // Update the auto-sync badge
  html = html.replace(
    /<i class="fas fa-robot"><\/i> Auto-Synced/,
    `<i class="fas fa-robot"></i> Synced ${freshnessText}`
  );

  return html;
}

/**
 * Helper: Parse date string
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Clean up date string
  const cleaned = dateStr
    .split('\n')[0]
    .trim()
    .replace(/(\d+)(st|nd|rd|th)/, '$1')
    .replace(' at ', ' ');

  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Helper: Format date
 */
function formatDate(date) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Print update summary
 */
function printUpdateSummary(icyVeins, maxroll) {
  console.log('📋 Integration Summary:');
  console.log('─'.repeat(40));

  if (icyVeins.tier) {
    console.log(`   Build Tier: ${icyVeins.tier}-TIER`);
  }

  if (maxroll.ratings) {
    console.log('   Ratings:');
    for (const [key, value] of Object.entries(maxroll.ratings)) {
      console.log(`     - ${key}: ${value}`);
    }
  }

  if (icyVeins.uniques?.length) {
    console.log(`   Required Uniques: ${icyVeins.uniques.slice(0, 3).join(', ')}`);
  }

  console.log('─'.repeat(40));
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  integrateData()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Integration failed:', error);
      process.exit(1);
    });
}

export default integrateData;
