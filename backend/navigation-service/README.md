# Product Requirements Document
## Navigation Service

**Service Name:** Navigation Service

**Architecture:** Spring Boot Reactive (WebFlux)

---

## 1. Executive Summary

### 1.1 Service Overview
A reactive, AI-powered navigation service that processes user queries through WebSocket connections, intelligently determines user intent using LangChain4j, and provides contextual navigation suggestions. The service adapts to user behavior patterns, implements smart debouncing for multi-message thoughts, and leverages both local PostgreSQL intent matching and OpenAI enhancement when needed.

### 1.2 Key Capabilities
- **Reactive Architecture**: Non-blocking I/O with Spring WebFlux
- **Real-time Communication**: WebSocket for bi-directional streaming
- **Intelligent Intent Processing**: LangChain4j orchestration with fallback strategies
- **Adaptive Behavior**: User session preferences and pattern recognition
- **Smart Debouncing**: Collects fragmented user thoughts before processing
- **Hybrid Intent Discovery**: PostgreSQL vector search with OpenAI enhancement
- **Contextual Responses**: Adjusts suggestions based on user challenges/disabilities

### 1.3 Technology Stack
- **Framework**: Spring Boot 3.2 with WebFlux
- **AI/ML**: LangChain4j 0.33.0
- **Database**: PostgreSQL 16 with pgvector
- **WebSocket**: Spring WebSocket with STOMP
- **Cache**: Caffeine (in-memory)
- **OpenAI**: GPT-4 Turbo & text-embedding-3-small

---

## 2. Functional Requirements

### 2.1 User Session Management

#### Session Preferences
```java
public class UserSessionPreferences {
    private String sessionId;
    private ResponseMode mode;           // CONCISE, DETAILED, GUIDED
    private boolean debounceEnabled;     // Auto-detect message fragmentation
    private int debounceWindow;          // ms to wait for follow-up messages
    private Language preferredLanguage;
    private AccessibilityProfile profile; // Vision, Motor, Cognitive challenges
    private float confidenceThreshold;    // Min confidence for suggestions
}
```

#### Accessibility Profiles
```java
public enum AccessibilityProfile {
    STANDARD,        // Default experience
    VISION_IMPAIRED, // Screen reader optimized, verbose descriptions
    MOTOR_IMPAIRED,  // Fewer clicks, larger targets, voice preferred
    COGNITIVE,       // Simpler language, step-by-step guidance
    ELDERLY,         // Larger text hints, slower pace, more confirmation
    DYSLEXIC        // Clear fonts, color coding, audio support
}
```

### 2.2 Debounce Mode

#### Pattern Detection
The service should automatically detect when users are sending fragmented thoughts:

```
User: "I want to see"
User: "my portfolio"  
User: "from last month"
→ Service waits and combines: "I want to see my portfolio from last month"
```

#### Debounce Configuration
```java
public class DebounceConfig {
    private boolean autoDetect = true;        // Auto-enable based on patterns
    private int windowMs = 2000;              // Wait time for next message
    private int maxMessages = 5;              // Max messages to combine
    private int patternThreshold = 3;         // Consecutive fragments to trigger
    private List<String> indicators = List.of(
        "and", "also", "with", "from", "but", "in", "for"
    );
}
```

### 2.3 Intent Discovery Flow

#### Primary Flow
1. **Collect Input**: Single message or debounced collection
2. **Session Context**: Load user preferences and history
3. **Local Search**: Query PostgreSQL for intent matches
4. **Confidence Check**: Evaluate match quality
5. **Enhancement**: If low confidence, enhance with OpenAI
6. **Response Generation**: Create adaptive response
7. **Stream Response**: Send via WebSocket

#### Intent Matching Levels
```java
public enum IntentConfidence {
    EXACT(0.95f),      // Direct match found
    HIGH(0.85f),       // Strong similarity
    MODERATE(0.70f),   // Reasonable match
    LOW(0.50f),        // Weak match - needs enhancement
    NONE(0.0f);        // No match - full OpenAI processing
}
```

---

## 3. Technical Specifications

### 3.1 Service Architecture

```yaml
navigation-service/
├── src/main/java/com/navigation/
│   ├── config/
│   │   ├── WebSocketConfig.java
│   │   ├── LangChainConfig.java
│   │   └── ReactiveConfig.java
│   ├── websocket/
│   │   ├── NavigationWebSocketHandler.java
│   │   └── SessionManager.java
│   ├── service/
│   │   ├── IntentProcessor.java
│   │   ├── DebounceService.java
│   │   ├── SessionPreferenceService.java
│   │   └── ResponseAdapter.java
│   ├── langchain/
│   │   ├── IntentChain.java
│   │   ├── NavigationAgent.java
│   │   └── PromptTemplates.java
│   ├── repository/
│   │   ├── IntentRepository.java
│   │   └── VectorSearchRepository.java
│   └── model/
│       ├── Intent.java
│       ├── NavigationSuggestion.java
│       └── UserSession.java
```

