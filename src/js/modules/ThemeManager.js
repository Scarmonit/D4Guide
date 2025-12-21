/**
 * ThemeManager - Theme, font size, and sound preferences
 */

import { storage } from '../utils/storage.js';

export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.fontSize = 'medium';
    this.soundEnabled = false;
    this.init();
  }

  init() {
    this.loadPreferences();
    this.setupControls();
    this.applyTheme();
    this.applyFontSize();
  }

  loadPreferences() {
    this.currentTheme = storage.get('theme', 'dark');
    this.fontSize = storage.get('fontSize', 'medium');
    this.soundEnabled = storage.get('soundEnabled', false);
  }

  setupControls() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Font size controls
    const fontIncrease = document.getElementById('font-increase');
    const fontDecrease = document.getElementById('font-decrease');
    if (fontIncrease) {
      fontIncrease.addEventListener('click', () => this.changeFontSize(1));
    }
    if (fontDecrease) {
      fontDecrease.addEventListener('click', () => this.changeFontSize(-1));
    }

    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => this.toggleSound());
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    storage.set('theme', this.currentTheme);
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  changeFontSize(direction) {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(this.fontSize);
    const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + direction));
    this.fontSize = sizes[newIndex];
    storage.set('fontSize', this.fontSize);
    this.applyFontSize();
  }

  applyFontSize() {
    document.documentElement.setAttribute('data-font-size', this.fontSize);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    storage.set('soundEnabled', this.soundEnabled);
    const toggle = document.getElementById('sound-toggle');
    if (toggle) {
      toggle.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    // Sound implementation placeholder
  }
}
