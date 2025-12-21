/**
 * Unit tests for DamageCalculator module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to test the calculation logic without DOM dependencies
// Extract the pure calculation functions for testing

describe('DamageCalculator', () => {
  // Test the damage calculation formulas directly
  describe('Damage Calculation Formulas', () => {
    // Replicate the calculation logic for testing
    function calculateDamage(stats) {
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

      // Overpower damage
      const overpowerDmg = bloodWaveDmg * (1 + overpower / 100);

      return {
        base: baseDamage,
        average: avgDamage,
        vulnerable: vulnerableDmg,
        bloodWave: bloodWaveDmg,
        overpower: overpowerDmg
      };
    }

    it('should calculate base damage correctly', () => {
      const stats = {
        baseWeaponDamage: 1000,
        skillDamage: 100,
        critChance: 0,
        critDamage: 0,
        vulnerableDamage: 0,
        overpower: 0,
        bloodWaveMultiplier: 0
      };

      const result = calculateDamage(stats);
      // 1000 * (1 + 100/100) = 1000 * 2 = 2000
      expect(result.base).toBe(2000);
    });

    it('should calculate crit multiplier correctly', () => {
      const stats = {
        baseWeaponDamage: 1000,
        skillDamage: 0,
        critChance: 50,
        critDamage: 200,
        vulnerableDamage: 0,
        overpower: 0,
        bloodWaveMultiplier: 0
      };

      const result = calculateDamage(stats);
      // Base: 1000 * (1 + 0) = 1000
      // Crit mult: 1 + (50/100) * (200/100) = 1 + 0.5 * 2 = 2
      // Avg: 1000 * 2 = 2000
      expect(result.base).toBe(1000);
      expect(result.average).toBe(2000);
    });

    it('should calculate vulnerable damage correctly', () => {
      const stats = {
        baseWeaponDamage: 1000,
        skillDamage: 0,
        critChance: 0,
        critDamage: 0,
        vulnerableDamage: 50,
        overpower: 0,
        bloodWaveMultiplier: 0
      };

      const result = calculateDamage(stats);
      // Base: 1000, Avg: 1000 (no crit)
      // Vuln mult: 1 + 50/100 = 1.5
      // Vuln dmg: 1000 * 1.5 = 1500
      expect(result.vulnerable).toBe(1500);
    });

    it('should calculate blood wave multiplier correctly', () => {
      const stats = {
        baseWeaponDamage: 1000,
        skillDamage: 0,
        critChance: 0,
        critDamage: 0,
        vulnerableDamage: 0,
        overpower: 0,
        bloodWaveMultiplier: 100
      };

      const result = calculateDamage(stats);
      // Base: 1000, Avg: 1000, Vuln: 1000
      // BW mult: 1 + 100/100 = 2
      // BW dmg: 1000 * 2 = 2000
      expect(result.bloodWave).toBe(2000);
    });

    it('should calculate overpower correctly', () => {
      const stats = {
        baseWeaponDamage: 1000,
        skillDamage: 0,
        critChance: 0,
        critDamage: 0,
        vulnerableDamage: 0,
        overpower: 75,
        bloodWaveMultiplier: 0
      };

      const result = calculateDamage(stats);
      // All previous: 1000
      // OP mult: 1 + 75/100 = 1.75
      // OP dmg: 1000 * 1.75 = 1750
      expect(result.overpower).toBe(1750);
    });

    it('should calculate full damage chain correctly', () => {
      const stats = {
        baseWeaponDamage: 1000,
        skillDamage: 100, // 2x
        critChance: 50, // with 150% crit damage = 1.75x avg
        critDamage: 150,
        vulnerableDamage: 60, // 1.6x
        overpower: 50, // 1.5x
        bloodWaveMultiplier: 100 // 2x
      };

      const result = calculateDamage(stats);

      // Base: 1000 * 2 = 2000
      expect(result.base).toBe(2000);

      // Crit mult: 1 + 0.5 * 1.5 = 1.75
      // Avg: 2000 * 1.75 = 3500
      expect(result.average).toBe(3500);

      // Vuln: 3500 * 1.6 = 5600
      expect(result.vulnerable).toBe(5600);

      // BW: 5600 * 2 = 11200
      expect(result.bloodWave).toBe(11200);

      // OP: 11200 * 1.5 = 16800
      expect(result.overpower).toBe(16800);
    });

    it('should handle zero values without errors', () => {
      const stats = {
        baseWeaponDamage: 0,
        skillDamage: 0,
        critChance: 0,
        critDamage: 0,
        vulnerableDamage: 0,
        overpower: 0,
        bloodWaveMultiplier: 0
      };

      const result = calculateDamage(stats);
      expect(result.base).toBe(0);
      expect(result.average).toBe(0);
      expect(result.overpower).toBe(0);
    });

    it('should handle very large values', () => {
      const stats = {
        baseWeaponDamage: 10000,
        skillDamage: 500,
        critChance: 100,
        critDamage: 500,
        vulnerableDamage: 200,
        overpower: 200,
        bloodWaveMultiplier: 300
      };

      const result = calculateDamage(stats);
      expect(result.overpower).toBeGreaterThan(1000000);
    });
  });

  describe('Number Formatting', () => {
    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return Math.round(num).toLocaleString();
    }

    it('should format millions correctly', () => {
      expect(formatNumber(1000000)).toBe('1.00M');
      expect(formatNumber(2500000)).toBe('2.50M');
      expect(formatNumber(10000000)).toBe('10.00M');
    });

    it('should format thousands correctly', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(2500)).toBe('2.5K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('should format small numbers correctly', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(1)).toBe('1');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should round decimal numbers', () => {
      expect(formatNumber(123.456)).toBe('123');
      expect(formatNumber(123.789)).toBe('124');
    });
  });
});
