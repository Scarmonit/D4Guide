import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const guidePath = path.join(__dirname, '..', 'blood_wave_necro_guide_advanced.html');

test.describe('D4 Necro Guide E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Load the local HTML file
    await page.goto(`file://${guidePath}`);
  });

  test('should load the page and display correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Shadow Blood Wave Necromancer/);
    await expect(page.locator('h1')).toContainText('Shadow Blood Wave Necromancer');
  });

  test('should toggle theme', async ({ page }) => {
    const themeBtn = page.locator('#themeSwitcher');

    // Check initial state (dark)
    await expect(page.locator('body')).not.toHaveClass(/light-theme/);

    // Toggle
    await themeBtn.click();
    await expect(page.locator('body')).toHaveClass(/light-theme/);

    // Toggle back
    await themeBtn.click();
    await expect(page.locator('body')).not.toHaveClass(/light-theme/);
  });

  test('should calculate skill points correctly', async ({ page }) => {
    // Reset skills first to ensure clean state
    await page.locator('#resetSkills').click();

    // Find a skill point element (e.g., Decompose)
    const skillPoint = page.locator('.points').first();
    const usedPointsDisplay = page.locator('#pointsUsed');

    // Initial state after reset
    await expect(usedPointsDisplay).toHaveText('0');

    // Add point
    await skillPoint.click();
    await expect(usedPointsDisplay).toHaveText('1');
    await expect(skillPoint).toContainText('1/');

    // Remove point (right click)
    await skillPoint.click({ button: 'right' });
    await expect(usedPointsDisplay).toHaveText('0');
    await expect(skillPoint).toContainText('0/');
  });

  test('should update damage calculator', async ({ page }) => {
    const weaponInput = page.locator('#weaponDamage');
    const resultDisplay = page.locator('#damageResult');

    // Get initial value
    const initialValue = await resultDisplay.textContent();

    // Change weapon damage
    await weaponInput.fill('10000');

    // Wait for update (it's immediate, but good practice to wait for change)
    await expect(resultDisplay).not.toHaveText(initialValue);

    // Check if it increased
    const newValue = parseInt((await resultDisplay.textContent()).replace(/,/g, ''));
    const oldValue = parseInt(initialValue.replace(/,/g, ''));
    expect(newValue).toBeGreaterThan(oldValue);
  });

  test('should open gear comparison modal', async ({ page }) => {
    const gearSlot = page.locator('.gear-slot[data-gear="helmet"]');
    const modal = page.locator('#gearModal');

    await expect(modal).toBeHidden();

    await gearSlot.click();
    await expect(modal).toBeVisible();
    await expect(page.locator('#modalTitle')).toContainText('Helmet Comparison');

    // Close modal
    await page.locator('#closeModal').click();
    await expect(modal).toBeHidden();
  });

  test('should close modal by clicking close button', async ({ page }) => {
    const gearSlot = page.locator('.gear-slot[data-gear="helmet"]');
    const modal = page.locator('#gearModal');
    const closeBtn = page.locator('#closeModal');

    await gearSlot.click();
    await expect(modal).toBeVisible();

    // Click close button to close
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });

  test('should navigate between sections', async ({ page }) => {
    // Check main sections exist
    await expect(page.locator('#gear')).toBeVisible();
    await expect(page.locator('#skills')).toBeVisible();
    await expect(page.locator('#calculator')).toBeVisible();

    // Check navigation menu exists
    const navMenu = page.locator('#navMenu');
    await expect(navMenu).toBeVisible();
  });

  test('should display all gear slots', async ({ page }) => {
    // These are the actual gear slots in the application
    const gearSlots = [
      'helmet',
      'chest',
      'gloves',
      'pants',
      'boots',
      'amulet',
      'ring1',
      'ring2',
      'weapon'
    ];

    for (const slot of gearSlots) {
      const slotElement = page.locator(`.gear-slot[data-gear="${slot}"]`);
      await expect(slotElement).toBeVisible();
    }
  });

  test('should persist theme preference', async ({ page }) => {
    const themeBtn = page.locator('#themeSwitcher');

    // Toggle to light theme
    await themeBtn.click();
    await expect(page.locator('body')).toHaveClass(/light-theme/);

    // Reload page
    await page.reload();

    // Check theme persisted
    await expect(page.locator('body')).toHaveClass(/light-theme/);
  });

  test('should handle multiple skill point allocations', async ({ page }) => {
    await page.locator('#resetSkills').click();

    const skillPoints = page.locator('.points');
    const usedPointsDisplay = page.locator('#pointsUsed');

    // Allocate 5 points to first skill
    const firstSkill = skillPoints.first();
    for (let i = 0; i < 5; i++) {
      await firstSkill.click();
    }

    await expect(usedPointsDisplay).toHaveText('5');
    await expect(firstSkill).toContainText('5/');
  });

  test('should not exceed max skill points', async ({ page }) => {
    await page.locator('#resetSkills').click();

    const skillPoints = page.locator('.points');
    const usedPointsDisplay = page.locator('#pointsUsed');
    const totalPoints = page.locator('#totalPoints');

    // Get max points value
    const maxPointsText = await totalPoints.textContent();
    const maxPoints = parseInt(maxPointsText);

    // Try to allocate more than max (click many times on first skill)
    const firstSkill = skillPoints.first();
    for (let i = 0; i < maxPoints + 5; i++) {
      await firstSkill.click();
    }

    // Used points should not exceed total
    const usedText = await usedPointsDisplay.textContent();
    const used = parseInt(usedText);
    expect(used).toBeLessThanOrEqual(maxPoints);
  });

  test('should reset all skills to zero', async ({ page }) => {
    const skillPoints = page.locator('.points');
    const usedPointsDisplay = page.locator('#pointsUsed');

    // Allocate some points
    await skillPoints.first().click();
    await skillPoints.nth(1).click();

    // Reset
    await page.locator('#resetSkills').click();

    // Verify all reset
    await expect(usedPointsDisplay).toHaveText('0');
  });

  test('should have responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#gear')).toBeVisible();
  });

  test('should have functional search overlay', async ({ page }) => {
    // Check search toggle exists
    const searchToggle = page.locator('#searchToggle');
    const searchOverlay = page.locator('#searchOverlay');

    await expect(searchToggle).toBeVisible();

    // Open search overlay
    await searchToggle.click();
    await expect(searchOverlay).toBeVisible();
  });
});
