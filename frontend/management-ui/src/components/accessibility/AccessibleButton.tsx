import type React from "react";

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

/**
 * Accessible button component with standardized styling variants
 * Always uses semantic <button> element and includes type="button" by default
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = "primary",
  type = "button",
  children,
  className = "",
  ...props
}) => {
  const variantClass = `btn-${variant}`;

  return (
    <button type={type} className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};
