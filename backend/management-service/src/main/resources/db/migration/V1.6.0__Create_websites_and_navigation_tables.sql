-- Create websites table for managing registered web applications (Idempotent)
CREATE TABLE IF NOT EXISTS websites (
    id BIGSERIAL PRIMARY KEY,
    app_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(500) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    crawl_enabled BOOLEAN NOT NULL DEFAULT false,
    crawl_config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT websites_app_key_not_empty CHECK (LENGTH(TRIM(app_key)) > 0),
    CONSTRAINT websites_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT websites_domain_format CHECK (domain ~* '^https?://.*'),
    CONSTRAINT websites_contact_email_format CHECK (
        contact_email IS NULL OR
        contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Create navigation_links table for storing navigation information (Idempotent)
CREATE TABLE IF NOT EXISTS navigation_links (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,
    intent VARCHAR(255) NOT NULL,
    description TEXT,
    url_path VARCHAR(1000) NOT NULL,
    selector VARCHAR(500),
    action_type VARCHAR(50) NOT NULL DEFAULT 'click',
    parameters JSONB DEFAULT '{}',
    form_fields JSONB DEFAULT '{}',
    keywords TEXT[],
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    success_indicators JSONB DEFAULT '[]',
    failure_indicators JSONB DEFAULT '[]',
    wait_time INTEGER DEFAULT 0,
    requires_auth BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_navigation_links_website_id FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT navigation_links_intent_not_empty CHECK (LENGTH(TRIM(intent)) > 0),
    CONSTRAINT navigation_links_url_path_not_empty CHECK (LENGTH(TRIM(url_path)) > 0),
    CONSTRAINT navigation_links_action_type_check CHECK (
        action_type IN ('click', 'navigate', 'input', 'select', 'submit', 'wait', 'scroll', 'hover', 'custom')
    ),
    CONSTRAINT navigation_links_wait_time_positive CHECK (wait_time >= 0),
    CONSTRAINT navigation_links_unique_website_intent UNIQUE (website_id, intent)
);

-- Create indexes for websites table (idempotent)
CREATE INDEX IF NOT EXISTS idx_websites_app_key ON websites(app_key);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_websites_active ON websites(is_active);
CREATE INDEX IF NOT EXISTS idx_websites_crawl_enabled ON websites(crawl_enabled);
CREATE INDEX IF NOT EXISTS idx_websites_created_at ON websites(created_at);
CREATE INDEX IF NOT EXISTS idx_websites_crawl_config ON websites USING GIN(crawl_config);
CREATE INDEX IF NOT EXISTS idx_websites_metadata ON websites USING GIN(metadata);

-- Create indexes for navigation_links table (idempotent)
CREATE INDEX IF NOT EXISTS idx_navigation_links_website_id ON navigation_links(website_id);
CREATE INDEX IF NOT EXISTS idx_navigation_links_intent ON navigation_links(intent);
CREATE INDEX IF NOT EXISTS idx_navigation_links_active ON navigation_links(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_links_priority ON navigation_links(priority DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_links_action_type ON navigation_links(action_type);
CREATE INDEX IF NOT EXISTS idx_navigation_links_requires_auth ON navigation_links(requires_auth);
CREATE INDEX IF NOT EXISTS idx_navigation_links_created_at ON navigation_links(created_at);

-- GIN indexes for JSONB and array fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_navigation_links_parameters ON navigation_links USING GIN(parameters);
CREATE INDEX IF NOT EXISTS idx_navigation_links_form_fields ON navigation_links USING GIN(form_fields);
CREATE INDEX IF NOT EXISTS idx_navigation_links_keywords ON navigation_links USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_navigation_links_success_indicators ON navigation_links USING GIN(success_indicators);
CREATE INDEX IF NOT EXISTS idx_navigation_links_metadata ON navigation_links USING GIN(metadata);

-- Composite indexes for common query patterns (idempotent)
CREATE INDEX IF NOT EXISTS idx_navigation_links_website_active ON navigation_links(website_id, is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_links_website_intent_active ON navigation_links(website_id, intent, is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_links_website_priority ON navigation_links(website_id, priority DESC, is_active);

-- Create triggers for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
CREATE TRIGGER update_websites_updated_at
    BEFORE UPDATE ON websites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_navigation_links_updated_at ON navigation_links;
CREATE TRIGGER update_navigation_links_updated_at
    BEFORE UPDATE ON navigation_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate app_key if not provided (idempotent)
CREATE OR REPLACE FUNCTION generate_app_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.app_key IS NULL OR NEW.app_key = '' THEN
        NEW.app_key := 'app_' || LOWER(REPLACE(NEW.name, ' ', '_')) || '_' ||
                       SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-generate app_key (idempotent)
DROP TRIGGER IF EXISTS generate_app_key_trigger ON websites;
CREATE TRIGGER generate_app_key_trigger
    BEFORE INSERT ON websites
    FOR EACH ROW
    EXECUTE FUNCTION generate_app_key();

-- Add comments for documentation
COMMENT ON TABLE websites IS 'Registered web applications that can be navigated by the AI assistant';
COMMENT ON COLUMN websites.app_key IS 'Unique application key for API authentication and identification';
COMMENT ON COLUMN websites.domain IS 'Base domain URL of the website (e.g., https://example.com)';
COMMENT ON COLUMN websites.crawl_enabled IS 'Whether automatic crawling is enabled for this website';
COMMENT ON COLUMN websites.crawl_config IS 'Configuration for web crawling (depth, frequency, etc.)';

COMMENT ON TABLE navigation_links IS 'Navigation actions and links for automated web application interaction';
COMMENT ON COLUMN navigation_links.intent IS 'User intent or action description (e.g., "search products", "add to cart")';
COMMENT ON COLUMN navigation_links.url_path IS 'URL path or pattern for this navigation action';
COMMENT ON COLUMN navigation_links.selector IS 'CSS selector or XPath for locating the element';
COMMENT ON COLUMN navigation_links.action_type IS 'Type of action to perform (click, navigate, input, etc.)';
COMMENT ON COLUMN navigation_links.parameters IS 'Dynamic parameters for the action (e.g., search query)';
COMMENT ON COLUMN navigation_links.form_fields IS 'Form field mappings for input actions';
COMMENT ON COLUMN navigation_links.keywords IS 'Keywords for search and intent matching';
COMMENT ON COLUMN navigation_links.success_indicators IS 'Elements or patterns that indicate successful navigation';
COMMENT ON COLUMN navigation_links.failure_indicators IS 'Elements or patterns that indicate navigation failure';
COMMENT ON COLUMN navigation_links.wait_time IS 'Milliseconds to wait before or after action execution';
