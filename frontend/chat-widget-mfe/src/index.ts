import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Development mode - render the app for testing
if (process.env.NODE_ENV === 'development') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(React.createElement(App));
  }
}

// Export main components for Module Federation
export { default as ChatWidget } from './components/ChatWidget';
export { default as NavigationHelper } from './components/NavigationHelper';
export { default as ConversationProvider } from './providers/ConversationProvider';
export { default as useConversation } from './hooks/useConversation';

// Export types for TypeScript consumers
export type {
  ChatWidgetProps,
  NavigationHelperProps,
  ConversationProviderProps,
  ConversationState,
  Message,
  NavigationAction,
} from './types';

// Version info
export const version = '1.0.0';
export const name = 'chat-widget-mfe';
