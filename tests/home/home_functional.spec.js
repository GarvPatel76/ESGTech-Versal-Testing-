const { test, expect } = require('@playwright/test');

test.describe('A. Home Page Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display logo', async ({ page }) => {
    // Look for common logo selectors
    const logo = page.locator('img[alt*="ESGtech.ai" i], img[alt*="logo" i], .logo, #logo').first();
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation links', async ({ page }) => {
    const navLinks = page.locator('header a, nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
    // Just checking the first link is clickable
    if(count > 0) {
        await expect(navLinks.first()).toBeEnabled();
    }
  });

  test('should have clickable main buttons', async ({ page }) => {
    const buttons = page.locator('button, .btn, a.btn');
    const count = await buttons.count();
    if(count > 0) {
      await expect(buttons.first()).toBeEnabled();
    }
  });

  test('should properly load images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      // Check if naturalWidth is > 0
      const isLoaded = await images.nth(i).evaluate((img) => img.naturalWidth > 0);
      expect(isLoaded).toBeTruthy();
    }
  });

  test('should have working footer links', async ({ page }) => {
    const footerLinks = page.locator('footer a');
    const count = await footerLinks.count();
    if(count > 0) {
       await expect(footerLinks.first()).toBeEnabled();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // Often a hamburger menu appears
    const hamburger = page.locator('button[aria-label*="menu" i], .hamburger, .menu-icon');
    if (await hamburger.count() > 0) {
       await expect(hamburger.first()).toBeVisible();
    }
    // Verify layout hasn't completely broken by checking body width
    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
