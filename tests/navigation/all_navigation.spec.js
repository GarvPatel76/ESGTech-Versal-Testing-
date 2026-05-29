const { test, expect } = require('@playwright/test');

test.describe('All Navigation Links Test', () => {
  // Give this test a longer timeout as it will navigate to multiple pages
  test.setTimeout(180000);

  test('should verify all navigation menu items work correctly', async ({ page }) => {
    // 1. Login to the application
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill( 'esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill( 'nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for the dashboard to load
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 2. Identify all Navigation Links
    // We target common navigation wrappers: <nav>, <aside>, or elements with classes like 'sidebar', 'menu', 'nav'
    // If the app uses a specific sidebar id/class, you can refine this selector later.
    const navLinksLocator = page.locator('nav a[href], aside a[href], [class*="sidebar"] a[href], [class*="menu"] a[href], [class*="nav"] a[href]');
    
    // Extract unique URLs from these navigation links
    const urlsToTest = new Set();
    const count = await navLinksLocator.count();
    
    for (let i = 0; i < count; i++) {
      const href = await navLinksLocator.nth(i).getAttribute('href');
      // Only test internal links that don't just point to '#' or empty
      if (href && !href.startsWith('http') && href !== '#' && href.trim() !== '') {
        urlsToTest.add(href);
      }
    }

    const uniqueUrls = Array.from(urlsToTest);
    console.log(`Found ${uniqueUrls.length} unique navigation links to test:`, uniqueUrls);

    // If we didn't find any links with the specific selector, fallback to testing all internal links on the dashboard
    let finalUrlsToTest = uniqueUrls;
    if (finalUrlsToTest.length === 0) {
      console.log('No specific nav links found. Falling back to all internal dashboard links.');
      const allLinks = await page.locator('a[href]').evaluateAll(links => 
        links.map(l => l.getAttribute('href')).filter(h => h && !h.startsWith('http') && h !== '#' && h !== '')
      );
      finalUrlsToTest = Array.from(new Set(allLinks));
      console.log(`Fallback found ${finalUrlsToTest.length} internal links.`);
    }

    // Ensure we have links to test
    expect(finalUrlsToTest.length).toBeGreaterThan(0);

    const errors = [];

    // 3. Visit each navigation link and verify page loads
    for (const url of finalUrlsToTest) {
      console.log(`Testing navigation to: ${url}`);
      
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        
        // Check for HTTP errors
        if (response && response.status() >= 400) {
          errors.push(`[${url}] Failed with HTTP Status ${response.status()}`);
          continue;
        }

        // Check for common error text on the page
        const bodyText = await page.locator('body').innerText();
        if (bodyText.includes('404 Not Found') || bodyText.includes('This page could not be found')) {
          errors.push(`[${url}] Loaded but showed a 404/Not Found message`);
        }

        // Wait a short moment for dynamic content to settle
        await page.waitForTimeout(1000);

      } catch (error) {
        errors.push(`[${url}] Navigation threw an error: ${error.message}`);
      }
    }

    // Print out summary
    console.log(`\n--- NAVIGATION TEST SUMMARY ---`);
    console.log(`Tested ${finalUrlsToTest.length} navigation links.`);
    if (errors.length > 0) {
      console.error(`Found ${errors.length} errors:`, errors);
    } else {
      console.log('All navigation links successfully verified! No broken pages found.');
    }

    // 4. Assert that there are no errors
    expect(errors).toHaveLength(0);
  });
});
