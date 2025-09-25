import { test, expect } from '@playwright/test';

test.describe('Basic Connectivity Tests', () => {
  test('should connect to admin portal', async ({ page }) => {
    // Simple connectivity test
    const response = await page.goto('/');
    
    // Check that we get a successful response
    expect(response?.status()).toBeLessThan(400);
    
    // Check that the page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check that we have some content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should have working JavaScript', async ({ page }) => {
    await page.goto('/');
    
    // Check that JavaScript is working by evaluating a simple expression
    const result = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(result).toBe(true);
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Check that there are no critical console errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('404') // Ignore 404 errors for optional resources
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
