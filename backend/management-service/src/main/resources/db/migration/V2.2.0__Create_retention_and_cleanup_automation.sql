-- Create data retention and cleanup automation infrastructure (Idempotent)

-- Create user_navigation_sessions_archive table for 90-day archival (Idempotent)
CREATE TABLE IF NOT EXISTS user_navigation_sessions_archive (
    LIKE user_navigation_sessions INCLUDING ALL
);

-- Add archival metadata to archive table (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_navigation_sessions_archive'
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE user_navigation_sessions_archive
        ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes for archive table (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_archive_session_id
    ON user_navigation_sessions_archive(session_id);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_archive_website_id
    ON user_navigation_sessions_archive(website_id);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_archive_archived_at
    ON user_navigation_sessions_archive(archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_navigation_sessions_archive_started_at
    ON user_navigation_sessions_archive(started_at DESC);

-- Function to cleanup page_analysis_history (keep last 10 versions per page) (idempotent)
CREATE OR REPLACE FUNCTION cleanup_page_analysis_history(
    p_versions_to_keep INTEGER DEFAULT 10
)
RETURNS TABLE (
    deleted_count INTEGER,
    pages_cleaned INTEGER
) AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_pages_cleaned INTEGER := 0;
BEGIN
    -- Delete old versions using ROW_NUMBER() OVER PARTITION
    WITH versions_to_delete AS (
        SELECT id
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (
                    PARTITION BY page_embedding_id
                    ORDER BY created_at DESC
                ) AS version_rank
            FROM page_analysis_history
        ) ranked
        WHERE version_rank > p_versions_to_keep
    )
    DELETE FROM page_analysis_history
    WHERE id IN (SELECT id FROM versions_to_delete);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Count unique pages cleaned
    SELECT COUNT(DISTINCT page_embedding_id)::INTEGER
    INTO v_pages_cleaned
    FROM (
        SELECT
            page_embedding_id,
            ROW_NUMBER() OVER (
                PARTITION BY page_embedding_id
                ORDER BY created_at DESC
            ) AS version_rank
        FROM page_analysis_history
    ) ranked
    WHERE version_rank <= p_versions_to_keep;

    RETURN QUERY SELECT v_deleted_count, v_pages_cleaned;
END;
$$ language 'plpgsql';

-- Function to cleanup crawl_history (keep last 50 entries per website) (idempotent)
CREATE OR REPLACE FUNCTION cleanup_crawl_history(
    p_crawls_to_keep INTEGER DEFAULT 50
)
RETURNS TABLE (
    deleted_crawls INTEGER,
    deleted_pages INTEGER,
    websites_cleaned INTEGER
) AS $$
DECLARE
    v_deleted_crawls INTEGER := 0;
    v_deleted_pages INTEGER := 0;
    v_websites_cleaned INTEGER := 0;
BEGIN
    -- Delete old crawl history entries and their associated pages (CASCADE)
    WITH crawls_to_delete AS (
        SELECT id
        FROM (
            SELECT
                id,
                website_id,
                ROW_NUMBER() OVER (
                    PARTITION BY website_id
                    ORDER BY created_at DESC
                ) AS crawl_rank
            FROM crawl_history
        ) ranked
        WHERE crawl_rank > p_crawls_to_keep
    )
    DELETE FROM crawl_history
    WHERE id IN (SELECT id FROM crawls_to_delete);

    GET DIAGNOSTICS v_deleted_crawls = ROW_COUNT;

    -- Count affected websites
    SELECT COUNT(DISTINCT website_id)::INTEGER
    INTO v_websites_cleaned
    FROM (
        SELECT
            website_id,
            ROW_NUMBER() OVER (
                PARTITION BY website_id
                ORDER BY created_at DESC
            ) AS crawl_rank
        FROM crawl_history
    ) ranked
    WHERE crawl_rank <= p_crawls_to_keep;

    RETURN QUERY SELECT v_deleted_crawls, 0::INTEGER, v_websites_cleaned;
END;
$$ language 'plpgsql';

-- Function to cleanup processed crawl_pages (delete after 7 days) (idempotent)
CREATE OR REPLACE FUNCTION cleanup_old_crawl_pages(
    p_retention_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    deleted_pages INTEGER,
    oldest_remaining TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_deleted_count INTEGER;
    v_cutoff_date TIMESTAMP WITH TIME ZONE;
    v_oldest_remaining TIMESTAMP WITH TIME ZONE;
BEGIN
    v_cutoff_date := CURRENT_TIMESTAMP - (p_retention_days || ' days')::INTERVAL;

    -- Delete processed pages older than retention period
    DELETE FROM crawl_pages
    WHERE is_processed = true
        AND is_embedded = true
        AND processed_at < v_cutoff_date;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Get oldest remaining processed page
    SELECT MIN(processed_at)
    INTO v_oldest_remaining
    FROM crawl_pages
    WHERE is_processed = true
        AND is_embedded = true;

    RETURN QUERY SELECT v_deleted_count, v_oldest_remaining;
END;
$$ language 'plpgsql';

-- Function to archive and cleanup old navigation sessions (90-day retention) (idempotent)
-- This extends the existing function from V1.9.0
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

    -- Archive sessions older than retention period
    INSERT INTO user_navigation_sessions_archive
    SELECT *, CURRENT_TIMESTAMP as archived_at
    FROM user_navigation_sessions
    WHERE created_at < v_cutoff_date;

    GET DIAGNOSTICS v_archived_count = ROW_COUNT;

    -- Delete archived sessions from main table
    DELETE FROM user_navigation_sessions
    WHERE created_at < v_cutoff_date;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT v_archived_count, v_deleted_count;
END;
$$ language 'plpgsql';

-- Function to cleanup archived navigation sessions (keep for 2 years total) (idempotent)
CREATE OR REPLACE FUNCTION cleanup_archived_navigation_sessions(
    p_total_retention_days INTEGER DEFAULT 730  -- 2 years
)
RETURNS TABLE (
    deleted_count INTEGER,
    oldest_archived TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_deleted_count INTEGER;
    v_cutoff_date TIMESTAMP WITH TIME ZONE;
    v_oldest_archived TIMESTAMP WITH TIME ZONE;
BEGIN
    v_cutoff_date := CURRENT_TIMESTAMP - (p_total_retention_days || ' days')::INTERVAL;

    -- Delete very old archived sessions
    DELETE FROM user_navigation_sessions_archive
    WHERE archived_at < v_cutoff_date;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Get oldest remaining archived session
    SELECT MIN(archived_at)
    INTO v_oldest_archived
    FROM user_navigation_sessions_archive;

    RETURN QUERY SELECT v_deleted_count, v_oldest_archived;
END;
$$ language 'plpgsql';

-- Function to cleanup old embeddings for inactive pages (idempotent)
CREATE OR REPLACE FUNCTION cleanup_inactive_page_embeddings(
    p_inactive_days INTEGER DEFAULT 180  -- 6 months
)
RETURNS TABLE (
    deactivated_count INTEGER,
    embeddings_cleared INTEGER
) AS $$
DECLARE
    v_deactivated_count INTEGER;
    v_embeddings_cleared INTEGER;
BEGIN
    -- Mark pages as inactive if not analyzed recently
    UPDATE page_embeddings
    SET is_active = false
    WHERE is_active = true
        AND (
            last_analyzed_at < CURRENT_TIMESTAMP - (p_inactive_days || ' days')::INTERVAL
            OR last_analyzed_at IS NULL
        );

    GET DIAGNOSTICS v_deactivated_count = ROW_COUNT;

    -- Optionally clear embeddings for very old inactive pages to save space
    -- (keeping text representations for reference)
    UPDATE page_embeddings
    SET
        functionality_embedding = NULL,
        content_embedding = NULL,
        purpose_embedding = NULL,
        action_embedding = NULL,
        data_context_embedding = NULL,
        user_task_embedding = NULL
    WHERE is_active = false
        AND last_analyzed_at < CURRENT_TIMESTAMP - ((p_inactive_days * 2) || ' days')::INTERVAL;

    GET DIAGNOSTICS v_embeddings_cleared = ROW_COUNT;

    RETURN QUERY SELECT v_deactivated_count, v_embeddings_cleared;
END;
$$ language 'plpgsql';

-- Master cleanup function to orchestrate all cleanup operations (idempotent)
CREATE OR REPLACE FUNCTION execute_data_retention_cleanup()
RETURNS TABLE (
    operation VARCHAR,
    records_affected INTEGER,
    status VARCHAR,
    execution_time_ms INTEGER
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_duration INTEGER;
    v_result RECORD;
BEGIN
    -- Cleanup page analysis history (keep last 10 versions)
    v_start_time := clock_timestamp();
    SELECT * INTO v_result FROM cleanup_page_analysis_history(10);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'page_analysis_history'::VARCHAR,
        v_result.deleted_count,
        'completed'::VARCHAR,
        v_duration;

    -- Cleanup crawl history (keep last 50 per website)
    v_start_time := clock_timestamp();
    SELECT * INTO v_result FROM cleanup_crawl_history(50);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'crawl_history'::VARCHAR,
        v_result.deleted_crawls,
        'completed'::VARCHAR,
        v_duration;

    -- Cleanup old crawl pages (7-day retention)
    v_start_time := clock_timestamp();
    SELECT deleted_pages INTO v_result FROM cleanup_old_crawl_pages(7);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'crawl_pages'::VARCHAR,
        v_result.deleted_pages::INTEGER,
        'completed'::VARCHAR,
        v_duration;

    -- Archive navigation sessions (90-day retention)
    v_start_time := clock_timestamp();
    SELECT * INTO v_result FROM archive_old_navigation_sessions(90);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'navigation_sessions_archive'::VARCHAR,
        v_result.archived_count,
        'completed'::VARCHAR,
        v_duration;

    -- Cleanup old archived sessions (2-year total retention)
    v_start_time := clock_timestamp();
    SELECT deleted_count INTO v_result FROM cleanup_archived_navigation_sessions(730);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'navigation_sessions_archive_cleanup'::VARCHAR,
        v_result.deleted_count::INTEGER,
        'completed'::VARCHAR,
        v_duration;

    -- Cleanup old analytics (2-year retention) - from V2.1.0
    v_start_time := clock_timestamp();
    SELECT deleted_analytics_count INTO v_result FROM cleanup_old_analytics(730);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'widget_usage_analytics'::VARCHAR,
        v_result.deleted_analytics_count::INTEGER,
        'completed'::VARCHAR,
        v_duration;

    -- Cleanup old system metrics (30-day retention) - from V2.1.0
    v_start_time := clock_timestamp();
    SELECT deleted_metrics_count INTO v_result FROM cleanup_old_system_metrics(30);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'system_metrics'::VARCHAR,
        v_result.deleted_metrics_count::INTEGER,
        'completed'::VARCHAR,
        v_duration;

    -- Cleanup inactive page embeddings (6-month inactivity threshold)
    v_start_time := clock_timestamp();
    SELECT * INTO v_result FROM cleanup_inactive_page_embeddings(180);
    v_duration := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    RETURN QUERY SELECT
        'page_embeddings_inactive'::VARCHAR,
        v_result.deactivated_count,
        'completed'::VARCHAR,
        v_duration;

    RETURN;
END;
$$ language 'plpgsql';

-- Function to get cleanup statistics and recommendations (idempotent)
CREATE OR REPLACE FUNCTION get_cleanup_statistics()
RETURNS TABLE (
    table_name VARCHAR,
    total_records BIGINT,
    eligible_for_cleanup BIGINT,
    estimated_space_mb NUMERIC,
    recommendation VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    -- Page analysis history stats
    SELECT
        'page_analysis_history'::VARCHAR,
        COUNT(*)::BIGINT,
        (
            SELECT COUNT(*)::BIGINT
            FROM (
                SELECT
                    ROW_NUMBER() OVER (
                        PARTITION BY page_embedding_id
                        ORDER BY created_at DESC
                    ) AS version_rank
                FROM page_analysis_history
            ) ranked
            WHERE version_rank > 10
        ),
        ROUND((pg_total_relation_size('page_analysis_history')::NUMERIC / 1024 / 1024), 2),
        CASE
            WHEN COUNT(*) > 10000 THEN 'Cleanup recommended - high volume'
            WHEN COUNT(*) > 5000 THEN 'Cleanup suggested - moderate volume'
            ELSE 'OK - low volume'
        END
    FROM page_analysis_history

    UNION ALL

    -- Crawl history stats
    SELECT
        'crawl_history'::VARCHAR,
        COUNT(*)::BIGINT,
        (
            SELECT COUNT(*)::BIGINT
            FROM (
                SELECT
                    ROW_NUMBER() OVER (
                        PARTITION BY website_id
                        ORDER BY created_at DESC
                    ) AS crawl_rank
                FROM crawl_history
            ) ranked
            WHERE crawl_rank > 50
        ),
        ROUND((pg_total_relation_size('crawl_history')::NUMERIC / 1024 / 1024), 2),
        CASE
            WHEN COUNT(*) > 1000 THEN 'Cleanup recommended - high volume'
            WHEN COUNT(*) > 500 THEN 'Cleanup suggested - moderate volume'
            ELSE 'OK - low volume'
        END
    FROM crawl_history

    UNION ALL

    -- Crawl pages stats
    SELECT
        'crawl_pages'::VARCHAR,
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (
            WHERE is_processed = true
                AND is_embedded = true
                AND processed_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
        )::BIGINT,
        ROUND((pg_total_relation_size('crawl_pages')::NUMERIC / 1024 / 1024), 2),
        CASE
            WHEN COUNT(*) > 100000 THEN 'Cleanup recommended - high volume'
            WHEN COUNT(*) > 50000 THEN 'Cleanup suggested - moderate volume'
            ELSE 'OK - low volume'
        END
    FROM crawl_pages

    UNION ALL

    -- Navigation sessions stats
    SELECT
        'user_navigation_sessions'::VARCHAR,
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (
            WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
        )::BIGINT,
        ROUND((pg_total_relation_size('user_navigation_sessions')::NUMERIC / 1024 / 1024), 2),
        CASE
            WHEN COUNT(*) > 500000 THEN 'Archive recommended - high volume'
            WHEN COUNT(*) > 100000 THEN 'Archive suggested - moderate volume'
            ELSE 'OK - low volume'
        END
    FROM user_navigation_sessions;
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON TABLE user_navigation_sessions_archive IS 'Archived navigation sessions older than 90 days (kept for 2 years total)';
COMMENT ON COLUMN user_navigation_sessions_archive.archived_at IS 'Timestamp when the record was archived from the main table';

COMMENT ON FUNCTION cleanup_page_analysis_history IS 'Keeps only the last N versions of page analysis per page (default: 10)';
COMMENT ON FUNCTION cleanup_crawl_history IS 'Keeps only the last N crawl history entries per website (default: 50)';
COMMENT ON FUNCTION cleanup_old_crawl_pages IS 'Deletes processed and embedded crawl pages older than N days (default: 7)';
COMMENT ON FUNCTION archive_old_navigation_sessions IS 'Archives navigation sessions older than N days to archive table (default: 90)';
COMMENT ON FUNCTION cleanup_archived_navigation_sessions IS 'Deletes archived sessions older than N days (default: 730 / 2 years)';
COMMENT ON FUNCTION cleanup_inactive_page_embeddings IS 'Deactivates and clears embeddings for pages not analyzed in N days (default: 180)';
COMMENT ON FUNCTION execute_data_retention_cleanup IS 'Master orchestration function that executes all cleanup operations in sequence';
COMMENT ON FUNCTION get_cleanup_statistics IS 'Returns statistics about data volume and cleanup recommendations for all tables';
