/**
 * GearComparison - Gear modal and comparison
 */

import { gearData } from '../data/gearData.js';
import { createElement } from '../utils/dom.js';

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

    // Close on backdrop click
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

    title.textContent = this.formatSlotName(slotType);
    body.innerHTML = '';

    const items = gearData[slotType] || [];
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
    const card = createElement('div', {
      className: `gear-card ${item.rarity || 'legendary'}`
    });

    const header = createElement('div', { className: 'gear-card-header' });
    const name = createElement('h3');
    name.textContent = item.name;
    const type = createElement('span', { className: 'item-type' });
    type.textContent = item.type || '';
    header.appendChild(name);
    header.appendChild(type);
    card.appendChild(header);

    if (item.stats && item.stats.length > 0) {
      const statsList = createElement('ul', { className: 'item-stats' });
      item.stats.forEach(stat => {
        const li = createElement('li');
        li.textContent = stat;
        statsList.appendChild(li);
      });
      card.appendChild(statsList);
    }

    if (item.aspect) {
      const aspect = createElement('div', { className: 'item-aspect' });
      const aspectLabel = createElement('strong');
      aspectLabel.textContent = 'Aspect: ';
      const aspectText = document.createTextNode(item.aspect);
      aspect.appendChild(aspectLabel);
      aspect.appendChild(aspectText);
      card.appendChild(aspect);
    }

    if (item.notes) {
      const notes = createElement('p', { className: 'item-notes' });
      notes.textContent = item.notes;
      card.appendChild(notes);
    }

    return card;
  }

  formatSlotName(slot) {
    return slot
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
