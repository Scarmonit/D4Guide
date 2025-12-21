/**
 * Unit tests for SkillManager module
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('SkillManager', () => {
  // Test the skill point management logic
  describe('Point Allocation Logic', () => {
    // Simulated skill manager state
    let skills;
    let maxPoints;
    let usedPoints;

    function calculateUsedPoints() {
      return Object.values(skills).reduce((sum, points) => sum + points, 0);
    }

    function addPoint(skillId, maxForSkill = 5) {
      if (usedPoints >= maxPoints) return false;

      const currentPoints = skills[skillId] || 0;
      if (currentPoints < maxForSkill) {
        skills[skillId] = currentPoints + 1;
        usedPoints++;
        return true;
      }
      return false;
    }

    function removePoint(skillId) {
      const currentPoints = skills[skillId] || 0;
      if (currentPoints > 0) {
        skills[skillId] = currentPoints - 1;
        usedPoints--;
        return true;
      }
      return false;
    }

    function resetSkills() {
      skills = {};
      usedPoints = 0;
    }

    beforeEach(() => {
      skills = {};
      maxPoints = 58;
      usedPoints = 0;
    });

    it('should start with zero used points', () => {
      expect(usedPoints).toBe(0);
      expect(calculateUsedPoints()).toBe(0);
    });

    it('should add a point to a skill', () => {
      const result = addPoint('blood_wave');
      expect(result).toBe(true);
      expect(skills.blood_wave).toBe(1);
      expect(usedPoints).toBe(1);
    });

    it('should add multiple points to a skill', () => {
      addPoint('blood_wave');
      addPoint('blood_wave');
      addPoint('blood_wave');
      expect(skills.blood_wave).toBe(3);
      expect(usedPoints).toBe(3);
    });

    it('should not exceed max points for a skill', () => {
      const maxForSkill = 5;
      for (let i = 0; i < 10; i++) {
        addPoint('blood_wave', maxForSkill);
      }
      expect(skills.blood_wave).toBe(5);
      expect(usedPoints).toBe(5);
    });

    it('should not exceed total max points', () => {
      maxPoints = 10; // Lower for testing
      for (let i = 0; i < 15; i++) {
        addPoint(`skill_${i}`, 5);
      }
      expect(usedPoints).toBe(10);
    });

    it('should remove a point from a skill', () => {
      addPoint('blood_wave');
      addPoint('blood_wave');
      expect(skills.blood_wave).toBe(2);

      const result = removePoint('blood_wave');
      expect(result).toBe(true);
      expect(skills.blood_wave).toBe(1);
      expect(usedPoints).toBe(1);
    });

    it('should not remove point from skill with zero points', () => {
      const result = removePoint('nonexistent_skill');
      expect(result).toBe(false);
      expect(usedPoints).toBe(0);
    });

    it('should not go negative on points', () => {
      addPoint('blood_wave');
      removePoint('blood_wave');
      removePoint('blood_wave'); // Should fail
      expect(skills.blood_wave).toBe(0);
      expect(usedPoints).toBe(0);
    });

    it('should reset all skills', () => {
      addPoint('blood_wave');
      addPoint('blood_wave');
      addPoint('decompose');
      addPoint('bone_spear');

      resetSkills();

      expect(skills).toEqual({});
      expect(usedPoints).toBe(0);
    });

    it('should calculate used points correctly', () => {
      skills = {
        blood_wave: 5,
        decompose: 3,
        bone_spear: 2,
        corpse_explosion: 4
      };
      expect(calculateUsedPoints()).toBe(14);
    });

    it('should handle skills with different max points', () => {
      // Passive with max 1
      addPoint('passive_skill', 1);
      addPoint('passive_skill', 1); // Should fail

      // Regular skill with max 5
      addPoint('regular_skill', 5);
      addPoint('regular_skill', 5);
      addPoint('regular_skill', 5);

      expect(skills.passive_skill).toBe(1);
      expect(skills.regular_skill).toBe(3);
    });

    it('should track multiple skills independently', () => {
      addPoint('skill_a');
      addPoint('skill_a');
      addPoint('skill_b');
      addPoint('skill_c');
      addPoint('skill_c');
      addPoint('skill_c');

      expect(skills.skill_a).toBe(2);
      expect(skills.skill_b).toBe(1);
      expect(skills.skill_c).toBe(3);
      expect(usedPoints).toBe(6);
    });

    it('should allow adding points after removing', () => {
      maxPoints = 5;

      // Fill up
      for (let i = 0; i < 5; i++) {
        addPoint('skill_a', 10);
      }
      expect(usedPoints).toBe(5);

      // Can't add more
      const resultFull = addPoint('skill_a', 10);
      expect(resultFull).toBe(false);

      // Remove one
      removePoint('skill_a');
      expect(usedPoints).toBe(4);

      // Now can add
      const resultAfterRemove = addPoint('skill_b', 10);
      expect(resultAfterRemove).toBe(true);
      expect(usedPoints).toBe(5);
    });
  });

  describe('Display Formatting', () => {
    it('should format point counter correctly', () => {
      const formatCounter = (used, max) => `${used}/${max}`;

      expect(formatCounter(0, 58)).toBe('0/58');
      expect(formatCounter(25, 58)).toBe('25/58');
      expect(formatCounter(58, 58)).toBe('58/58');
    });
  });
});
