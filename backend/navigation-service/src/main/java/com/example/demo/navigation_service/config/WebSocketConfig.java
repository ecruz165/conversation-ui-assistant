package com.example.demo.navigation_service.config;

import com.example.demo.navigation_service.websocket.ChatWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket configuration for reactive chat functionality
 */
@Configuration
public class WebSocketConfig {

    @Bean
    public HandlerMapping webSocketMapping(ChatWebSocketHandler chatHandler) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws/chat", chatHandler);
        
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.setUrlMap(map);
        mapping.setOrder(-1); // Before other mappings
        return mapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}
