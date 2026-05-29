const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Testing', () => {

  test('Login Page Visual Comparison', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if the page matches the baseline screenshot
    // The first run will generate the baseline. Subsequent runs will compare against it.
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.05, // Allow up to 5% pixel difference to avoid flakiness
      fullPage: true
    });
  });

  test('Dashboard Page Visual Comparison', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Masking dynamic content like charts or graphs that change frequently
    await expect(page).toHaveScreenshot('dashboard-page.png', {
      mask: [page.locator('.recharts-wrapper'), page.locator('canvas')],
      maxDiffPixelRatio: 0.05,
      fullPage: true
    });
  });
});
