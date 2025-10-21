-- Create page_embeddings table for multi-modal embedding infrastructure (Idempotent)
-- This table stores multiple types of embeddings for comprehensive page understanding
-- Estimated storage: ~40KB per row (6 vectors × 1536 dimensions × 4 bytes + metadata)

CREATE TABLE IF NOT EXISTS page_embeddings (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,
    url_path VARCHAR(1000) NOT NULL,
    page_title VARCHAR(500),

    -- Multi-modal embeddings (1536-dimensional vectors)
    functionality_embedding vector(1536),
    content_embedding vector(1536),
    purpose_embedding vector(1536),
    action_embedding vector(1536),
    data_context_embedding vector(1536),
    user_task_embedding vector(1536),

    -- Text representations for each embedding type
    functionality_text TEXT,
    content_text TEXT,
    purpose_text TEXT,
    action_text TEXT,
    data_context_text TEXT,
    user_task_text TEXT,

    -- Confidence scores for each embedding (0.0 to 1.0)
    functionality_confidence NUMERIC(3,2) DEFAULT 0.0,
    content_confidence NUMERIC(3,2) DEFAULT 0.0,
    purpose_confidence NUMERIC(3,2) DEFAULT 0.0,
    action_confidence NUMERIC(3,2) DEFAULT 0.0,
    data_context_confidence NUMERIC(3,2) DEFAULT 0.0,
    user_task_confidence NUMERIC(3,2) DEFAULT 0.0,

    -- Structured extracted data
    extracted_data JSONB DEFAULT '{}',

    -- Full-text search support
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(page_title, '') || ' ' ||
            COALESCE(functionality_text, '') || ' ' ||
            COALESCE(content_text, '') || ' ' ||
            COALESCE(purpose_text, '') || ' ' ||
            COALESCE(action_text, '') || ' ' ||
            COALESCE(data_context_text, '') || ' ' ||
            COALESCE(user_task_text, '')
        )
    ) STORED,

    -- Page metadata
    page_metadata JSONB DEFAULT '{}',
    dom_structure JSONB DEFAULT '{}',

    -- Analysis metadata
    analysis_version VARCHAR(50),
    embedding_model VARCHAR(100),
    last_analyzed_at TIMESTAMP WITH TIME ZONE,

    -- Standard fields
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_embeddings_website_id FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT page_embeddings_url_path_not_empty CHECK (LENGTH(TRIM(url_path)) > 0),
    CONSTRAINT page_embeddings_confidence_range CHECK (
        functionality_confidence BETWEEN 0 AND 1 AND
        content_confidence BETWEEN 0 AND 1 AND
        purpose_confidence BETWEEN 0 AND 1 AND
        action_confidence BETWEEN 0 AND 1 AND
        data_context_confidence BETWEEN 0 AND 1 AND
        user_task_confidence BETWEEN 0 AND 1
    ),
    CONSTRAINT page_embeddings_unique_website_url UNIQUE (website_id, url_path)
);

-- Create page_analysis_history table for version tracking (Idempotent)
CREATE TABLE IF NOT EXISTS page_analysis_history (
    id BIGSERIAL PRIMARY KEY,
    page_embedding_id BIGINT NOT NULL,
    analysis_version VARCHAR(50) NOT NULL,
    embedding_model VARCHAR(100),

    -- Snapshot of embeddings at this version
    functionality_embedding vector(1536),
    content_embedding vector(1536),
    purpose_embedding vector(1536),
    action_embedding vector(1536),
    data_context_embedding vector(1536),
    user_task_embedding vector(1536),

    -- Changes from previous version
    changes_summary JSONB DEFAULT '{}',
    confidence_deltas JSONB DEFAULT '{}',

    -- Analysis metadata
    analyzed_by VARCHAR(255),
    analysis_duration_ms INTEGER,
    analysis_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_analysis_history_page_id FOREIGN KEY (page_embedding_id)
        REFERENCES page_embeddings(id) ON DELETE CASCADE
);

-- Create indexes for page_embeddings table (idempotent)
CREATE INDEX IF NOT EXISTS idx_page_embeddings_website_id ON page_embeddings(website_id);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_url_path ON page_embeddings(url_path);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_active ON page_embeddings(is_active);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_last_analyzed ON page_embeddings(last_analyzed_at);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_embedding_model ON page_embeddings(embedding_model);

-- GIN indexes for JSONB fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_page_embeddings_extracted_data ON page_embeddings USING GIN(extracted_data);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_page_metadata ON page_embeddings USING GIN(page_metadata);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_dom_structure ON page_embeddings USING GIN(dom_structure);

-- Full-text search index (idempotent)
CREATE INDEX IF NOT EXISTS idx_page_embeddings_search_vector ON page_embeddings USING GIN(search_vector);

-- Composite indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_page_embeddings_website_active ON page_embeddings(website_id, is_active);
CREATE INDEX IF NOT EXISTS idx_page_embeddings_website_url_active ON page_embeddings(website_id, url_path, is_active);

