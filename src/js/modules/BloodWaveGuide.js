/**
 * BloodWaveGuide - Main orchestrator class
 * Initializes and coordinates all guide features
 */

import { ParticleSystem } from './ParticleSystem.js';
import { ThemeManager } from './ThemeManager.js';
import { ScrollEffects } from './ScrollEffects.js';
import { SkillManager } from './SkillManager.js';
import { DamageCalculator } from './DamageCalculator.js';
import { GearComparison } from './GearComparison.js';
import { SearchHandler } from './SearchHandler.js';

export class BloodWaveGuide {
  constructor() {
    this.modules = {};
    this.init();
  }

  init() {
    // Initialize all modules
    this.modules.particles = new ParticleSystem();
    this.modules.theme = new ThemeManager();
    this.modules.scroll = new ScrollEffects();
    this.modules.skills = new SkillManager();
    this.modules.calculator = new DamageCalculator();
    this.modules.gear = new GearComparison();
    this.modules.search = new SearchHandler();

    // Setup global event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.modules.search.toggle();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        this.modules.gear.closeModal();
        this.modules.search.close();
      }
    });
  }
}
