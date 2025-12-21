/**
 * SearchHandler - Fuzzy search with Fuse.js
 */

import Fuse from 'fuse.js';
import { searchIndex } from '../data/searchIndex.js';
import { createElement } from '../utils/dom.js';

export class SearchHandler {
  constructor() {
    this.overlay = null;
    this.input = null;
    this.results = null;
    this.fuse = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createOverlay();
    this.setupFuse();
    this.setupTrigger();
  }

  createOverlay() {
    this.overlay = createElement('div', {
      id: 'search-overlay',
      className: 'search-overlay hidden'
    });

    const container = createElement('div', { className: 'search-container' });

    this.input = createElement('input', {
      type: 'text',
      placeholder: 'Search guide... (Ctrl+K)',
      className: 'search-input',
      'aria-label': 'Search guide'
    });
    this.input.addEventListener('input', e => this.handleSearch(e.target.value));
    this.input.addEventListener('keydown', e => this.handleKeydown(e));

    this.results = createElement('div', { className: 'search-results' });

    container.appendChild(this.input);
    container.appendChild(this.results);
    this.overlay.appendChild(container);
    document.body.appendChild(this.overlay);

    // Close on backdrop click
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  setupFuse() {
    this.fuse = new Fuse(searchIndex, {
      keys: ['title', 'content', 'tags'],
      threshold: 0.3,
      includeMatches: true,
      minMatchCharLength: 2
    });
  }

  setupTrigger() {
    const searchBtn = document.getElementById('search-trigger');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.overlay.classList.remove('hidden');
    this.input.focus();
    this.input.value = '';
    this.clearResults();
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.add('hidden');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  clearResults() {
    while (this.results.firstChild) {
      this.results.removeChild(this.results.firstChild);
    }
  }

  handleSearch(query) {
    if (query.length < 2) {
      this.clearResults();
      return;
    }

    const searchResults = this.fuse.search(query);
    this.renderResults(searchResults.slice(0, 10));
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'Enter') {
      const firstResult = this.results.querySelector('.search-result-item');
      if (firstResult) {
        firstResult.click();
      }
    }
  }

  renderResults(results) {
    this.clearResults();

    if (results.length === 0) {
      const noResults = createElement('div', { className: 'no-results' });
      noResults.textContent = 'No results found';
      this.results.appendChild(noResults);
      return;
    }

    results.forEach(result => {
      const item = createElement('div', { className: 'search-result-item' });
      item.addEventListener('click', () => this.navigateTo(result.item));

      const title = createElement('div', { className: 'result-title' });
      title.textContent = result.item.title;

      const preview = createElement('div', { className: 'result-preview' });
      preview.textContent = result.item.content.substring(0, 100) + '...';

      item.appendChild(title);
      item.appendChild(preview);
      this.results.appendChild(item);
    });
  }

  navigateTo(item) {
    this.close();
    if (item.id) {
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('highlight');
        setTimeout(() => element.classList.remove('highlight'), 2000);
      }
    }
  }
}
