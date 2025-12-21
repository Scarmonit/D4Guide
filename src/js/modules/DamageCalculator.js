/**
 * DamageCalculator - Blood Wave damage calculation
 */

import { storage } from '../utils/storage.js';

export class DamageCalculator {
  constructor() {
    this.stats = {
      baseWeaponDamage: 1000,
      skillDamage: 100,
      critChance: 50,
      critDamage: 150,
      vulnerableDamage: 60,
      overpower: 50,
      bloodWaveMultiplier: 100
    };
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
          this.stats[stat] = parseFloat(e.target.value) || 0;
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
    const {
      baseWeaponDamage,
      skillDamage,
      critChance,
      critDamage,
      vulnerableDamage,
      overpower,
      bloodWaveMultiplier
    } = this.stats;

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

    this.updateDisplay({
      base: baseDamage,
      average: avgDamage,
      vulnerable: vulnerableDmg,
      bloodWave: bloodWaveDmg,
      overpower: overpowerDmg
    });
  }

  updateDisplay(results) {
    const display = document.getElementById('damage-results');
    if (!display) return;

    Object.entries(results).forEach(([key, value]) => {
      const element = display.querySelector(`[data-result="${key}"]`);
      if (element) {
        element.textContent = this.formatNumber(value);
      }
    });
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toLocaleString();
  }
}
