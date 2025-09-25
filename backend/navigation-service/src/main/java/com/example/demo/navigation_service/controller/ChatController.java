package com.example.demo.navigation_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * REST controller for chat-related endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ChatController {

    /**
     * Health check endpoint for chat service
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        return Mono.just(ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "navigation-service",
                "websocket", "enabled",
                "endpoint", "/ws/chat",
                "timestamp", LocalDateTime.now()
        )));
    }

    /**
     * Get WebSocket connection info
     */
    @GetMapping("/websocket/info")
    public Mono<ResponseEntity<Map<String, Object>>> websocketInfo() {
        return Mono.just(ResponseEntity.ok(Map.of(
                "endpoint", "/ws/chat",
                "protocol", "WebSocket",
                "messageFormat", "JSON",
                "features", Map.of(
                        "messageCount", "Tracks messages per session",
                        "sessionManagement", "Automatic session cleanup",
                        "errorHandling", "Graceful error responses"
                ),
                "sampleMessage", Map.of(
                        "type", "message",
                        "content", "Hello, this is a test message",
                        "sessionId", "optional-session-id"
                ),
                "sampleResponse", Map.of(
                        "type", "response",
                        "content", "Message received: \"Hello, this is a test message\"",
                        "messageCount", 1,
                        "sessionId", "generated-session-id",
                        "timestamp", System.currentTimeMillis()
                )
        )));
    }

    /**
     * Simple echo endpoint for testing
     */
    @PostMapping("/echo")
    public Mono<ResponseEntity<Map<String, Object>>> echo(@RequestBody Map<String, Object> message) {
        log.info("Echo request received: {}", message);
        
        return Mono.just(ResponseEntity.ok(Map.of(
                "echo", message,
                "timestamp", LocalDateTime.now(),
                "service", "navigation-service"
        )));
    }
}
