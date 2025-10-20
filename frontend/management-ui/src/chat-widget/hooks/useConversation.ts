import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationState, Message, UseConversationReturn } from "../types";

const DEFAULT_WEBSOCKET_URL = "ws://localhost:8081/ws/chat";

/**
 * Hook for managing conversation state and WebSocket connection
 * Connects to the reactive navigation service with Netty
 */
export const useConversation = (
  websocketUrl: string = DEFAULT_WEBSOCKET_URL,
  sessionId?: string
): UseConversationReturn => {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    isLoading: false,
    isConnected: false,
    sessionId: sessionId || null,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCountRef = useRef(0);

  // Generate session ID if not provided
  const getSessionId = useCallback(() => {
    if (state.sessionId) return state.sessionId;
    const newSessionId = `chat-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState((prev) => ({ ...prev, sessionId: newSessionId }));
    return newSessionId;
  }, [state.sessionId]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log("🔌 Connecting to WebSocket:", websocketUrl);
      wsRef.current = new WebSocket(websocketUrl);

      wsRef.current.onopen = () => {
        console.log("✅ WebSocket connected");
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("📥 Received WebSocket message:", response);

          if (response.type === "response" && response.content) {
            const assistantMessage: Message = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: response.content,
              sender: "assistant",
              timestamp: new Date(response.timestamp || Date.now()),
              type: "text",
              messageCount: response.messageCount,
              metadata: {
                confidence: 1.0,
              },
            };

            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, assistantMessage],
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
          setState((prev) => ({
            ...prev,
            error: "Failed to parse server response",
            isLoading: false,
          }));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setState((prev) => ({
          ...prev,
          error: "Connection error",
          isConnected: false,
        }));
      };

      wsRef.current.onclose = (event) => {
        console.log("🔚 WebSocket closed:", event.code, event.reason);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isLoading: false,
          error: event.code === 1009 ? "Message too large" : "Connection closed",
        }));

        // Auto-reconnect after 3 seconds if not manually closed
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Attempting to reconnect...");
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to connect to chat service",
        isConnected: false,
      }));
    }
  }, [websocketUrl]);

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Send message via WebSocket
  const sendMessage = useCallback(
    async (content: string, audioBlob?: Blob) => {
      if (!content.trim()) return;

      const currentSessionId = getSessionId();

      // Add user message to state immediately
      const userMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: content.trim(),
        sender: "user",
        timestamp: new Date(),
        type: audioBlob ? "voice" : "text",
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      // Send via WebSocket if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          const message: any = {
            type: "message",
            content: content.trim(),
            sessionId: currentSessionId,
          };

          // Add audio data if available
          if (audioBlob && audioBlob instanceof Blob && audioBlob.size > 0) {
            try {
              const audioBase64 = await blobToBase64(audioBlob);
              message.audio = {
                data: audioBase64,
                mimeType: audioBlob.type,
                size: audioBlob.size,
              };
              console.log("🎵 Including audio data, size:", audioBlob.size, "bytes");
            } catch (audioError) {
              console.error("❌ Failed to process audio blob:", audioError);
              // Continue without audio data
            }
          }

          console.log("📤 Sending WebSocket message:", {
            ...message,
            audio: message.audio ? "..." : undefined,
          });
          wsRef.current.send(JSON.stringify(message));
        } catch (error) {
          console.error("❌ Failed to send WebSocket message:", error);
          setState((prev) => ({
            ...prev,
            error: "Failed to send message",
            isLoading: false,
          }));
        }
      } else {
        console.warn("⚠️ WebSocket not connected, attempting to reconnect...");
        setState((prev) => ({
          ...prev,
          error: "Not connected to chat service",
          isLoading: false,
        }));
        connect();
      }
    },
    [getSessionId, connect, blobToBase64]
  );

  // Clear conversation
  const clearConversation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
    messageCountRef.current = 0;
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
      error: null,
    }));
    connect();
  }, [connect]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [connect]);

  return {
    state,
    sendMessage,
    clearConversation,
    reconnect,
  };
};

export default useConversation;
