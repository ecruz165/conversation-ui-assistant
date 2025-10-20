import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import MessageList from "~/chat-widget/components/MessageList";
import type { Message, Theme } from "~/chat-widget/types";

// Mock theme for testing
const mockTheme: Theme = {
  colors: {
    primary: "#1976d2",
    secondary: "#424242",
    background: "#ffffff",
    surface: "#f5f5f5",
    error: "#d32f2f",
    text: "#000000",
    textSecondary: "#757575",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
    },
  },
  borderRadius: "8px",
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.12)",
    md: "0 4px 6px rgba(0,0,0,0.16)",
    lg: "0 10px 20px rgba(0,0,0,0.19)",
  },
};

// Generate mock messages
const generateMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    content: `Test message ${i}`,
    sender: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
    timestamp: new Date(Date.now() - (count - i) * 1000),
  }));
};

describe("Performance Benchmarks", () => {
  test("MessageList renders 10 messages quickly", () => {
    const messages = generateMessages(10);
    const startTime = performance.now();

    render(<MessageList messages={messages} isLoading={false} theme={mockTheme} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
    console.log(`MessageList (10 messages) rendered in ${renderTime.toFixed(2)}ms`);
  });

  test("MessageList renders 50 messages efficiently", () => {
    const messages = generateMessages(50);
    const startTime = performance.now();

    render(<MessageList messages={messages} isLoading={false} theme={mockTheme} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 200ms even with 50 messages
    expect(renderTime).toBeLessThan(200);
    console.log(`MessageList (50 messages) rendered in ${renderTime.toFixed(2)}ms`);
  });

  test("MessageList renders 100 messages within acceptable time", () => {
    const messages = generateMessages(100);
    const startTime = performance.now();

    render(<MessageList messages={messages} isLoading={false} theme={mockTheme} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 500ms even with 100 messages
    expect(renderTime).toBeLessThan(500);
    console.log(`MessageList (100 messages) rendered in ${renderTime.toFixed(2)}ms`);
  });

  test("Re-rendering with new message is fast (memoization check)", () => {
    const messages1 = generateMessages(20);
    const { rerender } = render(
      <MessageList messages={messages1} isLoading={false} theme={mockTheme} />
    );

    // Add one new message with unique ID
    const newMessage = {
      id: "msg-new",
      content: "New test message",
      sender: "assistant" as const,
      timestamp: new Date(),
    };
    const messages2 = [...messages1, newMessage];

    const startTime = performance.now();
    rerender(<MessageList messages={messages2} isLoading={false} theme={mockTheme} />);
    const endTime = performance.now();

    const rerenderTime = endTime - startTime;

    // Re-render should be very fast due to memoization
    expect(rerenderTime).toBeLessThan(50);
    console.log(`MessageList re-render (1 new message) took ${rerenderTime.toFixed(2)}ms`);
  });
});
