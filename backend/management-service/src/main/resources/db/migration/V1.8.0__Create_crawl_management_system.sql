-- Create crawl management system for tracking website crawling operations (Idempotent)

-- Create crawl_history table for tracking crawl operations (Idempotent)
CREATE TABLE IF NOT EXISTS crawl_history (
    id BIGSERIAL PRIMARY KEY,
    website_id BIGINT NOT NULL,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Timing metrics
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,

    -- Crawl configuration snapshot
    crawl_config JSONB DEFAULT '{}',

    -- Results summary
    total_pages_found INTEGER DEFAULT 0,
    total_pages_crawled INTEGER DEFAULT 0,
    total_pages_failed INTEGER DEFAULT 0,
    total_pages_skipped INTEGER DEFAULT 0,

    -- Error handling
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,

    -- Crawl metadata
    crawl_depth INTEGER DEFAULT 1,
    user_agent VARCHAR(500),
    initiated_by VARCHAR(255),
    crawl_metadata JSONB DEFAULT '{}',

    -- Standard fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_crawl_history_website_id FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT crawl_history_status_check CHECK (
        status IN ('pending', 'in-progress', 'completed', 'failed', 'cancelled', 'paused')
    ),
    CONSTRAINT crawl_history_duration_positive CHECK (duration_ms IS NULL OR duration_ms >= 0),
    CONSTRAINT crawl_history_depth_positive CHECK (crawl_depth > 0),
    CONSTRAINT crawl_history_retry_count_positive CHECK (retry_count >= 0),
    CONSTRAINT crawl_history_page_counts_positive CHECK (
        total_pages_found >= 0 AND
        total_pages_crawled >= 0 AND
        total_pages_failed >= 0 AND
        total_pages_skipped >= 0
    )
);

-- Create crawl_pages table for individual page crawl results (Idempotent)
CREATE TABLE IF NOT EXISTS crawl_pages (
    id BIGSERIAL PRIMARY KEY,
    crawl_history_id BIGINT NOT NULL,

    -- Page identification
    url VARCHAR(2000) NOT NULL,
    url_hash VARCHAR(64) NOT NULL,
    page_title VARCHAR(500),

    -- Content tracking
    content_hash VARCHAR(64),
    content_length INTEGER,
    content_type VARCHAR(100),

    -- HTTP response
    status_code INTEGER,
    response_time_ms INTEGER,
    redirect_url VARCHAR(2000),

    -- Page analysis
    has_forms BOOLEAN DEFAULT false,
    has_tables BOOLEAN DEFAULT false,
    has_images BOOLEAN DEFAULT false,
    has_videos BOOLEAN DEFAULT false,
    has_links BOOLEAN DEFAULT false,
    link_count INTEGER DEFAULT 0,

    -- SEO metadata
    meta_description TEXT,
    meta_keywords TEXT[],
    canonical_url VARCHAR(2000),
    robots_directive VARCHAR(100),

    -- Crawl depth and relationship
    depth_level INTEGER NOT NULL DEFAULT 0,
    parent_page_id BIGINT,

    -- Processing status
    is_processed BOOLEAN DEFAULT false,
    is_embedded BOOLEAN DEFAULT false,
    processing_error TEXT,

    -- Page metadata
    page_metadata JSONB DEFAULT '{}',

    -- Timestamps
    crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_crawl_pages_crawl_history_id FOREIGN KEY (crawl_history_id)
        REFERENCES crawl_history(id) ON DELETE CASCADE,
    CONSTRAINT fk_crawl_pages_parent_id FOREIGN KEY (parent_page_id)
        REFERENCES crawl_pages(id) ON DELETE SET NULL,
    CONSTRAINT crawl_pages_url_not_empty CHECK (LENGTH(TRIM(url)) > 0),
    CONSTRAINT crawl_pages_url_hash_not_empty CHECK (LENGTH(TRIM(url_hash)) > 0),
    CONSTRAINT crawl_pages_content_length_positive CHECK (content_length IS NULL OR content_length >= 0),
    CONSTRAINT crawl_pages_response_time_positive CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
    CONSTRAINT crawl_pages_status_code_valid CHECK (status_code IS NULL OR (status_code >= 100 AND status_code < 600)),
    CONSTRAINT crawl_pages_depth_positive CHECK (depth_level >= 0),
    CONSTRAINT crawl_pages_link_count_positive CHECK (link_count >= 0)
);

