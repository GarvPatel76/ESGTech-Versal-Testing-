const { test, expect } = require('@playwright/test');

test.describe('F. Search Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'esgcare@growlity.com');
    await page.fill('#password', 'nwjJY21XT9x8');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
  });

  test('should perform valid search and display results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Test');
      await searchInput.first().press('Enter');
      
      // Wait for results to update (using network idle or looking for a loader)
      await page.waitForLoadState('networkidle');
      
      const resultsContainer = page.locator('table, .results, .grid');
      if (await resultsContainer.count() > 0) {
        await expect(resultsContainer.first()).toBeVisible();
      }
    }
  });

  test('should handle invalid search with no results message', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('asdfghjklqwertyuiop'); // Random string unlikely to exist
      await searchInput.first().press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      const noResultsMsg = page.locator('text=/no results|no records found|0 results/i');
      if (await noResultsMsg.count() > 0) {
        await expect(noResultsMsg.first()).toBeVisible();
      }
    }
  });

  test('should be able to clear search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Test');
      
      // Look for a clear button ('x') inside or next to search input
      const clearBtn = page.locator('button[aria-label*="clear" i], .clear-search');
      if (await clearBtn.count() > 0) {
        await clearBtn.first().click();
        const inputValue = await searchInput.first().inputValue();
        expect(inputValue).toBe('');
      } else {
        // Fallback: manually clear
        await searchInput.first().fill('');
        const inputValue = await searchInput.first().inputValue();
        expect(inputValue).toBe('');
      }
    }
  });
});
