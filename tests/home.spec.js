const { test, expect } = require('@playwright/test');

test.describe('Home Page Tests', () => {
  test('should load the home page successfully', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Check that the page has loaded by verifying the title or a specific element
    // We'll check if the page has a title
    await expect(page).toHaveTitle(/ESG/i);
    
    // You can add more assertions here based on the actual content of the page
  });
});