-- Create indexes for crawl_history table (idempotent)
CREATE INDEX IF NOT EXISTS idx_crawl_history_website_id ON crawl_history(website_id);
CREATE INDEX IF NOT EXISTS idx_crawl_history_status ON crawl_history(status);
CREATE INDEX IF NOT EXISTS idx_crawl_history_started_at ON crawl_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_history_completed_at ON crawl_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_history_created_at ON crawl_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_history_initiated_by ON crawl_history(initiated_by);

-- Partial index for active crawls (idempotent)
DROP INDEX IF EXISTS idx_crawl_history_in_progress;
CREATE INDEX idx_crawl_history_in_progress
    ON crawl_history(website_id, started_at DESC)
    WHERE status = 'in-progress';

-- Partial index for failed crawls (idempotent)
DROP INDEX IF EXISTS idx_crawl_history_failed;
CREATE INDEX idx_crawl_history_failed
    ON crawl_history(website_id, created_at DESC)
    WHERE status = 'failed';

-- GIN indexes for JSONB fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_crawl_history_crawl_config ON crawl_history USING GIN(crawl_config);
CREATE INDEX IF NOT EXISTS idx_crawl_history_error_details ON crawl_history USING GIN(error_details);
CREATE INDEX IF NOT EXISTS idx_crawl_history_crawl_metadata ON crawl_history USING GIN(crawl_metadata);

-- Composite indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_crawl_history_website_status ON crawl_history(website_id, status);
CREATE INDEX IF NOT EXISTS idx_crawl_history_website_started ON crawl_history(website_id, started_at DESC);

-- Create indexes for crawl_pages table (idempotent)
CREATE INDEX IF NOT EXISTS idx_crawl_pages_crawl_history_id ON crawl_pages(crawl_history_id);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_url_hash ON crawl_pages(url_hash);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_content_hash ON crawl_pages(content_hash);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_status_code ON crawl_pages(status_code);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_depth_level ON crawl_pages(depth_level);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_parent_id ON crawl_pages(parent_page_id);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_crawled_at ON crawl_pages(crawled_at DESC);

-- Partial indexes for processing status (idempotent)
DROP INDEX IF EXISTS idx_crawl_pages_not_processed;
CREATE INDEX idx_crawl_pages_not_processed
    ON crawl_pages(crawl_history_id, crawled_at)
    WHERE is_processed = false;

DROP INDEX IF EXISTS idx_crawl_pages_not_embedded;
CREATE INDEX idx_crawl_pages_not_embedded
    ON crawl_pages(crawl_history_id, crawled_at)
    WHERE is_embedded = false AND is_processed = true;

-- GIN indexes for JSONB and array fields (idempotent)
CREATE INDEX IF NOT EXISTS idx_crawl_pages_page_metadata ON crawl_pages USING GIN(page_metadata);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_meta_keywords ON crawl_pages USING GIN(meta_keywords);

-- Composite indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_crawl_pages_crawl_depth ON crawl_pages(crawl_history_id, depth_level);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_crawl_processed ON crawl_pages(crawl_history_id, is_processed);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_hash_crawl ON crawl_pages(url_hash, crawl_history_id);

-- Create triggers for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_crawl_history_updated_at ON crawl_history;
CREATE TRIGGER update_crawl_history_updated_at
    BEFORE UPDATE ON crawl_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate duration when crawl completes (idempotent)
CREATE OR REPLACE FUNCTION calculate_crawl_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_ms := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-calculate duration (idempotent)
DROP TRIGGER IF EXISTS calculate_crawl_duration_trigger ON crawl_history;
CREATE TRIGGER calculate_crawl_duration_trigger
    BEFORE INSERT OR UPDATE ON crawl_history
    FOR EACH ROW
    EXECUTE FUNCTION calculate_crawl_duration();

