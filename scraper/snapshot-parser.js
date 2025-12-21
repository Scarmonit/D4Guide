/**
 * Snapshot Parser Utility
 * Parses Playwright accessibility tree snapshots to extract structured data
 */

import { readFileSync } from 'fs';

/**
 * Parse a snapshot markdown file
 * @param {string} filePath - Path to the snapshot.md file
 * @returns {object} Parsed data
 */
export function parseSnapshotFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return parseSnapshot(content);
}

/**
 * Parse snapshot content string
 * @param {string} content - Raw snapshot markdown content
 * @returns {object} Parsed data
 */
export function parseSnapshot(content) {
  const lines = content.split('\n');

  // Extract page metadata
  const urlMatch = content.match(/- Page URL: (.+)/);
  const titleMatch = content.match(/- Page Title: (.+)/);

  const result = {
    url: urlMatch ? urlMatch[1].trim() : null,
    title: titleMatch ? titleMatch[1].trim() : null,
    skills: [],
    aspects: [],
    uniques: [],
    gear: [],
    strengths: [],
    weaknesses: [],
    ratings: {},
    sections: []
  };

  // Find the YAML snapshot section
  const yamlStart = content.indexOf('```yaml');
  const yamlEnd = content.lastIndexOf('```');

  if (yamlStart === -1 || yamlEnd === -1) {
    return result;
  }

  const yamlContent = content.substring(yamlStart + 7, yamlEnd);

  // Extract data based on patterns
  result.skills = extractSkills(yamlContent);
  result.skillAllocations = extractSkillAllocations(yamlContent);
  result.aspects = extractAspects(yamlContent);
  result.uniques = extractUniques(yamlContent);
  result.gear = extractGearTable(yamlContent);
  result.gems = extractGems(yamlContent);
  result.strengths = extractListItems(yamlContent, 'Strengths');
  result.weaknesses = extractListItems(yamlContent, 'Weaknesses');
  result.ratings = extractRatings(yamlContent);
  result.sections = extractSections(yamlContent);
  result.skillRotation = extractSkillRotation(yamlContent);
  result.bookOfTheDead = extractBookOfTheDead(yamlContent);

  return result;
}

/**
 * Extract skill names from skill bar images
 */
