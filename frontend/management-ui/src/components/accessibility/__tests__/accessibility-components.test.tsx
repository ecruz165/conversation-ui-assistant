import { describe, test } from "vitest";
import { testA11y } from "~/test/a11y-test-utils";
import { AccessibleButton } from "../AccessibleButton";
import { InteractiveDiv } from "../InteractiveDiv";
import { SkipLink } from "../SkipLink";

describe("Accessibility Components", () => {
  describe("AccessibleButton", () => {
    test("has no accessibility violations", async () => {
      await testA11y(<AccessibleButton>Click Me</AccessibleButton>);
    });

    test("primary variant has no violations", async () => {
      await testA11y(<AccessibleButton variant="primary">Primary</AccessibleButton>);
    });

    test("secondary variant has no violations", async () => {
      await testA11y(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
    });

    test("ghost variant has no violations", async () => {
      await testA11y(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
    });
  });

  describe("InteractiveDiv", () => {
    test("has no accessibility violations", async () => {
      await testA11y(
        <InteractiveDiv onClick={() => {}} ariaLabel="Interactive element">
          Interactive Content
        </InteractiveDiv>
      );
    });
  });

  describe("SkipLink", () => {
    test("has no accessibility violations", async () => {
      await testA11y(<SkipLink href="#main">Skip to main content</SkipLink>);
    });
  });
});
