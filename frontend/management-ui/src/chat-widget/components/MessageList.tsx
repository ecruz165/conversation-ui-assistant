import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, User } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import type { Message, Theme } from "../types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  theme: Theme;
}

/**
 * Component for displaying a list of chat messages
 */
const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, theme }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const MessageBubble: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isUser = message.sender === "user";
    const isError = message.type === "error";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          marginBottom: theme.spacing.sm,
          padding: `0 ${theme.spacing.md}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: theme.spacing.xs,
            maxWidth: "80%",
            flexDirection: isUser ? "row-reverse" : "row",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: isUser ? theme.colors.primary : theme.colors.secondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            {isUser ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
          </div>

          {/* Message Content */}
          <div
            style={{
              backgroundColor: isError
                ? theme.colors.error
                : isUser
                  ? theme.colors.primary
                  : theme.colors.surface,
              color: isError || isUser ? "white" : theme.colors.text,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius,
              boxShadow: theme.shadows.sm,
              position: "relative",
              wordBreak: "break-word",
              fontSize: theme.typography.fontSize.sm,
              lineHeight: "1.4",
            }}
          >
            {/* Message bubble arrow */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                [isUser ? "right" : "left"]: "-6px",
                width: "0",
                height: "0",
                borderTop: `6px solid ${
                  isError
                    ? theme.colors.error
                    : isUser
                      ? theme.colors.primary
                      : theme.colors.surface
                }`,
                borderLeft: isUser ? "6px solid transparent" : "none",
                borderRight: isUser ? "none" : "6px solid transparent",
                borderBottom: "6px solid transparent",
              }}
            />

            {/* Message text */}
            <div style={{ marginBottom: theme.spacing.xs }}>{message.content}</div>

            {/* Timestamp and Message Count */}
            <div
              style={{
                fontSize: theme.typography.fontSize.xs,
                opacity: 0.7,
                textAlign: isUser ? "right" : "left",
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "center",
                gap: theme.spacing.xs,
              }}
            >
              <span>{formatTime(message.timestamp)}</span>
              {message.messageCount && message.sender === "assistant" && (
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  #{message.messageCount}
                </span>
              )}
            </div>

            {/* Metadata (confidence, suggestions, etc.) */}
            {message.metadata && (
              <div style={{ marginTop: theme.spacing.xs }}>
                {message.metadata.confidence && message.metadata.confidence < 0.8 && (
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      opacity: 0.8,
                      fontStyle: "italic",
                    }}
                  >
                    (Low confidence: {Math.round(message.metadata.confidence * 100)}%)
                  </div>
                )}

                {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                  <div style={{ marginTop: theme.spacing.xs }}>
                    <div
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        opacity: 0.8,
                        marginBottom: "4px",
                      }}
                    >
                      Suggestions:
                    </div>
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          opacity: 0.9,
                          padding: "2px 6px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "4px",
                          marginBottom: "2px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          // Handle suggestion click - could emit an event or call a callback
                          console.log("Suggestion clicked:", suggestion);
                        }}
                      >
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const LoadingIndicator: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: theme.spacing.sm,
        padding: `0 ${theme.spacing.md}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: theme.spacing.xs,
        }}
      >
        {/* Bot Avatar */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: theme.colors.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <Bot size={16} color="white" />
        </div>

        {/* Loading bubble */}
        <div
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius,
            boxShadow: theme.shadows.sm,
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          {/* Message bubble arrow */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "-6px",
              width: "0",
              height: "0",
              borderTop: `6px solid ${theme.colors.surface}`,
              borderRight: "6px solid transparent",
              borderBottom: "6px solid transparent",
            }}
          />

          <Loader2 size={16} className="animate-spin" />
          <span style={{ fontSize: theme.typography.fontSize.sm }}>Thinking...</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: `${theme.spacing.md} 0`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Welcome message if no messages */}
      {messages.length === 0 && !isLoading && (
        <div
          style={{
            padding: theme.spacing.lg,
            textAlign: "center",
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          <Bot size={48} style={{ marginBottom: theme.spacing.md, opacity: 0.5 }} />
          <div>Hi! I'm your navigation assistant.</div>
          <div>Ask me anything to get started!</div>
        </div>
      )}

      {/* Messages */}
      <AnimatePresence>
        {messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} index={index} />
        ))}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>{isLoading && <LoadingIndicator />}</AnimatePresence>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
