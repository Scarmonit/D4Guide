/**
 * ThemeManager - Theme, font size, and sound preferences
 */

import { storage } from '../utils/storage.js';

// ============================================
// Pure functions (testable without DOM)
// ============================================

/**
 * Available font sizes in order
 */
export const FONT_SIZES = ['small', 'medium', 'large'];

/**
 * Default preferences
 */
export const DEFAULT_PREFERENCES = {
  theme: 'dark',
  fontSize: 'medium',
  soundEnabled: false
};

/**
 * Toggle theme between dark and light
 * @param {string} currentTheme - Current theme
 * @returns {string} New theme
 */
export function toggleTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

/**
 * Change font size by direction
 * @param {string} currentSize - Current font size
 * @param {number} direction - Direction to change (1 = increase, -1 = decrease)
 * @returns {string} New font size
 */
export function changeFontSize(currentSize, direction) {
  const currentIndex = FONT_SIZES.indexOf(currentSize);
  const newIndex = Math.max(0, Math.min(FONT_SIZES.length - 1, currentIndex + direction));
  return FONT_SIZES[newIndex];
}

/**
 * Toggle sound enabled state
 * @param {boolean} currentState - Current sound state
 * @returns {boolean} New sound state
 */
export function toggleSound(currentState) {
  return !currentState;
}

/**
 * Get theme icon for current theme
 * @param {string} theme - Current theme
 * @returns {string} Icon character
 */
export function getThemeIcon(theme) {
  return theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Get sound icon for current state
 * @param {boolean} enabled - Whether sound is enabled
 * @returns {string} Icon character
 */
export function getSoundIcon(enabled) {
  return enabled ? '🔊' : '🔇';
}

/**
 * Validate and normalize preferences
 * @param {Object} prefs - Preferences to validate
 * @returns {Object} Validated preferences
 */
export function validatePreferences(prefs) {
  return {
    theme: prefs.theme === 'light' ? 'light' : 'dark',
    fontSize: FONT_SIZES.includes(prefs.fontSize) ? prefs.fontSize : 'medium',
    soundEnabled: Boolean(prefs.soundEnabled)
  };
}

// ============================================
// Class with DOM bindings
// ============================================

export class ThemeManager {
  constructor() {
    this.currentTheme = DEFAULT_PREFERENCES.theme;
    this.fontSize = DEFAULT_PREFERENCES.fontSize;
    this.soundEnabled = DEFAULT_PREFERENCES.soundEnabled;
    this.init();
  }

  init() {
    this.loadPreferences();
    this.setupControls();
    this.applyTheme();
    this.applyFontSize();
  }

  loadPreferences() {
    this.currentTheme = storage.get('theme', DEFAULT_PREFERENCES.theme);
    this.fontSize = storage.get('fontSize', DEFAULT_PREFERENCES.fontSize);
    this.soundEnabled = storage.get('soundEnabled', DEFAULT_PREFERENCES.soundEnabled);
  }

  setupControls() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.handleToggleTheme());
    }

    const fontIncrease = document.getElementById('font-increase');
    const fontDecrease = document.getElementById('font-decrease');
    if (fontIncrease) {
      fontIncrease.addEventListener('click', () => this.handleChangeFontSize(1));
    }
    if (fontDecrease) {
      fontDecrease.addEventListener('click', () => this.handleChangeFontSize(-1));
    }

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => this.handleToggleSound());
    }
  }

  handleToggleTheme() {
    this.currentTheme = toggleTheme(this.currentTheme);
    storage.set('theme', this.currentTheme);
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = getThemeIcon(this.currentTheme);
    }
  }

  handleChangeFontSize(direction) {
    this.fontSize = changeFontSize(this.fontSize, direction);
    storage.set('fontSize', this.fontSize);
    this.applyFontSize();
  }

  applyFontSize() {
    document.documentElement.setAttribute('data-font-size', this.fontSize);
  }

  handleToggleSound() {
    this.soundEnabled = toggleSound(this.soundEnabled);
    storage.set('soundEnabled', this.soundEnabled);
    const toggle = document.getElementById('sound-toggle');
    if (toggle) {
      toggle.textContent = getSoundIcon(this.soundEnabled);
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    // Sound implementation placeholder
  }
}
