-- Create AI navigation tracking infrastructure for learning and quality monitoring (Idempotent)

-- Create user_navigation_sessions table for tracking AI-assisted navigation (Idempotent)
CREATE TABLE IF NOT EXISTS user_navigation_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    user_id BIGINT,
    website_id BIGINT NOT NULL,

    -- User query and intent
    user_query TEXT NOT NULL,
    query_embedding vector(1536),
    detected_intent VARCHAR(255),
    intent_confidence NUMERIC(3,2),

    -- Navigation paths
    suggested_paths JSONB DEFAULT '[]',
    selected_path_id BIGINT,
    final_url VARCHAR(2000),

    -- Path tracking details
    suggested_page_ids BIGINT[],
    visited_page_ids BIGINT[],
    navigation_steps INTEGER DEFAULT 0,

    -- Success metrics
    goal_reached BOOLEAN DEFAULT false,
    user_satisfaction_score NUMERIC(3,2),
    time_to_goal_ms INTEGER,

    -- AI model information
    model_used VARCHAR(100),
    model_version VARCHAR(50),
    embedding_type VARCHAR(50),

    -- Feedback and learning
    user_feedback TEXT,
    correction_applied BOOLEAN DEFAULT false,
    feedback_rating INTEGER,

    -- Session metadata
    session_metadata JSONB DEFAULT '{}',
    context_data JSONB DEFAULT '{}',

    -- Full-text search support
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(user_query, '') || ' ' ||
            COALESCE(detected_intent, '') || ' ' ||
            COALESCE(user_feedback, '')
        )
    ) STORED,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_navigation_sessions_user_id FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_navigation_sessions_website_id FOREIGN KEY (website_id)
        REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_navigation_sessions_selected_path FOREIGN KEY (selected_path_id)
        REFERENCES page_embeddings(id) ON DELETE SET NULL,
    CONSTRAINT user_navigation_sessions_query_not_empty CHECK (LENGTH(TRIM(user_query)) > 0),
    CONSTRAINT user_navigation_sessions_session_id_not_empty CHECK (LENGTH(TRIM(session_id)) > 0),
    CONSTRAINT user_navigation_sessions_intent_confidence_range CHECK (
        intent_confidence IS NULL OR (intent_confidence BETWEEN 0 AND 1)
    ),
    CONSTRAINT user_navigation_sessions_satisfaction_range CHECK (
        user_satisfaction_score IS NULL OR (user_satisfaction_score BETWEEN 0 AND 1)
    ),
    CONSTRAINT user_navigation_sessions_time_positive CHECK (
        time_to_goal_ms IS NULL OR time_to_goal_ms >= 0
    ),
    CONSTRAINT user_navigation_sessions_feedback_rating_range CHECK (
        feedback_rating IS NULL OR (feedback_rating BETWEEN 1 AND 5)
    ),
    CONSTRAINT user_navigation_sessions_steps_positive CHECK (navigation_steps >= 0)
);

