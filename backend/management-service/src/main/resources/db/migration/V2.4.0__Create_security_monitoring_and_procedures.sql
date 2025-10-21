-- Create security, monitoring, and migration procedures infrastructure (Idempotent)
--
-- NOTE: Role creation requires superuser privileges and should be executed by a DBA.
-- The following roles should be created manually before running this migration:
--   - management_service: Full access to user/admin tables
--   - navigation_service: Access to navigation and embeddings
--   - analytics_service: Read access for analytics
--   - readonly_user: Read-only access to all tables
--
-- Example role creation (run as postgres superuser):
--   CREATE ROLE management_service WITH LOGIN PASSWORD 'secure_password';
--   CREATE ROLE navigation_service WITH LOGIN PASSWORD 'secure_password';
--   CREATE ROLE analytics_service WITH LOGIN PASSWORD 'secure_password';
--   CREATE ROLE readonly_user WITH LOGIN PASSWORD 'secure_password';

-- ============================================================================
-- DATABASE ROLES AND PERMISSIONS
-- ============================================================================

-- Verify required roles exist (skip grants if roles don't exist)
DO $$
BEGIN
    -- Check if service roles exist, log warnings if they don't
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'management_service') THEN
        RAISE NOTICE 'Role management_service does not exist. Grants will be skipped.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'navigation_service') THEN
        RAISE NOTICE 'Role navigation_service does not exist. Grants will be skipped.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_service') THEN
        RAISE NOTICE 'Role analytics_service does not exist. Grants will be skipped.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
        RAISE NOTICE 'Role readonly_user does not exist. Grants will be skipped.';
    END IF;
END $$;

-- Grant permissions to management_service (full access to user/admin tables)
-- Only execute if role exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'management_service') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON users, conversations, messages TO management_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ai_models, user_preferences, applications TO management_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs, system_settings, user_sessions TO management_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON websites, navigation_links TO management_service;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO management_service;
        RAISE NOTICE 'Granted permissions to management_service role';
    ELSE
        RAISE NOTICE 'Skipping grants for management_service - role does not exist';
    END IF;
END $$;

-- Grant permissions to navigation_service (access to navigation and embeddings)
-- Only execute if role exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'navigation_service') THEN
        GRANT SELECT ON users, websites, navigation_links TO navigation_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON page_embeddings, page_analysis_history TO navigation_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON user_navigation_sessions TO navigation_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON synthetic_queries TO navigation_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON crawl_history, crawl_pages TO navigation_service;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO navigation_service;
        RAISE NOTICE 'Granted permissions to navigation_service role';
    ELSE
        RAISE NOTICE 'Skipping grants for navigation_service - role does not exist';
    END IF;
END $$;

-- Grant permissions to analytics_service (access to analytics and metrics)
-- Only execute if role exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_service') THEN
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON widget_usage_analytics, system_metrics TO analytics_service;
        GRANT SELECT, INSERT, UPDATE, DELETE ON embedding_quality_metrics TO analytics_service;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO analytics_service;
        RAISE NOTICE 'Granted permissions to analytics_service role';
    ELSE
        RAISE NOTICE 'Skipping grants for analytics_service - role does not exist';
    END IF;
END $$;

-- Grant read-only permissions to readonly_user
-- Only execute if role exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO readonly_user;
        RAISE NOTICE 'Granted permissions to readonly_user role';
    ELSE
        RAISE NOTICE 'Skipping grants for readonly_user - role does not exist';
    END IF;
END $$;

-- ============================================================================
-- ENHANCED AUDIT LOGGING
-- ============================================================================

-- Extend audit_logs table with additional metadata (idempotent)
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'execution_time_ms'
    ) THEN
        ALTER TABLE audit_logs
        ADD COLUMN execution_time_ms INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'error_details'
    ) THEN
        ALTER TABLE audit_logs
        ADD COLUMN error_details JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'query_hash'
    ) THEN
        ALTER TABLE audit_logs
        ADD COLUMN query_hash VARCHAR(64);
    END IF;
