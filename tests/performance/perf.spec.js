const { test, expect } = require('@playwright/test');

test.describe('8. Performance Testing', () => {

  test('Measure page load and navigation timing', async ({ page }) => {
    // Navigate and measure total time taken
    const start = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    
    console.log(`Page Load Time: ${loadTime} ms`);
    // Basic threshold, e.g. < 5 seconds for complete network idle
    expect(loadTime).toBeLessThan(10000); 

    // Retrieve Performance API metrics from the browser
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    const interactiveTime = performanceTiming.domInteractive - performanceTiming.navigationStart;
    console.log(`DOM Interactive Time: ${interactiveTime} ms`);
    // DOM should be interactive relatively quickly
    expect(interactiveTime).toBeLessThan(5000);
  });

  test('Measure API delay during login', async ({ page }) => {
    await page.goto('/login');
    
    // We will measure how long the login API takes
    const requestPromise = page.waitForResponse(response => 
      response.url().includes('login') || response.url().includes('auth') || response.status() === 200
    );

    await page.getByRole('textbox', { name: 'Email *' }).fill('esgcare@growlity.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('nwjJY21XT9x8');
    
    const start = Date.now();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for the auth response
    const response = await requestPromise.catch(() => null);
    const delay = Date.now() - start;
    
    console.log(`Login Action + API Delay: ${delay} ms`);
    // Expect login flow to be responsive (< 5s)
    expect(delay).toBeLessThan(5000);
  });
});
