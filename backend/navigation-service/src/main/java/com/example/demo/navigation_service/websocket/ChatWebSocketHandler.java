package com.example.demo.navigation_service.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * WebSocket handler for reactive chat functionality with Netty
 * Receives messages and replies with a count value
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper;

    // Session-based message counters
    private final ConcurrentHashMap<String, AtomicLong> sessionCounters = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String sessionId = session.getId();
        log.info("WebSocket connection established for session: {}", sessionId);

        // Initialize counter for this session
        sessionCounters.putIfAbsent(sessionId, new AtomicLong(0));

        return session.send(
            session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .doOnNext(payload -> log.debug("Received message from {}: {}", sessionId, payload))
                .map(payload -> processMessage(payload, sessionId))
                .map(session::textMessage)
        ).doFinally(signalType -> {
            log.info("WebSocket connection closed for session: {} ({})", sessionId, signalType);
            // Clean up session counter
            sessionCounters.remove(sessionId);
        });
    }

    /**
     * Process incoming message and generate response with count
     */
    private String processMessage(String payload, String sessionId) {
        try {
            // Parse incoming message
            JsonNode messageNode = objectMapper.readTree(payload);
            String content = messageNode.path("content").asText();
            String type = messageNode.path("type").asText("message");

            // Check for audio data
            JsonNode audioNode = messageNode.path("audio");
            boolean hasAudio = !audioNode.isMissingNode();
            String audioInfo = "";

            if (hasAudio) {
                String mimeType = audioNode.path("mimeType").asText("unknown");
                int audioSize = audioNode.path("size").asInt(0);
                String audioData = audioNode.path("data").asText("");

                audioInfo = String.format(" [Audio: %s, %d bytes, %d chars base64]",
                    mimeType, audioSize, audioData.length());

                log.info("Received audio data: mimeType={}, size={} bytes, base64Length={}",
                    mimeType, audioSize, audioData.length());

                // Here you could save the audio file, process it with AI, etc.
                // For now, we'll just acknowledge it in the response
            }

            // Increment counter for this session
            AtomicLong counter = sessionCounters.get(sessionId);
            long currentCount = counter.incrementAndGet();

            log.info("Processing message #{} from session {}: {}{}",
                currentCount, sessionId, content, audioInfo);

            // Create response with count
            String responseContent = hasAudio ?
                String.format("Voice message received: \"%s\"%s", content, audioInfo) :
                String.format("Message received: \"%s\"", content);

            ChatResponse response = ChatResponse.builder()
                    .type("response")
                    .content(responseContent)
                    .messageCount(currentCount)
                    .sessionId(sessionId)
                    .timestamp(System.currentTimeMillis())
                    .hasAudio(hasAudio)
                    .build();

            return objectMapper.writeValueAsString(response);
            
        } catch (Exception e) {
            log.error("Error processing message from session {}: {}", sessionId, e.getMessage(), e);
            
            // Return error response
            try {
                ChatResponse errorResponse = ChatResponse.builder()
                        .type("error")
                        .content("Error processing message: " + e.getMessage())
                        .messageCount(sessionCounters.get(sessionId).get())
                        .sessionId(sessionId)
                        .timestamp(System.currentTimeMillis())
                        .build();
                
                return objectMapper.writeValueAsString(errorResponse);
            } catch (Exception jsonError) {
                return "{\"type\":\"error\",\"content\":\"Failed to process message\"}";
            }
        }
    }

    /**
     * Response model for chat messages
     */
    public static class ChatResponse {
        private String type;
        private String content;
        private long messageCount;
        private String sessionId;
        private long timestamp;
        private boolean hasAudio;

        // Builder pattern
        public static ChatResponseBuilder builder() {
            return new ChatResponseBuilder();
        }

        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public long getMessageCount() { return messageCount; }
        public void setMessageCount(long messageCount) { this.messageCount = messageCount; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

        public boolean isHasAudio() { return hasAudio; }
        public void setHasAudio(boolean hasAudio) { this.hasAudio = hasAudio; }

        public static class ChatResponseBuilder {
            private String type;
            private String content;
            private long messageCount;
            private String sessionId;
            private long timestamp;
            private boolean hasAudio;

            public ChatResponseBuilder type(String type) { this.type = type; return this; }
            public ChatResponseBuilder content(String content) { this.content = content; return this; }
            public ChatResponseBuilder messageCount(long messageCount) { this.messageCount = messageCount; return this; }
            public ChatResponseBuilder sessionId(String sessionId) { this.sessionId = sessionId; return this; }
            public ChatResponseBuilder timestamp(long timestamp) { this.timestamp = timestamp; return this; }
            public ChatResponseBuilder hasAudio(boolean hasAudio) { this.hasAudio = hasAudio; return this; }

            public ChatResponse build() {
                ChatResponse response = new ChatResponse();
                response.type = this.type;
                response.content = this.content;
                response.messageCount = this.messageCount;
                response.sessionId = this.sessionId;
                response.timestamp = this.timestamp;
                response.hasAudio = this.hasAudio;
                return response;
            }
        }
    }
}
