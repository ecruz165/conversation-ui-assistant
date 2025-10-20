import type React from "react";
import { useCallback } from "react";

/**
 * Hook for standardizing keyboard interaction patterns
 * @param onClick - Callback function to execute on Enter or Space key press
 * @param keys - Array of keys that should trigger the callback (defaults to Enter and Space)
 * @returns Object with handleKeyDown event handler
 */
export const useKeyboardInteraction = (
  onClick: () => void,
  keys: string[] = ["Enter", " "]
) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (keys.includes(e.key)) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick, keys]
  );

  return { handleKeyDown };
};
