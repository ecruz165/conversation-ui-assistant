-- Create audit logs table for system auditing and monitoring
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT audit_logs_action_not_empty CHECK (LENGTH(TRIM(action)) > 0)
);

-- Create system settings table for application-wide configuration
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) NOT NULL DEFAULT 'string',
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT system_settings_key_not_empty CHECK (LENGTH(TRIM(setting_key)) > 0),
    CONSTRAINT system_settings_type_check CHECK (setting_type IN ('string', 'number', 'boolean', 'json'))
);

-- Create user sessions table for session management
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_sessions_token_not_empty CHECK (LENGTH(TRIM(session_token)) > 0)
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_type ON system_settings(setting_type);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_accessed ON user_sessions(last_accessed_at);

-- Create triggers for updated_at
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'System audit trail for security and compliance';
COMMENT ON TABLE system_settings IS 'Application-wide configuration settings';
COMMENT ON TABLE user_sessions IS 'Active user sessions for authentication';

COMMENT ON COLUMN audit_logs.action IS 'Action performed (login, logout, create, update, delete, etc.)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (user, conversation, etc.)';
COMMENT ON COLUMN audit_logs.details IS 'Additional details about the action in JSON format';

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Function to clean up expired and inactive user sessions';
