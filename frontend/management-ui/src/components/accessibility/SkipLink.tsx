import type React from "react";

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Skip link component for keyboard navigation
 * Allows users to skip repetitive navigation and jump to main content
 * Visible only when focused (typically with Tab key)
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      style={{
        position: "absolute",
        left: "-9999px",
        zIndex: 999,
        padding: "1rem",
        backgroundColor: "#000",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "0.25rem",
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "1rem";
        e.currentTarget.style.top = "1rem";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
        e.currentTarget.style.top = "auto";
      }}
    >
      {children}
    </a>
  );
};
