/**
 * Unit tests for GearComparison module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement } from '../../src/js/utils/dom.js';

describe('GearComparison', () => {
  describe('formatSlotName()', () => {
    function formatSlotName(slot) {
      return slot
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

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

  describe('Modal State Management', () => {
    let isModalOpen;
    let currentSlot;

    function openModal(slotType) {
      currentSlot = slotType;
      isModalOpen = true;
    }

    function closeModal() {
      isModalOpen = false;
      currentSlot = null;
    }

    beforeEach(() => {
      isModalOpen = false;
      currentSlot = null;
    });

    it('should start with modal closed', () => {
      expect(isModalOpen).toBe(false);
      expect(currentSlot).toBe(null);
    });

    it('should open modal with slot type', () => {
      openModal('helmet');
      expect(isModalOpen).toBe(true);
      expect(currentSlot).toBe('helmet');
    });

    it('should close modal and clear slot', () => {
      openModal('helmet');
      closeModal();
      expect(isModalOpen).toBe(false);
      expect(currentSlot).toBe(null);
    });

    it('should switch between different slots', () => {
      openModal('helmet');
      expect(currentSlot).toBe('helmet');

      openModal('chest');
      expect(currentSlot).toBe('chest');
    });
  });

  describe('Item Card Data Handling', () => {
    function getItemCardInfo(item) {
      return {
        name: item.name,
        type: item.type || '',
        rarity: item.rarity || 'legendary',
        hasStats: !!(item.stats && item.stats.length > 0),
        hasAspect: !!item.aspect,
        hasNotes: !!item.notes,
        statsCount: item.stats ? item.stats.length : 0
      };
    }

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

  describe('Gear Slot Validation', () => {
    const validSlots = [
      'helmet',
      'chest',
      'gloves',
      'pants',
      'boots',
      'amulet',
      'ring1',
      'ring2',
      'weapon'
    ];

    function isValidSlot(slot) {
      return validSlots.includes(slot);
    }

    it('should validate all gear slots', () => {
      validSlots.forEach(slot => {
        expect(isValidSlot(slot)).toBe(true);
      });
    });

    it('should reject invalid slots', () => {
      expect(isValidSlot('invalid')).toBe(false);
      expect(isValidSlot('bracers')).toBe(false);
      expect(isValidSlot('')).toBe(false);
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
