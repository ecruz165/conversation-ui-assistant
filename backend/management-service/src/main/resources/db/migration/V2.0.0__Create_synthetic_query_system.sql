-- Create synthetic query generation system for automated testing (Idempotent)

-- Create synthetic_queries table for storing generated test queries (Idempotent)
CREATE TABLE IF NOT EXISTS synthetic_queries (
    id BIGSERIAL PRIMARY KEY,
    navigation_link_id BIGINT NOT NULL,

    -- Query information
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) NOT NULL,
    query_embedding vector(1536),

    -- Generation metadata
    generation_method VARCHAR(50) NOT NULL DEFAULT 'template',
    template_used VARCHAR(100),
    generation_parameters JSONB DEFAULT '{}',

    -- Validation and quality
    is_validated BOOLEAN DEFAULT false,
    validation_score NUMERIC(3,2),
    validation_method VARCHAR(50),
    validation_feedback TEXT,

    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    avg_success_rate NUMERIC(5,4),

    -- Quality metrics
    avg_precision NUMERIC(5,4),
    avg_recall NUMERIC(5,4),
    avg_user_satisfaction NUMERIC(3,2),

    -- Metadata
    query_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_synthetic_queries_link_id FOREIGN KEY (navigation_link_id)
        REFERENCES navigation_links(id) ON DELETE CASCADE,
    CONSTRAINT synthetic_queries_query_text_not_empty CHECK (LENGTH(TRIM(query_text)) > 0),
    CONSTRAINT synthetic_queries_query_type_check CHECK (
        query_type IN (
            'show_me',           -- "Show me X"
            'i_want_to',         -- "I want to X"
            'where_can_i',       -- "Where can I X?"
            'how_do_i',          -- "How do I X?"
            'find',              -- "Find X"
            'navigate_to'        -- "Navigate to X"
        )
    ),
    CONSTRAINT synthetic_queries_generation_method_check CHECK (
        generation_method IN ('template', 'llm', 'hybrid', 'manual')
    ),
    CONSTRAINT synthetic_queries_validation_score_range CHECK (
        validation_score IS NULL OR (validation_score BETWEEN 0 AND 1)
    ),
    CONSTRAINT synthetic_queries_times_used_positive CHECK (times_used >= 0),
    CONSTRAINT synthetic_queries_quality_range CHECK (
        (avg_precision IS NULL OR avg_precision BETWEEN 0 AND 1) AND
        (avg_recall IS NULL OR avg_recall BETWEEN 0 AND 1) AND
        (avg_success_rate IS NULL OR avg_success_rate BETWEEN 0 AND 1) AND
        (avg_user_satisfaction IS NULL OR avg_user_satisfaction BETWEEN 0 AND 1)
    )
);

