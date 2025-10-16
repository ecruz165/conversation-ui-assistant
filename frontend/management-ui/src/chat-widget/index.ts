// Chat Widget Module Federation Exports
export { default as ChatWidget } from "./components/ChatWidget";
export { default as NavigationHelper } from "./components/NavigationHelper";
export { default as useConversation } from "./hooks/useConversation";
export { default as ConversationProvider } from "./providers/ConversationProvider";

// Re-export types for consumers
export type * from "./types";
