package com.example.demo.navigation_service.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Reactive vector store service for in-memory embeddings with async persistence.
 * 
 * This service provides:
 * - In-memory vector storage for fast similarity search
 * - Async queue for background persistence of embeddings
 * - Non-blocking operations for Netty compatibility
 * - Simple cosine similarity search
 */
@Service
public class ReactiveVectorStoreService {

    private final Map<String, VectorDocument> inMemoryStore = new ConcurrentHashMap<>();
    private final ConcurrentLinkedQueue<VectorDocument> persistenceQueue = new ConcurrentLinkedQueue<>();
    private final Sinks.Many<VectorDocument> vectorSink = Sinks.many().multicast().onBackpressureBuffer();
    private final AtomicLong documentIdCounter = new AtomicLong(1);

    public ReactiveVectorStoreService() {
        // Start background persistence processor
        startVectorPersistenceProcessor();
    }

    /**
     * Store document with embedding in memory and queue for async persistence.
     */
    public Mono<VectorDocument> storeDocument(String content, List<Double> embedding, Map<String, Object> metadata) {
        return Mono.fromCallable(() -> {
            String id = "doc_" + documentIdCounter.getAndIncrement();
            VectorDocument document = new VectorDocument(
                id,
                content,
                embedding,
                metadata,
                LocalDateTime.now()
            );
            
            // Store in memory for fast access
            inMemoryStore.put(id, document);
            
            // Add to persistence queue (non-blocking)
            persistenceQueue.offer(document);
            
            // Emit to reactive stream
            vectorSink.tryEmitNext(document);
            
            return document;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Perform similarity search using cosine similarity.
     */
    public Flux<SimilarityResult> similaritySearch(List<Double> queryEmbedding, int topK, double threshold) {
        return Flux.fromIterable(inMemoryStore.values())
            .subscribeOn(Schedulers.boundedElastic())
            .map(doc -> new SimilarityResult(
                doc,
                cosineSimilarity(queryEmbedding, doc.getEmbedding())
            ))
            .filter(result -> result.getScore() >= threshold)
            .sort((a, b) -> Double.compare(b.getScore(), a.getScore()))
            .take(topK);
    }

    /**
     * Get document by ID.
     */
    public Mono<VectorDocument> getDocument(String id) {
        return Mono.fromCallable(() -> inMemoryStore.get(id))
            .subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Get all documents stream.
     */
    public Flux<VectorDocument> getAllDocuments() {
        return Flux.fromIterable(inMemoryStore.values())
            .subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Delete document from memory and mark for deletion in persistence.
     */
    public Mono<Boolean> deleteDocument(String id) {
        return Mono.fromCallable(() -> {
            VectorDocument removed = inMemoryStore.remove(id);
            if (removed != null) {
                // Mark for deletion in persistence layer
                VectorDocument deletionMarker = new VectorDocument(
                    id, null, null, Map.of("_deleted", true), LocalDateTime.now()
                );
                persistenceQueue.offer(deletionMarker);
                return true;
            }
            return false;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Calculate cosine similarity between two vectors.
     */
    private double cosineSimilarity(List<Double> vectorA, List<Double> vectorB) {
        if (vectorA.size() != vectorB.size()) {
            throw new IllegalArgumentException("Vectors must have the same dimension");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.size(); i++) {
            dotProduct += vectorA.get(i) * vectorB.get(i);
            normA += Math.pow(vectorA.get(i), 2);
            normB += Math.pow(vectorB.get(i), 2);
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Background processor for async vector persistence.
     */
    private void startVectorPersistenceProcessor() {
        Flux.interval(java.time.Duration.ofSeconds(10))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(tick -> processVectorPersistenceQueue())
            .subscribe(
                count -> {
                    if (count > 0) {
                        System.out.println("Persisted " + count + " vector documents to background storage");
                    }
                },
                error -> System.err.println("Error in vector persistence processor: " + error.getMessage())
            );
    }

    /**
     * Process vectors from queue and persist them.
     */
    private Mono<Integer> processVectorPersistenceQueue() {
        return Mono.fromCallable(() -> {
            int count = 0;
            VectorDocument document;
            
            // Process up to 50 documents per batch
            while ((document = persistenceQueue.poll()) != null && count < 50) {
                persistVectorDocument(document);
                count++;
            }
            
            return count;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Actual vector persistence implementation.
     */
    private void persistVectorDocument(VectorDocument document) {
        // Example implementations:
        
        // 1. Log to console (for development)
        System.out.println("PERSIST VECTOR: " + document.getId() + " (embedding size: " + 
            (document.getEmbedding() != null ? document.getEmbedding().size() : "deleted") + ")");
        
        // 2. TODO: Write to vector database (Pinecone, Weaviate, etc.)
        // vectorDbClient.upsert(document).subscribe();
        
        // 3. TODO: Write to file-based vector store
        // Files.write(Paths.get("vectors/" + document.getId() + ".json"), 
        //     objectMapper.writeValueAsBytes(document));
        
        // 4. TODO: Send to external vector service
        // webClient.post().uri("/api/vectors").bodyValue(document).retrieve().toBodilessEntity().subscribe();
        
        // 5. TODO: Store in PostgreSQL with pgvector (via separate service)
        // persistenceServiceClient.storeVector(document).subscribe();
    }

    /**
     * Vector document data class.
     */
    public static class VectorDocument {
        private final String id;
        private final String content;
        private final List<Double> embedding;
        private final Map<String, Object> metadata;
        private final LocalDateTime timestamp;

        public VectorDocument(String id, String content, List<Double> embedding, 
                            Map<String, Object> metadata, LocalDateTime timestamp) {
            this.id = id;
            this.content = content;
            this.embedding = embedding;
            this.metadata = metadata;
            this.timestamp = timestamp;
        }

        // Getters
        public String getId() { return id; }
        public String getContent() { return content; }
        public List<Double> getEmbedding() { return embedding; }
        public Map<String, Object> getMetadata() { return metadata; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    /**
     * Similarity search result.
     */
    public static class SimilarityResult {
        private final VectorDocument document;
        private final double score;

        public SimilarityResult(VectorDocument document, double score) {
            this.document = document;
            this.score = score;
        }

        public VectorDocument getDocument() { return document; }
        public double getScore() { return score; }
    }
}
