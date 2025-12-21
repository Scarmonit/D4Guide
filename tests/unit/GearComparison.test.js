/**
 * Unit tests for GearComparison module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../src/js/utils/dom.js';
import {
  formatSlotName,
  isValidSlot,
  getItemCardInfo,
  filterItemsByRarity,
  sortItemsByName,
  clearElement,
  VALID_SLOTS
} from '../../src/js/modules/GearComparison.js';

describe('GearComparison', () => {
  describe('VALID_SLOTS constant', () => {
    it('should contain all expected gear slots', () => {
      expect(VALID_SLOTS).toContain('helmet');
      expect(VALID_SLOTS).toContain('chest');
      expect(VALID_SLOTS).toContain('gloves');
      expect(VALID_SLOTS).toContain('pants');
      expect(VALID_SLOTS).toContain('boots');
      expect(VALID_SLOTS).toContain('amulet');
      expect(VALID_SLOTS).toContain('ring1');
      expect(VALID_SLOTS).toContain('ring2');
      expect(VALID_SLOTS).toContain('weapon');
    });

    it('should have exactly 9 slots', () => {
      expect(VALID_SLOTS.length).toBe(9);
    });
  });

  describe('formatSlotName()', () => {
    it('should capitalize single word', () => {
      expect(formatSlotName('helmet')).toBe('Helmet');
    });

    it('should format hyphenated words', () => {
      expect(formatSlotName('head-armor')).toBe('Head Armor');
    });

    it('should handle multiple hyphens', () => {
      expect(formatSlotName('two-handed-sword')).toBe('Two Handed Sword');
    });

    it('should handle already capitalized input', () => {
      expect(formatSlotName('Helmet')).toBe('Helmet');
    });

    it('should handle empty string', () => {
      expect(formatSlotName('')).toBe('');
    });

    it('should format common gear slots', () => {
      expect(formatSlotName('chest')).toBe('Chest');
      expect(formatSlotName('gloves')).toBe('Gloves');
      expect(formatSlotName('pants')).toBe('Pants');
      expect(formatSlotName('boots')).toBe('Boots');
      expect(formatSlotName('amulet')).toBe('Amulet');
      expect(formatSlotName('ring')).toBe('Ring');
      expect(formatSlotName('main-hand')).toBe('Main Hand');
      expect(formatSlotName('off-hand')).toBe('Off Hand');
    });
  });

  describe('isValidSlot()', () => {
    it('should validate all gear slots', () => {
      VALID_SLOTS.forEach(slot => {
        expect(isValidSlot(slot)).toBe(true);
      });
    });

    it('should reject invalid slots', () => {
      expect(isValidSlot('invalid')).toBe(false);
      expect(isValidSlot('bracers')).toBe(false);
      expect(isValidSlot('')).toBe(false);
    });
  });

  describe('getItemCardInfo()', () => {
    it('should handle complete item data', () => {
      const item = {
        name: 'Harlequin Crest',
        type: 'Helmet',
        rarity: 'unique',
        stats: ['+4 to All Skills', '+20% Damage Reduction'],
        aspect: 'Gain +4 Ranks to all Skills',
        notes: 'Best in slot helmet'
      };

      const info = getItemCardInfo(item);
      expect(info.name).toBe('Harlequin Crest');
      expect(info.type).toBe('Helmet');
      expect(info.rarity).toBe('unique');
      expect(info.hasStats).toBe(true);
      expect(info.statsCount).toBe(2);
      expect(info.hasAspect).toBe(true);
      expect(info.hasNotes).toBe(true);
    });

    it('should handle minimal item data', () => {
      const item = {
        name: 'Basic Helm'
      };

      const info = getItemCardInfo(item);
      expect(info.name).toBe('Basic Helm');
      expect(info.type).toBe('');
      expect(info.rarity).toBe('legendary');
      expect(info.hasStats).toBe(false);
      expect(info.hasAspect).toBe(false);
      expect(info.hasNotes).toBe(false);
    });

    it('should handle empty stats array', () => {
      const item = {
        name: 'Empty Stats Item',
        stats: []
      };

      const info = getItemCardInfo(item);
      expect(info.hasStats).toBe(false);
      expect(info.statsCount).toBe(0);
    });

    it('should handle different rarity values', () => {
      const rarities = ['common', 'magic', 'rare', 'legendary', 'unique', 'mythic'];

      rarities.forEach(rarity => {
        const item = { name: 'Test', rarity };
        const info = getItemCardInfo(item);
        expect(info.rarity).toBe(rarity);
      });
    });
  });

  describe('filterItemsByRarity()', () => {
    const items = [
      { name: 'Common Helm', rarity: 'common' },
      { name: 'Rare Helm', rarity: 'rare' },
      { name: 'Legendary Helm', rarity: 'legendary' },
      { name: 'Unique Helm', rarity: 'unique' },
      { name: 'Default Helm' } // No rarity, defaults to legendary
    ];

    it('should filter by specific rarity', () => {
      const legendary = filterItemsByRarity(items, 'legendary');
      expect(legendary.length).toBe(2); // Legendary Helm + Default Helm
    });

    it('should return empty array for no matches', () => {
      const mythic = filterItemsByRarity(items, 'mythic');
      expect(mythic.length).toBe(0);
    });

    it('should filter unique items', () => {
      const unique = filterItemsByRarity(items, 'unique');
      expect(unique.length).toBe(1);
      expect(unique[0].name).toBe('Unique Helm');
    });
  });

  describe('sortItemsByName()', () => {
    const items = [{ name: 'Zephyr' }, { name: 'Alpha' }, { name: 'Beta' }];

    it('should sort ascending by default', () => {
      const sorted = sortItemsByName(items);
      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[1].name).toBe('Beta');
      expect(sorted[2].name).toBe('Zephyr');
    });

    it('should sort descending when specified', () => {
      const sorted = sortItemsByName(items, false);
      expect(sorted[0].name).toBe('Zephyr');
      expect(sorted[1].name).toBe('Beta');
      expect(sorted[2].name).toBe('Alpha');
    });

    it('should not mutate original array', () => {
      sortItemsByName(items);
      expect(items[0].name).toBe('Zephyr');
    });
  });

  describe('clearElement()', () => {
    beforeEach(() => {
      document.body.textContent = '';
    });

    it('should remove all children from element', () => {
      const container = createElement('div');
      container.appendChild(createElement('p'));
      container.appendChild(createElement('span'));
      container.appendChild(createElement('div'));

      expect(container.children.length).toBe(3);
      clearElement(container);
      expect(container.children.length).toBe(0);
    });

    it('should handle empty element', () => {
      const container = createElement('div');
      expect(() => clearElement(container)).not.toThrow();
    });
  });

  describe('createElement Integration', () => {
    beforeEach(() => {
      document.body.textContent = '';
    });

    it('should create modal structure', () => {
      const modal = createElement('div', {
        id: 'gear-modal',
        className: 'modal hidden'
      });

      expect(modal.id).toBe('gear-modal');
      expect(modal.classList.contains('modal')).toBe(true);
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should create close button with aria label', () => {
      const closeBtn = createElement('button', {
        className: 'modal-close',
        'aria-label': 'Close modal'
      });

      expect(closeBtn.tagName).toBe('BUTTON');
      expect(closeBtn.className).toBe('modal-close');
      expect(closeBtn.getAttribute('aria-label')).toBe('Close modal');
    });

    it('should create gear card with rarity class', () => {
      const card = createElement('div', {
        className: 'gear-card legendary'
      });

      expect(card.classList.contains('gear-card')).toBe(true);
      expect(card.classList.contains('legendary')).toBe(true);
    });
  });
});
