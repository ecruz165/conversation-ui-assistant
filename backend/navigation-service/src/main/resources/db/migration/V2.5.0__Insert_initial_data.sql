-- Insert sample navigation workflows for common patterns
INSERT INTO navigation_workflows (name, description, application_pattern, workflow_steps, tags, created_by) VALUES
('GitHub Login', 'Standard GitHub login workflow', 'https://github.com%',
 '[
    {"step": 1, "type": "navigate", "description": "Navigate to GitHub login page", "data": {"url": "https://github.com/login"}},
    {"step": 2, "type": "type", "description": "Enter username", "data": {"selector": "#login_field", "text": "{username}"}},
    {"step": 3, "type": "type", "description": "Enter password", "data": {"selector": "#password", "text": "{password}"}},
    {"step": 4, "type": "click", "description": "Click sign in button", "data": {"selector": "[type=\"submit\"]"}},
    {"step": 5, "type": "wait", "description": "Wait for dashboard to load", "data": {"timeout": 5000}}
 ]', 'login,github,authentication', 'system'),

('Google Drive File Upload', 'Upload a file to Google Drive', 'https://drive.google.com%',
 '[
    {"step": 1, "type": "click", "description": "Click New button", "data": {"selector": "[data-target=\"new\"]"}},
    {"step": 2, "type": "click", "description": "Click File upload", "data": {"selector": "[data-menu-item-id=\"file_upload\"]"}},
    {"step": 3, "type": "custom", "description": "Select file to upload", "data": {"action": "file_upload", "file_path": "{file_path}"}},
    {"step": 4, "type": "wait", "description": "Wait for upload to complete", "data": {"timeout": 30000}}
 ]', 'upload,google-drive,file-management', 'system'),

('Slack Send Message', 'Send a message in Slack channel', 'https://%.slack.com%',
 '[
    {"step": 1, "type": "click", "description": "Click on channel", "data": {"selector": "[data-qa=\"channel_sidebar_name_{channel}\"]"}},
    {"step": 2, "type": "type", "description": "Type message", "data": {"selector": "[data-qa=\"message_input\"]", "text": "{message}"}},
    {"step": 3, "type": "click", "description": "Send message", "data": {"selector": "[data-qa=\"send_message_button\"]"}}
 ]', 'messaging,slack,communication', 'system'),

('Notion Create Page', 'Create a new page in Notion', 'https://notion.so%',
 '[
    {"step": 1, "type": "click", "description": "Click New Page", "data": {"selector": "[data-test-id=\"new-page\"]"}},
    {"step": 2, "type": "type", "description": "Enter page title", "data": {"selector": "[data-content-editable-leaf=\"true\"]", "text": "{page_title}"}},
    {"step": 3, "type": "wait", "description": "Wait for page to initialize", "data": {"timeout": 2000}},
    {"step": 4, "type": "type", "description": "Add content", "data": {"selector": "[data-content-editable-leaf=\"true\"]:last", "text": "{content}"}}
 ]', 'note-taking,notion,productivity', 'system'),

('Demo App Counter Test', 'Test the demo app counter functionality', 'http://localhost:3001%',
 '[
    {"step": 1, "type": "navigate", "description": "Navigate to demo app", "data": {"url": "http://localhost:3001"}},
    {"step": 2, "type": "screenshot", "description": "Take initial screenshot", "data": {}},
    {"step": 3, "type": "click", "description": "Click counter button", "data": {"selector": "button"}},
    {"step": 4, "type": "verify", "description": "Verify counter increased", "data": {"selector": "button", "expected_text_contains": "count is"}},
    {"step": 5, "type": "screenshot", "description": "Take final screenshot", "data": {}}
 ]', 'testing,demo,counter', 'system');

-- Insert sample performance metrics for demonstration
DO $$
DECLARE
    sample_session_id BIGINT := 1; -- This would be a real session ID in practice