### 3.2 WebSocket Handler Implementation

```java
@Component
@RequiredArgsConstructor
public class NavigationWebSocketHandler implements WebSocketHandler {
    
    private final IntentProcessor intentProcessor;
    private final DebounceService debounceService;
    private final SessionManager sessionManager;
    private final ResponseAdapter responseAdapter;
    
    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String sessionId = extractSessionId(session);
        UserSession userSession = sessionManager.createOrGet(sessionId);
        
        return session.send(
            session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .transform(flux -> applyDebounceIfNeeded(flux, userSession))
                .flatMap(input -> processIntent(input, userSession))
                .map(response -> adaptResponse(response, userSession))
                .map(session::textMessage)
        ).doFinally(sig -> sessionManager.cleanup(sessionId));
    }
    
    private Flux<String> applyDebounceIfNeeded(Flux<String> input, UserSession session) {
        if (session.getPreferences().isDebounceEnabled()) {
            return debounceService.debounceMessages(input, session);
        }
        return input;
    }
    
    private Mono<NavigationResponse> processIntent(String input, UserSession session) {
        return intentProcessor.process(input, session)
            .timeout(Duration.ofSeconds(5))
            .retry(2);
    }
}
```

### 3.3 Intent Processor with LangChain4j

```java
@Service
@RequiredArgsConstructor
public class IntentProcessor {
    
    private final IntentRepository intentRepository;
    private final ChatLanguageModel chatModel;
    private final EmbeddingModel embeddingModel;
    private final NavigationAgent navigationAgent;
    
    public Mono<NavigationResponse> process(String input, UserSession session) {
        return Mono.fromCallable(() -> embeddingModel.embed(input))
            .flatMap(embedding -> searchLocalIntents(embedding))
            .flatMap(matches -> evaluateAndEnhance(matches, input, session))
            .map(result -> generateResponse(result, session));
    }
    
    private Mono<List<IntentMatch>> searchLocalIntents(Embedding embedding) {
        return intentRepository.findSimilar(embedding, 10)
            .collectList();
    }
    
    private Mono<IntentResult> evaluateAndEnhance(List<IntentMatch> matches, 
                                                  String input, 
                                                  UserSession session) {
        float topScore = matches.isEmpty() ? 0 : matches.get(0).getScore();
        
        if (topScore >= IntentConfidence.HIGH.getThreshold()) {
            // High confidence - use local match
            return Mono.just(IntentResult.fromMatches(matches));
        } else if (topScore >= IntentConfidence.LOW.getThreshold()) {
            // Moderate confidence - enhance with OpenAI
            return enhanceWithOpenAI(matches, input, session);
        } else {
            // Low/no confidence - full OpenAI processing
            return processWithOpenAI(input, session);
        }
    }
    
    private Mono<IntentResult> enhanceWithOpenAI(List<IntentMatch> matches, 
                                                 String input, 
                                                 UserSession session) {
        String prompt = PromptTemplates.enhanceIntent(input, matches, session);
        
        return Mono.fromCallable(() -> 
            navigationAgent.enhanceIntent(prompt)
        );
    }
}
```

### 3.4 Debounce Service

```java
@Service
@RequiredArgsConstructor
public class DebounceService {
    
    private final DebounceConfig config;
    private final ConcurrentHashMap<String, MessageBuffer> buffers = new ConcurrentHashMap<>();
    
    public Flux<String> debounceMessages(Flux<String> messages, UserSession session) {
        String sessionId = session.getSessionId();
        MessageBuffer buffer = buffers.computeIfAbsent(sessionId, k -> new MessageBuffer());
        
        return messages
            .doOnNext(msg -> buffer.add(msg))
            .switchMap(msg -> {
                if (shouldTriggerProcessing(msg, buffer)) {
                    return Flux.just(buffer.getCombined());
                } else {
                    return Flux.empty();
                }
            })
            .timeout(Duration.ofMillis(config.getWindowMs()))
            .onErrorResume(TimeoutException.class, e -> 
                Flux.just(buffer.getCombined())
            )
            .filter(StringUtils::isNotBlank);
    }
    
    private boolean shouldTriggerProcessing(String message, MessageBuffer buffer) {
        // Check for sentence ending punctuation
        if (message.matches(".*[.!?]$")) {
            return true;
        }
        
        // Check if message doesn't end with continuation indicator
        boolean endsWithIndicator = config.getIndicators().stream()
            .anyMatch(ind -> message.toLowerCase().endsWith(" " + ind));
        
        return !endsWithIndicator && buffer.size() >= config.getMaxMessages();
    }
    
    @Data
    private static class MessageBuffer {
        private final List<String> messages = new ArrayList<>();
        private final long startTime = System.currentTimeMillis();
        
        public synchronized void add(String message) {
            messages.add(message);
        }
        
        public synchronized String getCombined() {
            String combined = String.join(" ", messages);
            messages.clear();
            return combined;
        }
        
        public int size() {
            return messages.size();
        }
    }
}
```

