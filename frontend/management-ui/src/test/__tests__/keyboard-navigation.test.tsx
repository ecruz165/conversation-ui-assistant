import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { AccessibleButton } from "~/components/accessibility/AccessibleButton";
import { InteractiveDiv } from "~/components/accessibility/InteractiveDiv";

describe("Keyboard Navigation", () => {
  describe("AccessibleButton", () => {
    test("can be focused with Tab key", async () => {
      const user = userEvent.setup();
      render(<AccessibleButton>Test Button</AccessibleButton>);

      const button = screen.getByRole("button", { name: /test button/i });

      // Tab to focus
      await user.tab();
      expect(button).toHaveFocus();
    });

    test("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };
      render(<AccessibleButton onClick={handleClick}>Test Button</AccessibleButton>);

      const _button = screen.getByRole("button", { name: /test button/i });

      // Tab to focus and press Enter
      await user.tab();
      await user.keyboard("{Enter}");
      expect(clicked).toBe(true);
    });

    test("can be activated with Space key", async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };
      render(<AccessibleButton onClick={handleClick}>Test Button</AccessibleButton>);

      const _button = screen.getByRole("button", { name: /test button/i });

      // Tab to focus and press Space
      await user.tab();
      await user.keyboard(" ");
      expect(clicked).toBe(true);
    });
  });

  describe("InteractiveDiv", () => {
    test("can be focused with Tab key", async () => {
      const user = userEvent.setup();
      const handleClick = () => {
        /* intentionally empty for focus test */
      };
      render(
        <InteractiveDiv onClick={handleClick} ariaLabel="Test Interactive">
          Interactive Content
        </InteractiveDiv>
      );

      const element = screen.getByRole("button", { name: /test interactive/i });

      // Tab to focus
      await user.tab();
      expect(element).toHaveFocus();
    });

    test("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };
      render(
        <InteractiveDiv onClick={handleClick} ariaLabel="Test Interactive">
          Interactive Content
        </InteractiveDiv>
      );

      const _element = screen.getByRole("button", { name: /test interactive/i });

      // Tab to focus and press Enter
      await user.tab();
      await user.keyboard("{Enter}");
      expect(clicked).toBe(true);
    });

    test("can be activated with Space key", async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };
      render(
        <InteractiveDiv onClick={handleClick} ariaLabel="Test Interactive">
          Interactive Content
        </InteractiveDiv>
      );

      const _element = screen.getByRole("button", { name: /test interactive/i });

      // Tab to focus and press Space
      await user.tab();
      await user.keyboard(" ");
      expect(clicked).toBe(true);
    });
  });

  describe("Focus Order", () => {
    test("maintains correct tab order for multiple interactive elements", async () => {
      const user = userEvent.setup();
      const handleClick = () => {
        /* intentionally empty for focus order test */
      };
      render(
        <div>
          <AccessibleButton>First</AccessibleButton>
          <AccessibleButton>Second</AccessibleButton>
          <InteractiveDiv onClick={handleClick} ariaLabel="Third">
            Third
          </InteractiveDiv>
        </div>
      );

      const first = screen.getByRole("button", { name: /first/i });
      const second = screen.getByRole("button", { name: /second/i });
      const third = screen.getByRole("button", { name: /third/i });

      // Tab through elements
      await user.tab();
      expect(first).toHaveFocus();

      await user.tab();
      expect(second).toHaveFocus();

      await user.tab();
      expect(third).toHaveFocus();
    });

    test("can navigate backwards with Shift+Tab", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <AccessibleButton>First</AccessibleButton>
          <AccessibleButton>Second</AccessibleButton>
        </div>
      );

      const first = screen.getByRole("button", { name: /first/i });
      const second = screen.getByRole("button", { name: /second/i });

      // Tab to second
      await user.tab();
      await user.tab();
      expect(second).toHaveFocus();

      // Shift+Tab back to first
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(first).toHaveFocus();
    });
  });
});
