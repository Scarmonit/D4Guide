/**
 * D4Guide Source Configuration
 * Defines the authoritative sources to monitor for guide updates
 */

export const SOURCES = {
  maxroll: {
    name: 'Maxroll',
    url: 'https://maxroll.gg/d4/build-guides/blood-wave-necromancer-guide',
    tierListUrl: 'https://maxroll.gg/d4/tier-lists/build-tier-list',
    priority: 1,
    type: 'guide',
    selectors: {
      lastUpdated: '.guide-updated-date',
      version: '.guide-version',
      skillSection: '.skill-bar-section',
      gearSection: '.gear-section'
    }
  },

  icyVeins: {
    name: 'Icy Veins',
    url: 'https://www.icy-veins.com/d4/guides/blood-wave-necromancer-build/',
    priority: 2,
    type: 'guide',
    selectors: {
      lastUpdated: '.guide-info-updated',
      skillSection: '#skill_bar_and_skill_tree_points',
      gearSection: '#gear,_gems,_elixirs_and_stats'
    }
  },

  blizzard: {
    name: 'Blizzard Patch Notes',
    url: 'https://news.blizzard.com/en-us/diablo4',
    rssUrl: 'https://news.blizzard.com/en-us/diablo4/feed',
    priority: 1,
    type: 'news',
    keywords: ['patch', 'hotfix', 'necromancer', 'blood wave', 'balance']
  },

  d4builds: {
    name: 'D4Builds.gg',
    url: 'https://d4builds.gg/builds/?class=Necromancer&sort=popular',
    priority: 3,
    type: 'community',
    selectors: {
      buildCards: '.build-card',
      popularity: '.build-popularity'
    }
  }
};

export const CONTENT_SECTIONS = {
  skills: {
    name: 'Skill Bar & Tree',
    htmlId: 'skill-section',
    priority: 1
  },
  gear: {
    name: 'Gear & Aspects',
    htmlId: 'gear-section',
    priority: 2
  },
  paragon: {
    name: 'Paragon Boards',
    htmlId: 'paragon-section',
    priority: 3
  },
  seasonal: {
    name: 'Season 11 Content',
    htmlId: 'sanctification-section',
    priority: 1
  },
  rotation: {
    name: 'Gameplay Rotation',
    htmlId: 'rotation-section',
    priority: 2
  }
};

export const UPDATE_CONFIG = {
  checkInterval: 6 * 60 * 60 * 1000, // 6 hours in ms
  maxRetries: 3,
  retryDelay: 5000,
  snapshotTimeout: 30000,
  diffThreshold: 0.05 // 5% content change triggers update
};