### 3.5 Response Adapter

```java
@Service
@RequiredArgsConstructor
public class ResponseAdapter {
    
    public NavigationResponse adapt(IntentResult result, UserSession session) {
        ResponseMode mode = session.getPreferences().getMode();
        AccessibilityProfile profile = session.getPreferences().getProfile();
        
        NavigationResponse response = new NavigationResponse();
        response.setSessionId(session.getSessionId());
        response.setSuggestions(filterSuggestions(result.getSuggestions(), session));
        
        // Adapt message based on mode
        String message = switch (mode) {
            case CONCISE -> generateConciseMessage(result);
            case DETAILED -> generateDetailedMessage(result);
            case GUIDED -> generateGuidedMessage(result, session);
        };
        
        // Apply accessibility adaptations
        message = applyAccessibilityAdaptations(message, profile);
        response.setMessage(message);
        
        // Add metadata for client-side handling
        response.setMetadata(Map.of(
            "confidence", result.getConfidence(),
            "mode", mode.toString(),
            "profile", profile.toString(),
            "suggestionsCount", response.getSuggestions().size()
        ));
        
        return response;
    }
    
    private String applyAccessibilityAdaptations(String message, AccessibilityProfile profile) {
        return switch (profile) {
            case VISION_IMPAIRED -> addScreenReaderHints(message);
            case MOTOR_IMPAIRED -> simplifyInteractions(message);
            case COGNITIVE -> useSimpleLanguage(message);
            case ELDERLY -> addDetailedInstructions(message);
            case DYSLEXIC -> formatForDyslexia(message);
            default -> message;
        };
    }
    
    private List<NavigationSuggestion> filterSuggestions(List<NavigationSuggestion> suggestions,
                                                         UserSession session) {
        float threshold = session.getPreferences().getConfidenceThreshold();
        AccessibilityProfile profile = session.getPreferences().getProfile();
        
        // Filter by confidence
        List<NavigationSuggestion> filtered = suggestions.stream()
            .filter(s -> s.getConfidence() >= threshold)
            .collect(Collectors.toList());
        
        // Limit based on profile
        int maxSuggestions = switch (profile) {
            case COGNITIVE, ELDERLY -> 3;  // Fewer options
            case MOTOR_IMPAIRED -> 5;      // Balance between options and clicks
            default -> 10;                 // Standard amount
        };
        
        return filtered.stream()
            .limit(maxSuggestions)
            .collect(Collectors.toList());
    }
}
```

### 3.6 LangChain4j Configuration

```java
@Configuration
public class LangChainConfig {
    
    @Bean
    public ChatLanguageModel chatModel(@Value("${openai.api-key}") String apiKey) {
        return OpenAiChatModel.builder()
            .apiKey(apiKey)
            .modelName("gpt-4-turbo-preview")
            .temperature(0.3)
            .maxTokens(500)
            .timeout(Duration.ofSeconds(10))
            .build();
    }
    
    @Bean
    public EmbeddingModel embeddingModel(@Value("${openai.api-key}") String apiKey) {
        return OpenAiEmbeddingModel.builder()
            .apiKey(apiKey)
            .modelName("text-embedding-3-small")
            .dimensions(1536)
            .build();
    }
    
    @Bean
    public NavigationAgent navigationAgent(ChatLanguageModel chatModel,
                                          ContentRetriever contentRetriever) {
        return AiServices.builder(NavigationAgent.class)
            .chatLanguageModel(chatModel)
            .contentRetriever(contentRetriever)
            .chatMemoryProvider(sessionId -> 
                MessageWindowChatMemory.withMaxMessages(10))
            .build();
    }
}

// Navigation Agent Interface
public interface NavigationAgent {
    
    @SystemMessage("""
        You are a navigation assistant helping users find the right pages.
        Consider the user's accessibility needs and preferences.
        Provide clear, actionable navigation suggestions.
        """)
    NavigationResult findBestPath(@UserMessage String query, 
                                  @V("context") String context);
    
    @SystemMessage("""
        Enhance the intent understanding based on partial matches.
        Consider the user's history and preferences.
        """)
    IntentResult enhanceIntent(@UserMessage String query,
                              @V("matches") List<IntentMatch> matches,
                              @V("session") UserSession session);
}
```

