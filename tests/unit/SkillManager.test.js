/**
 * Unit tests for SkillManager module
 */

import { describe, it, expect } from 'vitest';
import {
  calculateUsedPoints,
  canAddPoint,
  canRemovePoint,
  addPoint,
  removePoint,
  resetSkills,
  formatPointCounter,
  DEFAULT_MAX_POINTS,
  DEFAULT_SKILL_MAX
} from '../../src/js/modules/SkillManager.js';

describe('SkillManager', () => {
  describe('Constants', () => {
    it('should have correct default max points', () => {
      expect(DEFAULT_MAX_POINTS).toBe(58);
    });

    it('should have correct default skill max', () => {
      expect(DEFAULT_SKILL_MAX).toBe(5);
    });
  });

  describe('calculateUsedPoints()', () => {
    it('should return 0 for empty skills', () => {
      expect(calculateUsedPoints({})).toBe(0);
    });

    it('should sum all skill points', () => {
      const skills = { skill1: 3, skill2: 5, skill3: 2 };
      expect(calculateUsedPoints(skills)).toBe(10);
    });

    it('should handle single skill', () => {
      const skills = { skill1: 5 };
      expect(calculateUsedPoints(skills)).toBe(5);
    });
  });

  describe('canAddPoint()', () => {
    it('should allow adding point when under limits', () => {
      const skills = { skill1: 2 };
      expect(canAddPoint(skills, 'skill1', 58, 5)).toBe(true);
    });

    it('should prevent adding when at skill max', () => {
      const skills = { skill1: 5 };
      expect(canAddPoint(skills, 'skill1', 58, 5)).toBe(false);
    });

    it('should prevent adding when at total max', () => {
      const skills = { skill1: 5, skill2: 5, skill3: 48 };
      expect(canAddPoint(skills, 'skill4', 58, 5)).toBe(false);
    });

    it('should allow adding to new skill', () => {
      const skills = {};
      expect(canAddPoint(skills, 'newSkill', 58, 5)).toBe(true);
    });
  });

  describe('canRemovePoint()', () => {
    it('should allow removing when points exist', () => {
      const skills = { skill1: 3 };
      expect(canRemovePoint(skills, 'skill1')).toBe(true);
    });

    it('should prevent removing when at zero', () => {
      const skills = { skill1: 0 };
      expect(canRemovePoint(skills, 'skill1')).toBe(false);
    });

    it('should prevent removing from non-existent skill', () => {
      const skills = {};
      expect(canRemovePoint(skills, 'skill1')).toBe(false);
    });
  });

  describe('addPoint()', () => {
    it('should add point to skill', () => {
      const skills = { skill1: 2 };
      const result = addPoint(skills, 'skill1', 58, 5);
      expect(result.skill1).toBe(3);
    });

    it('should create new skill entry', () => {
      const skills = {};
      const result = addPoint(skills, 'skill1', 58, 5);
      expect(result.skill1).toBe(1);
    });

    it('should return same object when cannot add', () => {
      const skills = { skill1: 5 };
      const result = addPoint(skills, 'skill1', 58, 5);
      expect(result).toBe(skills);
    });

    it('should not mutate original object', () => {
      const skills = { skill1: 2 };
      addPoint(skills, 'skill1', 58, 5);
      expect(skills.skill1).toBe(2);
    });
  });

  describe('removePoint()', () => {
    it('should remove point from skill', () => {
      const skills = { skill1: 3 };
      const result = removePoint(skills, 'skill1');
      expect(result.skill1).toBe(2);
    });

    it('should return same object when cannot remove', () => {
      const skills = { skill1: 0 };
      const result = removePoint(skills, 'skill1');
      expect(result).toBe(skills);
    });

    it('should not mutate original object', () => {
      const skills = { skill1: 3 };
      removePoint(skills, 'skill1');
      expect(skills.skill1).toBe(3);
    });
  });

  describe('resetSkills()', () => {
    it('should return empty object', () => {
      expect(resetSkills()).toEqual({});
    });
  });

  describe('formatPointCounter()', () => {
    it('should format correctly', () => {
      expect(formatPointCounter(10, 58)).toBe('10/58');
    });

    it('should handle zero', () => {
      expect(formatPointCounter(0, 58)).toBe('0/58');
    });

    it('should handle max', () => {
      expect(formatPointCounter(58, 58)).toBe('58/58');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full allocation workflow', () => {
      let skills = {};

      // Add points
      skills = addPoint(skills, 'skill1', 58, 5);
      skills = addPoint(skills, 'skill1', 58, 5);
      skills = addPoint(skills, 'skill2', 58, 5);

      expect(calculateUsedPoints(skills)).toBe(3);
      expect(skills.skill1).toBe(2);
      expect(skills.skill2).toBe(1);

      // Remove a point
      skills = removePoint(skills, 'skill1');
      expect(skills.skill1).toBe(1);
      expect(calculateUsedPoints(skills)).toBe(2);
    });

    it('should track multiple skills independently', () => {
      let skills = {};

      skills = addPoint(skills, 'bloodWave', 58, 5);
      skills = addPoint(skills, 'bloodWave', 58, 5);
      skills = addPoint(skills, 'corpseExplosion', 58, 5);
      skills = addPoint(skills, 'boneSpear', 58, 5);

      expect(skills.bloodWave).toBe(2);
      expect(skills.corpseExplosion).toBe(1);
      expect(skills.boneSpear).toBe(1);
      expect(calculateUsedPoints(skills)).toBe(4);
    });
  });
});
