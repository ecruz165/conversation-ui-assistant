import React from "react";
import { createRoot, type Root } from "react-dom/client";
import ChatWidget from "../components/ChatWidget";
import ConversationProvider from "../providers/ConversationProvider";
import type { ChatWidgetProps } from "../types";

/**
 * Web Component wrapper for the React ChatWidget
 * Allows the chat widget to be used as a native HTML custom element
 *
 * Usage:
 * <chat-widget
 *   api-endpoint="http://localhost:8080"
 *   websocket-url="ws://localhost:8081/ws/chat"
 *   theme="light"
 *   position="bottom-right"
 *   welcome-message="Hello! How can I help you navigate?"
 * ></chat-widget>
 */
class ChatWidgetElement extends HTMLElement {
  private root: Root | null = null;
  private mountPoint: HTMLDivElement | null = null;

  // Define which attributes to observe for changes
  static get observedAttributes(): string[] {
    return [
      "api-endpoint",
      "websocket-url",
      "theme",
      "position",
      "welcome-message",
      "placeholder",
      "max-height",
      "width",
      "z-index",
      "show-welcome-message",
    ];
  }

  constructor() {
    super();
    // Create shadow DOM for style encapsulation
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  private getProps(): ChatWidgetProps {
    return {
      position: (this.getAttribute("position") as ChatWidgetProps["position"]) || "bottom-right",
      theme: (this.getAttribute("theme") as ChatWidgetProps["theme"]) || "light",
      showWelcomeMessage: this.getAttribute("show-welcome-message") !== "false",
      welcomeMessage:
        this.getAttribute("welcome-message") ||
        "Hi! I'm here to help you navigate. What are you looking for?",
      placeholder: this.getAttribute("placeholder") || "Ask me anything...",
      maxHeight: Number.parseInt(this.getAttribute("max-height") || "500", 10),
      width: Number.parseInt(this.getAttribute("width") || "350", 10),
      zIndex: Number.parseInt(this.getAttribute("z-index") || "1000", 10),
      onNavigationAction: (action) => {
        // Dispatch custom event for navigation actions
        this.dispatchEvent(
          new CustomEvent("navigation-action", {
            detail: action,
            bubbles: true,
          })
        );
      },
      onMessageSent: (message) => {
        // Dispatch custom event for sent messages
        this.dispatchEvent(
          new CustomEvent("message-sent", {
            detail: { message },
            bubbles: true,
          })
        );
      },
      onMessageReceived: (message) => {
        // Dispatch custom event for received messages
        this.dispatchEvent(
          new CustomEvent("message-received", {
            detail: { message },
            bubbles: true,
          })
        );
      },
      onError: (error) => {
        // Dispatch custom event for errors
        this.dispatchEvent(
          new CustomEvent("error", {
            detail: { error },
            bubbles: true,
          })
        );
      },
    };
  }

  private render(): void {
    if (!this.shadowRoot) return;

    // Create mount point if it doesn't exist
    if (!this.mountPoint) {
      this.mountPoint = document.createElement("div");
      this.mountPoint.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      this.shadowRoot.appendChild(this.mountPoint);
    }

    // Create or reuse React root
    if (!this.root) {
      this.root = createRoot(this.mountPoint);
    }

    const apiEndpoint = this.getAttribute("api-endpoint") || "http://localhost:8080";
    const websocketUrl = this.getAttribute("websocket-url") ?? undefined;
    const props = this.getProps();

    // Render React component inside web component
    this.root.render(
      React.createElement(
        ConversationProvider,
        {
          apiEndpoint,
          websocketUrl,
          onError: props.onError,
          children: React.createElement(ChatWidget, props),
        }
      )
    );
  }
}

// Register the custom element
if (!customElements.get("chat-widget")) {
  customElements.define("chat-widget", ChatWidgetElement);
}

export default ChatWidgetElement;
