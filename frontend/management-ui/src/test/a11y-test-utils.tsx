import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import type React from "react";
import { expect } from "vitest";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * Test utility for running accessibility tests on React components
 * Uses axe-core to check for WCAG violations
 *
 * @param component - React component to test
 * @param options - Additional axe configuration options
 * @returns Promise that resolves when test completes
 *
 * @example
 * await testA11y(<MyComponent />);
 */
export const testA11y = async (
  component: React.ReactElement,
  options?: Parameters<typeof axe>[1]
) => {
  const { container } = render(component);
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Accessibility test options presets for common scenarios
 */
export const a11yOptions = {
  // Test keyboard navigation specifically
  keyboardOnly: {
    runOnly: {
      type: "tag" as const,
      values: ["keyboard", "focus-order"],
    },
  },

  // Test ARIA attributes
  ariaOnly: {
    runOnly: {
      type: "tag" as const,
      values: ["aria"],
    },
  },

  // Test color contrast
  colorContrastOnly: {
    runOnly: {
      type: "tag" as const,
      values: ["color-contrast"],
    },
  },

  // WCAG 2.1 Level AA (most common)
  wcag21aa: {
    runOnly: {
      type: "tag" as const,
      values: ["wcag21aa"],
    },
  },
};
