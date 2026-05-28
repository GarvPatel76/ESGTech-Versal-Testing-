// Helper functions for tests

/**
 * Logs in to the application
 * @param {import('@playwright/test').Page} page 
 * @param {string} email 
 * @param {string} password 
 */
async function login(page, email, password) {
  await page.goto('/login');
  // Adjust selectors based on actual DOM elements
  // await page.fill('input[type="email"]', email);
  // await page.fill('input[type="password"]', password);
  // await page.click('button[type="submit"]');
}

module.exports = {
  login
};
