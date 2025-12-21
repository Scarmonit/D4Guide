/**
 * Unit tests for ThemeManager module
 */

import { describe, it, expect } from 'vitest';
import {
  toggleTheme,
  changeFontSize,
  toggleSound,
  getThemeIcon,
  getSoundIcon,
  validatePreferences,
  FONT_SIZES,
  DEFAULT_PREFERENCES
} from '../../src/js/modules/ThemeManager.js';

describe('ThemeManager', () => {
  describe('Constants', () => {
    it('should have correct font sizes', () => {
      expect(FONT_SIZES).toEqual(['small', 'medium', 'large']);
    });

    it('should have correct default preferences', () => {
      expect(DEFAULT_PREFERENCES.theme).toBe('dark');
      expect(DEFAULT_PREFERENCES.fontSize).toBe('medium');
      expect(DEFAULT_PREFERENCES.soundEnabled).toBe(false);
    });
  });

  describe('toggleTheme()', () => {
    it('should toggle from dark to light', () => {
      expect(toggleTheme('dark')).toBe('light');
    });

    it('should toggle from light to dark', () => {
      expect(toggleTheme('light')).toBe('dark');
    });

    it('should treat invalid theme as non-dark (toggle to dark)', () => {
      // Invalid theme is not 'dark', so toggle returns 'dark'
      expect(toggleTheme('invalid')).toBe('dark');
    });
  });

  describe('changeFontSize()', () => {
    it('should increase font size', () => {
      expect(changeFontSize('medium', 1)).toBe('large');
    });

    it('should decrease font size', () => {
      expect(changeFontSize('medium', -1)).toBe('small');
    });

    it('should not exceed maximum size', () => {
      expect(changeFontSize('large', 1)).toBe('large');
    });

    it('should not go below minimum size', () => {
      expect(changeFontSize('small', -1)).toBe('small');
    });

    it('should handle large direction values', () => {
      expect(changeFontSize('small', 10)).toBe('large');
      expect(changeFontSize('large', -10)).toBe('small');
    });

    it('should cycle through all sizes correctly', () => {
      expect(changeFontSize('small', 1)).toBe('medium');
      expect(changeFontSize('medium', 1)).toBe('large');
      expect(changeFontSize('large', -1)).toBe('medium');
      expect(changeFontSize('medium', -1)).toBe('small');
    });
  });

  describe('toggleSound()', () => {
    it('should toggle from false to true', () => {
      expect(toggleSound(false)).toBe(true);
    });

    it('should toggle from true to false', () => {
      expect(toggleSound(true)).toBe(false);
    });
  });

  describe('getThemeIcon()', () => {
    it('should show sun icon for dark theme', () => {
      expect(getThemeIcon('dark')).toBe('☀️');
    });

    it('should show moon icon for light theme', () => {
      expect(getThemeIcon('light')).toBe('🌙');
    });
  });

  describe('getSoundIcon()', () => {
    it('should show speaker icon when sound enabled', () => {
      expect(getSoundIcon(true)).toBe('🔊');
    });

    it('should show muted icon when sound disabled', () => {
      expect(getSoundIcon(false)).toBe('🔇');
    });
  });

  describe('validatePreferences()', () => {
    it('should validate correct preferences', () => {
      const prefs = { theme: 'light', fontSize: 'large', soundEnabled: true };
      const result = validatePreferences(prefs);
      expect(result.theme).toBe('light');
      expect(result.fontSize).toBe('large');
      expect(result.soundEnabled).toBe(true);
    });

    it('should default invalid theme to dark', () => {
      const prefs = { theme: 'invalid', fontSize: 'medium', soundEnabled: false };
      const result = validatePreferences(prefs);
      expect(result.theme).toBe('dark');
    });

    it('should default invalid fontSize to medium', () => {
      const prefs = { theme: 'dark', fontSize: 'invalid', soundEnabled: false };
      const result = validatePreferences(prefs);
      expect(result.fontSize).toBe('medium');
    });

    it('should coerce soundEnabled to boolean', () => {
      const prefs = { theme: 'dark', fontSize: 'medium', soundEnabled: 1 };
      const result = validatePreferences(prefs);
      expect(result.soundEnabled).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle theme toggle cycle', () => {
      let theme = 'dark';
      theme = toggleTheme(theme);
      expect(theme).toBe('light');
      theme = toggleTheme(theme);
      expect(theme).toBe('dark');
    });

    it('should handle font size adjustments', () => {
      let size = 'medium';
      size = changeFontSize(size, 1);
      expect(size).toBe('large');
      size = changeFontSize(size, -2);
      expect(size).toBe('small');
    });
  });
});
