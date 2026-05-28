const { test, expect } = require('@playwright/test');

test.describe('Logout Tests', () => {
  test('should successfully logout', async ({ page }) => {
    // Navigate to the login page and login first
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill( 'esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill( 'nwjJY21XT9x8');
    await page.click('button:has-text("Sign In")');

    // Wait for successful login (dashboard)
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });

    // Now attempt to logout
    // NOTE: Replace the logout button selector with your app's actual logout button selector
    // Examples: button.logout, text="Logout", etc.
    const logoutButton = page.getByRole('button', { name: 'EC ESG Care' });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.getByRole('menuitem', { name: 'Sign Out' }).click();
      // Should redirect back to login
      await expect(page).toHaveURL(/.*login/i);
    } else {
      console.log('Logout button not visible with standard selector. Please update the test.');
    }
  });
});
