/**
 * Chat Widget Web Component Entry Point
 *
 * This file creates a standalone web component that can be included in any webpage.
 * It bundles React, the chat widget components, and all dependencies into a single file.
 *
 * Usage after including the built script:
 * <chat-widget api-endpoint="http://localhost:8080" theme="light"></chat-widget>
 */

// Import the web component class
import ChatWidgetElement from "./ChatWidgetElement";

// Also export types for TypeScript consumers
export type * from "../types";
// Re-export for module usage
export { default as ChatWidgetElement } from "./ChatWidgetElement";

// Extend Window interface for type safety
declare global {
  interface Window {
    ChatWidgetElement?: typeof ChatWidgetElement;
    createChatWidget?: (container: HTMLElement, props?: Record<string, string>) => Element;
  }
}

// The web component is automatically registered when this module loads
// due to the customElements.define() call in ChatWidgetElement.ts

// For debugging and introspection
if (typeof window !== "undefined") {
  // Make the component class available globally for debugging
  window.ChatWidgetElement = ChatWidgetElement;

  // Add a simple API to create widgets programmatically
  window.createChatWidget = (container: HTMLElement, props: Record<string, string> = {}) => {
    const widget = document.createElement("chat-widget");

    // Set attributes from props
    Object.entries(props).forEach(([key, value]) => {
      widget.setAttribute(key, value);
    });

    container.appendChild(widget);
    return widget;
  };

  console.log("Chat Widget Web Component loaded successfully");
  console.log("Available element: <chat-widget>");
  console.log("Global helper: window.createChatWidget(container, props)");
}
