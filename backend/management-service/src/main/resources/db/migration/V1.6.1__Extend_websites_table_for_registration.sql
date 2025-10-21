-- Extend websites table for enhanced website registration (Idempotent)
-- Adds support for website type, PII tracking, contact details, and scannable domains

DO $$
BEGIN
    -- Add website_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'website_type'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN website_type VARCHAR(50) DEFAULT 'website'
        CONSTRAINT websites_website_type_check CHECK (
            website_type IN ('website', 'internal_app', 'mobile_app')
        );

        COMMENT ON COLUMN websites.website_type IS 'Type of website: website (public), internal_app (internal application), mobile_app (mobile application)';
    END IF;

    -- Add contains_pii column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'contains_pii'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN contains_pii BOOLEAN DEFAULT false NOT NULL;

        COMMENT ON COLUMN websites.contains_pii IS 'Whether this website contains Personally Identifiable Information';
    END IF;

    -- Add contact_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'contact_name'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN contact_name VARCHAR(255);

        COMMENT ON COLUMN websites.contact_name IS 'Name of the primary contact person for this website';
    END IF;

    -- Add contact_phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN contact_phone VARCHAR(50);

        COMMENT ON COLUMN websites.contact_phone IS 'Phone number of the primary contact person';
    END IF;

    -- Add contact_department column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'contact_department'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN contact_department VARCHAR(255);

        COMMENT ON COLUMN websites.contact_department IS 'Department of the primary contact person';
    END IF;

    -- Add scannable_domains column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'scannable_domains'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN scannable_domains JSONB DEFAULT '[]';

        COMMENT ON COLUMN websites.scannable_domains IS 'Array of domains that can be scanned/crawled for this website';
    END IF;

    -- Add primary_domain column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites' AND column_name = 'primary_domain'
    ) THEN
        ALTER TABLE websites
        ADD COLUMN primary_domain VARCHAR(500);

        COMMENT ON COLUMN websites.primary_domain IS 'Primary domain for this website (main entry point)';
    END IF;

    -- Make domain column nullable if it's not already (since primary_domain is the new main field)
    -- Check if domain column has NOT NULL constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'websites'
        AND column_name = 'domain'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE websites ALTER COLUMN domain DROP NOT NULL;
    END IF;

END $$;

-- Create indexes for new columns (idempotent)
CREATE INDEX IF NOT EXISTS idx_websites_website_type ON websites(website_type);
CREATE INDEX IF NOT EXISTS idx_websites_contains_pii ON websites(contains_pii);
CREATE INDEX IF NOT EXISTS idx_websites_primary_domain ON websites(primary_domain);

-- Create GIN index for scannable_domains JSONB array (idempotent)
CREATE INDEX IF NOT EXISTS idx_websites_scannable_domains ON websites USING GIN(scannable_domains);

-- Add comment on table
COMMENT ON TABLE websites IS 'Stores registered websites with extended metadata for registration, PII tracking, and multi-domain support';