END $$;

-- Create audit_logs indexes if they don't exist (idempotent)
CREATE INDEX IF NOT EXISTS idx_audit_logs_query_hash ON audit_logs(query_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_execution_time ON audit_logs(execution_time_ms DESC);

-- Create security_events table for tracking security-related events (Idempotent)
CREATE TABLE IF NOT EXISTS security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Event details
    event_description TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',

    -- Authentication/Authorization context
    auth_method VARCHAR(50),
    role_attempted VARCHAR(100),
    resource_accessed VARCHAR(500),
    access_granted BOOLEAN DEFAULT false,

    -- Threat detection
    is_suspicious BOOLEAN DEFAULT false,
    threat_score NUMERIC(3,2),
    detection_rules JSONB DEFAULT '[]',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_security_events_user_id FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT security_events_event_type_check CHECK (
        event_type IN (
            'login_success', 'login_failure', 'logout',
            'password_change', 'password_reset',
            'permission_denied', 'role_escalation_attempt',
            'suspicious_query', 'rate_limit_exceeded',
            'sql_injection_attempt', 'xss_attempt',
            'data_export', 'bulk_operation',
            'api_key_created', 'api_key_revoked'
        )
    ),
    CONSTRAINT security_events_severity_check CHECK (
        severity IN ('info', 'warning', 'error', 'critical')
    ),
    CONSTRAINT security_events_threat_score_range CHECK (
        threat_score IS NULL OR threat_score BETWEEN 0 AND 1
    )
);

-- Create indexes for security_events (idempotent)
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);

-- Partial index for suspicious events (idempotent)
DROP INDEX IF EXISTS idx_security_events_suspicious;
CREATE INDEX idx_security_events_suspicious
    ON security_events(created_at DESC, threat_score DESC, event_type)
    WHERE is_suspicious = true;

-- Partial index for high-severity events (idempotent)
DROP INDEX IF EXISTS idx_security_events_high_severity;
CREATE INDEX idx_security_events_high_severity
    ON security_events(created_at DESC, severity, event_type)
    WHERE severity IN ('error', 'critical');

-- GIN indexes for JSONB fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_security_events_event_data ON security_events USING GIN(event_data);
CREATE INDEX IF NOT EXISTS idx_security_events_detection_rules ON security_events USING GIN(detection_rules);

-- ============================================================================
-- MONITORING AND ALERTING
-- ============================================================================

-- Create monitoring_alerts table for tracking system alerts (Idempotent)
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',

    -- Alert details
    alert_name VARCHAR(200) NOT NULL,
    alert_description TEXT,
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    threshold_value NUMERIC,

    -- Alert state
    is_active BOOLEAN DEFAULT true,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by BIGINT,
    acknowledged_at TIMESTAMP WITH TIME ZONE,

    -- Resolution
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,

    -- Alert metadata
    alert_data JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_monitoring_alerts_acknowledged_by FOREIGN KEY (acknowledged_by)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT monitoring_alerts_alert_type_check CHECK (
        alert_type IN (
            'embedding_failure_rate', 'slow_query', 'connection_pool_exhaustion',
            'high_error_rate', 'disk_space_low', 'memory_usage_high',
            'cpu_usage_high', 'response_time_degraded',
            'suspicious_activity', 'data_retention_needed',
            'index_bloat', 'vacuum_needed'
        )
    ),
    CONSTRAINT monitoring_alerts_severity_check CHECK (
        severity IN ('info', 'warning', 'error', 'critical')
    )
);

-- Create indexes for monitoring_alerts (idempotent)
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_alert_type ON monitoring_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created_at ON monitoring_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_is_active ON monitoring_alerts(is_active);

-- Partial index for active unresolved alerts (idempotent)
DROP INDEX IF EXISTS idx_monitoring_alerts_active_unresolved;
CREATE INDEX idx_monitoring_alerts_active_unresolved
    ON monitoring_alerts(created_at DESC, severity DESC, alert_type)
    WHERE is_active = true AND is_resolved = false;