-- Create indexes for synthetic_queries table (idempotent)
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_link_id ON synthetic_queries(navigation_link_id);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_query_type ON synthetic_queries(query_type);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_is_validated ON synthetic_queries(is_validated);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_generation_method ON synthetic_queries(generation_method);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_validation_score ON synthetic_queries(validation_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_times_used ON synthetic_queries(times_used DESC);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_success_rate ON synthetic_queries(avg_success_rate DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_created_at ON synthetic_queries(created_at DESC);

-- Partial index for validated queries (idempotent)
DROP INDEX IF EXISTS idx_synthetic_queries_validated;
CREATE INDEX idx_synthetic_queries_validated
    ON synthetic_queries(navigation_link_id, validation_score DESC)
    WHERE is_validated = true;

-- Partial index for high-performing queries (idempotent)
DROP INDEX IF EXISTS idx_synthetic_queries_high_quality;
CREATE INDEX idx_synthetic_queries_high_quality
    ON synthetic_queries(navigation_link_id, avg_success_rate DESC)
    WHERE avg_success_rate >= 0.8;

-- GIN indexes for JSONB fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_generation_params ON synthetic_queries USING GIN(generation_parameters);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_metadata ON synthetic_queries USING GIN(query_metadata);

-- IVFFlat index for query embeddings (idempotent)
DROP INDEX IF EXISTS idx_synthetic_queries_embedding;
CREATE INDEX idx_synthetic_queries_embedding
    ON synthetic_queries
    USING ivfflat (query_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE query_embedding IS NOT NULL;

-- Composite indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_link_type
    ON synthetic_queries(navigation_link_id, query_type);
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_link_validated
    ON synthetic_queries(navigation_link_id, is_validated, validation_score DESC);

-- Create trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_synthetic_queries_updated_at ON synthetic_queries;
CREATE TRIGGER update_synthetic_queries_updated_at
    BEFORE UPDATE ON synthetic_queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate synthetic queries for a navigation link (idempotent)
CREATE OR REPLACE FUNCTION generate_synthetic_queries(
    p_link_id BIGINT,
    p_regenerate BOOLEAN DEFAULT false
)
RETURNS TABLE (
    query_id BIGINT,
    query_text TEXT,
    query_type VARCHAR
) AS $$
DECLARE
    v_link RECORD;
    v_query_id BIGINT;
    v_queries TEXT[];
BEGIN
    -- Get navigation link details
    SELECT nl.id, nl.intent, nl.description, nl.url_path, nl.selector, nl.action_type
    INTO v_link
    FROM navigation_links nl
    WHERE nl.id = p_link_id AND nl.is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Navigation link % not found or inactive', p_link_id;
    END IF;

    -- Delete existing queries if regenerating
    IF p_regenerate THEN
        DELETE FROM synthetic_queries WHERE navigation_link_id = p_link_id;
    END IF;

    -- Generate "show_me" query
    INSERT INTO synthetic_queries (navigation_link_id, query_text, query_type, generation_method, template_used)
    VALUES (
        p_link_id,
        'Show me ' || COALESCE(v_link.intent, 'this page'),
        'show_me',
        'template',
        'show_me_template'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, query_text, query_type INTO v_query_id, v_queries[1], query_type;

    IF v_query_id IS NOT NULL THEN
        RETURN QUERY SELECT v_query_id, v_queries[1], 'show_me'::VARCHAR;
    END IF;

    -- Generate "i_want_to" query
    INSERT INTO synthetic_queries (navigation_link_id, query_text, query_type, generation_method, template_used)
    VALUES (
        p_link_id,
        'I want to ' || COALESCE(v_link.intent, v_link.description, 'navigate'),
        'i_want_to',
        'template',
        'i_want_to_template'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, query_text, query_type INTO v_query_id, v_queries[2], query_type;

    IF v_query_id IS NOT NULL THEN
        RETURN QUERY SELECT v_query_id, v_queries[2], 'i_want_to'::VARCHAR;
    END IF;

    -- Generate "where_can_i" query
    INSERT INTO synthetic_queries (navigation_link_id, query_text, query_type, generation_method, template_used)
    VALUES (
        p_link_id,
        'Where can I ' || COALESCE(v_link.intent, v_link.description, 'find this') || '?',
        'where_can_i',
        'template',
        'where_can_i_template'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, query_text, query_type INTO v_query_id, v_queries[3], query_type;

    IF v_query_id IS NOT NULL THEN
        RETURN QUERY SELECT v_query_id, v_queries[3], 'where_can_i'::VARCHAR;
    END IF;

    -- Generate "how_do_i" query
    INSERT INTO synthetic_queries (navigation_link_id, query_text, query_type, generation_method, template_used)
    VALUES (
        p_link_id,
        'How do I ' || COALESCE(v_link.intent, v_link.description, 'navigate') || '?',
        'how_do_i',
        'template',
        'how_do_i_template'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, query_text, query_type INTO v_query_id, v_queries[4], query_type;

    IF v_query_id IS NOT NULL THEN
        RETURN QUERY SELECT v_query_id, v_queries[4], 'how_do_i'::VARCHAR;
    END IF;

    -- Generate "find" query
    INSERT INTO synthetic_queries (navigation_link_id, query_text, query_type, generation_method, template_used)
    VALUES (
        p_link_id,
        'Find ' || COALESCE(v_link.description, v_link.intent, 'this page'),
        'find',
        'template',
        'find_template'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, query_text, query_type INTO v_query_id, v_queries[5], query_type;

    IF v_query_id IS NOT NULL THEN
        RETURN QUERY SELECT v_query_id, v_queries[5], 'find'::VARCHAR;
    END IF;

    -- Generate "navigate_to" query
    INSERT INTO synthetic_queries (navigation_link_id, query_text, query_type, generation_method, template_used)
    VALUES (
        p_link_id,
        'Navigate to ' || COALESCE(v_link.description, v_link.intent, v_link.url_path),
        'navigate_to',
        'template',
        'navigate_to_template'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, query_text, query_type INTO v_query_id, v_queries[6], query_type;

    IF v_query_id IS NOT NULL THEN
        RETURN QUERY SELECT v_query_id, v_queries[6], 'navigate_to'::VARCHAR;
    END IF;

    RETURN;
END;
$$ language 'plpgsql';

-- Function to bulk generate queries for all links in a website (idempotent)
CREATE OR REPLACE FUNCTION generate_queries_for_website(
    p_website_id BIGINT,
    p_regenerate BOOLEAN DEFAULT false
)
RETURNS TABLE (
    link_id BIGINT,
    queries_generated INTEGER
) AS $$
DECLARE
    v_link_id BIGINT;
    v_count INTEGER;
BEGIN
    FOR v_link_id IN
        SELECT id FROM navigation_links
        WHERE website_id = p_website_id AND is_active = true
    LOOP
        SELECT COUNT(*)
        INTO v_count
        FROM generate_synthetic_queries(v_link_id, p_regenerate);

        RETURN QUERY SELECT v_link_id, v_count;
    END LOOP;
END;
$$ language 'plpgsql';

-- Function to update query usage statistics (idempotent)
CREATE OR REPLACE FUNCTION update_query_usage(
    p_query_id BIGINT,
    p_success BOOLEAN,
    p_precision NUMERIC DEFAULT NULL,
    p_recall NUMERIC DEFAULT NULL,
    p_satisfaction NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE synthetic_queries
    SET
        times_used = times_used + 1,
        last_used_at = CURRENT_TIMESTAMP,
        avg_success_rate = CASE
            WHEN avg_success_rate IS NULL THEN
                CASE WHEN p_success THEN 1.0 ELSE 0.0 END
            ELSE
                (avg_success_rate * times_used + CASE WHEN p_success THEN 1.0 ELSE 0.0 END) / (times_used + 1)
        END,
        avg_precision = CASE
            WHEN p_precision IS NOT NULL THEN
                CASE
                    WHEN avg_precision IS NULL THEN p_precision
                    ELSE (avg_precision * times_used + p_precision) / (times_used + 1)
                END
            ELSE avg_precision
        END,
        avg_recall = CASE
            WHEN p_recall IS NOT NULL THEN
                CASE
                    WHEN avg_recall IS NULL THEN p_recall
                    ELSE (avg_recall * times_used + p_recall) / (times_used + 1)
                END
            ELSE avg_recall
        END,
        avg_user_satisfaction = CASE
            WHEN p_satisfaction IS NOT NULL THEN
                CASE
                    WHEN avg_user_satisfaction IS NULL THEN p_satisfaction
                    ELSE (avg_user_satisfaction * times_used + p_satisfaction) / (times_used + 1)
                END
            ELSE avg_user_satisfaction
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_query_id;
END;
$$ language 'plpgsql';

-- Function to get top performing queries for a link (idempotent)
CREATE OR REPLACE FUNCTION get_top_queries_for_link(
    p_link_id BIGINT,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    query_id BIGINT,
    query_text TEXT,
    query_type VARCHAR,
    success_rate NUMERIC,
    times_used INTEGER,
    validation_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sq.id,
        sq.query_text,
        sq.query_type,
        sq.avg_success_rate,
        sq.times_used,
        sq.validation_score
    FROM synthetic_queries sq
    WHERE sq.navigation_link_id = p_link_id
        AND sq.is_validated = true
    ORDER BY
        COALESCE(sq.avg_success_rate, 0) DESC,
        sq.times_used DESC,
        COALESCE(sq.validation_score, 0) DESC
    LIMIT p_limit;
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON TABLE synthetic_queries IS 'Synthetically generated test queries for navigation link validation and testing';
COMMENT ON COLUMN synthetic_queries.query_type IS 'Type of query template: show_me, i_want_to, where_can_i, how_do_i, find, navigate_to';
COMMENT ON COLUMN synthetic_queries.generation_method IS 'How query was generated: template, llm, hybrid, manual';
COMMENT ON COLUMN synthetic_queries.validation_score IS 'Quality score from validation (0-1)';
COMMENT ON COLUMN synthetic_queries.avg_success_rate IS 'Average success rate when query is used (0-1)';

COMMENT ON FUNCTION generate_synthetic_queries IS 'Generates 6 synthetic queries (one per type) for a navigation link';
COMMENT ON FUNCTION generate_queries_for_website IS 'Bulk generates queries for all active navigation links in a website';
COMMENT ON FUNCTION update_query_usage IS 'Updates usage statistics and quality metrics for a synthetic query';
COMMENT ON FUNCTION get_top_queries_for_link IS 'Returns top N validated queries for a link ordered by performance';
