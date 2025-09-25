-- Create performance metrics table for tracking navigation performance
CREATE TABLE performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    navigation_session_id BIGINT NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,3) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    measurement_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    context_data JSONB DEFAULT '{}',

    CONSTRAINT fk_performance_metrics_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT performance_metrics_type_check CHECK (metric_type IN ('timing', 'count', 'size', 'rate', 'score', 'custom')),
    CONSTRAINT performance_metrics_name_not_empty CHECK (LENGTH(TRIM(metric_name)) > 0),
    CONSTRAINT performance_metrics_unit_not_empty CHECK (LENGTH(TRIM(metric_unit)) > 0)
);

-- Create browser automation logs table for detailed automation tracking
CREATE TABLE browser_automation_logs (
    id BIGSERIAL PRIMARY KEY,
    navigation_session_id BIGINT NOT NULL,
    log_level VARCHAR(10) NOT NULL,
    log_source VARCHAR(50) NOT NULL,
    log_message TEXT NOT NULL,
    log_data JSONB DEFAULT '{}',
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_browser_automation_logs_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT browser_automation_logs_level_check CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    CONSTRAINT browser_automation_logs_source_not_empty CHECK (LENGTH(TRIM(log_source)) > 0),
    CONSTRAINT browser_automation_logs_message_not_empty CHECK (LENGTH(TRIM(log_message)) > 0)
);

-- Create element recognition cache table for caching AI element recognition results
CREATE TABLE element_recognition_cache (
    id BIGSERIAL PRIMARY KEY,
    page_url_hash VARCHAR(64) NOT NULL,
    element_description_hash VARCHAR(64) NOT NULL,
    recognition_result JSONB NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    model_version VARCHAR(50),
    cache_hits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT element_recognition_cache_confidence_range CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    CONSTRAINT element_recognition_cache_hits_non_negative CHECK (cache_hits >= 0),
    CONSTRAINT element_recognition_cache_unique_entry UNIQUE (page_url_hash, element_description_hash)
);

-- Create session analytics table for aggregated session statistics
CREATE TABLE session_analytics (
    id BIGSERIAL PRIMARY KEY,
    navigation_session_id BIGINT NOT NULL,
    total_steps INTEGER NOT NULL DEFAULT 0,
    successful_steps INTEGER NOT NULL DEFAULT 0,
    failed_steps INTEGER NOT NULL DEFAULT 0,
    total_execution_time_ms BIGINT NOT NULL DEFAULT 0,
    average_step_time_ms DECIMAL(10,2),
    page_load_time_ms BIGINT,
    element_detection_time_ms BIGINT,
    user_wait_time_ms BIGINT,
    error_rate DECIMAL(5,2) DEFAULT 0.0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    pages_visited INTEGER NOT NULL DEFAULT 0,
    elements_interacted INTEGER NOT NULL DEFAULT 0,
    screenshots_taken INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_analytics_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT session_analytics_steps_non_negative CHECK (total_steps >= 0 AND successful_steps >= 0 AND failed_steps >= 0),
    CONSTRAINT session_analytics_times_non_negative CHECK (total_execution_time_ms >= 0),
    CONSTRAINT session_analytics_rates_range CHECK (error_rate >= 0.0 AND error_rate <= 100.0 AND success_rate >= 0.0 AND success_rate <= 100.0),
    CONSTRAINT session_analytics_counts_non_negative CHECK (pages_visited >= 0 AND elements_interacted >= 0 AND screenshots_taken >= 0),
    CONSTRAINT session_analytics_unique_session UNIQUE (navigation_session_id)
);

-- Create indexes for performance
CREATE INDEX idx_performance_metrics_navigation_session_id ON performance_metrics(navigation_session_id);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(measurement_timestamp);

CREATE INDEX idx_browser_automation_logs_navigation_session_id ON browser_automation_logs(navigation_session_id);
CREATE INDEX idx_browser_automation_logs_level ON browser_automation_logs(log_level);
CREATE INDEX idx_browser_automation_logs_source ON browser_automation_logs(log_source);
CREATE INDEX idx_browser_automation_logs_created_at ON browser_automation_logs(created_at);

CREATE INDEX idx_element_recognition_cache_page_hash ON element_recognition_cache(page_url_hash);
CREATE INDEX idx_element_recognition_cache_element_hash ON element_recognition_cache(element_description_hash);
CREATE INDEX idx_element_recognition_cache_confidence ON element_recognition_cache(confidence_score);
CREATE INDEX idx_element_recognition_cache_last_accessed ON element_recognition_cache(last_accessed_at);
CREATE INDEX idx_element_recognition_cache_expires_at ON element_recognition_cache(expires_at);

CREATE INDEX idx_session_analytics_navigation_session_id ON session_analytics(navigation_session_id);
CREATE INDEX idx_session_analytics_success_rate ON session_analytics(success_rate);
CREATE INDEX idx_session_analytics_error_rate ON session_analytics(error_rate);
CREATE INDEX idx_session_analytics_created_at ON session_analytics(created_at);

-- Create trigger for session_analytics updated_at
CREATE TRIGGER update_session_analytics_updated_at
    BEFORE UPDATE ON session_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM element_recognition_cache
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE performance_metrics IS 'Performance metrics collected during navigation sessions';
COMMENT ON TABLE browser_automation_logs IS 'Detailed logs from browser automation activities';
COMMENT ON TABLE element_recognition_cache IS 'Cache for AI element recognition results to improve performance';
COMMENT ON TABLE session_analytics IS 'Aggregated analytics and statistics for navigation sessions';

COMMENT ON FUNCTION cleanup_expired_cache() IS 'Function to clean up expired element recognition cache entries';
