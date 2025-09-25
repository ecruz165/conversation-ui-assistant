package com.example.demo.navigation_service.config;

import com.example.demo.navigation_service.websocket.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.netty.NettyReactiveWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;
import org.springframework.web.reactive.socket.server.upgrade.ReactorNettyRequestUpgradeStrategy;
import reactor.netty.http.server.HttpServer;

import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket configuration for reactive chat functionality with Netty
 * Supports large audio file transmission by configuring frame size limits
 */
@Configuration
public class WebSocketConfig {

    @Value("${app.websocket.max-frame-size:2097152}") // Default 2MB
    private int maxFrameSize;

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

    /**
     * Configure Netty server to support larger WebSocket frames for audio transmission
     */
    @Bean
    public WebServerFactoryCustomizer<NettyReactiveWebServerFactory> nettyCustomizer() {
        return factory -> factory.addServerCustomizers(httpServer ->
            httpServer.httpRequestDecoder(spec ->
                spec.maxHeaderSize(8192)
                   .maxInitialLineLength(4096)
                   .maxChunkSize(maxFrameSize)
            )
        );
    }
}
