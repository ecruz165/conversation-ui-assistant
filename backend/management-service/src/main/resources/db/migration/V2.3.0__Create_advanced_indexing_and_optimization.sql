-- Create advanced indexing and query optimization infrastructure (Idempotent)

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Websites table composite indexes (idempotent)
-- Note: owner_id column doesn't exist in current schema, so we use domain-based indexing
CREATE INDEX IF NOT EXISTS idx_websites_active_created
    ON websites(is_active, created_at DESC);

-- Navigation links composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_navigation_links_website_active
    ON navigation_links(website_id, is_active, priority DESC);

-- User navigation sessions composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_nav_sessions_website_goal_date
    ON user_navigation_sessions(website_id, goal_reached, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_nav_sessions_user_website_date
    ON user_navigation_sessions(user_id, website_id, started_at DESC);

-- Synthetic queries composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_synthetic_queries_link_validated_score
    ON synthetic_queries(navigation_link_id, is_validated, validation_score DESC);

-- Widget analytics composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_widget_analytics_website_daterange
    ON widget_usage_analytics(website_id, analytics_date DESC, analytics_hour DESC);

-- System metrics composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_system_metrics_status_timestamp
    ON system_metrics(health_status, metric_timestamp DESC);

-- ============================================================================
-- PARTIAL INDEXES FOR ACTIVE/FILTERED RECORDS
-- ============================================================================

-- Active websites only (idempotent)
DROP INDEX IF EXISTS idx_websites_active_only;
CREATE INDEX idx_websites_active_only
    ON websites(id, name, domain)
    WHERE is_active = true;

-- Active navigation links only (idempotent)
DROP INDEX IF EXISTS idx_navigation_links_active_only;
CREATE INDEX idx_navigation_links_active_only
    ON navigation_links(website_id, intent, url_path)
    WHERE is_active = true;

-- Active page embeddings only (idempotent)
DROP INDEX IF EXISTS idx_page_embeddings_active_only;
CREATE INDEX idx_page_embeddings_active_only
    ON page_embeddings(website_id, url_path, last_analyzed_at DESC)
    WHERE is_active = true;

-- Successful navigation sessions only (idempotent)
DROP INDEX IF EXISTS idx_user_nav_sessions_successful;
CREATE INDEX idx_user_nav_sessions_successful
    ON user_navigation_sessions(website_id, started_at DESC, user_satisfaction_score DESC)
    WHERE goal_reached = true;

-- Failed navigation sessions only (for debugging) (idempotent)
DROP INDEX IF EXISTS idx_user_nav_sessions_failed;
CREATE INDEX idx_user_nav_sessions_failed
    ON user_navigation_sessions(website_id, started_at DESC, detected_intent)
    WHERE goal_reached = false;

-- Validated synthetic queries only (idempotent)
DROP INDEX IF EXISTS idx_synthetic_queries_validated_high_score;
CREATE INDEX idx_synthetic_queries_validated_high_score
    ON synthetic_queries(navigation_link_id, validation_score DESC, avg_success_rate DESC)
    WHERE is_validated = true AND validation_score >= 0.7;

-- Pending crawl pages (for processing pipeline) (idempotent)
DROP INDEX IF EXISTS idx_crawl_pages_pending_processing;
CREATE INDEX idx_crawl_pages_pending_processing
    ON crawl_pages(crawl_history_id, crawled_at)
    WHERE is_processed = false;

-- Pending embedding generation (idempotent)
DROP INDEX IF EXISTS idx_crawl_pages_pending_embedding;
CREATE INDEX idx_crawl_pages_pending_embedding
    ON crawl_pages(crawl_history_id, processed_at)
    WHERE is_processed = true AND is_embedded = false;

-- High-traffic analytics hours (idempotent)
DROP INDEX IF EXISTS idx_widget_analytics_high_traffic;
CREATE INDEX idx_widget_analytics_high_traffic
    ON widget_usage_analytics(website_id, analytics_date DESC, total_sessions DESC)
    WHERE total_sessions > 100;

-- Unhealthy system states (idempotent)
DROP INDEX IF EXISTS idx_system_metrics_unhealthy;
CREATE INDEX idx_system_metrics_unhealthy
    ON system_metrics(metric_timestamp DESC, health_status, error_count DESC)
    WHERE health_status IN ('degraded', 'unhealthy', 'critical');

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function for cosine similarity calculation (idempotent)
CREATE OR REPLACE FUNCTION cosine_similarity(
    vec1 vector(1536),
    vec2 vector(1536)
)
RETURNS NUMERIC AS $$
BEGIN
    -- pgvector uses <=> operator for cosine distance
    -- Cosine similarity = 1 - cosine distance
    RETURN ROUND((1 - (vec1 <=> vec2))::NUMERIC, 4);
END;
$$ language 'plpgsql' IMMUTABLE;

-- Function for calculating vector magnitude (idempotent)
CREATE OR REPLACE FUNCTION vector_magnitude(
    vec vector(1536)
)
RETURNS NUMERIC AS $$
BEGIN
    -- Magnitude = sqrt(sum of squares)
    -- Using pgvector's inner product operator
    RETURN ROUND(SQRT((vec <#> vec))::NUMERIC, 4);
END;
$$ language 'plpgsql' IMMUTABLE;

-- Audit trigger function for change tracking (idempotent)
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    audit_record JSONB;
    table_name TEXT;
BEGIN
    table_name := TG_TABLE_NAME;

    -- Build audit record
    audit_record := jsonb_build_object(
        'table_name', table_name,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP,
        'user', CURRENT_USER
    );

    -- Add old and new values based on operation
    IF TG_OP = 'DELETE' THEN
        audit_record := audit_record || jsonb_build_object('old_data', row_to_json(OLD));
    ELSIF TG_OP = 'UPDATE' THEN
        audit_record := audit_record || jsonb_build_object(
            'old_data', row_to_json(OLD),
            'new_data', row_to_json(NEW)
        );
    ELSIF TG_OP = 'INSERT' THEN
        audit_record := audit_record || jsonb_build_object('new_data', row_to_json(NEW));
    END IF;

    -- Insert into audit_logs table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            changes,
            ip_address,
            user_agent
        ) VALUES (
            NULL,  -- Can be enhanced to get actual user_id from session
            TG_OP,
            table_name,
            CASE
                WHEN TG_OP = 'DELETE' THEN (OLD.id)::BIGINT
                ELSE (NEW.id)::BIGINT
            END,
            audit_record,
            inet_client_addr()::VARCHAR,
            current_setting('application_name', true)
        );
    END IF;

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Function to analyze query performance (idempotent)
CREATE OR REPLACE FUNCTION analyze_query_performance(
    p_query TEXT
)
RETURNS TABLE (
    plan_line TEXT,
    estimated_cost NUMERIC,
    estimated_rows NUMERIC
) AS $$
BEGIN
    -- Execute EXPLAIN for the query
    RETURN QUERY EXECUTE 'EXPLAIN (FORMAT TEXT, COSTS true) ' || p_query;
END;
$$ language 'plpgsql';

-- Function to get table statistics (idempotent)
CREATE OR REPLACE FUNCTION get_table_statistics(
    p_schema_name VARCHAR DEFAULT 'public'
)
RETURNS TABLE (
    table_name VARCHAR,
    row_count BIGINT,
    total_size_mb NUMERIC,
    table_size_mb NUMERIC,
    indexes_size_mb NUMERIC,
    toast_size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.tablename::VARCHAR,
        (
            SELECT reltuples::BIGINT
            FROM pg_class
            WHERE oid = (quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::regclass
        ) AS row_count,
        ROUND((pg_total_relation_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024), 2) AS total_size_mb,
        ROUND((pg_relation_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024), 2) AS table_size_mb,
        ROUND((pg_indexes_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024), 2) AS indexes_size_mb,
        ROUND((pg_total_relation_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024 -
               pg_relation_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024 -
               pg_indexes_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024), 2) AS toast_size_mb
    FROM pg_tables t
    WHERE t.schemaname = p_schema_name
    ORDER BY pg_total_relation_size(quote_ident(p_schema_name) || '.' || quote_ident(t.tablename)) DESC;
END;
$$ language 'plpgsql' STABLE;

-- Function to get index usage statistics (idempotent)
CREATE OR REPLACE FUNCTION get_index_usage_statistics(
    p_schema_name VARCHAR DEFAULT 'public'
)
RETURNS TABLE (
    table_name VARCHAR,
    index_name VARCHAR,
    index_size_mb NUMERIC,
    index_scans BIGINT,
    tuples_read BIGINT,
    tuples_fetched BIGINT,
    usage_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        schemaname::VARCHAR || '.' || tablename::VARCHAR AS table_name,
        indexrelname::VARCHAR AS index_name,
        ROUND((pg_relation_size(indexrelid)::NUMERIC / 1024 / 1024), 2) AS index_size_mb,
        idx_scan AS index_scans,
        idx_tup_read AS tuples_read,
        idx_tup_fetch AS tuples_fetched,
        CASE
            WHEN idx_scan > 0 THEN ROUND((idx_tup_fetch::NUMERIC / idx_scan), 2)
            ELSE 0
        END AS usage_ratio
    FROM pg_stat_user_indexes
    WHERE schemaname = p_schema_name
    ORDER BY idx_scan DESC, pg_relation_size(indexrelid) DESC;
END;
$$ language 'plpgsql' STABLE;

-- Function to identify unused indexes (idempotent)
CREATE OR REPLACE FUNCTION get_unused_indexes(
    p_schema_name VARCHAR DEFAULT 'public',
    p_min_size_mb NUMERIC DEFAULT 1.0
)
RETURNS TABLE (
    table_name VARCHAR,
    index_name VARCHAR,
    index_size_mb NUMERIC,
    index_scans BIGINT,
    index_definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        schemaname::VARCHAR || '.' || tablename::VARCHAR AS table_name,
        indexrelname::VARCHAR AS index_name,
        ROUND((pg_relation_size(indexrelid)::NUMERIC / 1024 / 1024), 2) AS index_size_mb,
        idx_scan AS index_scans,
        pg_get_indexdef(indexrelid) AS index_definition
    FROM pg_stat_user_indexes
    WHERE schemaname = p_schema_name
        AND idx_scan = 0
        AND pg_relation_size(indexrelid) >= (p_min_size_mb * 1024 * 1024)
    ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$ language 'plpgsql' STABLE;

-- ============================================================================
-- MAINTENANCE AND MONITORING CONFIGURATION
-- ============================================================================

-- Function to perform VACUUM ANALYZE on large tables (idempotent)
CREATE OR REPLACE FUNCTION vacuum_large_tables(
    p_size_threshold_mb NUMERIC DEFAULT 100
)
RETURNS TABLE (
    table_name VARCHAR,
    table_size_mb NUMERIC,
    vacuum_status VARCHAR,
    execution_time_ms INTEGER
) AS $$
DECLARE
    v_table RECORD;
    v_start_time TIMESTAMP;
    v_duration INTEGER;
    v_status VARCHAR;
BEGIN
    FOR v_table IN
        SELECT
            t.tablename,
            ROUND((pg_total_relation_size(quote_ident('public') || '.' || quote_ident(t.tablename))::NUMERIC / 1024 / 1024), 2) AS size_mb
        FROM pg_tables t
        WHERE t.schemaname = 'public'
            AND pg_total_relation_size(quote_ident('public') || '.' || quote_ident(t.tablename)) >= (p_size_threshold_mb * 1024 * 1024)
    LOOP
        v_start_time := clock_timestamp();
        v_status := 'completed';

        BEGIN
            EXECUTE 'VACUUM ANALYZE ' || quote_ident(v_table.tablename);
        EXCEPTION WHEN OTHERS THEN
            v_status := 'failed: ' || SQLERRM;
        END;

        v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;

        RETURN QUERY SELECT
            v_table.tablename::VARCHAR,
            v_table.size_mb,
            v_status,
            v_duration;
    END LOOP;
END;
$$ language 'plpgsql';

-- Function to detect slow queries from pg_stat_statements (if available) (idempotent)
CREATE OR REPLACE FUNCTION get_slow_queries(
    p_min_duration_ms NUMERIC DEFAULT 1000,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    query_text TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC,
    max_time_ms NUMERIC,
    rows_per_call NUMERIC
) AS $$
BEGIN
    -- Check if pg_stat_statements extension is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        RETURN QUERY
        SELECT
            LEFT(query, 200) AS query_text,
            calls::BIGINT,
            ROUND(total_exec_time::NUMERIC, 2) AS total_time_ms,
            ROUND(mean_exec_time::NUMERIC, 2) AS mean_time_ms,
            ROUND(max_exec_time::NUMERIC, 2) AS max_time_ms,
            CASE
                WHEN calls > 0 THEN ROUND((rows::NUMERIC / calls), 2)
                ELSE 0
            END AS rows_per_call
        FROM pg_stat_statements
        WHERE mean_exec_time >= p_min_duration_ms
        ORDER BY mean_exec_time DESC
        LIMIT p_limit;
    ELSE
        RAISE NOTICE 'pg_stat_statements extension not available. Install with: CREATE EXTENSION pg_stat_statements;';
        RETURN;
    END IF;
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON FUNCTION cosine_similarity IS 'Calculate cosine similarity between two vectors (returns value between 0 and 1)';
COMMENT ON FUNCTION vector_magnitude IS 'Calculate magnitude (length) of a vector';
COMMENT ON FUNCTION audit_trigger_func IS 'Generic audit trigger function for tracking data changes';
COMMENT ON FUNCTION analyze_query_performance IS 'Execute EXPLAIN on a query to analyze performance';
COMMENT ON FUNCTION get_table_statistics IS 'Get size and row count statistics for all tables in schema';
COMMENT ON FUNCTION get_index_usage_statistics IS 'Get usage statistics for all indexes in schema';
COMMENT ON FUNCTION get_unused_indexes IS 'Identify unused indexes larger than threshold (default: 1MB)';
COMMENT ON FUNCTION vacuum_large_tables IS 'Run VACUUM ANALYZE on tables larger than threshold (default: 100MB)';
COMMENT ON FUNCTION get_slow_queries IS 'Get slow queries from pg_stat_statements (requires extension)';

-- ============================================================================
-- PERFORMANCE OPTIMIZATION RECOMMENDATIONS
-- ============================================================================

-- Create view for query optimization recommendations (idempotent)
CREATE OR REPLACE VIEW v_optimization_recommendations AS
SELECT
    'Missing index on frequently queried column' AS recommendation_type,
    table_name,
    column_name,
    'high' AS priority,
    'Consider adding index on ' || table_name || '.' || column_name AS recommendation
FROM (
    SELECT
        c.table_name::TEXT,
        c.column_name::TEXT
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
        AND c.table_name IN (
            'user_navigation_sessions',
            'synthetic_queries',
            'widget_usage_analytics',
            'crawl_pages'
        )
        AND c.column_name IN ('website_id', 'user_id', 'status', 'created_at')
        AND NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
                AND tablename = c.table_name
                AND indexdef LIKE '%' || c.column_name || '%'
        )
) missing_indexes

UNION ALL

SELECT
    'Large table without recent VACUUM' AS recommendation_type,
    relname::TEXT AS table_name,
    NULL AS column_name,
    'medium' AS priority,
    'Run VACUUM ANALYZE on ' || relname AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_live_tup > 10000
    AND (last_vacuum IS NULL OR last_vacuum < CURRENT_TIMESTAMP - INTERVAL '7 days')
    AND (last_autovacuum IS NULL OR last_autovacuum < CURRENT_TIMESTAMP - INTERVAL '7 days')

UNION ALL

SELECT
    'High bloat table' AS recommendation_type,
    relname::TEXT AS table_name,
    NULL AS column_name,
    'high' AS priority,
    'Table has high dead tuple ratio. Consider VACUUM FULL for ' || relname AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0) > 0.2
    AND n_dead_tup > 1000;

COMMENT ON VIEW v_optimization_recommendations IS 'Automated recommendations for database performance optimization';
