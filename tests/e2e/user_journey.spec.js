const { test, expect } = require('@playwright/test');

test.describe('E2E User Journey', () => {
  test('Complete flow: Login -> Dashboard -> Search -> Logout', async ({ page }) => {
    // 1. Login
    await test.step('Login to the application', async () => {
      await page.goto('/login');
      await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
      await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    });

    // 2. Dashboard Checks
    await test.step('Verify Dashboard Elements', async () => {
      const charts = page.locator('.recharts-wrapper, .chartjs-render-monitor, canvas');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
      
      const cards = page.locator('.card, [role="grid"], table');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    });

    // 3. Search Flow
    await test.step('Perform a Search', async () => {
      const searchIcon = page.locator('button[aria-label*="search" i], .search-icon, input[type="search"]').first();
      if (await searchIcon.count() > 0) {
         if (await searchIcon.getAttribute('type') !== 'search') {
            await searchIcon.click();
         }
         const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
         await searchInput.fill('Emissions');
         await searchInput.press('Enter');
         await page.waitForTimeout(2000); // wait for results
      }
    });

    // 4. Logout
    await test.step('Logout from the application', async () => {
      const logoutBtn = page.getByRole('button', { name: 'EC ESG Care' });
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        const signOutBtn = page.locator('text=/sign out|logout/i').first();
        await signOutBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        if (await signOutBtn.isVisible()) {
            await signOutBtn.click();
        }
      }
      await expect(page).toHaveURL(/.*login/i, { timeout: 10000 });
    });
  });
});
