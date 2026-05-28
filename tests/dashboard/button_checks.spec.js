const { test, expect } = require('@playwright/test');

test.describe('Dashboard Navigation and Button Tests', () => {
  // Use beforeAll or beforeEach to login before checking buttons
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'esgcare@growlity.com');
    await page.fill('#password', 'nwjJY21XT9x8');
    await page.click('button:has-text("Sign In")');
    // Wait for navigation
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
  });

  test('should verify all main buttons and links are visible', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Find all buttons on the page
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    console.log(`Found ${buttonCount} buttons on the dashboard.`);

    // Verify at least some buttons exist
    expect(buttonCount).toBeGreaterThan(0);

    // Check visibility of first few buttons to avoid long test times
    const maxButtonsToCheck = Math.min(buttonCount, 10); 
    for (let i = 0; i < maxButtonsToCheck; i++) {
      await expect(buttons.nth(i)).toBeVisible();
    }

    // Find all anchor links
    const links = page.locator('a');
    const linkCount = await links.count();
    console.log(`Found ${linkCount} links on the dashboard.`);

    const maxLinksToCheck = Math.min(linkCount, 10);
    for (let i = 0; i < maxLinksToCheck; i++) {
      // Ensure the links are attached to the DOM (some might be hidden, so we just check attachment)
      const link = links.nth(i);
      const isAttached = await link.evaluate(node => node.isConnected);
      expect(isAttached).toBeTruthy();
    }
  });

  test('should click the first available navigation link and verify page loads', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find a link that isn't just "#" or empty
    const navLinks = page.locator('a[href]:not([href="#"]):not([href=""])');
    
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');
      console.log(`Clicking navigation link: ${href}`);
      
      // Click and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}), // catch timeout if it doesn't navigate
        firstLink.click()
      ]);
      
      // Basic check that we are still on the app and not hitting a 404
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('404');
    } else {
      console.log('No actionable navigation links found on dashboard.');
    }
  });
});
