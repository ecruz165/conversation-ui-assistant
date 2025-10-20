import type React from "react";
import { createContext, useContext } from "react";
import type { ConversationProviderProps } from "../types";

/**
 * Context provider for conversation state management
 * This is a simple wrapper that could be extended with global state management
 */

interface ConversationContextType {
  apiEndpoint: string;
  websocketUrl?: string;
  sessionId?: string;
  onError?: (error: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

/**
 * Provider component for conversation context
 */
const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
  apiEndpoint,
  websocketUrl,
  sessionId,
  onError,
}) => {
  const contextValue: ConversationContextType = {
    apiEndpoint,
    websocketUrl,
    sessionId,
    onError,
  };

  return (
    <ConversationContext.Provider value={contextValue}>{children}</ConversationContext.Provider>
  );
};

/**
 * Hook to access conversation context
 */
export const useConversationContext = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversationContext must be used within a ConversationProvider");
  }
  return context;
};

export default ConversationProvider;
