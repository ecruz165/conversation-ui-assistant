-- Create navigation sessions table for tracking active navigation sessions
CREATE TABLE navigation_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    conversation_id BIGINT,
    application_url VARCHAR(500) NOT NULL,
    current_page_url VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    session_data JSONB DEFAULT '{}',
    browser_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT navigation_sessions_status_check CHECK (status IN ('active', 'paused', 'completed', 'failed', 'timeout')),
    CONSTRAINT navigation_sessions_session_id_not_empty CHECK (LENGTH(TRIM(session_id)) > 0),
    CONSTRAINT navigation_sessions_application_url_format CHECK (application_url ~* '^https?://.*')
);

-- Create page snapshots table for storing page state information
CREATE TABLE page_snapshots (
    id BIGSERIAL PRIMARY KEY,
    navigation_session_id BIGINT NOT NULL,
    page_url VARCHAR(1000) NOT NULL,
    page_title VARCHAR(500),
    page_html TEXT,
    page_screenshot_url VARCHAR(500),
    dom_elements JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_snapshots_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT page_snapshots_page_url_not_empty CHECK (LENGTH(TRIM(page_url)) > 0)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for performance
CREATE INDEX idx_navigation_sessions_session_id ON navigation_sessions(session_id);
CREATE INDEX idx_navigation_sessions_user_id ON navigation_sessions(user_id);
CREATE INDEX idx_navigation_sessions_conversation_id ON navigation_sessions(conversation_id);
CREATE INDEX idx_navigation_sessions_status ON navigation_sessions(status);
CREATE INDEX idx_navigation_sessions_application_url ON navigation_sessions(application_url);
CREATE INDEX idx_navigation_sessions_created_at ON navigation_sessions(created_at);
CREATE INDEX idx_navigation_sessions_session_data ON navigation_sessions USING GIN(session_data);

CREATE INDEX idx_page_snapshots_navigation_session_id ON page_snapshots(navigation_session_id);
CREATE INDEX idx_page_snapshots_page_url ON page_snapshots(page_url);
CREATE INDEX idx_page_snapshots_created_at ON page_snapshots(created_at);
CREATE INDEX idx_page_snapshots_dom_elements ON page_snapshots USING GIN(dom_elements);

-- Create trigger to automatically update navigation_sessions.updated_at
CREATE TRIGGER update_navigation_sessions_updated_at
    BEFORE UPDATE ON navigation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update navigation session when page snapshot is added
CREATE OR REPLACE FUNCTION update_navigation_session_on_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE navigation_sessions
    SET updated_at = CURRENT_TIMESTAMP,
        current_page_url = NEW.page_url
    WHERE id = NEW.navigation_session_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update navigation session when new page snapshot is added
CREATE TRIGGER update_navigation_session_on_snapshot
    AFTER INSERT ON page_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_navigation_session_on_snapshot();

-- Add comments for documentation
COMMENT ON TABLE navigation_sessions IS 'Active navigation sessions tracking user interactions with web applications';
COMMENT ON COLUMN navigation_sessions.session_id IS 'Unique session identifier for tracking';
COMMENT ON COLUMN navigation_sessions.session_data IS 'Session state and context information';
COMMENT ON COLUMN navigation_sessions.browser_info IS 'Browser and device information';

COMMENT ON TABLE page_snapshots IS 'Snapshots of web pages during navigation sessions';
COMMENT ON COLUMN page_snapshots.dom_elements IS 'Extracted DOM elements and their properties';
COMMENT ON COLUMN page_snapshots.metadata IS 'Additional page metadata and analysis results';
