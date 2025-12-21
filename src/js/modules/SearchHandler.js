/**
 * SearchHandler - Fuzzy search with Fuse.js
 */

import Fuse from 'fuse.js';
import { searchIndex } from '../data/searchIndex.js';
import { createElement } from '../utils/dom.js';

// ============================================
// Pure functions (testable without DOM)
// ============================================

/**
 * Default Fuse.js options for search
 */
export const DEFAULT_FUSE_OPTIONS = {
  keys: ['title', 'content', 'tags'],
  threshold: 0.3,
  includeMatches: true,
  minMatchCharLength: 2
};

/**
 * Minimum query length to trigger search
 */
export const MIN_QUERY_LENGTH = 2;

/**
 * Maximum number of results to display
 */
export const MAX_RESULTS = 10;

/**
 * Check if query is valid for searching
 * @param {string} query - The search query
 * @returns {boolean} Whether the query is valid
 */
export function isValidQuery(query) {
  return query && query.length >= MIN_QUERY_LENGTH;
}

/**
 * Create a Fuse instance with given data and options
 * @param {Array} data - The data to search
 * @param {Object} options - Fuse.js options
 * @returns {Fuse} Fuse instance
 */
export function createFuseInstance(data, options = DEFAULT_FUSE_OPTIONS) {
  return new Fuse(data, options);
}

/**
 * Perform a search and return limited results
 * @param {Fuse} fuse - Fuse instance
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Array} Search results
 */
export function performSearch(fuse, query, limit = MAX_RESULTS) {
  if (!isValidQuery(query)) {
    return [];
  }
  return fuse.search(query).slice(0, limit);
}

/**
 * Get preview text from content
 * @param {string} content - Full content
 * @param {number} maxLength - Maximum preview length
 * @returns {string} Preview text with ellipsis
 */
export function getPreviewText(content, maxLength = 100) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

/**
 * Clear all children from an element
 * @param {Element} element - The element to clear
 */
export function clearResults(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Check if a key event should close the search
 * @param {string} key - The key pressed
 * @returns {boolean} Whether to close
 */
export function shouldCloseOnKey(key) {
  return key === 'Escape';
}

/**
 * Check if a key event should submit the search
 * @param {string} key - The key pressed
 * @returns {boolean} Whether to submit
 */
export function shouldSubmitOnKey(key) {
  return key === 'Enter';
}

// ============================================
// Class with DOM bindings
// ============================================

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

    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  setupFuse() {
    this.fuse = createFuseInstance(searchIndex);
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
    clearResults(this.results);
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.add('hidden');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  handleSearch(query) {
    if (!isValidQuery(query)) {
      clearResults(this.results);
      return;
    }

    const searchResults = performSearch(this.fuse, query);
    this.renderResults(searchResults);
  }

  handleKeydown(e) {
    if (shouldCloseOnKey(e.key)) {
      this.close();
    } else if (shouldSubmitOnKey(e.key)) {
      const firstResult = this.results.querySelector('.search-result-item');
      if (firstResult) {
        firstResult.click();
      }
    }
  }

  renderResults(results) {
    clearResults(this.results);

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
      preview.textContent = getPreviewText(result.item.content);

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
