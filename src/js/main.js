/**
 * D4Guide - Blood Wave Necromancer Build Guide
 * Main entry point for ES modules
 */

import { BloodWaveGuide } from './modules/BloodWaveGuide.js';

// Initialize the guide when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Blood Wave Guide initializing...');
  window.bloodWaveGuide = new BloodWaveGuide();
  console.log('Blood Wave Guide initialized');
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
