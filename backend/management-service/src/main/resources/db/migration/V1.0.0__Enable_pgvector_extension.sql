-- Enable pgvector extension for vector similarity search (Idempotent)
-- This extension provides support for vector data types and similarity search operations
-- Required for AI embeddings and semantic search functionality
--
-- NOTE: This extension must be pre-installed by a database superuser.
-- If the extension doesn't exist, this migration will attempt to create it,
-- but will fail gracefully if the user lacks superuser privileges.

-- Create extension if it doesn't exist (requires superuser on first run)
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is installed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) THEN
        RAISE EXCEPTION 'pgvector extension is not installed. Please have a database administrator install it with: CREATE EXTENSION vector;';
    END IF;
END $$;