-- IVFFlat indexes for vector similarity search (idempotent)
-- Using lists=100 as recommended for datasets with 10k-100k rows
-- Note: pgvector extension must be enabled before creating these indexes

DROP INDEX IF EXISTS idx_page_embeddings_functionality_vector;
CREATE INDEX idx_page_embeddings_functionality_vector
    ON page_embeddings
    USING ivfflat (functionality_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE functionality_embedding IS NOT NULL;

DROP INDEX IF EXISTS idx_page_embeddings_content_vector;
CREATE INDEX idx_page_embeddings_content_vector
    ON page_embeddings
    USING ivfflat (content_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE content_embedding IS NOT NULL;

DROP INDEX IF EXISTS idx_page_embeddings_purpose_vector;
CREATE INDEX idx_page_embeddings_purpose_vector
    ON page_embeddings
    USING ivfflat (purpose_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE purpose_embedding IS NOT NULL;

DROP INDEX IF EXISTS idx_page_embeddings_action_vector;
CREATE INDEX idx_page_embeddings_action_vector
    ON page_embeddings
    USING ivfflat (action_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE action_embedding IS NOT NULL;

DROP INDEX IF EXISTS idx_page_embeddings_data_context_vector;
CREATE INDEX idx_page_embeddings_data_context_vector
    ON page_embeddings
    USING ivfflat (data_context_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE data_context_embedding IS NOT NULL;

DROP INDEX IF EXISTS idx_page_embeddings_user_task_vector;
CREATE INDEX idx_page_embeddings_user_task_vector
    ON page_embeddings
    USING ivfflat (user_task_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE user_task_embedding IS NOT NULL;

-- Create indexes for page_analysis_history table (idempotent)
CREATE INDEX IF NOT EXISTS idx_page_analysis_history_page_id ON page_analysis_history(page_embedding_id);
CREATE INDEX IF NOT EXISTS idx_page_analysis_history_version ON page_analysis_history(analysis_version);
CREATE INDEX IF NOT EXISTS idx_page_analysis_history_created_at ON page_analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_analysis_history_analyzed_by ON page_analysis_history(analyzed_by);

-- GIN indexes for JSONB fields in history (idempotent)
CREATE INDEX IF NOT EXISTS idx_page_analysis_history_changes ON page_analysis_history USING GIN(changes_summary);
CREATE INDEX IF NOT EXISTS idx_page_analysis_history_metadata ON page_analysis_history USING GIN(analysis_metadata);

-- Create trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_page_embeddings_updated_at ON page_embeddings;
CREATE TRIGGER update_page_embeddings_updated_at
    BEFORE UPDATE ON page_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate average confidence score (idempotent)
CREATE OR REPLACE FUNCTION calculate_average_confidence(
    p_functionality_confidence NUMERIC,
    p_content_confidence NUMERIC,
    p_purpose_confidence NUMERIC,
    p_action_confidence NUMERIC,
    p_data_context_confidence NUMERIC,
    p_user_task_confidence NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
    total_confidence NUMERIC;
    count_non_zero INTEGER;
BEGIN
    total_confidence :=
        COALESCE(p_functionality_confidence, 0) +
        COALESCE(p_content_confidence, 0) +
        COALESCE(p_purpose_confidence, 0) +
        COALESCE(p_action_confidence, 0) +
        COALESCE(p_data_context_confidence, 0) +
        COALESCE(p_user_task_confidence, 0);

    count_non_zero :=
        (CASE WHEN p_functionality_confidence > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN p_content_confidence > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN p_purpose_confidence > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN p_action_confidence > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN p_data_context_confidence > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN p_user_task_confidence > 0 THEN 1 ELSE 0 END);

    IF count_non_zero = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND(total_confidence / count_non_zero, 2);
END;
$$ language 'plpgsql' IMMUTABLE;

-- Function for similarity search across all embedding types (idempotent)
CREATE OR REPLACE FUNCTION search_similar_pages(
    p_query_embedding vector(1536),
    p_embedding_type TEXT DEFAULT 'content',
    p_website_id BIGINT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_min_confidence NUMERIC DEFAULT 0.5
)
RETURNS TABLE (
    page_id BIGINT,
    website_id BIGINT,
    url_path VARCHAR,
    page_title VARCHAR,
    similarity_score NUMERIC,
    confidence_score NUMERIC,
    matching_text TEXT
) AS $$
BEGIN
    IF p_embedding_type = 'functionality' THEN
        RETURN QUERY
        SELECT
            pe.id,
            pe.website_id,
            pe.url_path,
            pe.page_title,
            ROUND((1 - (pe.functionality_embedding <=> p_query_embedding))::NUMERIC, 4) AS similarity_score,
            pe.functionality_confidence,
            pe.functionality_text
        FROM page_embeddings pe
        WHERE pe.is_active = true
            AND pe.functionality_embedding IS NOT NULL
            AND pe.functionality_confidence >= p_min_confidence
            AND (p_website_id IS NULL OR pe.website_id = p_website_id)
        ORDER BY pe.functionality_embedding <=> p_query_embedding
        LIMIT p_limit;

    ELSIF p_embedding_type = 'content' THEN
        RETURN QUERY
        SELECT
            pe.id,
            pe.website_id,
            pe.url_path,
            pe.page_title,
            ROUND((1 - (pe.content_embedding <=> p_query_embedding))::NUMERIC, 4) AS similarity_score,
            pe.content_confidence,
            pe.content_text
        FROM page_embeddings pe
        WHERE pe.is_active = true
            AND pe.content_embedding IS NOT NULL
            AND pe.content_confidence >= p_min_confidence
            AND (p_website_id IS NULL OR pe.website_id = p_website_id)
        ORDER BY pe.content_embedding <=> p_query_embedding
        LIMIT p_limit;

    ELSIF p_embedding_type = 'purpose' THEN
        RETURN QUERY
        SELECT
            pe.id,
            pe.website_id,
            pe.url_path,
            pe.page_title,
            ROUND((1 - (pe.purpose_embedding <=> p_query_embedding))::NUMERIC, 4) AS similarity_score,
            pe.purpose_confidence,
            pe.purpose_text
        FROM page_embeddings pe
        WHERE pe.is_active = true
            AND pe.purpose_embedding IS NOT NULL
            AND pe.purpose_confidence >= p_min_confidence
            AND (p_website_id IS NULL OR pe.website_id = p_website_id)
        ORDER BY pe.purpose_embedding <=> p_query_embedding
        LIMIT p_limit;

    ELSIF p_embedding_type = 'action' THEN
        RETURN QUERY
        SELECT
            pe.id,
            pe.website_id,
            pe.url_path,
            pe.page_title,
            ROUND((1 - (pe.action_embedding <=> p_query_embedding))::NUMERIC, 4) AS similarity_score,
            pe.action_confidence,
            pe.action_text
        FROM page_embeddings pe
        WHERE pe.is_active = true
            AND pe.action_embedding IS NOT NULL
            AND pe.action_confidence >= p_min_confidence
            AND (p_website_id IS NULL OR pe.website_id = p_website_id)
        ORDER BY pe.action_embedding <=> p_query_embedding
        LIMIT p_limit;

    ELSIF p_embedding_type = 'data_context' THEN
        RETURN QUERY
        SELECT
            pe.id,
            pe.website_id,
            pe.url_path,
            pe.page_title,
            ROUND((1 - (pe.data_context_embedding <=> p_query_embedding))::NUMERIC, 4) AS similarity_score,
            pe.data_context_confidence,
            pe.data_context_text
        FROM page_embeddings pe
        WHERE pe.is_active = true
            AND pe.data_context_embedding IS NOT NULL
            AND pe.data_context_confidence >= p_min_confidence
            AND (p_website_id IS NULL OR pe.website_id = p_website_id)
        ORDER BY pe.data_context_embedding <=> p_query_embedding
        LIMIT p_limit;

    ELSIF p_embedding_type = 'user_task' THEN
        RETURN QUERY
        SELECT
            pe.id,
            pe.website_id,
            pe.url_path,
            pe.page_title,
            ROUND((1 - (pe.user_task_embedding <=> p_query_embedding))::NUMERIC, 4) AS similarity_score,
            pe.user_task_confidence,
            pe.user_task_text
        FROM page_embeddings pe
        WHERE pe.is_active = true
            AND pe.user_task_embedding IS NOT NULL
            AND pe.user_task_confidence >= p_min_confidence
            AND (p_website_id IS NULL OR pe.website_id = p_website_id)
        ORDER BY pe.user_task_embedding <=> p_query_embedding
        LIMIT p_limit;

    ELSE
        RAISE EXCEPTION 'Invalid embedding type: %. Must be one of: functionality, content, purpose, action, data_context, user_task', p_embedding_type;
    END IF;
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON TABLE page_embeddings IS 'Multi-modal embeddings for comprehensive page understanding and similarity search';
COMMENT ON COLUMN page_embeddings.functionality_embedding IS 'Vector embedding representing page functionality and capabilities';
COMMENT ON COLUMN page_embeddings.content_embedding IS 'Vector embedding representing page content and information';
COMMENT ON COLUMN page_embeddings.purpose_embedding IS 'Vector embedding representing page purpose and intent';
COMMENT ON COLUMN page_embeddings.action_embedding IS 'Vector embedding representing available actions and interactions';
COMMENT ON COLUMN page_embeddings.data_context_embedding IS 'Vector embedding representing data context and domain';
COMMENT ON COLUMN page_embeddings.user_task_embedding IS 'Vector embedding representing user tasks this page supports';
COMMENT ON COLUMN page_embeddings.search_vector IS 'Generated tsvector for hybrid full-text + vector search';

COMMENT ON TABLE page_analysis_history IS 'Version history of page embedding analysis for tracking changes over time';
COMMENT ON FUNCTION calculate_average_confidence IS 'Calculate average confidence score across all embedding types';
COMMENT ON FUNCTION search_similar_pages IS 'Search for similar pages using cosine similarity on specified embedding type';
