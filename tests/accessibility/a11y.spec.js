const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Testing (a11y)', () => {

  test('Login Page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // We expect 0 violations. If there are violations, it will list them in the console output.
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Dashboard should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
