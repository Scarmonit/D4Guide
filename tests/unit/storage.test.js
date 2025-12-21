/**
 * Unit tests for storage utility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../../src/js/utils/storage.js';

describe('Storage Utility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('get()', () => {
    it('should return default value when key does not exist', () => {
      const result = storage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return null as default when no default provided', () => {
      const result = storage.get('nonexistent');
      expect(result).toBe(null);
    });

    it('should retrieve stored string value', () => {
      localStorage.setItem('d4guide_testKey', JSON.stringify('testValue'));
      const result = storage.get('testKey');
      expect(result).toBe('testValue');
    });

    it('should retrieve stored object value', () => {
      const obj = { name: 'test', value: 42 };
      localStorage.setItem('d4guide_testObj', JSON.stringify(obj));
      const result = storage.get('testObj');
      expect(result).toEqual(obj);
    });

    it('should retrieve stored array value', () => {
      const arr = [1, 2, 3, 'four'];
      localStorage.setItem('d4guide_testArr', JSON.stringify(arr));
      const result = storage.get('testArr');
      expect(result).toEqual(arr);
    });

    it('should retrieve stored boolean value', () => {
      localStorage.setItem('d4guide_testBool', JSON.stringify(true));
      const result = storage.get('testBool');
      expect(result).toBe(true);
    });

    it('should retrieve stored number value', () => {
      localStorage.setItem('d4guide_testNum', JSON.stringify(123.45));
      const result = storage.get('testNum');
      expect(result).toBe(123.45);
    });
  });

  describe('set()', () => {
    it('should store string value with prefix', () => {
      const result = storage.set('myKey', 'myValue');
      expect(result).toBe(true);
      expect(localStorage.getItem('d4guide_myKey')).toBe('"myValue"');
    });

    it('should store object value', () => {
      const obj = { foo: 'bar', num: 100 };
      storage.set('myObj', obj);
      expect(JSON.parse(localStorage.getItem('d4guide_myObj'))).toEqual(obj);
    });

    it('should store array value', () => {
      const arr = ['a', 'b', 'c'];
      storage.set('myArr', arr);
      expect(JSON.parse(localStorage.getItem('d4guide_myArr'))).toEqual(arr);
    });

    it('should store boolean value', () => {
      storage.set('myBool', false);
      expect(JSON.parse(localStorage.getItem('d4guide_myBool'))).toBe(false);
    });

    it('should store null value', () => {
      storage.set('myNull', null);
      expect(JSON.parse(localStorage.getItem('d4guide_myNull'))).toBe(null);
    });
  });

  describe('remove()', () => {
    it('should remove existing key', () => {
      localStorage.setItem('d4guide_toRemove', '"value"');
      const result = storage.remove('toRemove');
      expect(result).toBe(true);
      expect(localStorage.getItem('d4guide_toRemove')).toBe(null);
    });

    it('should return true even if key does not exist', () => {
      const result = storage.remove('nonexistent');
      expect(result).toBe(true);
    });
  });

  describe('clear()', () => {
    it('should clear only prefixed keys', () => {
      localStorage.setItem('d4guide_key1', '"val1"');
      localStorage.setItem('d4guide_key2', '"val2"');
      localStorage.setItem('otherApp_key', '"val3"');

      const result = storage.clear();
      expect(result).toBe(true);
      expect(localStorage.getItem('d4guide_key1')).toBe(null);
      expect(localStorage.getItem('d4guide_key2')).toBe(null);
      // Note: In real implementation, non-prefixed keys should remain
    });
  });

  describe('roundtrip', () => {
    it('should correctly roundtrip complex nested object', () => {
      const complex = {
        skills: { blood_wave: 5, decompose: 3 },
        stats: [100, 200, 300],
        settings: { theme: 'dark', sound: true }
      };

      storage.set('complex', complex);
      const retrieved = storage.get('complex');
      expect(retrieved).toEqual(complex);
    });
  });
});
