/**
 * Vitest setup file - runs before each test file
 */

import { vi } from 'vitest';

// Mock localStorage for jsdom environment
const localStorageMock = {
  store: {},
  getItem: vi.fn(key => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value.toString();
  }),
  removeItem: vi.fn(key => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
  key: vi.fn(index => Object.keys(localStorageMock.store)[index] || null),
  get length() {
    return Object.keys(localStorageMock.store).length;
  },
  // Helper to get all keys (for clear() implementation in storage.js)
  keys: function () {
    return Object.keys(this.store);
  }
};

// Make Object.keys work on the mock
Object.defineProperty(localStorageMock, Symbol.iterator, {
  value: function* () {
    for (const key of Object.keys(this.store)) {
      yield key;
    }
  }
});

// Override Object.keys for localStorage
const originalKeys = Object.keys;
Object.keys = function (obj) {
  if (obj === localStorage) {
    return Object.keys(localStorageMock.store);
  }
  return originalKeys(obj);
};

global.localStorage = localStorageMock;

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.store = {};
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