-- Function to update crawl_history summary counts (idempotent)
CREATE OR REPLACE FUNCTION update_crawl_summary_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE crawl_history
        SET
            total_pages_crawled = (
                SELECT COUNT(*)
                FROM crawl_pages
                WHERE crawl_history_id = NEW.crawl_history_id
                    AND status_code IS NOT NULL
            ),
            total_pages_failed = (
                SELECT COUNT(*)
                FROM crawl_pages
                WHERE crawl_history_id = NEW.crawl_history_id
                    AND (status_code >= 400 OR processing_error IS NOT NULL)
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.crawl_history_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update summary counts (idempotent)
DROP TRIGGER IF EXISTS update_crawl_summary_counts_trigger ON crawl_pages;
CREATE TRIGGER update_crawl_summary_counts_trigger
    AFTER INSERT OR UPDATE ON crawl_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_crawl_summary_counts();

-- Function to detect content changes (idempotent)
CREATE OR REPLACE FUNCTION detect_content_change(
    p_url_hash VARCHAR(64),
    p_new_content_hash VARCHAR(64)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_previous_hash VARCHAR(64);
BEGIN
    SELECT content_hash INTO v_previous_hash
    FROM crawl_pages
    WHERE url_hash = p_url_hash
        AND content_hash IS NOT NULL
    ORDER BY crawled_at DESC
    LIMIT 1;

    IF v_previous_hash IS NULL THEN
        RETURN false; -- First time seeing this URL
    END IF;

    RETURN v_previous_hash != p_new_content_hash;
END;
$$ language 'plpgsql' STABLE;

-- Function to get latest crawl status for a website (idempotent)
CREATE OR REPLACE FUNCTION get_latest_crawl_status(p_website_id BIGINT)
RETURNS TABLE (
    crawl_id BIGINT,
    status VARCHAR,
    started_at TIMESTAMP WITH TIME ZONE,
    total_pages INTEGER,
    progress_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ch.id,
        ch.status,
        ch.started_at,
        ch.total_pages_crawled,
        CASE
            WHEN ch.total_pages_found > 0 THEN
                ROUND((ch.total_pages_crawled::NUMERIC / ch.total_pages_found::NUMERIC) * 100, 2)
            ELSE 0
        END AS progress_percentage
    FROM crawl_history ch
    WHERE ch.website_id = p_website_id
    ORDER BY ch.created_at DESC
    LIMIT 1;
END;
$$ language 'plpgsql' STABLE;

-- Add comments for documentation
COMMENT ON TABLE crawl_history IS 'Historical record of website crawling operations with status and metrics';
COMMENT ON COLUMN crawl_history.status IS 'Current status: pending, in-progress, completed, failed, cancelled, paused';
COMMENT ON COLUMN crawl_history.duration_ms IS 'Total duration of crawl operation in milliseconds (auto-calculated)';
COMMENT ON COLUMN crawl_history.crawl_depth IS 'Maximum depth level for recursive crawling';
COMMENT ON COLUMN crawl_history.retry_count IS 'Number of retry attempts for failed crawls';

COMMENT ON TABLE crawl_pages IS 'Individual pages discovered and crawled during crawl operations';
COMMENT ON COLUMN crawl_pages.url_hash IS 'SHA-256 hash of URL for efficient duplicate detection';
COMMENT ON COLUMN crawl_pages.content_hash IS 'Hash of page content for change detection';
COMMENT ON COLUMN crawl_pages.depth_level IS 'Distance from start page (0 = start page, 1 = linked from start, etc.)';
COMMENT ON COLUMN crawl_pages.is_processed IS 'Whether page has been analyzed and processed';
COMMENT ON COLUMN crawl_pages.is_embedded IS 'Whether embeddings have been generated for this page';

COMMENT ON FUNCTION calculate_crawl_duration IS 'Auto-calculates crawl duration when completed_at is set';
COMMENT ON FUNCTION update_crawl_summary_counts IS 'Updates aggregate counts in crawl_history when pages are added/updated';
COMMENT ON FUNCTION detect_content_change IS 'Detects if page content has changed since last crawl';
COMMENT ON FUNCTION get_latest_crawl_status IS 'Retrieves latest crawl status and progress for a website';
