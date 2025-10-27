-- Migration: Create search_history table for tracking search queries
-- Purpose: Enable trending searches, popular queries, and search analytics

-- +migrate Up
CREATE TABLE IF NOT EXISTS search_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    query TEXT NOT NULL,
    normalized_query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    filters JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for analytics queries
    INDEX idx_search_history_user_id (user_id, created_at DESC),
    INDEX idx_search_history_normalized_query (normalized_query),
    INDEX idx_search_history_created_at (created_at DESC),
    INDEX idx_search_history_query_gin (normalized_query gin_trgm_ops)
);

-- Create trigram extension for fuzzy text search (if not exists)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add comments
COMMENT ON TABLE search_history IS 'Search query history for analytics and trending';
COMMENT ON COLUMN search_history.id IS 'Unique identifier for search entry';
COMMENT ON COLUMN search_history.user_id IS 'ID of user performing search (NULL for anonymous)';
COMMENT ON COLUMN search_history.query IS 'Original search query as entered';
COMMENT ON COLUMN search_history.normalized_query IS 'Normalized query for deduplication (lowercase, trimmed)';
COMMENT ON COLUMN search_history.results_count IS 'Number of results returned';
COMMENT ON COLUMN search_history.filters IS 'Applied filters as JSON (type, subject, grade, etc.)';
COMMENT ON COLUMN search_history.ip_address IS 'IP address of the client';
COMMENT ON COLUMN search_history.created_at IS 'Timestamp when search was performed';

-- Create materialized view for trending searches (updated periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_searches AS
SELECT 
    normalized_query,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(created_at) as last_searched
FROM search_history
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY normalized_query
HAVING COUNT(*) >= 3
ORDER BY search_count DESC, last_searched DESC
LIMIT 100;

-- Create unique index on materialized view for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_trending_searches_query 
    ON trending_searches (normalized_query);

COMMENT ON MATERIALIZED VIEW trending_searches IS 'Top 100 trending searches in the last 7 days';

-- +migrate Down
DROP MATERIALIZED VIEW IF EXISTS trending_searches;
DROP TABLE IF EXISTS search_history;