-- Create embedding_quality_metrics table for tracking ML model performance (Idempotent)
CREATE TABLE IF NOT EXISTS embedding_quality_metrics (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,
    embedding_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(50) NOT NULL,

    -- Evaluation period
    evaluation_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    evaluation_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Sample metrics
    total_queries INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,

    -- Precision and recall metrics
    precision_score NUMERIC(5,4),
    recall_score NUMERIC(5,4),
    f1_score NUMERIC(5,4),
    accuracy_score NUMERIC(5,4),

    -- Ranking metrics
    mean_reciprocal_rank NUMERIC(5,4),
    normalized_dcg NUMERIC(5,4),
    average_precision NUMERIC(5,4),

    -- User satisfaction
    avg_satisfaction_score NUMERIC(3,2),
    goal_completion_rate NUMERIC(5,4),

    -- Performance metrics
    avg_query_time_ms NUMERIC(10,2),
    avg_embedding_time_ms NUMERIC(10,2),

    -- Quality distribution
    high_confidence_ratio NUMERIC(5,4),
    low_confidence_ratio NUMERIC(5,4),

    -- Detailed breakdown
    metrics_by_intent JSONB DEFAULT '{}',
    quality_distribution JSONB DEFAULT '{}',

    -- Evaluation metadata
    evaluation_method VARCHAR(100),
    sample_size INTEGER,
    evaluation_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_embedding_quality_metrics_website_id FOREIGN KEY (website_id)
        REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT embedding_quality_metrics_type_not_empty CHECK (LENGTH(TRIM(embedding_type)) > 0),
    CONSTRAINT embedding_quality_metrics_period_valid CHECK (evaluation_period_end > evaluation_period_start),
    CONSTRAINT embedding_quality_metrics_counts_positive CHECK (
        total_queries >= 0 AND total_sessions >= 0 AND sample_size >= 0
    ),
    CONSTRAINT embedding_quality_metrics_scores_range CHECK (
        (precision_score IS NULL OR precision_score BETWEEN 0 AND 1) AND
        (recall_score IS NULL OR recall_score BETWEEN 0 AND 1) AND
        (f1_score IS NULL OR f1_score BETWEEN 0 AND 1) AND
        (accuracy_score IS NULL OR accuracy_score BETWEEN 0 AND 1) AND
        (mean_reciprocal_rank IS NULL OR mean_reciprocal_rank BETWEEN 0 AND 1) AND
        (normalized_dcg IS NULL OR normalized_dcg BETWEEN 0 AND 1) AND
        (average_precision IS NULL OR average_precision BETWEEN 0 AND 1) AND
        (avg_satisfaction_score IS NULL OR avg_satisfaction_score BETWEEN 0 AND 1) AND
        (goal_completion_rate IS NULL OR goal_completion_rate BETWEEN 0 AND 1) AND
        (high_confidence_ratio IS NULL OR high_confidence_ratio BETWEEN 0 AND 1) AND
        (low_confidence_ratio IS NULL OR low_confidence_ratio BETWEEN 0 AND 1)
    ),
    CONSTRAINT embedding_quality_metrics_time_positive CHECK (
        (avg_query_time_ms IS NULL OR avg_query_time_ms >= 0) AND
        (avg_embedding_time_ms IS NULL OR avg_embedding_time_ms >= 0)
    )
);

