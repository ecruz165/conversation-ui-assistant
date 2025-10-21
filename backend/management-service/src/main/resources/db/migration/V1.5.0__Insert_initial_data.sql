-- Insert default AI models (Idempotent)
INSERT INTO ai_models (name, provider, model_id, version, description, configuration, is_default)
SELECT * FROM (VALUES
    ('GPT-4 Turbo', 'openai', 'gpt-4-turbo-preview', '2024-01', 'OpenAI GPT-4 Turbo model for advanced conversations',
     '{"max_tokens": 4096, "temperature": 0.7, "top_p": 1.0, "frequency_penalty": 0.0, "presence_penalty": 0.0}'::jsonb, true),
    ('GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', '2024-01', 'OpenAI GPT-3.5 Turbo model for general conversations',
     '{"max_tokens": 4096, "temperature": 0.7, "top_p": 1.0, "frequency_penalty": 0.0, "presence_penalty": 0.0}'::jsonb, false),
    ('Claude 3 Sonnet', 'anthropic', 'claude-3-sonnet-20240229', '2024-02', 'Anthropic Claude 3 Sonnet model for balanced performance',
     '{"max_tokens": 4096, "temperature": 0.7, "top_p": 1.0}'::jsonb, false),
    ('Claude 3 Haiku', 'anthropic', 'claude-3-haiku-20240307', '2024-03', 'Anthropic Claude 3 Haiku model for fast responses',
     '{"max_tokens": 4096, "temperature": 0.7, "top_p": 1.0}'::jsonb, false)
) AS v(name, provider, model_id, version, description, configuration, is_default)
WHERE NOT EXISTS (
    SELECT 1 FROM ai_models WHERE ai_models.name = v.name
);

-- Insert default system settings (Idempotent)
INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
SELECT * FROM (VALUES
    ('app.name', 'Conversation UI Assistant', 'string', 'Application name displayed to users'),
    ('app.version', '1.0.0', 'string', 'Current application version'),
    ('app.environment', 'development', 'string', 'Current environment (development, staging, production)'),
    ('security.session_timeout_minutes', '60', 'number', 'User session timeout in minutes'),
    ('security.max_login_attempts', '5', 'number', 'Maximum failed login attempts before account lockout'),
    ('security.password_min_length', '8', 'number', 'Minimum password length requirement'),
    ('ai.default_model_timeout_seconds', '30', 'number', 'Default timeout for AI model responses'),
    ('ai.max_conversation_length', '100', 'number', 'Maximum number of messages per conversation'),
    ('ui.default_theme', 'light', 'string', 'Default UI theme for new users'),
    ('ui.enable_dark_mode', 'true', 'boolean', 'Whether dark mode is available'),
    ('notifications.email_enabled', 'true', 'boolean', 'Whether email notifications are enabled'),
    ('notifications.push_enabled', 'false', 'boolean', 'Whether push notifications are enabled'),
    ('features.navigation_assistance', 'true', 'boolean', 'Whether navigation assistance feature is enabled'),
    ('features.conversation_export', 'true', 'boolean', 'Whether conversation export feature is enabled'),
    ('features.multi_language', 'false', 'boolean', 'Whether multi-language support is enabled')
) AS v(setting_key, setting_value, setting_type, description)
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE system_settings.setting_key = v.setting_key
);

-- Insert sample applications for navigation (Idempotent)
INSERT INTO applications (name, base_url, description, configuration)
SELECT * FROM (VALUES
    ('GitHub', 'https://github.com', 'GitHub code repository platform',
     '{"selectors": {"login_button": "[href=\"/login\"]", "search_input": "[data-test-selector=\"nav-search-input\"]"}, "auth_required": true}'::jsonb),
    ('Google Drive', 'https://drive.google.com', 'Google Drive cloud storage service',
     '{"selectors": {"new_button": "[data-target=\"new\"]", "search_input": "[data-test-id=\"search-input\"]"}, "auth_required": true}'::jsonb),
    ('Slack', 'https://slack.com', 'Slack team communication platform',
     '{"selectors": {"workspace_input": "[data-qa=\"signin_domain_input\"]", "message_input": "[data-qa=\"message_input\"]"}, "auth_required": true}'::jsonb),
    ('Notion', 'https://notion.so', 'Notion workspace and note-taking application',
     '{"selectors": {"new_page": "[data-test-id=\"new-page\"]", "search": "[data-test-id=\"search-input\"]"}, "auth_required": true}'::jsonb),
    ('Demo App', 'http://localhost:3001', 'Local demo application for testing',
     '{"selectors": {"counter_button": "button", "title": "h1"}, "auth_required": false}'::jsonb)
) AS v(name, base_url, description, configuration)
WHERE NOT EXISTS (
    SELECT 1 FROM applications WHERE applications.name = v.name
);

-- Create default admin user (password should be changed in production) (Idempotent)
-- Password hash for 'admin123' - CHANGE THIS IN PRODUCTION!
INSERT INTO users (username, email, password_hash, first_name, last_name, is_verified)
SELECT 'admin', 'admin@conversation-ui.local', '$2a$10$rQ8QcQzQ8QzQ8QzQ8QzQ8O', 'System', 'Administrator', true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);

-- Get the admin user ID for creating preferences (Idempotent)
DO $$
DECLARE
    admin_user_id BIGINT;
    default_model_id BIGINT;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';
    SELECT id INTO default_model_id FROM ai_models WHERE is_default = true LIMIT 1;

    -- Insert default preferences for admin user (idempotent)
    IF admin_user_id IS NOT NULL AND default_model_id IS NOT NULL THEN
        INSERT INTO user_preferences (user_id, preferred_ai_model_id, ui_theme, language, timezone)
        SELECT admin_user_id, default_model_id, 'light', 'en', 'UTC'
        WHERE NOT EXISTS (
            SELECT 1 FROM user_preferences WHERE user_id = admin_user_id
        );
    END IF;
END $$;

-- Add initial audit log entry (Idempotent - will create duplicate entries if run multiple times)
INSERT INTO audit_logs (action, entity_type, details)
SELECT 'system_initialization', 'system', '{"message": "Database initialized with default data", "version": "1.5.0"}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs
    WHERE action = 'system_initialization'
    AND entity_type = 'system'
    AND details->>'version' = '1.5.0'
);

-- Add comments
COMMENT ON TABLE ai_models IS 'Default AI models are inserted for immediate use';
COMMENT ON TABLE system_settings IS 'Default system configuration for application startup';
COMMENT ON TABLE applications IS 'Sample applications for navigation testing and demonstration';
