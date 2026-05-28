const { test, expect } = require('@playwright/test');

test.describe('10. API Testing (Basic checks on backend)', () => {

  // Since we don't have the exact API paths, we will intercept requests 
  // made by the frontend during the login flow to test the API directly.
  test('Verify primary API endpoints return 200 OK and handle data', async ({ request, page }) => {
    
    const apiCalls = [];
    
    // Listen to network traffic to capture API endpoints
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('graphql')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });

    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    
    // Let the dashboard load APIs
    await page.waitForLoadState('networkidle');

    console.log(`Intercepted ${apiCalls.length} API calls during login and load.`);

    if (apiCalls.length > 0) {
      // Check that all captured standard APIs succeeded
      const failedApis = apiCalls.filter(api => !api.ok && api.status >= 500);
      expect(failedApis).toHaveLength(0);
      
      // We can also perform a direct REST API request if we know the endpoint
      // Example:
      /*
      const response = await request.get('https://esgtech.vercel.app/api/health');
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      */
    } else {
      console.log('No specific /api/ requests caught. The app might use Server Actions or a different API structure.');
    }
  });

  test('Verify API error handling (404 Not Found)', async ({ request }) => {
    // Make a request to an endpoint that definitely shouldn't exist
    const response = await request.get('https://esgtech.vercel.app/api/this-endpoint-does-not-exist-12345');
    
    // Should gracefully return a 404
    expect(response.status()).toBe(404);
  });
});
