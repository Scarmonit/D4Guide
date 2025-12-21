/**
 * SkillManager - Skill tree and point allocation
 */

import { storage } from '../utils/storage.js';

// ============================================
// Pure functions (testable without DOM)
// ============================================

/**
 * Default maximum skill points
 */
export const DEFAULT_MAX_POINTS = 58;

/**
 * Default max points per skill
 */
export const DEFAULT_SKILL_MAX = 5;

/**
 * Calculate total used points from skills object
 * @param {Object} skills - Object mapping skill IDs to point values
 * @returns {number} Total points used
 */
export function calculateUsedPoints(skills) {
  return Object.values(skills).reduce((sum, points) => sum + points, 0);
}

/**
 * Check if a point can be added to a skill
 * @param {Object} skills - Current skills object
 * @param {string} skillId - The skill to add a point to
 * @param {number} maxPoints - Maximum total points allowed
 * @param {number} maxForSkill - Maximum points for this specific skill
 * @returns {boolean} Whether the point can be added
 */
export function canAddPoint(skills, skillId, maxPoints, maxForSkill) {
  const usedPoints = calculateUsedPoints(skills);
  const currentPoints = skills[skillId] || 0;
  return usedPoints < maxPoints && currentPoints < maxForSkill;
}

/**
 * Check if a point can be removed from a skill
 * @param {Object} skills - Current skills object
 * @param {string} skillId - The skill to remove a point from
 * @returns {boolean} Whether the point can be removed
 */
export function canRemovePoint(skills, skillId) {
  const currentPoints = skills[skillId] || 0;
  return currentPoints > 0;
}

/**
 * Add a point to a skill (returns new skills object)
 * @param {Object} skills - Current skills object
 * @param {string} skillId - The skill to add a point to
 * @param {number} maxPoints - Maximum total points allowed
 * @param {number} maxForSkill - Maximum points for this specific skill
 * @returns {Object} New skills object (or same if cannot add)
 */
export function addPoint(skills, skillId, maxPoints, maxForSkill) {
  if (!canAddPoint(skills, skillId, maxPoints, maxForSkill)) {
    return skills;
  }
  const currentPoints = skills[skillId] || 0;
  return { ...skills, [skillId]: currentPoints + 1 };
}

/**
 * Remove a point from a skill (returns new skills object)
 * @param {Object} skills - Current skills object
 * @param {string} skillId - The skill to remove a point from
 * @returns {Object} New skills object (or same if cannot remove)
 */
export function removePoint(skills, skillId) {
  if (!canRemovePoint(skills, skillId)) {
    return skills;
  }
  const currentPoints = skills[skillId] || 0;
  return { ...skills, [skillId]: currentPoints - 1 };
}

/**
 * Reset all skills to zero
 * @returns {Object} Empty skills object
 */
export function resetSkills() {
  return {};
}

/**
 * Format the point counter display
 * @param {number} used - Points used
 * @param {number} max - Maximum points
 * @returns {string} Formatted string
 */
export function formatPointCounter(used, max) {
  return `${used}/${max}`;
}

// ============================================
// Class with DOM bindings
// ============================================

export class SkillManager {
  constructor() {
    this.skills = {};
    this.maxPoints = DEFAULT_MAX_POINTS;
    this.usedPoints = 0;
    this.init();
  }

  init() {
    this.loadSkills();
    this.setupSkillControls();
    this.updateDisplay();
  }

  loadSkills() {
    this.skills = storage.get('skills', {});
    this.usedPoints = calculateUsedPoints(this.skills);
  }

  setupSkillControls() {
    document.querySelectorAll('.skill-point-control').forEach(control => {
      const skillId = control.dataset.skillId;
      const addBtn = control.querySelector('.add-point');
      const removeBtn = control.querySelector('.remove-point');

      if (addBtn) {
        addBtn.addEventListener('click', () => this.handleAddPoint(skillId));
      }
      if (removeBtn) {
        removeBtn.addEventListener('click', () => this.handleRemovePoint(skillId));
      }
    });
  }

  handleAddPoint(skillId) {
    const maxForSkill = this.getMaxPointsForSkill(skillId);
    const newSkills = addPoint(this.skills, skillId, this.maxPoints, maxForSkill);
    if (newSkills !== this.skills) {
      this.skills = newSkills;
      this.usedPoints = calculateUsedPoints(this.skills);
      this.saveAndUpdate();
    }
  }

  handleRemovePoint(skillId) {
    const newSkills = removePoint(this.skills, skillId);
    if (newSkills !== this.skills) {
      this.skills = newSkills;
      this.usedPoints = calculateUsedPoints(this.skills);
      this.saveAndUpdate();
    }
  }

  getMaxPointsForSkill(skillId) {
    const skillElement = document.querySelector(`[data-skill-id="${skillId}"]`);
    return parseInt(skillElement?.dataset.maxPoints || DEFAULT_SKILL_MAX, 10);
  }

  saveAndUpdate() {
    storage.set('skills', this.skills);
    this.updateDisplay();
  }

  updateDisplay() {
    const counter = document.getElementById('skill-points-used');
    if (counter) {
      counter.textContent = formatPointCounter(this.usedPoints, this.maxPoints);
    }

    Object.entries(this.skills).forEach(([skillId, points]) => {
      const display = document.querySelector(`[data-skill-id="${skillId}"] .point-count`);
      if (display) {
        display.textContent = points;
      }
    });
  }

  handleResetSkills() {
    this.skills = resetSkills();
    this.usedPoints = 0;
    this.saveAndUpdate();
  }
}
