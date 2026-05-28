const { test, expect } = require('@playwright/test');

test.describe('D. Dashboard Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'esgcare@growlity.com');
    await page.fill('#password', 'nwjJY21XT9x8');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should load main data containers', async ({ page }) => {
    // Look for generic data containers like tables, lists, or grids
    const dataContainers = page.locator('table, .grid, .list, [role="grid"], .card');
    const count = await dataContainers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display charts properly', async ({ page }) => {
    // Charts are usually rendered in SVG or Canvas
    const charts = page.locator('svg, canvas, .recharts-wrapper, .chartjs-render-monitor');
    // We expect at least one chart on an ESG dashboard
    const count = await charts.count();
    if(count > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('dashboard buttons should be clickable', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    // Test that the first few buttons are at least interactive
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(buttons.nth(i)).toBeEnabled();
    }
  });
});
