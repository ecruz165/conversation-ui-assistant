// Core types for the chat widget MFE

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "voice" | "navigation" | "error";
  messageCount?: number;
  metadata?: {
    navigationTarget?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

// Navigation action data types
export interface NavigationScrollData {
  position: number;
  element?: string;
  behavior?: ScrollBehavior;
}

export interface NavigationHighlightData {
  selector: string;
  duration?: number;
  color?: string;
}

export interface NavigationFocusData {
  elementId: string;
  options?: FocusOptions;
}

export interface NavigationNavigateData {
  url?: string;
  params?: Record<string, string>;
  query?: string;
  timestamp?: number;
  navigationTarget?: string;
  confidence?: number;
  suggestions?: string[];
}

export type NavigationActionData =
  | NavigationScrollData
  | NavigationHighlightData
  | NavigationFocusData
  | NavigationNavigateData;

export interface NavigationAction {
  type: "navigate" | "scroll" | "highlight" | "focus";
  target: string;
  data?: NavigationActionData;
}

export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  sessionId: string | null;
  error: string | null;
}

export interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "light" | "dark" | "auto";
  apiEndpoint?: string;
  websocketUrl?: string;
  showWelcomeMessage?: boolean;
  welcomeMessage?: string;
  placeholder?: string;
  maxHeight?: number;
  width?: number;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  onNavigationAction?: (action: NavigationAction) => void;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (message: Message) => void;
  onError?: (error: string) => void;
}

export interface NavigationHelperProps {
  placeholder?: string;
  compact?: boolean;
  showSuggestions?: boolean;
  suggestions?: string[];
  className?: string;
  style?: React.CSSProperties;
  onNavigationAction?: (action: NavigationAction) => void;
  onMessageSent?: (message: string) => void;
}

export interface ConversationProviderProps {
  children: React.ReactNode;
  apiEndpoint: string;
  websocketUrl?: string;
  sessionId?: string;
  onError?: (error: string) => void;
}

export interface UseConversationReturn {
  state: ConversationState;
  sendMessage: (content: string, audioBlob?: Blob) => Promise<void>;
  clearConversation: () => void;
  reconnect: () => void;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  error: string;
  success: string;
}

export interface Theme {
  colors: ThemeColors;
  borderRadius: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// API types
export interface SendMessageRequest {
  content: string;
  sessionId?: string;
  context?: {
    currentUrl?: string;
    userAgent?: string;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

export interface SendMessageResponse {
  message: Message;
  navigationActions?: NavigationAction[];
  suggestions?: string[];
}

// WebSocket message data types
export interface WebSocketChatData {
  message: Message;
  suggestions?: string[];
}

export interface WebSocketNavigationData {
  actions: NavigationAction[];
}

export interface WebSocketErrorData {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface WebSocketConnectionData {
  sessionId: string;
  reconnected?: boolean;
}

export type WebSocketMessageData =
  | WebSocketChatData
  | WebSocketNavigationData
  | WebSocketErrorData
  | WebSocketConnectionData
  | null;

export interface WebSocketMessage {
  type: "message" | "navigation" | "error" | "connected" | "disconnected";
  data: WebSocketMessageData;
  timestamp: string;
}
