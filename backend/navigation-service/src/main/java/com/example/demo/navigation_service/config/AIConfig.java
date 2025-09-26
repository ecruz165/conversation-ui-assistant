package com.example.demo.navigation_service.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * AI Configuration for development and testing.
 * 
 * This configuration provides mock implementations to prevent
 * startup errors when real AI services are not available or
 * API keys are not configured.
 */
@Configuration
public class AIConfig {

    /**
     * Mock chat client for development when OpenAI is disabled.
     * Prevents startup errors related to missing API keys.
     */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "spring.ai.openai.chat.enabled", havingValue = "false", matchIfMissing = true)
    public MockChatClient mockChatClient() {
        return new MockChatClient();
    }

    /**
     * Simple mock implementation of chat functionality.
     * Returns predefined responses for development/testing.
     */
    public static class MockChatClient {
        
        public String chat(String message) {
            return "Mock response: I received your message '" + message + "'. " +
                   "This is a development mock. Configure OpenAI API key for real AI responses.";
        }
        
        public boolean isAvailable() {
            return false; // Indicates this is a mock
        }
        
        public String getProviderName() {
            return "Mock AI Provider";
        }
    }
}
