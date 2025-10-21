-- Create analytics and metrics infrastructure for usage tracking and system health monitoring (Idempotent)

-- Create widget_usage_analytics table for hourly usage tracking (Idempotent)
CREATE TABLE IF NOT EXISTS widget_usage_analytics (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,

    -- Time bucketing
    analytics_date DATE NOT NULL,
    analytics_hour INTEGER NOT NULL,

    -- Usage metrics
    total_sessions INTEGER NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    total_queries INTEGER NOT NULL DEFAULT 0,
    successful_queries INTEGER NOT NULL DEFAULT 0,
    failed_queries INTEGER NOT NULL DEFAULT 0,

    -- Performance metrics
    avg_response_time_ms NUMERIC(10,2),
    p50_response_time_ms NUMERIC(10,2),
    p95_response_time_ms NUMERIC(10,2),
    p99_response_time_ms NUMERIC(10,2),
    max_response_time_ms INTEGER,

    -- Engagement metrics
    avg_session_duration_ms NUMERIC(10,2),
    avg_queries_per_session NUMERIC(5,2),
    bounce_rate NUMERIC(5,4),

    -- Quality metrics
    avg_user_satisfaction NUMERIC(3,2),
    goal_completion_rate NUMERIC(5,4),

    -- Top queries analysis
    top_queries JSONB DEFAULT '[]',
    top_intents JSONB DEFAULT '[]',
    failed_query_patterns JSONB DEFAULT '[]',

    -- Analytics metadata
    analytics_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_widget_usage_analytics_website_id FOREIGN KEY (website_id)
        REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT widget_usage_analytics_hour_range CHECK (analytics_hour BETWEEN 0 AND 23),
    CONSTRAINT widget_usage_analytics_counts_positive CHECK (
        total_sessions >= 0 AND
        unique_users >= 0 AND
        total_queries >= 0 AND
        successful_queries >= 0 AND
        failed_queries >= 0
    ),
    CONSTRAINT widget_usage_analytics_times_positive CHECK (
        (avg_response_time_ms IS NULL OR avg_response_time_ms >= 0) AND
        (p50_response_time_ms IS NULL OR p50_response_time_ms >= 0) AND
        (p95_response_time_ms IS NULL OR p95_response_time_ms >= 0) AND
        (p99_response_time_ms IS NULL OR p99_response_time_ms >= 0) AND
        (max_response_time_ms IS NULL OR max_response_time_ms >= 0) AND
        (avg_session_duration_ms IS NULL OR avg_session_duration_ms >= 0)
    ),
    CONSTRAINT widget_usage_analytics_rates_range CHECK (
        (avg_user_satisfaction IS NULL OR avg_user_satisfaction BETWEEN 0 AND 1) AND
        (goal_completion_rate IS NULL OR goal_completion_rate BETWEEN 0 AND 1) AND
        (bounce_rate IS NULL OR bounce_rate BETWEEN 0 AND 1)
    ),
    CONSTRAINT widget_usage_analytics_queries_per_session_positive CHECK (
        avg_queries_per_session IS NULL OR avg_queries_per_session >= 0
    ),
    CONSTRAINT widget_usage_analytics_unique_website_date_hour UNIQUE (website_id, analytics_date, analytics_hour)
);

