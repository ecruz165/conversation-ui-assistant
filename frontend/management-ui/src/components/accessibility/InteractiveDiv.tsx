import type React from "react";
import { useKeyboardInteraction } from "~/hooks/useKeyboardInteraction";

interface InteractiveDivProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick: () => void;
  ariaLabel: string;
}

/**
 * Accessible interactive div component with keyboard support
 * For cases where semantic button element cannot be used due to styling constraints
 * Includes role="button", tabIndex, and keyboard event handlers
 *
 * Note: Prefer AccessibleButton component when possible.
 * This component exists for specific layout scenarios where button styling cannot be used.
 */
export const InteractiveDiv: React.FC<InteractiveDivProps> = ({
  onClick,
  ariaLabel,
  children,
  ...props
}) => {
  const { handleKeyDown } = useKeyboardInteraction(onClick);

  return (
    // biome-ignore lint/a11y/useSemanticElements: This component intentionally uses div for complex layouts where button element cannot be styled appropriately
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
};