-- GIN index for alert_data (idempotent)
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_data ON monitoring_alerts USING GIN(alert_data);

-- Create trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_monitoring_alerts_updated_at ON monitoring_alerts;
CREATE TRIGGER update_monitoring_alerts_updated_at
    BEFORE UPDATE ON monitoring_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MONITORING FUNCTIONS
-- ============================================================================

-- Function to check embedding failure rate and create alert (idempotent)
CREATE OR REPLACE FUNCTION check_embedding_failure_rate(
    p_threshold_percent NUMERIC DEFAULT 5.0,
    p_hours_lookback INTEGER DEFAULT 24
)
RETURNS TABLE (
    failure_rate NUMERIC,
    alert_created BOOLEAN
) AS $$
DECLARE
    v_total_attempts INTEGER;
    v_failed_attempts INTEGER;
    v_failure_rate NUMERIC;
    v_alert_created BOOLEAN := false;
BEGIN
    -- Calculate failure rate from crawl_pages
    SELECT
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE processing_error IS NOT NULL)::INTEGER
    INTO v_total_attempts, v_failed_attempts
    FROM crawl_pages
    WHERE crawled_at >= CURRENT_TIMESTAMP - (p_hours_lookback || ' hours')::INTERVAL;

    IF v_total_attempts > 0 THEN
        v_failure_rate := ROUND((v_failed_attempts::NUMERIC / v_total_attempts::NUMERIC) * 100, 2);

        -- Create alert if threshold exceeded
        IF v_failure_rate > p_threshold_percent THEN
            INSERT INTO monitoring_alerts (
                alert_type,
                severity,
                alert_name,
                alert_description,
                metric_name,
                metric_value,
                threshold_value,
                alert_data
            ) VALUES (
                'embedding_failure_rate',
                CASE
                    WHEN v_failure_rate > 20 THEN 'critical'
                    WHEN v_failure_rate > 10 THEN 'error'
                    ELSE 'warning'
                END,
                'High Embedding Failure Rate',
                'Embedding generation failure rate exceeds threshold',
                'failure_rate_percent',
                v_failure_rate,
                p_threshold_percent,
                jsonb_build_object(
                    'total_attempts', v_total_attempts,
                    'failed_attempts', v_failed_attempts,
                    'hours_lookback', p_hours_lookback
                )
            );
            v_alert_created := true;
        END IF;
    ELSE
        v_failure_rate := 0;
    END IF;

    RETURN QUERY SELECT v_failure_rate, v_alert_created;
END;
$$ language 'plpgsql';

-- Function to detect slow queries and create alerts (idempotent)
CREATE OR REPLACE FUNCTION check_slow_queries(
    p_threshold_ms NUMERIC DEFAULT 1000
)
RETURNS TABLE (
    slow_query_count INTEGER,
    alert_created BOOLEAN
) AS $$
DECLARE
    v_slow_count INTEGER;
    v_alert_created BOOLEAN := false;
BEGIN
    -- Count slow queries from audit_logs (if tracking query execution times)
    SELECT COUNT(*)::INTEGER
    INTO v_slow_count
    FROM audit_logs
    WHERE execution_time_ms > p_threshold_ms
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour';

    -- Create alert if significant slow queries detected
    IF v_slow_count > 10 THEN
        INSERT INTO monitoring_alerts (
            alert_type,
            severity,
            alert_name,
            alert_description,
            metric_name,
            metric_value,
            threshold_value
        ) VALUES (
            'slow_query',
            CASE
                WHEN v_slow_count > 100 THEN 'critical'
                WHEN v_slow_count > 50 THEN 'error'
                ELSE 'warning'
            END,
            'Multiple Slow Queries Detected',
            'Significant number of queries exceeding performance threshold',
            'slow_query_count',
            v_slow_count,
            10
        );
        v_alert_created := true;
    END IF;

    RETURN QUERY SELECT v_slow_count, v_alert_created;
END;
$$ language 'plpgsql';

