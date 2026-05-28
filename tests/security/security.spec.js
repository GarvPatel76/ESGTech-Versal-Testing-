const { test, expect } = require('@playwright/test');

test.describe('9. Basic Security Testing', () => {

  test('Password input should be hidden (type="password")', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByRole('textbox', { name: 'Password *' });
    
    // We check if the attribute is actually 'password' so characters are masked
    const type = await passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  test('App should enforce HTTPS', async ({ page }) => {
    await page.goto('/');
    const currentUrl = page.url();
    // Assuming the app runs on vercel, it should be https
    if(!currentUrl.includes('localhost')) {
       expect(currentUrl.startsWith('https://')).toBeTruthy();
    }
  });

  test('Should block direct URL access to dashboard without login', async ({ page }) => {
    // Attempt to go directly to dashboard without authenticating
    await page.goto('/dashboard');
    
    // Wait for a moment for potential redirects
    await page.waitForTimeout(2000);
    
    // URL should redirect away from dashboard (usually back to login)
    expect(page.url()).not.toContain('/dashboard');
  });

  test('Session logout should prevent back button navigation', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    
    // Logout
    const logoutBtn = page.getByRole('button', { name: 'EC ESG Care' });
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await page.getByRole('menuitem', { name: 'Sign Out' }).click();
    }
    
    await expect(page).toHaveURL(/.*login/i, { timeout: 10000 });
    
    // Simulate browser back button
    await page.goBack();
    await page.waitForTimeout(2000);
    
    // Check if we are incorrectly allowed back into dashboard
    const bodyText = await page.locator('body').innerText();
    // It shouldn't show dashboard content, usually it will redirect back to login automatically
    // if the auth guard is strong on the frontend.
    expect(page.url()).not.toContain('/dashboard');
  });
});
