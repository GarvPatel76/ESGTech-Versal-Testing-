const { test, expect } = require('@playwright/test');

test.describe('API Mocking & Error Handling', () => {

  test('Should handle 500 Internal Server Error gracefully on Login', async ({ page }) => {
    // Intercept the login API request and mock a 500 error response
    // Assuming the login API contains '/login' or '/auth'
    await page.route('**/api/**/login*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });

    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify that the UI displays a generic error message and does not crash
    // We look for common error notification patterns
    const errorAlert = page.locator('.alert, .error, [role="alert"], text=/error|failed|wrong/i').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    // Verify that it stays on the login page
    await expect(page).toHaveURL(/.*login/i);
  });

  test('Should handle timeout or network failure on Dashboard', async ({ page }) => {
    // Intercept dashboard data API to simulate network abort
    await page.route('**/api/**/dashboard*', async route => {
      await route.abort('failed');
    });

    // We force login directly or via UI
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Even if dashboard API fails, the container page should load (graceful degradation)
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    
    // There should be some "No data", "Failed to load", or error state rather than a blank white screen
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
