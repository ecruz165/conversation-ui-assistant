import { Mic, MicOff, Send } from "lucide-react";
import React, { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Theme } from "../types";

interface MessageInputProps {
  onSendMessage: (message: string, audioBlob?: Blob) => void;
  placeholder?: string;
  disabled?: boolean;
  theme: Theme;
  maxLength?: number;
}

/**
 * Component for message input with send button and optional voice input
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  theme,
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle sending message
  const handleSend = (providedAudioBlob?: Blob) => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      const audioToSend = providedAudioBlob || audioBlob;
      onSendMessage(trimmedMessage, audioToSend ? audioToSend : undefined);
      setMessage("");
      setAudioBlob(null); // Clear the stored audio blob

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);

      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Initialize audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
        console.log("🎵 Audio recording completed, size:", audioBlob.size, "bytes");

        // Store the audio blob for later use
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      console.log("🎙️ Audio recording started");
    } catch (error) {
      console.error("❌ Error starting audio recording:", error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsTranscribing(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the transcript state with interim results
        setTranscript(interimTranscript);

        // If we have final results, add them to the message
        if (finalTranscript) {
          setMessage((prev) => {
            const newMessage = prev + finalTranscript;
            // Auto-resize textarea
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
              }
            }, 0);
            return newMessage;
          });
          setTranscript(""); // Clear interim transcript after adding to message
        }
      };

      recognition.onerror = (event: any) => {
        console.error("🚫 Speech recognition error:", event.error);
        setIsListening(false);
        setIsTranscribing(false);
        setTranscript("");
      };

      recognition.onend = () => {
        console.log("🔚 Speech recognition ended");
        setIsListening(false);
        setIsTranscribing(false);
        setTranscript("");

        // Stop audio recording when speech recognition ends
        stopAudioRecording();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioRecording();
    };
  }, [stopAudioRecording]);

  // Demo mode for testing transcription display
  const simulateTranscription = () => {
    const demoText = "Hello, this is a test of the voice recognition feature";
    const words = demoText.split(" ");
    let currentIndex = 0;

    setIsListening(true);
    setIsTranscribing(true);

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        const currentTranscript = words.slice(0, currentIndex + 1).join(" ");
        setTranscript(currentTranscript);
        currentIndex++;
      } else {
        // Finalize the transcription
        setMessage((prev) => prev + demoText);
        setTranscript("");
        setIsListening(false);
        setIsTranscribing(false);
        clearInterval(interval);

        // Auto-resize textarea
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
          }
        }, 0);
      }
    }, 300); // Add a word every 300ms
  };

  // Voice input implementation
  const toggleVoiceInput = async () => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition not supported in this browser");
      // Use demo mode for testing
      simulateTranscription();
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopAudioRecording();
    } else {
      setIsListening(true);
      // Start both speech recognition and audio recording
      await startAudioRecording();
      recognitionRef.current.start();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  // Auto-send when audio recording is complete and we have a message
  useEffect(() => {
    if (audioBlob && message.trim() && !isListening) {
      console.log("🚀 Auto-sending voice message with audio");
      // Use setTimeout to avoid race conditions
      const timer = setTimeout(() => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !disabled) {
          // Check audio size and skip if too large (>50KB)
          const audioToSend = audioBlob.size > 50000 ? undefined : audioBlob;
          if (audioBlob.size > 50000) {
            console.warn("⚠️ Audio file too large, sending text only");
          }
          onSendMessage(trimmedMessage, audioToSend);
          setMessage("");
          setAudioBlob(null);
          // Reset textarea height
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [audioBlob, message, isListening, disabled, onSendMessage]);

  // Add CSS animation for pulse effect
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      style={{
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius,
          border: `1px solid ${theme.colors.border}`,
          padding: theme.spacing.sm,
          transition: theme.transitions.normal,
          boxShadow: theme.shadows.sm,
        }}
      >
        {/* Text Input Container */}
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={message + (transcript ? transcript : "")}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Connecting..." : isListening ? "Listening..." : placeholder}
            disabled={disabled || isListening}
            rows={1}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              backgroundColor: "transparent",
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily,
              lineHeight: "1.4",
              minHeight: "20px",
              maxHeight: "120px",
              overflow: "hidden",
            }}
          />

          {/* Real-time Transcription Overlay */}
          {transcript && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                padding: "0",
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily,
                lineHeight: "1.4",
                color: theme.colors.primary,
                opacity: 0.7,
                fontStyle: "italic",
                whiteSpace: "pre-wrap",
                overflow: "hidden",
              }}
            >
              {message}
              <span style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "0 2px" }}>
                {transcript}
              </span>
            </div>
          )}

          {/* Voice Recording Indicator */}
          {isListening && (
            <div
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                width: "16px",
                height: "16px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                animation: "pulse 1.5s ease-in-out infinite",
                border: "2px solid white",
                boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.3)",
              }}
            />
          )}
        </div>

        {/* Character Counter */}
        {message.length > maxLength * 0.8 && (
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: message.length >= maxLength ? theme.colors.error : theme.colors.textSecondary,
              alignSelf: "flex-end",
              marginBottom: "2px",
            }}
          >
            {message.length}/{maxLength}
          </div>
        )}

        {/* Voice Input Button */}
        {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={toggleVoiceInput}
          disabled={disabled}
          style={{
            padding: "8px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: isListening ? theme.colors.error : "transparent",
            color: isListening ? "white" : theme.colors.textSecondary,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: theme.transitions.normal,
            opacity: disabled ? 0.5 : 1,
          }}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Send Button */}
        {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            padding: "8px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: canSend ? theme.colors.primary : theme.colors.border,
            color: "white",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: theme.transitions.normal,
            transform: canSend ? "scale(1)" : "scale(0.95)",
          }}
          title="Send message (Enter)"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Connection Status */}
      {disabled && (
        <div
          style={{
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            textAlign: "center",
          }}
        >
          Connecting to chat service...
        </div>
      )}

      {/* Quick Actions / Suggestions */}
      <div
        style={{
          marginTop: theme.spacing.sm,
          display: "flex",
          gap: theme.spacing.xs,
          flexWrap: "wrap",
        }}
      >
        {["Help", "Navigation", "Search"].map((suggestion) => (
          // biome-ignore lint/a11y/useButtonType: <explanation>
          <button
            key={suggestion}
            onClick={() => {
              if (!disabled) {
                setMessage(suggestion);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }
            }}
            disabled={disabled}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "12px",
              backgroundColor: theme.colors.surface,
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.xs,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: theme.transitions.fast,
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = theme.colors.primary;
                e.currentTarget.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = theme.colors.surface;
                e.currentTarget.style.color = theme.colors.textSecondary;
              }
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageInput;
