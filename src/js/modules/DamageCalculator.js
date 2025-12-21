/**
 * DamageCalculator - Blood Wave damage calculation
 */

import { storage } from '../utils/storage.js';

// ============================================
// Pure functions (testable without DOM)
// ============================================

/**
 * Default stats for damage calculation
 */
export const DEFAULT_STATS = {
  baseWeaponDamage: 1000,
  skillDamage: 100,
  critChance: 50,
  critDamage: 150,
  vulnerableDamage: 60,
  overpower: 50,
  bloodWaveMultiplier: 100
};

/**
 * Calculate all damage values from stats
 * @param {Object} stats - The stat values
 * @returns {Object} Calculated damage values
 */
export function calculateDamage(stats) {
  const {
    baseWeaponDamage,
    skillDamage,
    critChance,
    critDamage,
    vulnerableDamage,
    overpower,
    bloodWaveMultiplier
  } = stats;

  // Base damage calculation
  const baseDamage = baseWeaponDamage * (1 + skillDamage / 100);

  // Average damage with crit
  const critMultiplier = 1 + (critChance / 100) * (critDamage / 100);
  const avgDamage = baseDamage * critMultiplier;

  // With vulnerable
  const vulnerableMultiplier = 1 + vulnerableDamage / 100;
  const vulnerableDmg = avgDamage * vulnerableMultiplier;

  // Blood Wave multiplier
  const bloodWaveDmg = vulnerableDmg * (1 + bloodWaveMultiplier / 100);

  // Overpower damage (when it procs)
  const overpowerDmg = bloodWaveDmg * (1 + overpower / 100);

  return {
    base: baseDamage,
    average: avgDamage,
    vulnerable: vulnerableDmg,
    bloodWave: bloodWaveDmg,
    overpower: overpowerDmg
  };
}

/**
 * Format a number for display (K/M suffixes)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.round(num).toLocaleString();
}

/**
 * Parse a stat value from input
 * @param {string|number} value - The value to parse
 * @returns {number} Parsed number or 0
 */
export function parseStatValue(value) {
  return parseFloat(value) || 0;
}

// ============================================
// Class with DOM bindings
// ============================================

export class DamageCalculator {
  constructor() {
    this.stats = { ...DEFAULT_STATS };
    this.init();
  }

  init() {
    this.loadStats();
    this.setupInputs();
    this.calculate();
  }

  loadStats() {
    const saved = storage.get('calculatorStats', null);
    if (saved) {
      this.stats = { ...this.stats, ...saved };
    }
  }

  setupInputs() {
    const container = document.getElementById('damage-calculator');
    if (!container) return;

    Object.keys(this.stats).forEach(stat => {
      const input = container.querySelector(`[data-stat="${stat}"]`);
      if (input) {
        input.value = this.stats[stat];
        input.addEventListener('input', e => {
          this.stats[stat] = parseStatValue(e.target.value);
          this.saveAndCalculate();
        });
      }
    });
  }

  saveAndCalculate() {
    storage.set('calculatorStats', this.stats);
    this.calculate();
  }

  calculate() {
    const results = calculateDamage(this.stats);
    this.updateDisplay(results);
  }

  updateDisplay(results) {
    const display = document.getElementById('damage-results');
    if (!display) return;

    Object.entries(results).forEach(([key, value]) => {
      const element = display.querySelector(`[data-result="${key}"]`);
      if (element) {
        element.textContent = formatNumber(value);
      }
    });
  }
}
