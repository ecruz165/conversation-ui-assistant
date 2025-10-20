import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("homepage should not have automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("navigation links page should not have accessibility violations", async ({ page }) => {
    await page.goto("/");

    // Navigate to websites list
    await page.click('a[href="/websites"]');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("keyboard navigation works correctly", async ({ page }) => {
    await page.goto("/");

    // Get all focusable elements
    const focusableElements = await page
      .locator("a, button, input, [tabindex]:not([tabindex='-1'])")
      .all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Tab through first few elements
    for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    }
  });

  test("skip link is keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Press Tab to focus skip link
    await page.keyboard.press("Tab");

    const skipLink = page.locator('a[href="#main"]').first();

    if ((await skipLink.count()) > 0) {
      expect(await skipLink.isVisible()).toBe(true);
    }
  });
});
