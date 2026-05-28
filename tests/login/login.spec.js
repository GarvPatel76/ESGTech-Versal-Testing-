const { test, expect } = require('@playwright/test');

test.describe('Login Tests', () => {
  test('should successfully login and display dashboard', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Fill in the login credentials
    await page.getByRole('textbox', { name: 'Email *' }).fill( 'esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill( 'nwjJY21XT9x8');

    // Click the Sign In button
    await page.click('button:has-text("Sign In")');

    // Wait for the URL to change to dashboard or expect a dashboard element
    // Assuming the url contains dashboard after successful login
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 10000 });
  });
});