-- Function to log security event (idempotent)
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR,
    p_severity VARCHAR,
    p_description TEXT,
    p_user_id BIGINT DEFAULT NULL,
    p_ip_address VARCHAR DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    v_event_id BIGINT;
BEGIN
    INSERT INTO security_events (
        event_type,
        severity,
        event_description,
        user_id,
        ip_address,
        event_data
    ) VALUES (
        p_event_type,
        p_severity,
        p_description,
        p_user_id,
        p_ip_address,
        p_event_data
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ language 'plpgsql';

-- Function to get active alerts summary (idempotent)
CREATE OR REPLACE FUNCTION get_active_alerts_summary()
RETURNS TABLE (
    severity VARCHAR,
    alert_type VARCHAR,
    alert_count BIGINT,
    oldest_alert TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ma.severity::VARCHAR,
        ma.alert_type::VARCHAR,
        COUNT(*)::BIGINT,
        MIN(ma.created_at)
    FROM monitoring_alerts ma
    WHERE ma.is_active = true
        AND ma.is_resolved = false
    GROUP BY ma.severity, ma.alert_type
    ORDER BY
        CASE ma.severity
            WHEN 'critical' THEN 1
            WHEN 'error' THEN 2
            WHEN 'warning' THEN 3
            ELSE 4
        END,
        COUNT(*) DESC;
END;
$$ language 'plpgsql' STABLE;

-- ============================================================================
-- MIGRATION AND ROLLBACK PROCEDURES
-- ============================================================================

-- Function to validate migration readiness (idempotent)
CREATE OR REPLACE FUNCTION validate_migration_readiness()
RETURNS TABLE (
    check_name VARCHAR,
    status VARCHAR,
    details TEXT
) AS $$
BEGIN
    -- Check pgvector extension
    RETURN QUERY
    SELECT
        'pgvector_extension'::VARCHAR,
        CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
            THEN 'OK' ELSE 'MISSING'
        END::VARCHAR,
        'Required for vector similarity search'::TEXT;

    -- Check database size
    RETURN QUERY
    SELECT
        'database_size'::VARCHAR,
        CASE WHEN pg_database_size(current_database()) < 10737418240  -- 10GB
            THEN 'OK' ELSE 'WARNING'
        END::VARCHAR,
        'Current size: ' || pg_size_pretty(pg_database_size(current_database()))::TEXT;

    -- Check connection availability
    RETURN QUERY
    SELECT
        'connection_capacity'::VARCHAR,
        CASE WHEN (
            SELECT count(*) FROM pg_stat_activity
        ) < (
            SELECT setting::INTEGER * 0.8 FROM pg_settings WHERE name = 'max_connections'
        )
            THEN 'OK' ELSE 'WARNING'
        END::VARCHAR,
        (SELECT count(*)::TEXT || ' of ' || setting || ' connections used'
         FROM pg_settings, pg_stat_activity WHERE name = 'max_connections')::TEXT;

    -- Check for blocking locks
    RETURN QUERY
    SELECT
        'blocking_locks'::VARCHAR,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_locks WHERE NOT granted
        )
            THEN 'WARNING' ELSE 'OK'
        END::VARCHAR,
        'Check for long-running transactions before migration'::TEXT;
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON TABLE security_events IS 'Security event logging for authentication, authorization, and threat detection';
COMMENT ON TABLE monitoring_alerts IS 'System monitoring alerts for performance, capacity, and health issues';

COMMENT ON FUNCTION check_embedding_failure_rate IS 'Monitor embedding generation failure rate and create alerts if threshold exceeded';
COMMENT ON FUNCTION check_slow_queries IS 'Detect slow queries and create performance alerts';
COMMENT ON FUNCTION log_security_event IS 'Log security-related events with severity and context';
COMMENT ON FUNCTION get_active_alerts_summary IS 'Get summary of active unresolved alerts grouped by severity and type';
COMMENT ON FUNCTION validate_migration_readiness IS 'Check system readiness for migration (extensions, capacity, locks)';
