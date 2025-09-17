-- Rollback migration: 000005_contact_newsletter_system
-- Description: Drop tables and types for contact and newsletter system

-- Drop newsletter_campaigns table
DROP TABLE IF EXISTS newsletter_campaigns CASCADE;

-- Drop newsletter_subscriptions table
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;

-- Drop contact_submissions table
DROP TABLE IF EXISTS contact_submissions CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS contact_status;