/**
 * Unit tests for SearchHandler module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../src/js/utils/dom.js';
import {
  isValidQuery,
  createFuseInstance,
  performSearch,
  getPreviewText,
  clearResults,
  shouldCloseOnKey,
  shouldSubmitOnKey,
  DEFAULT_FUSE_OPTIONS,
  MIN_QUERY_LENGTH,
  MAX_RESULTS
} from '../../src/js/modules/SearchHandler.js';

describe('SearchHandler', () => {
  describe('Constants', () => {
    it('should have correct MIN_QUERY_LENGTH', () => {
      expect(MIN_QUERY_LENGTH).toBe(2);
    });

    it('should have correct MAX_RESULTS', () => {
      expect(MAX_RESULTS).toBe(10);
    });

    it('should have correct DEFAULT_FUSE_OPTIONS', () => {
      expect(DEFAULT_FUSE_OPTIONS.keys).toEqual(['title', 'content', 'tags']);
      expect(DEFAULT_FUSE_OPTIONS.threshold).toBe(0.3);
      expect(DEFAULT_FUSE_OPTIONS.includeMatches).toBe(true);
      expect(DEFAULT_FUSE_OPTIONS.minMatchCharLength).toBe(2);
    });
  });

  describe('isValidQuery()', () => {
    it('should return true for valid queries', () => {
      expect(isValidQuery('ab')).toBe(true);
      expect(isValidQuery('abc')).toBe(true);
      expect(isValidQuery('blood wave')).toBe(true);
    });

    it('should return false for queries shorter than MIN_QUERY_LENGTH', () => {
      expect(isValidQuery('a')).toBeFalsy();
      expect(isValidQuery('')).toBeFalsy();
    });

    it('should return false for null or undefined', () => {
      expect(isValidQuery(null)).toBeFalsy();
      expect(isValidQuery(undefined)).toBeFalsy();
    });

    it('should handle whitespace queries', () => {
      expect(isValidQuery('  ')).toBe(true); // 2 spaces is valid length
      expect(isValidQuery(' ')).toBeFalsy(); // 1 space is too short
    });
  });

  describe('createFuseInstance()', () => {
    const testData = [
      { title: 'Blood Wave', content: 'A powerful necromancer skill', tags: ['skill', 'necro'] },
      { title: 'Bone Spear', content: 'Launches a bone projectile', tags: ['skill', 'bone'] },
      {
        title: 'Corpse Explosion',
        content: 'Explodes corpses for damage',
        tags: ['skill', 'corpse']
      }
    ];

    it('should create a Fuse instance', () => {
      const fuse = createFuseInstance(testData);
      expect(fuse).toBeDefined();
      expect(typeof fuse.search).toBe('function');
    });

    it('should use default options when none provided', () => {
      const fuse = createFuseInstance(testData);
      const results = fuse.search('blood');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should accept custom options', () => {
      const customOptions = {
        keys: ['title'],
        threshold: 0.1
      };
      const fuse = createFuseInstance(testData, customOptions);
      expect(fuse).toBeDefined();
    });

    it('should handle empty data array', () => {
      const fuse = createFuseInstance([]);
      const results = fuse.search('test');
      expect(results).toEqual([]);
    });
  });

  describe('performSearch()', () => {
    const testData = [
      { title: 'Blood Wave', content: 'A powerful necromancer skill' },
      { title: 'Blood Mist', content: 'Transform into mist' },
      { title: 'Blood Surge', content: 'Draw blood from enemies' },
      { title: 'Bone Spear', content: 'Launches a bone projectile' }
    ];
    let fuse;

    beforeEach(() => {
      fuse = createFuseInstance(testData);
    });

    it('should return results for valid query', () => {
      const results = performSearch(fuse, 'blood');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid query', () => {
      const results = performSearch(fuse, 'a');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = performSearch(fuse, '');
      expect(results).toEqual([]);
    });

    it('should limit results to MAX_RESULTS by default', () => {
      // Create data with many items
      const largeData = Array.from({ length: 20 }, (_, i) => ({
        title: `Item ${i}`,
        content: `Content for item ${i}`
      }));
      const largeFuse = createFuseInstance(largeData);
      const results = performSearch(largeFuse, 'item');
      expect(results.length).toBeLessThanOrEqual(MAX_RESULTS);
    });

    it('should respect custom limit parameter', () => {
      const results = performSearch(fuse, 'blood', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should find results by content', () => {
      const results = performSearch(fuse, 'necromancer');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.title).toBe('Blood Wave');
    });

    it('should return results with item property', () => {
      const results = performSearch(fuse, 'blood');
      expect(results[0]).toHaveProperty('item');
      expect(results[0].item).toHaveProperty('title');
    });
  });

  describe('getPreviewText()', () => {
    it('should return full content if under maxLength', () => {
      const content = 'Short text';
      expect(getPreviewText(content, 100)).toBe('Short text');
    });

    it('should truncate and add ellipsis if over maxLength', () => {
      const content = 'This is a very long piece of content that should be truncated';
      const result = getPreviewText(content, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23); // 20 chars + '...'
    });

    it('should use default maxLength of 100', () => {
      const longContent = 'a'.repeat(150);
      const result = getPreviewText(longContent);
      expect(result).toBe('a'.repeat(100) + '...');
    });

    it('should return empty string for null content', () => {
      expect(getPreviewText(null)).toBe('');
    });

    it('should return empty string for undefined content', () => {
      expect(getPreviewText(undefined)).toBe('');
    });

    it('should return empty string for empty content', () => {
      expect(getPreviewText('')).toBe('');
    });

    it('should handle content exactly at maxLength', () => {
      const content = 'a'.repeat(100);
      expect(getPreviewText(content, 100)).toBe(content);
    });
  });

  describe('clearResults()', () => {
    beforeEach(() => {
      document.body.textContent = '';
    });

    it('should remove all children from element', () => {
      const container = createElement('div');
      container.appendChild(createElement('div'));
      container.appendChild(createElement('div'));
      container.appendChild(createElement('div'));

      expect(container.children.length).toBe(3);
      clearResults(container);
      expect(container.children.length).toBe(0);
    });

    it('should handle element with no children', () => {
      const container = createElement('div');
      expect(() => clearResults(container)).not.toThrow();
      expect(container.children.length).toBe(0);
    });

    it('should remove nested elements', () => {
      const container = createElement('div');
      const nested = createElement('div');
      nested.appendChild(createElement('span'));
      nested.appendChild(createElement('span'));
      container.appendChild(nested);

      clearResults(container);
      expect(container.children.length).toBe(0);
    });

    it('should remove text nodes as well', () => {
      const container = createElement('div');
      container.appendChild(document.createTextNode('Some text'));
      container.appendChild(createElement('span'));

      expect(container.childNodes.length).toBe(2);
      clearResults(container);
      expect(container.childNodes.length).toBe(0);
    });
  });

  describe('shouldCloseOnKey()', () => {
    it('should return true for Escape key', () => {
      expect(shouldCloseOnKey('Escape')).toBe(true);
    });

    it('should return false for other keys', () => {
      expect(shouldCloseOnKey('Enter')).toBe(false);
      expect(shouldCloseOnKey('a')).toBe(false);
      expect(shouldCloseOnKey('Tab')).toBe(false);
      expect(shouldCloseOnKey('ArrowDown')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(shouldCloseOnKey('escape')).toBe(false);
      expect(shouldCloseOnKey('ESCAPE')).toBe(false);
    });
  });

  describe('shouldSubmitOnKey()', () => {
    it('should return true for Enter key', () => {
      expect(shouldSubmitOnKey('Enter')).toBe(true);
    });

    it('should return false for other keys', () => {
      expect(shouldSubmitOnKey('Escape')).toBe(false);
      expect(shouldSubmitOnKey('a')).toBe(false);
      expect(shouldSubmitOnKey('Tab')).toBe(false);
      expect(shouldSubmitOnKey('Space')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(shouldSubmitOnKey('enter')).toBe(false);
      expect(shouldSubmitOnKey('ENTER')).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    const testData = [
      {
        title: 'Blood Wave Build',
        content: 'Complete guide for Blood Wave Necromancer',
        tags: ['build', 'necro']
      },
      { title: 'Gear Guide', content: 'Best gear for Blood Wave', tags: ['gear', 'items'] },
      { title: 'Skill Tree', content: 'Optimal skill point allocation', tags: ['skills', 'tree'] }
    ];

    it('should perform full search workflow', () => {
      const fuse = createFuseInstance(testData);

      // Invalid query returns empty
      expect(performSearch(fuse, 'a')).toEqual([]);

      // Valid query returns results
      const results = performSearch(fuse, 'blood');
      expect(results.length).toBeGreaterThan(0);

      // Get preview of first result
      const preview = getPreviewText(results[0].item.content, 50);
      expect(preview.length).toBeLessThanOrEqual(53); // 50 + '...'
    });

    it('should handle keyboard navigation', () => {
      expect(shouldCloseOnKey('Escape')).toBe(true);
      expect(shouldSubmitOnKey('Enter')).toBe(true);
      expect(shouldCloseOnKey('Enter')).toBe(false);
      expect(shouldSubmitOnKey('Escape')).toBe(false);
    });
  });
});