-- Create system_metrics table for 5-minute interval health tracking (Idempotent)
CREATE TABLE IF NOT EXISTS system_metrics (
    id BIGSERIAL PRIMARY KEY,

    -- Time bucketing (5-minute intervals)
    metric_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

    -- System health
    cpu_usage_percent NUMERIC(5,2),
    memory_usage_mb NUMERIC(10,2),
    memory_total_mb NUMERIC(10,2),
    memory_usage_percent NUMERIC(5,2),

    -- Database metrics
    db_active_connections INTEGER,
    db_idle_connections INTEGER,
    db_total_connections INTEGER,
    db_avg_query_time_ms NUMERIC(10,2),
    db_slow_query_count INTEGER DEFAULT 0,

    -- Application metrics
    active_sessions INTEGER DEFAULT 0,
    requests_per_minute INTEGER DEFAULT 0,
    avg_request_time_ms NUMERIC(10,2),
    error_count INTEGER DEFAULT 0,
    error_rate NUMERIC(5,4),

    -- Cache metrics
    cache_hit_rate NUMERIC(5,4),
    cache_size_mb NUMERIC(10,2),
    cache_eviction_count INTEGER DEFAULT 0,

    -- Queue metrics (if applicable)
    queue_size INTEGER DEFAULT 0,
    queue_processing_time_ms NUMERIC(10,2),

    -- API metrics
    api_requests_total INTEGER DEFAULT 0,
    api_requests_success INTEGER DEFAULT 0,
    api_requests_failed INTEGER DEFAULT 0,
    api_avg_latency_ms NUMERIC(10,2),

    -- Embedding service metrics
    embedding_requests INTEGER DEFAULT 0,
    embedding_avg_time_ms NUMERIC(10,2),
    embedding_cache_hit_rate NUMERIC(5,4),

    -- Health status
    health_status VARCHAR(20) NOT NULL DEFAULT 'healthy',
    alert_count INTEGER DEFAULT 0,

    -- Detailed metrics
    detailed_metrics JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT system_metrics_cpu_range CHECK (
        cpu_usage_percent IS NULL OR cpu_usage_percent BETWEEN 0 AND 100
    ),
    CONSTRAINT system_metrics_memory_range CHECK (
        memory_usage_percent IS NULL OR memory_usage_percent BETWEEN 0 AND 100
    ),
    CONSTRAINT system_metrics_memory_positive CHECK (
        (memory_usage_mb IS NULL OR memory_usage_mb >= 0) AND
        (memory_total_mb IS NULL OR memory_total_mb >= 0)
    ),
    CONSTRAINT system_metrics_db_connections_positive CHECK (
        (db_active_connections IS NULL OR db_active_connections >= 0) AND
        (db_idle_connections IS NULL OR db_idle_connections >= 0) AND
        (db_total_connections IS NULL OR db_total_connections >= 0) AND
        (db_slow_query_count >= 0)
    ),
    CONSTRAINT system_metrics_app_counts_positive CHECK (
        active_sessions >= 0 AND
        requests_per_minute >= 0 AND
        error_count >= 0 AND
        cache_eviction_count >= 0 AND
        queue_size >= 0
    ),
    CONSTRAINT system_metrics_api_counts_positive CHECK (
        api_requests_total >= 0 AND
        api_requests_success >= 0 AND
        api_requests_failed >= 0 AND
        embedding_requests >= 0
    ),
    CONSTRAINT system_metrics_times_positive CHECK (
        (db_avg_query_time_ms IS NULL OR db_avg_query_time_ms >= 0) AND
        (avg_request_time_ms IS NULL OR avg_request_time_ms >= 0) AND
        (queue_processing_time_ms IS NULL OR queue_processing_time_ms >= 0) AND
        (api_avg_latency_ms IS NULL OR api_avg_latency_ms >= 0) AND
        (embedding_avg_time_ms IS NULL OR embedding_avg_time_ms >= 0)
    ),
    CONSTRAINT system_metrics_rates_range CHECK (
        (error_rate IS NULL OR error_rate BETWEEN 0 AND 1) AND
        (cache_hit_rate IS NULL OR cache_hit_rate BETWEEN 0 AND 1) AND
        (embedding_cache_hit_rate IS NULL OR embedding_cache_hit_rate BETWEEN 0 AND 1)
    ),
    CONSTRAINT system_metrics_cache_positive CHECK (
        cache_size_mb IS NULL OR cache_size_mb >= 0
    ),
    CONSTRAINT system_metrics_health_status_check CHECK (
        health_status IN ('healthy', 'degraded', 'unhealthy', 'critical')
    ),
    CONSTRAINT system_metrics_alert_count_positive CHECK (alert_count >= 0)
);

-- Create indexes for widget_usage_analytics table (idempotent)
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_website_id ON widget_usage_analytics(website_id);
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_date ON widget_usage_analytics(analytics_date DESC);
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_created_at ON widget_usage_analytics(created_at DESC);

-- Composite indexes for common time-range queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_website_date
    ON widget_usage_analytics(website_id, analytics_date DESC);
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_website_date_hour
    ON widget_usage_analytics(website_id, analytics_date DESC, analytics_hour DESC);

