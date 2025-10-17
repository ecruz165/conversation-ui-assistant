import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Minimize2, Send, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useConversation } from "../hooks/useConversation";
import type { ChatWidgetProps, Message } from "../types";
import { getTheme } from "../utils/theme";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

/**
 * Main chat widget component for conversational navigation
 * Designed to be embedded as a floating widget in any application
 */
const ChatWidget: React.FC<ChatWidgetProps> = ({
  position = "bottom-right",
  theme = "light",
  showWelcomeMessage = true,
  welcomeMessage = "Hi! I'm here to help you navigate. What are you looking for?",
  placeholder = "Ask me anything...",
  maxHeight = 500,
  width = 350,
  zIndex = 1000,
  className = "",
  style = {},
  onNavigationAction,
  onMessageSent,
  onMessageReceived,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { state, sendMessage } = useConversation("ws://localhost:8081/ws/chat");
  const widgetRef = useRef<HTMLDivElement>(null);
  const currentTheme = getTheme(theme);

  // Position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex,
    };

    switch (position) {
      case "bottom-right":
        return { ...baseStyles, bottom: "20px", right: "20px" };
      case "bottom-left":
        return { ...baseStyles, bottom: "20px", left: "20px" };
      case "top-right":
        return { ...baseStyles, top: "20px", right: "20px" };
      case "top-left":
        return { ...baseStyles, top: "20px", left: "20px" };
      default:
        return { ...baseStyles, bottom: "20px", right: "20px" };
    }
  };

  // Handle message sending
  const handleSendMessage = async (content: string, audioBlob?: Blob) => {
    try {
      await sendMessage(content, audioBlob);
      onMessageSent?.(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      onError?.(errorMessage);
    }
  };

  // Handle received messages
  useEffect(() => {
    if (state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.sender === "assistant") {
        onMessageReceived?.(lastMessage);

        // Handle navigation actions
        if (lastMessage.metadata?.navigationTarget && onNavigationAction) {
          onNavigationAction({
            type: "navigate",
            target: lastMessage.metadata.navigationTarget,
            data: lastMessage.metadata,
          });
        }
      }
    }
  }, [state.messages, onMessageReceived, onNavigationAction]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && showWelcomeMessage && state.messages.length === 0) {
      // Add welcome message to state (this would typically come from the conversation provider)
      const welcomeMsg: Message = {
        id: "welcome",
        content: welcomeMessage,
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      };
      // This would be handled by the conversation provider in a real implementation
    }
  }, [isOpen, showWelcomeMessage, welcomeMessage, state.messages.length]);

  return (
    <div
      ref={widgetRef}
      className={`chat-widget ${className}`}
      style={{
        ...getPositionStyles(),
        ...style,
      }}
    >
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: currentTheme.colors.primary,
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: currentTheme.shadows.lg,
              transition: currentTheme.transitions.normal,
            }}
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              width: `${width}px`,
              maxHeight: `${maxHeight}px`,
              backgroundColor: currentTheme.colors.background,
              borderRadius: currentTheme.borderRadius,
              boxShadow: currentTheme.shadows.lg,
              border: `1px solid ${currentTheme.colors.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              marginBottom: isMinimized ? "0" : "10px",
              height: isMinimized ? "auto" : `${maxHeight}px`,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: currentTheme.spacing.md,
                backgroundColor: currentTheme.colors.primary,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: currentTheme.spacing.sm }}>
                <MessageCircle size={20} />
                <span style={{ fontWeight: currentTheme.typography.fontWeight.medium }}>
                  Navigation Assistant
                </span>
                {state.isConnected && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: currentTheme.colors.success,
                    }}
                    title="Connected"
                  />
                )}
              </div>
              <div style={{ display: "flex", gap: currentTheme.spacing.xs }}>
                {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 size={16} />
                </button>
                {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <MessageList
                    messages={state.messages}
                    isLoading={state.isLoading}
                    theme={currentTheme}
                  />
                </div>

                {/* Input */}
                <div style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}>
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    placeholder={placeholder}
                    disabled={state.isLoading || !state.isConnected}
                    theme={currentTheme}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