---

## 4. Database Schema

### 4.1 Intent Storage

```sql
-- Intents table with vector embeddings
CREATE TABLE intents (
    id UUID PRIMARY KEY,
    intent_name VARCHAR(100) NOT NULL,
    description TEXT,
    embedding vector(1536),
    confidence_boost FLOAT DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intent paths mapping
CREATE TABLE intent_paths (
    id UUID PRIMARY KEY,
    intent_id UUID REFERENCES intents(id),
    path VARCHAR(500) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    priority INTEGER DEFAULT 0
);

-- User session preferences
CREATE TABLE user_sessions (
    session_id VARCHAR(200) PRIMARY KEY,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_intents_embedding ON intents 
    USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_sessions_last_active ON user_sessions(last_active);
```

---

## 5. API Specifications

### 5.1 WebSocket Messages

#### Client → Server
```json
{
  "type": "message",
  "content": "Show me my portfolio",
  "sessionId": "session_123",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### Server → Client (High Confidence)
```json
{
  "type": "navigation",
  "message": "I found your portfolio section.",
  "suggestions": [
    {
      "path": "/portfolio/overview",
      "title": "Portfolio Overview",
      "description": "View your complete investment portfolio",
      "confidence": 0.95,
      "primary": true
    },
    {
      "path": "/portfolio/performance",
      "title": "Performance Analytics",
      "description": "Detailed performance metrics",
      "confidence": 0.88
    }
  ],
  "metadata": {
    "confidence": 0.95,
    "mode": "CONCISE",
    "processingTime": 120
  }
}
```

#### Server → Client (Low Confidence)
```json
{
  "type": "clarification",
  "message": "I found several options. Which portfolio view interests you?",
  "suggestions": [
    {
      "path": "/portfolio/holdings",
      "title": "Current Holdings",
      "confidence": 0.65
    },
    {
      "path": "/portfolio/history",
      "title": "Transaction History",
      "confidence": 0.62
    }
  ],
  "metadata": {
    "confidence": 0.65,
    "enhancedWithAI": true
  }
}
```

---

## 6. Configuration

### 6.1 Application Properties

```yaml
navigation:
  websocket:
    endpoint: /ws/navigation
    heartbeat-interval: 30000
    session-timeout: 1800000  # 30 minutes
  
  debounce:
    enabled: true
    auto-detect: true
    window-ms: 2000
    max-messages: 5
    pattern-threshold: 3
  
  intent:
    confidence-threshold: 0.7
    max-suggestions: 10
    cache-ttl: 300  # 5 minutes
  
  openai:
    enabled: true
    fallback-threshold: 0.7
    timeout: 5000
    max-retries: 2
  
  accessibility:
    default-profile: STANDARD
    auto-detect: true
```

---

## 7. Performance Requirements

### 7.1 Response Times
- **Local Intent Match**: < 100ms
- **OpenAI Enhancement**: < 2000ms
- **Debounce Window**: 2000ms default
- **WebSocket Latency**: < 50ms

### 7.2 Scalability
- **Concurrent Sessions**: 1000 per instance
- **Messages/Second**: 100 per session
- **Memory per Session**: < 10MB
- **CPU Utilization**: < 60% at peak

### 7.3 Caching Strategy
```java
@Configuration
public class CacheConfig {
    
    @Bean
    public CaffeineCache intentCache() {
        return Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .recordStats()
            .build();
    }
    
    @Bean
    public CaffeineCache embeddingCache() {
        return Caffeine.newBuilder()
            .maximumSize(5000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .build();
    }
}
```

---

## 8. Monitoring & Observability

### 8.1 Metrics
- Intent match confidence distribution
- Debounce activation frequency
- OpenAI enhancement rate
- Response time percentiles (p50, p95, p99)
- Session duration and message count
- Accessibility profile distribution

### 8.2 Logging
```java
@Slf4j
public class IntentProcessor {
    
    private void logIntentProcessing(String sessionId, IntentResult result) {
        log.info("Intent processed - Session: {}, Confidence: {}, Enhanced: {}, Time: {}ms",
            sessionId,
            result.getConfidence(),
            result.isEnhanced(),
            result.getProcessingTime()
        );
    }
}
```

---

## 9. Success Criteria

### 9.1 Key Metrics
- **Intent Match Rate**: > 85% with confidence > 0.7
- **Debounce Accuracy**: > 90% correct message grouping
- **Response Time**: P95 < 500ms for local matches
- **User Satisfaction**: > 4.5/5 rating
- **Accessibility Compliance**: WCAG 2.1 AA

### 9.2 Quality Gates
- Unit test coverage > 80%
- Integration test coverage > 70%
- Zero critical security vulnerabilities
- Documentation completeness > 90%