-- GIN indexes for JSONB fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_top_queries ON widget_usage_analytics USING GIN(top_queries);
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_top_intents ON widget_usage_analytics USING GIN(top_intents);
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_failed_patterns ON widget_usage_analytics USING GIN(failed_query_patterns);
CREATE INDEX IF NOT EXISTS idx_widget_usage_analytics_metadata ON widget_usage_analytics USING GIN(analytics_metadata);

-- Partial index for high-traffic hours (idempotent)
DROP INDEX IF EXISTS idx_widget_usage_analytics_high_traffic;
CREATE INDEX idx_widget_usage_analytics_high_traffic
    ON widget_usage_analytics(website_id, analytics_date DESC, total_sessions DESC)
    WHERE total_sessions > 100;

-- Create indexes for system_metrics table (idempotent)
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(metric_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_health_status ON system_metrics(health_status);

-- Partial index for unhealthy states (idempotent)
DROP INDEX IF EXISTS idx_system_metrics_unhealthy;
CREATE INDEX idx_system_metrics_unhealthy
    ON system_metrics(metric_timestamp DESC)
    WHERE health_status IN ('degraded', 'unhealthy', 'critical');

-- Partial index for high error rates (idempotent)
DROP INDEX IF EXISTS idx_system_metrics_high_errors;
CREATE INDEX idx_system_metrics_high_errors
    ON system_metrics(metric_timestamp DESC, error_count DESC)
    WHERE error_rate > 0.05;

-- GIN index for detailed metrics (idempotent)
CREATE INDEX IF NOT EXISTS idx_system_metrics_detailed ON system_metrics USING GIN(detailed_metrics);

-- Create trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_widget_usage_analytics_updated_at ON widget_usage_analytics;
CREATE TRIGGER update_widget_usage_analytics_updated_at
    BEFORE UPDATE ON widget_usage_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate hourly analytics to daily (idempotent)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(
    p_website_id BIGINT,
    p_date DATE
)
RETURNS TABLE (
    total_sessions BIGINT,
    unique_users BIGINT,
    total_queries BIGINT,
    avg_satisfaction NUMERIC,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(wua.total_sessions)::BIGINT,
        SUM(wua.unique_users)::BIGINT,
        SUM(wua.total_queries)::BIGINT,
        ROUND(AVG(wua.avg_user_satisfaction), 2),
        ROUND(AVG(wua.goal_completion_rate), 4)
    FROM widget_usage_analytics wua
    WHERE wua.website_id = p_website_id
        AND wua.analytics_date = p_date;
END;
$$ language 'plpgsql' STABLE;

-- Function to get system health summary for a time range (idempotent)
CREATE OR REPLACE FUNCTION get_system_health_summary(
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    avg_cpu_usage NUMERIC,
    avg_memory_usage NUMERIC,
    avg_db_connections INTEGER,
    avg_request_time NUMERIC,
    total_errors INTEGER,
    avg_error_rate NUMERIC,
    unhealthy_intervals INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(sm.cpu_usage_percent), 2),
        ROUND(AVG(sm.memory_usage_percent), 2),
        ROUND(AVG(sm.db_active_connections))::INTEGER,
        ROUND(AVG(sm.avg_request_time_ms), 2),
        SUM(sm.error_count)::INTEGER,
        ROUND(AVG(sm.error_rate), 4),
        COUNT(*) FILTER (WHERE sm.health_status IN ('degraded', 'unhealthy', 'critical'))::INTEGER
    FROM system_metrics sm
    WHERE sm.metric_timestamp BETWEEN p_start_time AND p_end_time;
END;
$$ language 'plpgsql' STABLE;

-- Function to cleanup old analytics data (2-year retention) (idempotent)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(
    p_retention_days INTEGER DEFAULT 730  -- 2 years
)
RETURNS TABLE (
    deleted_analytics_count INTEGER,
    oldest_date DATE
) AS $$
DECLARE
    v_deleted_count INTEGER;
    v_cutoff_date DATE;
    v_oldest_date DATE;
BEGIN
    v_cutoff_date := CURRENT_DATE - p_retention_days;

    -- Delete old analytics
    DELETE FROM widget_usage_analytics
    WHERE analytics_date < v_cutoff_date;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Get oldest remaining date
    SELECT MIN(analytics_date) INTO v_oldest_date
    FROM widget_usage_analytics;

    RETURN QUERY SELECT v_deleted_count, v_oldest_date;
END;
$$ language 'plpgsql';

-- Function to cleanup old system metrics (30-day retention) (idempotent)
CREATE OR REPLACE FUNCTION cleanup_old_system_metrics(
    p_retention_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    deleted_metrics_count INTEGER,
    oldest_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_deleted_count INTEGER;
    v_cutoff_timestamp TIMESTAMP WITH TIME ZONE;
    v_oldest_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    v_cutoff_timestamp := CURRENT_TIMESTAMP - (p_retention_days || ' days')::INTERVAL;

    -- Delete old metrics
    DELETE FROM system_metrics
    WHERE metric_timestamp < v_cutoff_timestamp;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Get oldest remaining timestamp
    SELECT MIN(metric_timestamp) INTO v_oldest_timestamp
    FROM system_metrics;

    RETURN QUERY SELECT v_deleted_count, v_oldest_timestamp;
END;
$$ language 'plpgsql';

-- Function to record hourly analytics snapshot (idempotent)
CREATE OR REPLACE FUNCTION record_hourly_analytics(
    p_website_id BIGINT,
    p_date DATE,
    p_hour INTEGER
)
RETURNS BIGINT AS $$
DECLARE
    v_analytics_id BIGINT;
    v_sessions INTEGER;
    v_users INTEGER;
    v_queries INTEGER;
    v_successful INTEGER;
    v_failed INTEGER;
BEGIN
    -- Calculate metrics from user_navigation_sessions
    SELECT
        COUNT(*)::INTEGER,
        COUNT(DISTINCT user_id)::INTEGER,
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE goal_reached = true)::INTEGER,
        COUNT(*) FILTER (WHERE goal_reached = false)::INTEGER
    INTO v_sessions, v_users, v_queries, v_successful, v_failed
    FROM user_navigation_sessions
    WHERE website_id = p_website_id
        AND DATE(started_at) = p_date
        AND EXTRACT(HOUR FROM started_at) = p_hour;

    -- Insert or update analytics record
    INSERT INTO widget_usage_analytics (
        website_id,
        analytics_date,
        analytics_hour,
        total_sessions,
        unique_users,
        total_queries,
        successful_queries,
        failed_queries
    )
    VALUES (
        p_website_id,
        p_date,
        p_hour,
        v_sessions,
        v_users,
        v_queries,
        v_successful,
        v_failed
    )
    ON CONFLICT (website_id, analytics_date, analytics_hour)
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        unique_users = EXCLUDED.unique_users,
        total_queries = EXCLUDED.total_queries,
        successful_queries = EXCLUDED.successful_queries,
        failed_queries = EXCLUDED.failed_queries,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_analytics_id;

    RETURN v_analytics_id;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE widget_usage_analytics IS 'Hourly aggregated usage analytics for widget performance and engagement tracking (2-year retention)';
COMMENT ON COLUMN widget_usage_analytics.analytics_hour IS 'Hour of day (0-23) for time bucketing';
COMMENT ON COLUMN widget_usage_analytics.top_queries IS 'JSON array of most common queries with counts';
COMMENT ON COLUMN widget_usage_analytics.failed_query_patterns IS 'JSON array of frequently failing query patterns for debugging';
COMMENT ON COLUMN widget_usage_analytics.bounce_rate IS 'Percentage of single-query sessions (0-1)';

COMMENT ON TABLE system_metrics IS 'System health metrics collected at 5-minute intervals (30-day retention)';
COMMENT ON COLUMN system_metrics.metric_timestamp IS 'Exact timestamp of metric collection (5-minute intervals)';
COMMENT ON COLUMN system_metrics.health_status IS 'Overall system health: healthy, degraded, unhealthy, critical';
COMMENT ON COLUMN system_metrics.detailed_metrics IS 'Additional custom metrics in JSON format';

COMMENT ON FUNCTION aggregate_daily_analytics IS 'Aggregate hourly analytics data to daily summary for a website';
COMMENT ON FUNCTION get_system_health_summary IS 'Calculate system health statistics for a time range';
COMMENT ON FUNCTION cleanup_old_analytics IS 'Remove analytics data older than specified days (default: 730 days / 2 years)';
COMMENT ON FUNCTION cleanup_old_system_metrics IS 'Remove system metrics older than specified days (default: 30 days)';
COMMENT ON FUNCTION record_hourly_analytics IS 'Calculate and record hourly analytics snapshot for a website';
