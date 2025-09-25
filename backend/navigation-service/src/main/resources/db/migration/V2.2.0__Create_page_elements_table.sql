-- Create page elements table for caching identified page elements
CREATE TABLE page_elements (
    id BIGSERIAL PRIMARY KEY,
    page_snapshot_id BIGINT NOT NULL,
    element_type VARCHAR(50) NOT NULL,
    element_tag VARCHAR(20) NOT NULL,
    element_id VARCHAR(255),
    element_class VARCHAR(500),
    element_name VARCHAR(255),
    element_text TEXT,
    element_value VARCHAR(1000),
    xpath VARCHAR(1000),
    css_selector VARCHAR(1000),
    attributes JSONB DEFAULT '{}',
    position_data JSONB DEFAULT '{}',
    is_interactive BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_page_elements_page_snapshot_id FOREIGN KEY (page_snapshot_id) REFERENCES page_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT page_elements_element_type_check CHECK (element_type IN ('button', 'input', 'link', 'text', 'image', 'form', 'select', 'textarea', 'div', 'span', 'other')),
    CONSTRAINT page_elements_confidence_score_range CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0)
);

-- Create element interactions table for tracking user interactions with elements
CREATE TABLE element_interactions (
    id BIGSERIAL PRIMARY KEY,
    navigation_session_id BIGINT NOT NULL,
    page_element_id BIGINT,
    interaction_type VARCHAR(30) NOT NULL,
    interaction_data JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_element_interactions_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_element_interactions_page_element_id FOREIGN KEY (page_element_id) REFERENCES page_elements(id) ON DELETE SET NULL,
    CONSTRAINT element_interactions_type_check CHECK (interaction_type IN ('click', 'type', 'select', 'hover', 'scroll', 'wait', 'navigate', 'screenshot', 'extract')),
    CONSTRAINT element_interactions_execution_time_positive CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0)
);

-- Create element selectors table for storing different ways to identify elements
CREATE TABLE element_selectors (
    id BIGSERIAL PRIMARY KEY,
    page_element_id BIGINT NOT NULL,
    selector_type VARCHAR(20) NOT NULL,
    selector_value VARCHAR(1000) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_element_selectors_page_element_id FOREIGN KEY (page_element_id) REFERENCES page_elements(id) ON DELETE CASCADE,
    CONSTRAINT element_selectors_type_check CHECK (selector_type IN ('id', 'class', 'name', 'xpath', 'css', 'text', 'attribute')),
    CONSTRAINT element_selectors_priority_positive CHECK (priority > 0),
    CONSTRAINT element_selectors_success_rate_range CHECK (success_rate >= 0.0 AND success_rate <= 100.0)
);

-- Create indexes for performance
CREATE INDEX idx_page_elements_page_snapshot_id ON page_elements(page_snapshot_id);
CREATE INDEX idx_page_elements_element_type ON page_elements(element_type);
CREATE INDEX idx_page_elements_element_tag ON page_elements(element_tag);
CREATE INDEX idx_page_elements_element_id ON page_elements(element_id);
CREATE INDEX idx_page_elements_interactive ON page_elements(is_interactive);
CREATE INDEX idx_page_elements_visible ON page_elements(is_visible);
CREATE INDEX idx_page_elements_confidence ON page_elements(confidence_score);
CREATE INDEX idx_page_elements_attributes ON page_elements USING GIN(attributes);
CREATE INDEX idx_page_elements_position ON page_elements USING GIN(position_data);

CREATE INDEX idx_element_interactions_navigation_session_id ON element_interactions(navigation_session_id);
CREATE INDEX idx_element_interactions_page_element_id ON element_interactions(page_element_id);
CREATE INDEX idx_element_interactions_type ON element_interactions(interaction_type);
CREATE INDEX idx_element_interactions_success ON element_interactions(success);
CREATE INDEX idx_element_interactions_created_at ON element_interactions(created_at);

CREATE INDEX idx_element_selectors_page_element_id ON element_selectors(page_element_id);
CREATE INDEX idx_element_selectors_type ON element_selectors(selector_type);
CREATE INDEX idx_element_selectors_primary ON element_selectors(is_primary);
CREATE INDEX idx_element_selectors_success_rate ON element_selectors(success_rate);
CREATE INDEX idx_element_selectors_last_used ON element_selectors(last_used_at);

-- Add comments for documentation
COMMENT ON TABLE page_elements IS 'Identified and cached page elements for navigation';
COMMENT ON COLUMN page_elements.element_type IS 'Type of element (button, input, link, etc.)';
COMMENT ON COLUMN page_elements.confidence_score IS 'AI confidence score for element identification (0.0-1.0)';
COMMENT ON COLUMN page_elements.position_data IS 'Element position and size information';

COMMENT ON TABLE element_interactions IS 'Log of user interactions with page elements';
COMMENT ON COLUMN element_interactions.interaction_type IS 'Type of interaction performed';
COMMENT ON COLUMN element_interactions.execution_time_ms IS 'Time taken to execute the interaction in milliseconds';

COMMENT ON TABLE element_selectors IS 'Different selector strategies for identifying elements';
COMMENT ON COLUMN element_selectors.success_rate IS 'Success rate percentage for this selector';
COMMENT ON COLUMN element_selectors.priority IS 'Priority order for trying selectors (1 = highest)';
