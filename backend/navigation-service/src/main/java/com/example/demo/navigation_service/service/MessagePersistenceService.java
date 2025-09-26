package com.example.demo.navigation_service.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Reactive message persistence service for in-memory storage with async persistence.
 * 
 * This service provides:
 * - In-memory message storage for fast access
 * - Async queue for background persistence
 * - Non-blocking operations for Netty compatibility
 * - Message batching for efficient persistence
 */
@Service
public class MessagePersistenceService {

    private final ConcurrentLinkedQueue<ChatMessage> persistenceQueue = new ConcurrentLinkedQueue<>();
    private final Sinks.Many<ChatMessage> messageSink = Sinks.many().multicast().onBackpressureBuffer();
    private final AtomicLong messageIdCounter = new AtomicLong(1);

    public MessagePersistenceService() {
        // Start background persistence processor
        startPersistenceProcessor();
    }

    /**
     * Store message in memory and queue for async persistence.
     */
    public Mono<ChatMessage> storeMessage(String sessionId, String content, String role) {
        return Mono.fromCallable(() -> {
            ChatMessage message = new ChatMessage(
                messageIdCounter.getAndIncrement(),
                sessionId,
                content,
                role,
                LocalDateTime.now()
            );
            
            // Add to persistence queue (non-blocking)
            persistenceQueue.offer(message);
            
            // Emit to reactive stream
            messageSink.tryEmitNext(message);
            
            return message;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Get messages for a session from in-memory storage.
     */
    public Flux<ChatMessage> getSessionMessages(String sessionId) {
        return messageSink.asFlux()
            .filter(message -> sessionId.equals(message.getSessionId()))
            .startWith(getPersistedMessages(sessionId));
    }

    /**
     * Get all messages stream for monitoring/debugging.
     */
    public Flux<ChatMessage> getAllMessages() {
        return messageSink.asFlux();
    }

    /**
     * Background processor for async persistence.
     * Runs on separate thread pool to avoid blocking Netty.
     */
    private void startPersistenceProcessor() {
        Flux.interval(java.time.Duration.ofSeconds(5))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(tick -> processPersistenceQueue())
            .subscribe(
                count -> {
                    if (count > 0) {
                        System.out.println("Persisted " + count + " messages to background storage");
                    }
                },
                error -> System.err.println("Error in persistence processor: " + error.getMessage())
            );
    }

    /**
     * Process messages from queue and persist them.
     * This could write to database, file, external service, etc.
     */
    private Mono<Integer> processPersistenceQueue() {
        return Mono.fromCallable(() -> {
            int count = 0;
            ChatMessage message;
            
            // Process up to 100 messages per batch
            while ((message = persistenceQueue.poll()) != null && count < 100) {
                // TODO: Implement actual persistence logic here
                // Examples:
                // - Write to R2DBC database
                // - Send to message queue (RabbitMQ, Kafka)
                // - Write to file
                // - Send to external API
                
                persistMessage(message);
                count++;
            }
            
            return count;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Actual persistence implementation.
     * Replace with your preferred persistence mechanism.
     */
    private void persistMessage(ChatMessage message) {
        // Example implementations:
        
        // 1. Log to console (for development)
        System.out.println("PERSIST: " + message);
        
        // 2. TODO: Write to R2DBC database
        // r2dbcTemplate.insert(message).subscribe();
        
        // 3. TODO: Send to message queue
        // rabbitTemplate.convertAndSend("chat.messages", message);
        
        // 4. TODO: Write to file
        // Files.write(Paths.get("messages.log"), message.toString().getBytes(), StandardOpenOption.APPEND);
        
        // 5. TODO: Send to external service
        // webClient.post().uri("/api/messages").bodyValue(message).retrieve().toBodilessEntity().subscribe();
    }

    /**
     * Retrieve persisted messages (placeholder for actual implementation).
     */
    private Flux<ChatMessage> getPersistedMessages(String sessionId) {
        // TODO: Implement retrieval from persistent storage
        // Examples:
        // - Query R2DBC database
        // - Read from file
        // - Query external API
        
        return Flux.empty(); // Return empty for now
    }

    /**
     * Chat message data class.
     */
    public static class ChatMessage {
        private final Long id;
        private final String sessionId;
        private final String content;
        private final String role;
        private final LocalDateTime timestamp;

        public ChatMessage(Long id, String sessionId, String content, String role, LocalDateTime timestamp) {
            this.id = id;
            this.sessionId = sessionId;
            this.content = content;
            this.role = role;
            this.timestamp = timestamp;
        }

        // Getters
        public Long getId() { return id; }
        public String getSessionId() { return sessionId; }
        public String getContent() { return content; }
        public String getRole() { return role; }
        public LocalDateTime getTimestamp() { return timestamp; }

        @Override
        public String toString() {
            return String.format("ChatMessage{id=%d, sessionId='%s', role='%s', content='%s', timestamp=%s}",
                id, sessionId, role, content, timestamp);
        }
    }
}
