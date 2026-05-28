const { test, expect } = require('@playwright/test');

test.describe('Deep App Crawler Tests', () => {
  // We will increase timeout because a crawler test can take a while
  test.setTimeout(120000);

  test('should crawl all internal links on dashboard without errors', async ({ page }) => {
    const visitedLinks = new Set();
    const linksToVisit = new Set();
    const errorsLog = [];

    // Setup listener to catch console errors
    page.on('pageerror', exception => {
      errorsLog.push(`Uncaught exception: "${exception}"`);
    });
    
    // Login to access the dashboard
    await page.goto('/login');
    await page.fill('#email', 'esgcare@growlity.com');
    await page.fill('#password', 'nwjJY21XT9x8');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard/i, { timeout: 15000 });
    
    // Start crawling from dashboard
    const baseURL = await page.evaluate(() => window.location.origin);
    linksToVisit.add(page.url());

    // We'll limit the crawl to 15 pages to avoid infinite loops in dynamic UI
    const MAX_PAGES = 15;
    let pagesCrawled = 0;

    for (const link of linksToVisit) {
      if (visitedLinks.has(link) || pagesCrawled >= MAX_PAGES) continue;
      
      console.log(`Crawling: ${link}`);
      
      const response = await page.goto(link, { waitUntil: 'networkidle', timeout: 20000 }).catch(e => null);
      visitedLinks.add(link);
      pagesCrawled++;

      // Check HTTP Status
      if (response && response.status() >= 400) {
         errorsLog.push(`HTTP Error ${response.status()} on page ${link}`);
      }

      // Check for generic error boundaries/text on page
      const bodyText = await page.locator('body').innerText();
      if (bodyText.includes('404 Not Found') || bodyText.includes('500 Internal Server Error')) {
         errorsLog.push(`Found error text on page ${link}`);
      }

      // Find all new internal links on this page
      const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(href => href.startsWith(window.location.origin));
      });

      // Add new links to our queue
      for (const href of hrefs) {
        // Strip off hash fragments to avoid crawling the same page repeatedly
        const cleanHref = href.split('#')[0];
        if (!visitedLinks.has(cleanHref)) {
          linksToVisit.add(cleanHref);
        }
      }
    }

    console.log(`Total pages crawled: ${pagesCrawled}`);
    console.log(`Total unique internal links discovered: ${linksToVisit.size}`);
    
    if (errorsLog.length > 0) {
      console.error('Crawler found the following issues:', errorsLog);
    }
    
    // Test fails if there are any HTTP or Uncaught JS errors
    expect(errorsLog).toHaveLength(0);
  });
});