function extractSkills(content) {
  const skills = [];
  const skillBarMatch = content.match(/Suggested Skill Bar[\s\S]*?(?=heading|separator)/);

  if (skillBarMatch) {
    // Extract img elements with skill names
    const imgMatches = skillBarMatch[0].matchAll(/img "([^"]+)"/g);
    for (const match of imgMatches) {
      const name = match[1].trim();
      if (name && !skills.includes(name) && !name.includes('Avatar') && !name.includes('Icon')) {
        skills.push(name);
      }
    }
  }

  // Also look for skill bar pattern with generic elements
  const skillGenericMatches = content.matchAll(/generic \[ref=e\d+\]:\s*\n\s*- img "([^"]+)"/g);
  for (const match of skillGenericMatches) {
    const name = match[1].trim();
    if (name && !skills.includes(name) && isValidSkillName(name)) {
      skills.push(name);
    }
  }

  // Extract from skill descriptions (Maxroll format)
  const skillDescMatches = content.matchAll(/‍([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g);
  for (const match of skillDescMatches) {
    const name = match[1].trim();
    if (name && !skills.includes(name) && isValidSkillName(name)) {
      skills.push(name);
    }
  }

  return [...new Set(skills)];
}

/**
 * Check if a name looks like a valid skill name
 */
function isValidSkillName(name) {
  const invalidPatterns = ['Avatar', 'Icon', 'logo', 'Logo', 'Royal', 'Igni', 'necromancer'];
  return !invalidPatterns.some(p => name.includes(p)) && name.length > 2 && name.length < 30;
}

/**
 * Extract aspect names
 */
function extractAspects(content) {
  const aspects = [];

  // Pattern: "Aspect of X" or "X Aspect"
  const aspectMatches = content.matchAll(
    /(?:img|text:?) "?(Aspect of [^"]+|[A-Z][a-z]+ Aspect)"?/g
  );
  for (const match of aspectMatches) {
    let name = match[1].trim();
    // Clean up duplicate names like "Tidal AspectTidal Aspect"
    if (name.length > 20) {
      const half = Math.floor(name.length / 2);
      if (name.substring(0, half) === name.substring(half)) {
        name = name.substring(0, half);
      }
    }
    if (name && !aspects.includes(name)) {
      aspects.push(name);
    }
  }

  // Also extract from link text
  const linkAspectMatches = content.matchAll(/link "([^"]*Aspect[^"]*)"[\s\S]*?text: ([^"\n]+)/g);
  for (const match of linkAspectMatches) {
    const name = match[2]?.trim() || match[1]?.trim();
    if (name && !aspects.includes(name) && name.includes('Aspect')) {
      aspects.push(name);
    }
  }

  return [...new Set(aspects)];
}

/**
 * Extract unique item names
 */
function extractUniques(content) {
  const uniques = [];

  // Look for Required Uniques section
  const requiredMatch = content.match(
    /Required Uniques[\s\S]*?(?=Required Aspects|heading|\n\s*-\s*generic)/
  );
  if (requiredMatch) {
    const imgMatches = requiredMatch[0].matchAll(/img "([^"]+)"/g);
    for (const match of imgMatches) {
      uniques.push(match[1].trim());
    }
    const textMatches = requiredMatch[0].matchAll(/generic \[ref=e\d+\]: ([^\n]+)/g);
    for (const match of textMatches) {
      const name = match[1].trim();
      if (name && name !== 'Required Uniques' && !uniques.includes(name)) {
        uniques.push(name);
      }
    }
  }

  // Also look for Kessime's Legacy and other known uniques
  const knownUniques = ["Kessime's Legacy", 'Bloodless Scream', 'Harlequin Crest'];
  for (const unique of knownUniques) {
    if (content.includes(unique) && !uniques.includes(unique)) {
      uniques.push(unique);
    }
  }

  return [...new Set(uniques)];
}

/**
 * Extract gear table data
 */
function extractGearTable(content) {
  const gear = [];

  // Look for gear table rows
  const rowMatches = content.matchAll(/row "([^"]+)" \[ref=e\d+\]:/g);
  for (const match of rowMatches) {
    const rowText = match[1];
    // Skip header rows
    if (rowText.includes('Gear Slot') || rowText.includes('columnheader')) continue;

    // Parse slot and aspect from row text
    const parts = rowText.split(/\s+/);
    if (parts.length >= 2) {
      const slot = parts[0];
      // Find aspect name in the row
      const aspectMatch = rowText.match(/(Aspect of [A-Za-z\s]+|[A-Za-z]+ Aspect)/);
      const uniqueMatch = rowText.match(/([A-Z][a-z]+'s [A-Za-z]+)/);

      gear.push({
        slot,
        aspect: aspectMatch ? aspectMatch[1] : null,
        unique: uniqueMatch ? uniqueMatch[1] : null,
        raw: rowText.substring(0, 100)
      });
    }
  }

  // Also extract from cell patterns
  const cellMatches = content.matchAll(
    /cell "([^"]+)" \[ref=e\d+\]:\s*\n\s*- (?:strong|link|text)/g
  );
  let _currentSlot = null;
  for (const match of cellMatches) {
    const cellText = match[1];
    if (
      ['Helm', 'Chest', 'Gloves', 'Pants', 'Boots', 'Amulet', 'Ring', 'Weapon'].some(s =>
        cellText.includes(s)
      )
    ) {
      _currentSlot = cellText;
    }
  }

  return gear;
}

/**
 * Extract list items under a specific heading
 */
function extractListItems(content, sectionName) {
  const items = [];

  // Find the section
  const sectionPattern = new RegExp(
    `${sectionName}[\\s\\S]*?list \\[ref=e\\d+\\]:([\\s\\S]*?)(?=generic \\[ref|heading|separator)`,
    'i'
  );
  const sectionMatch = content.match(sectionPattern);

  if (sectionMatch) {
    // Extract listitem content
    const listContent = sectionMatch[1];
    const itemMatches = listContent.matchAll(/listitem[\s\S]*?generic \[ref=e\d+\]: ([^\n]+)/g);
    for (const match of itemMatches) {
      items.push(match[1].trim());
    }

    // Also try simpler pattern
    const simpleMatches = listContent.matchAll(
      /- text: ([+-])\s*\n\s*- generic \[ref=e\d+\]: ([^\n]+)/g
    );
    for (const match of simpleMatches) {
      items.push(match[2].trim());
    }
  }

  return items;
}

/**
 * Extract skill point allocations (e.g., "1/5", "3/3")
 */
function extractSkillAllocations(content) {
  const allocations = [];
  const pattern = /generic \[ref=e\d+\]: (\d+\/\d+)\s*\n\s*- generic \[ref=e\d+\]: ([A-Za-z\s]+)/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const points = match[1];
    const skillName = match[2].trim();
    if (skillName && !skillName.includes('End Game') && skillName.length < 40) {
      allocations.push({ skill: skillName, points });
    }
  }
  return allocations;
}

/**
 * Extract gem recommendations from gear table
 */