BEGIN
    -- Only insert if we have navigation sessions (this is sample data)
    IF EXISTS (SELECT 1 FROM navigation_sessions LIMIT 1) THEN
        INSERT INTO performance_metrics (navigation_session_id, metric_type, metric_name, metric_value, metric_unit, context_data) VALUES
        (sample_session_id, 'timing', 'page_load_time', 1250.5, 'milliseconds', '{"page": "login"}'),
        (sample_session_id, 'timing', 'element_detection_time', 89.2, 'milliseconds', '{"element_type": "button"}'),
        (sample_session_id, 'timing', 'click_response_time', 45.8, 'milliseconds', '{"element": "submit_button"}'),
        (sample_session_id, 'count', 'elements_detected', 23, 'count', '{"page": "dashboard"}'),
        (sample_session_id, 'score', 'element_confidence', 0.95, 'ratio', '{"element": "login_button"}'),
        (sample_session_id, 'rate', 'success_rate', 98.5, 'percentage', '{"workflow": "login_flow"}'
        );
    END IF;
END $$;

-- Insert sample element recognition cache entries
INSERT INTO element_recognition_cache (page_url_hash, element_description_hash, recognition_result, confidence_score, model_version, expires_at) VALUES
('a1b2c3d4e5f6', 'login_button_hash',
 '{"selector": "#login-button", "element_type": "button", "text": "Sign In", "attributes": {"class": "btn btn-primary"}}',
 0.95, 'v1.0.0', CURRENT_TIMESTAMP + INTERVAL '7 days'),

('a1b2c3d4e5f6', 'username_field_hash',
 '{"selector": "#username", "element_type": "input", "attributes": {"type": "text", "name": "username"}}',
 0.98, 'v1.0.0', CURRENT_TIMESTAMP + INTERVAL '7 days'),

('f6e5d4c3b2a1', 'search_box_hash',
 '{"selector": "[data-test-id=\"search-input\"]", "element_type": "input", "attributes": {"type": "search", "placeholder": "Search..."}}',
 0.92, 'v1.0.0', CURRENT_TIMESTAMP + INTERVAL '7 days'),

('b2c3d4e5f6a1', 'new_file_button_hash',
 '{"selector": "[data-target=\"new\"]", "element_type": "button", "text": "New", "attributes": {"role": "button"}}',
 0.89, 'v1.0.0', CURRENT_TIMESTAMP + INTERVAL '7 days');

-- Insert browser automation log samples
DO $$
DECLARE
    sample_session_id BIGINT := 1;
BEGIN
    IF EXISTS (SELECT 1 FROM navigation_sessions LIMIT 1) THEN
        INSERT INTO browser_automation_logs (navigation_session_id, log_level, log_source, log_message, log_data) VALUES
        (sample_session_id, 'INFO', 'WebDriver', 'Browser session started successfully', '{"browser": "chrome", "version": "120.0.0"}'),
        (sample_session_id, 'DEBUG', 'ElementDetector', 'Scanning page for interactive elements', '{"page_url": "https://example.com", "elements_found": 15}'),
        (sample_session_id, 'INFO', 'NavigationEngine', 'Navigation step completed successfully', '{"step": "click_button", "execution_time": 245}'),
        (sample_session_id, 'WARN', 'ElementDetector', 'Element selector had low confidence', '{"selector": ".dynamic-button", "confidence": 0.65}'),
        (sample_session_id, 'INFO', 'ScreenshotService', 'Screenshot captured successfully', '{"file_path": "/tmp/screenshot_123.png", "size": "1920x1080"}');
    END IF;
END $$;

-- Create initial session analytics entry template
DO $$
DECLARE
    sample_session_id BIGINT := 1;
BEGIN
    IF EXISTS (SELECT 1 FROM navigation_sessions LIMIT 1) THEN
        INSERT INTO session_analytics (
            navigation_session_id, total_steps, successful_steps, failed_steps,
            total_execution_time_ms, average_step_time_ms, page_load_time_ms,
            element_detection_time_ms, error_rate, success_rate,
            pages_visited, elements_interacted, screenshots_taken
        ) VALUES (
            sample_session_id, 5, 4, 1,
            12500, 2500.0, 1250,
            890, 20.0, 80.0,
            3, 8, 2
        );
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE navigation_workflows IS 'Sample workflows are provided for common web application patterns';
COMMENT ON TABLE element_recognition_cache IS 'Sample cache entries demonstrate the caching mechanism for AI recognition results';
COMMENT ON TABLE performance_metrics IS 'Sample metrics show the types of performance data collected during navigation';
