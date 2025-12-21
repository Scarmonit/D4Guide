/**
 * SkillManager - Skill tree and point allocation
 */

import { storage } from '../utils/storage.js';

export class SkillManager {
  constructor() {
    this.skills = {};
    this.maxPoints = 58;
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
    this.calculateUsedPoints();
  }

  calculateUsedPoints() {
    this.usedPoints = Object.values(this.skills).reduce((sum, points) => sum + points, 0);
  }

  setupSkillControls() {
    document.querySelectorAll('.skill-point-control').forEach(control => {
      const skillId = control.dataset.skillId;
      const addBtn = control.querySelector('.add-point');
      const removeBtn = control.querySelector('.remove-point');

      if (addBtn) {
        addBtn.addEventListener('click', () => this.addPoint(skillId));
      }
      if (removeBtn) {
        removeBtn.addEventListener('click', () => this.removePoint(skillId));
      }
    });
  }

  addPoint(skillId) {
    if (this.usedPoints >= this.maxPoints) return;

    const currentPoints = this.skills[skillId] || 0;
    const maxForSkill = this.getMaxPointsForSkill(skillId);

    if (currentPoints < maxForSkill) {
      this.skills[skillId] = currentPoints + 1;
      this.usedPoints++;
      this.saveAndUpdate();
    }
  }

  removePoint(skillId) {
    const currentPoints = this.skills[skillId] || 0;
    if (currentPoints > 0) {
      this.skills[skillId] = currentPoints - 1;
      this.usedPoints--;
      this.saveAndUpdate();
    }
  }

  getMaxPointsForSkill(skillId) {
    // Most skills max at 5, some at 1 or 3
    const skillElement = document.querySelector(`[data-skill-id="${skillId}"]`);
    return parseInt(skillElement?.dataset.maxPoints || '5', 10);
  }

  saveAndUpdate() {
    storage.set('skills', this.skills);
    this.updateDisplay();
  }

  updateDisplay() {
    // Update point counter
    const counter = document.getElementById('skill-points-used');
    if (counter) {
      counter.textContent = `${this.usedPoints}/${this.maxPoints}`;
    }

    // Update individual skill displays
    Object.entries(this.skills).forEach(([skillId, points]) => {
      const display = document.querySelector(`[data-skill-id="${skillId}"] .point-count`);
      if (display) {
        display.textContent = points;
      }
    });
  }

  resetSkills() {
    this.skills = {};
    this.usedPoints = 0;
    this.saveAndUpdate();
  }
}
