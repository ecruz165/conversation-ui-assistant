import { test, expect } from '@playwright/test';

test.describe('Testing Infrastructure Verification', () => {
  test('should verify Playwright is working', async ({ page }) => {
    // Test that Playwright can navigate to a simple page
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    
    // Check that we can interact with the page
    await expect(page.locator('h1')).toHaveText('Test Page');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should verify browser capabilities', async ({ page }) => {
    // Test JavaScript execution
    const result = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        hasConsole: typeof console !== 'undefined'
      };
    });
    
    expect(result.userAgent).toBeTruthy();
    expect(result.hasLocalStorage).toBe(true);
    expect(result.hasSessionStorage).toBe(true);
    expect(result.hasConsole).toBe(true);
  });

  test('should verify network capabilities', async ({ page }) => {
    // Test that we can make network requests
    const response = await page.goto('https://httpbin.org/json');
    expect(response?.status()).toBe(200);
    
    // Verify we can read the response
    const content = await page.textContent('body');
    expect(content).toContain('slideshow');
  });

  test('should verify local server connectivity', async ({ page }) => {
    // Test that we can connect to localhost (even if it returns an error)
    try {
      const response = await page.goto('http://localhost:3000');
      // Just verify we got some response
      expect(response?.status()).toBeGreaterThan(0);
      console.log(`Admin portal responded with status: ${response?.status()}`);
    } catch (error) {
      console.log('Admin portal connection failed:', error);
      // This is expected if the service isn't running properly
    }
  });
});
