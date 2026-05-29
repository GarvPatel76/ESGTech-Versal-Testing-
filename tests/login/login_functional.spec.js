const { test, expect } = require('@playwright/test');

test.describe('B. Login Testing', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('Positive Cases', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
      await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    });

    test('should allow checking remember me', async ({ page }) => {
      const rememberCheckbox = page.locator('input[type="checkbox"], [name*="remember" i]');
      if (await rememberCheckbox.count() > 0) {
         await rememberCheckbox.first().check();
         expect(await rememberCheckbox.first().isChecked()).toBeTruthy();
      }
    });

    test('should successfully logout', async ({ page }) => {
      // Login first
      await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
      await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
      
      // Click logout
      const logoutBtn = page.getByRole('button', { name: 'EC ESG Care' });
      if (await logoutBtn.count() > 0) {
         await logoutBtn.click();
         const signOutBtn = page.locator('text=/sign out|logout/i').first();
         await signOutBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
         if (await signOutBtn.isVisible()) {
             await signOutBtn.click();
         }
         await expect(page).toHaveURL(/.*login/i, { timeout: 10000 });
      }
    });
  });

  test.describe('Negative Cases', () => {
    test('should reject wrong password', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
      await page.getByRole('textbox', { name: 'Password *' }).fill('wrongpassword123');
      await page.getByRole('button', { name: 'Sign In' }).click();
      // Should show error or stay on login
      await expect(page).not.toHaveURL(/.*dashboard/i, { timeout: 5000 });
    });

    test('should show validation on empty fields', async ({ page }) => {
      // Submit without filling anything
      await page.getByRole('button', { name: 'Sign In' }).click();
      // Look for validation messages (native or custom)
      const errorMsg = page.locator('text=/required|empty/i');
      if (await errorMsg.count() > 0) {
         await expect(errorMsg.first()).toBeVisible();
      }
      // Or check if URL is still login
      await expect(page.url()).toContain('login');
    });

    test('should reject invalid email format', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Email *' }).fill('invalidemail.com');
      await page.getByRole('textbox', { name: 'Password *' }).fill('password123');
      await page.getByRole('button', { name: 'Sign In' }).click();
      // Usually the browser native validation blocks it, or custom UI
      await expect(page.url()).toContain('login');
    });

    test('should resist basic SQL injection', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Email *' }).fill("' OR 1=1 --");
      await page.getByRole('textbox', { name: 'Password *' }).fill("' OR 1=1 --");
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should definitely not go to dashboard
      await expect(page).not.toHaveURL(/.*dashboard/i, { timeout: 5000 });
      
      // Ideally should show a generic error rather than a DB crash error
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('SQL syntax');
    });
  });
});