-- Create indexes for user_navigation_sessions table (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_session_id ON user_navigation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_user_id ON user_navigation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_website_id ON user_navigation_sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_goal_reached ON user_navigation_sessions(goal_reached);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_started_at ON user_navigation_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_completed_at ON user_navigation_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_detected_intent ON user_navigation_sessions(detected_intent);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_model_used ON user_navigation_sessions(model_used);

-- Full-text search index (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_search ON user_navigation_sessions USING GIN(search_vector);

-- GIN indexes for JSONB and array fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_suggested_paths ON user_navigation_sessions USING GIN(suggested_paths);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_session_metadata ON user_navigation_sessions USING GIN(session_metadata);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_context_data ON user_navigation_sessions USING GIN(context_data);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_suggested_page_ids ON user_navigation_sessions USING GIN(suggested_page_ids);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_visited_page_ids ON user_navigation_sessions USING GIN(visited_page_ids);

-- IVFFlat index for query embeddings (idempotent)
DROP INDEX IF EXISTS idx_user_navigation_sessions_query_embedding;
CREATE INDEX idx_user_navigation_sessions_query_embedding
    ON user_navigation_sessions
    USING ivfflat (query_embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE query_embedding IS NOT NULL;

-- Composite indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_website_goal
    ON user_navigation_sessions(website_id, goal_reached, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_user_website
    ON user_navigation_sessions(user_id, website_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_intent_goal
    ON user_navigation_sessions(detected_intent, goal_reached);

-- Partial index for unsuccessful sessions (learning opportunities) (idempotent)
DROP INDEX IF EXISTS idx_user_navigation_sessions_failed;
CREATE INDEX idx_user_navigation_sessions_failed
    ON user_navigation_sessions(website_id, started_at DESC)
    WHERE goal_reached = false;

-- Partial index for sessions with user feedback (idempotent)
DROP INDEX IF EXISTS idx_user_navigation_sessions_with_feedback;
CREATE INDEX idx_user_navigation_sessions_with_feedback
    ON user_navigation_sessions(website_id, feedback_rating DESC, started_at DESC)
    WHERE user_feedback IS NOT NULL;

-- Create indexes for embedding_quality_metrics table (idempotent)
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_website_id ON embedding_quality_metrics(website_id);
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_type ON embedding_quality_metrics(embedding_type);
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_model_version ON embedding_quality_metrics(model_version);
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_period_start ON embedding_quality_metrics(evaluation_period_start DESC);
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_created_at ON embedding_quality_metrics(created_at DESC);

-- GIN indexes for JSONB fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_by_intent ON embedding_quality_metrics USING GIN(metrics_by_intent);
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_distribution ON embedding_quality_metrics USING GIN(quality_distribution);
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_metadata ON embedding_quality_metrics USING GIN(evaluation_metadata);

-- Composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_embedding_quality_metrics_website_type
    ON embedding_quality_metrics(website_id, embedding_type, evaluation_period_start DESC);

-- Function to archive old navigation sessions (90-day retention) (idempotent)
CREATE OR REPLACE FUNCTION archive_old_navigation_sessions(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS TABLE (
    archived_count INTEGER,
    deleted_count INTEGER
) AS $$
DECLARE
    v_archived_count INTEGER;
    v_deleted_count INTEGER;
    v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    v_cutoff_date := CURRENT_TIMESTAMP - (p_retention_days || ' days')::INTERVAL;

    -- Archive sessions older than retention period to a separate table (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_navigation_sessions_archive') THEN
        INSERT INTO user_navigation_sessions_archive
        SELECT * FROM user_navigation_sessions
        WHERE created_at < v_cutoff_date;

        GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    ELSE
        v_archived_count := 0;
    END IF;

    -- Delete old sessions
    DELETE FROM user_navigation_sessions
    WHERE created_at < v_cutoff_date;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT v_archived_count, v_deleted_count;
END;
$$ language 'plpgsql';

-- Function to calculate session success rate (idempotent)
CREATE OR REPLACE FUNCTION calculate_session_success_rate(
    p_website_id BIGINT,
    p_days_back INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_sessions INTEGER;
    v_successful_sessions INTEGER;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE goal_reached = true)
    INTO v_total_sessions, v_successful_sessions
    FROM user_navigation_sessions
    WHERE website_id = p_website_id
        AND started_at >= CURRENT_TIMESTAMP - (p_days_back || ' days')::INTERVAL;

    IF v_total_sessions = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND((v_successful_sessions::NUMERIC / v_total_sessions::NUMERIC) * 100, 2);
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON TABLE user_navigation_sessions IS 'Tracks AI-assisted navigation sessions for learning and improvement';
COMMENT ON COLUMN user_navigation_sessions.query_embedding IS 'Vector embedding of user query for similarity matching';
COMMENT ON COLUMN user_navigation_sessions.suggested_paths IS 'Array of suggested navigation paths with scores';
COMMENT ON COLUMN user_navigation_sessions.goal_reached IS 'Whether user achieved their navigation goal';
COMMENT ON COLUMN user_navigation_sessions.user_satisfaction_score IS 'User satisfaction rating (0-1)';
COMMENT ON COLUMN user_navigation_sessions.correction_applied IS 'Whether AI learned from user corrections';

COMMENT ON TABLE embedding_quality_metrics IS 'Tracks embedding model performance and quality metrics over time';
COMMENT ON COLUMN embedding_quality_metrics.precision_score IS 'Precision: (true positives) / (true positives + false positives)';
COMMENT ON COLUMN embedding_quality_metrics.recall_score IS 'Recall: (true positives) / (true positives + false negatives)';
COMMENT ON COLUMN embedding_quality_metrics.f1_score IS 'F1 Score: 2 * (precision * recall) / (precision + recall)';
COMMENT ON COLUMN embedding_quality_metrics.mean_reciprocal_rank IS 'MRR: Average of reciprocal ranks of first relevant result';
COMMENT ON COLUMN embedding_quality_metrics.normalized_dcg IS 'NDCG: Normalized discounted cumulative gain for ranking quality';

COMMENT ON FUNCTION archive_old_navigation_sessions IS 'Archives and deletes navigation sessions older than specified days (default: 90)';
COMMENT ON FUNCTION calculate_session_success_rate IS 'Calculates percentage of successful navigation sessions for a website';
