import { Search, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { NavigationHelperProps } from "../types";
import { getTheme } from "../utils/theme";

/**
 * Inline navigation helper component
 * Provides a compact search/navigation interface
 */
const NavigationHelper: React.FC<NavigationHelperProps> = ({
  placeholder = "Ask me to navigate somewhere...",
  compact = false,
  showSuggestions = true,
  suggestions = ["Home", "Dashboard", "Settings", "Help"],
  className = "",
  style = {},
  onNavigationAction,
  onMessageSent,
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const theme = getTheme("light");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      // Simulate navigation processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      onMessageSent?.(query);

      // Simulate navigation action
      onNavigationAction?.({
        type: "navigate",
        target: query.toLowerCase(),
        data: { query, timestamp: Date.now() },
      });

      setQuery("");
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div
      className={`navigation-helper ${className}`}
      style={{
        width: "100%",
        maxWidth: compact ? "300px" : "500px",
        ...style,
      }}
    >
      {/* Search Form */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius,
            padding: theme.spacing.sm,
            boxShadow: theme.shadows.sm,
            transition: theme.transitions.normal,
          }}
        >
          <Search
            size={20}
            style={{
              color: theme.colors.textSecondary,
              marginRight: theme.spacing.sm,
            }}
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily,
            }}
          />

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            style={{
              padding: "6px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: query.trim() ? theme.colors.primary : theme.colors.border,
              color: "white",
              cursor: query.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: theme.transitions.normal,
              marginLeft: theme.spacing.sm,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            display: "flex",
            gap: theme.spacing.xs,
            flexWrap: "wrap",
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "12px",
                backgroundColor: theme.colors.surface,
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: theme.transitions.fast,
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary;
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius,
            textAlign: "center",
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          Processing navigation request...
        </div>
      )}
    </div>
  );
};

export default NavigationHelper;
