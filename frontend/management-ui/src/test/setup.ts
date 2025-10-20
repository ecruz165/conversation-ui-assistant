import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Mock scrollIntoView (not implemented in jsdom)
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
