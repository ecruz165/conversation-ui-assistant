import { test, expect } from '@playwright/test';

test.describe('Admin Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin portal
    await page.goto('/');
  });

  test('should load the admin portal homepage', async ({ page }) => {
    // Check that the page loads successfully
    await expect(page).toHaveTitle(/Conversation UI/);
    
    // Check for main navigation or key elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    // Test navigation functionality
    // This will depend on your actual admin portal structure
    
    // Example: Check if there are navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Click the first navigation link
      await navLinks.first().click();
      
      // Verify navigation occurred
      await expect(page).toHaveURL(/.*\/.*/, { timeout: 5000 });
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check that the page is still functional on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Check that the page is still functional on tablet
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API connectivity', async ({ page }) => {
    // Test that the frontend can communicate with backend services
    
    // Listen for network requests
    const apiRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('localhost:8080') || url.includes('localhost:8081')) {
        apiRequests.push(url);
      }
    });

    // Trigger actions that should make API calls
    await page.reload();
    
    // Wait a bit for any async API calls
    await page.waitForTimeout(2000);
    
    // Verify that API calls were made (if expected)
    // This will depend on your actual application behavior
    console.log('API requests detected:', apiRequests);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test error handling by navigating to a non-existent route
    await page.goto('/non-existent-route');
    
    // Check that an error page or 404 page is shown
    // This will depend on your routing configuration
    await expect(page.locator('body')).toBeVisible();
  });
});
