import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Test file patterns
    include: ['tests/unit/**/*.test.js'],

    // Global test APIs (describe, it, expect)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/js/**/*.js'],
      exclude: ['src/js/main.js']
    },

    // Setup files (runs before each test file)
    setupFiles: ['./tests/unit/setup.js'],

    // Reporter
    reporters: ['verbose'],

    // Timeout for tests
    testTimeout: 10000
  }
});