function extractGems(content) {
  const gems = [];
  const imgPattern = /img "Royal (Diamond|Ruby|Emerald|Sapphire|Topaz|Amethyst|Skull)"/g;
  let match;
  while ((match = imgPattern.exec(content)) !== null) {
    const gem = 'Royal ' + match[1];
    if (!gems.includes(gem)) {
      gems.push(gem);
    }
  }
  const gearGems = [];
  const slotPattern = /row "(\w+)[^"]*"[^:]*:[\s\S]*?Royal (\w+)/g;
  while ((match = slotPattern.exec(content)) !== null) {
    gearGems.push({ slot: match[1], gem: 'Royal ' + match[2] });
  }
  return { types: [...new Set(gems)], bySlot: gearGems };
}

/**
 * Extract skill rotation instructions
 */
function extractSkillRotation(content) {
  const rotation = [];
  const simpleRotation = content.match(/Simple rotation is as follows: ([^"]+)"/);
  if (simpleRotation) {
    rotation.push(simpleRotation[1].trim());
  }
  return rotation;
}

/**
 * Extract Book of the Dead configuration
 */
function extractBookOfTheDead(content) {
  const config = { warriors: null, mages: null, golem: null };
  const warriorMatch = content.match(
    /sacrifice[\s\S]{0,100}Warriors[\s\S]{0,50}(Reapers|Skirmishers|Defenders)/i
  );
  if (warriorMatch) config.warriors = { type: warriorMatch[1], action: 'sacrifice' };
  const mageMatch = content.match(/sacrifice[\s\S]{0,100}Mages[\s\S]{0,50}(Bone|Shadow|Cold)/i);
  if (mageMatch) config.mages = { type: mageMatch[1], action: 'sacrifice' };
  const golemMatch = content.match(/sacrifice[\s\S]{0,100}Golems[\s\S]{0,50}(Iron|Blood|Bone)/i);
  if (golemMatch) config.golem = { type: golemMatch[1], action: 'sacrifice' };
  return config;
}

/**
 * Extract build ratings (Maxroll format)
 */
function extractRatings(content) {
  const ratings = {};

  const ratingCategories = ['Push', 'Speed', 'Bossing', 'Surviability', 'Playability'];

  for (const category of ratingCategories) {
    const pattern = new RegExp(
      `${category}[\\s\\S]*?generic \\[ref=e\\d+\\]: (Excellent|Great|Good|Moderate|Poor)`,
      'i'
    );
    const match = content.match(pattern);
    if (match) {
      ratings[category.toLowerCase()] = match[1];
    }
  }

  return ratings;
}

/**
 * Extract section headings
 */
function extractSections(content) {
  const sections = [];

  const headingMatches = content.matchAll(/heading "([^"]+)" \[level=(\d)\]/g);
  for (const match of headingMatches) {
    sections.push({
      title: match[1].trim(),
      level: parseInt(match[2])
    });
  }

  return sections;
}

/**
 * Parse Icy Veins specific format
 */
export function parseIcyVeinsSnapshot(filePath) {
  const base = parseSnapshotFile(filePath);
  const content = readFileSync(filePath, 'utf-8');

  // Extract update date
  const updateMatch = content.match(/Updated: ([^"]+)"/);
  if (updateMatch) {
    base.lastUpdated = updateMatch[1].trim();
  }

  // Extract tier
  const tierMatch = content.match(/([A-S])-Tier Build/);
  if (tierMatch) {
    base.tier = tierMatch[1];
  }

  // Extract author
  const authorMatch = content.match(
    /paragraph \[ref=e\d+\]: ([A-Za-z]+TV|[A-Za-z]+ [A-Z])\s*\n\s*- paragraph \[ref=e\d+\]: WRITER/
  );
  if (authorMatch) {
    base.author = authorMatch[1];
  }

  return base;
}

/**
 * Parse Maxroll specific format
 */
export function parseMaxrollSnapshot(filePath) {
  const base = parseSnapshotFile(filePath);
  const content = readFileSync(filePath, 'utf-8');

  // Extract update date
  const updateMatch = content.match(/Last Updated: ([^"]+)"/);
  if (updateMatch) {
    base.lastUpdated = updateMatch[1].trim();
  }

  // Extract author
  const authorMatch = content.match(/link "([A-Za-z]+)" \[ref=e\d+\][\s\S]*?Content Creator/);
  if (authorMatch) {
    base.author = authorMatch[1];
  }

  // Extract season info
  const seasonMatch = content.match(/Season (\d+) - ([^"]+)"/);
  if (seasonMatch) {
    base.season = {
      number: parseInt(seasonMatch[1]),
      name: seasonMatch[2].trim()
    };
  }

  // Extract build variants
  const variantMatches = content.matchAll(
    /listitem \[ref=e\d+\] \[cursor=pointer\]: (Starter|Ancestral|Mythic|Sanctified)/g
  );
  base.variants = [];
  for (const match of variantMatches) {
    base.variants.push(match[1]);
  }

  return base;
}

export default {
  parseSnapshot,
  parseSnapshotFile,
  parseIcyVeinsSnapshot,
  parseMaxrollSnapshot
};
