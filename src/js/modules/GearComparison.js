/**
 * GearComparison - Gear modal and comparison
 */

import { gearData } from '../data/gearData.js';
import { createElement } from '../utils/dom.js';

// ============================================
// Pure functions (testable without DOM)
// ============================================

/**
 * Valid gear slot types
 */
export const VALID_SLOTS = [
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

/**
 * Format a slot name for display
 * @param {string} slot - The slot identifier
 * @returns {string} Formatted slot name
 */
export function formatSlotName(slot) {
  return slot
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a slot is valid
 * @param {string} slot - The slot to validate
 * @returns {boolean} Whether the slot is valid
 */
export function isValidSlot(slot) {
  return VALID_SLOTS.includes(slot);
}

/**
 * Get item card info for display
 * @param {Object} item - The item data
 * @returns {Object} Processed item info
 */
export function getItemCardInfo(item) {
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

/**
 * Get items for a specific slot
 * @param {string} slotType - The slot type
 * @param {Object} data - The gear data object
 * @returns {Array} Items for that slot
 */
export function getItemsForSlot(slotType, data = gearData) {
  return data[slotType] || [];
}

/**
 * Filter items by rarity
 * @param {Array} items - Array of items
 * @param {string} rarity - Rarity to filter by
 * @returns {Array} Filtered items
 */
export function filterItemsByRarity(items, rarity) {
  return items.filter(item => (item.rarity || 'legendary') === rarity);
}

/**
 * Sort items by name
 * @param {Array} items - Array of items
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted items
 */
export function sortItemsByName(items, ascending = true) {
  return [...items].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
}

/**
 * Clear all children from an element
 * @param {Element} element - The element to clear
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// ============================================
// Class with DOM bindings
// ============================================

export class GearComparison {
  constructor() {
    this.modal = null;
    this.currentSlot = null;
    this.init();
  }

  init() {
    this.createModal();
    this.setupGearSlots();
  }

  createModal() {
    this.modal = createElement('div', {
      id: 'gear-modal',
      className: 'modal hidden'
    });

    const content = createElement('div', { className: 'modal-content' });

    const header = createElement('div', { className: 'modal-header' });
    const title = createElement('h2', { id: 'gear-modal-title' });
    title.textContent = 'Gear Comparison';
    const closeBtn = createElement('button', {
      className: 'modal-close',
      'aria-label': 'Close modal'
    });
    closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', () => this.closeModal());
    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = createElement('div', {
      id: 'gear-modal-body',
      className: 'modal-body'
    });

    content.appendChild(header);
    content.appendChild(body);
    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }

  setupGearSlots() {
    document.querySelectorAll('.gear-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const slotType = slot.dataset.slot;
        this.openModal(slotType);
      });
    });
  }

  openModal(slotType) {
    this.currentSlot = slotType;
    const title = this.modal.querySelector('#gear-modal-title');
    const body = this.modal.querySelector('#gear-modal-body');

    title.textContent = formatSlotName(slotType);
    clearElement(body);

    const items = getItemsForSlot(slotType);
    if (items.length === 0) {
      const noItems = createElement('p', { className: 'no-items' });
      noItems.textContent = 'No items available for this slot.';
      body.appendChild(noItems);
    } else {
      items.forEach(item => {
        body.appendChild(this.createItemCard(item));
      });
    }

    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
    this.currentSlot = null;
  }

  createItemCard(item) {
    const info = getItemCardInfo(item);
    const card = createElement('div', {
      className: `gear-card ${info.rarity}`
    });

    const header = createElement('div', { className: 'gear-card-header' });
    const name = createElement('h3');
    name.textContent = info.name;
    const type = createElement('span', { className: 'item-type' });
    type.textContent = info.type;
    header.appendChild(name);
    header.appendChild(type);
    card.appendChild(header);

    if (info.hasStats) {
      const statsList = createElement('ul', { className: 'item-stats' });
      item.stats.forEach(stat => {
        const li = createElement('li');
        li.textContent = stat;
        statsList.appendChild(li);
      });
      card.appendChild(statsList);
    }

    if (info.hasAspect) {
      const aspect = createElement('div', { className: 'item-aspect' });
      const aspectLabel = createElement('strong');
      aspectLabel.textContent = 'Aspect: ';
      const aspectText = document.createTextNode(item.aspect);
      aspect.appendChild(aspectLabel);
      aspect.appendChild(aspectText);
      card.appendChild(aspect);
    }

    if (info.hasNotes) {
      const notes = createElement('p', { className: 'item-notes' });
      notes.textContent = item.notes;
      card.appendChild(notes);
    }

    return card;
  }
}
