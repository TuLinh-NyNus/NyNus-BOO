-- ===================================================================
-- ROLLBACK: 000005_content_management_system
-- PURPOSE: Remove Content Management System
-- DATE: 2025-09-22
-- ===================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
DROP TRIGGER IF EXISTS update_newsletter_subscriptions_updated_at ON newsletter_subscriptions;
DROP TRIGGER IF EXISTS trigger_mapcode_versions_updated_at ON mapcode_versions;
DROP TRIGGER IF EXISTS trigger_mapcode_translations_updated_at ON mapcode_translations;

-- Drop functions
DROP FUNCTION IF EXISTS update_mapcode_updated_at();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS bulk_import_errors CASCADE;
DROP TABLE IF EXISTS parse_errors CASCADE;
DROP TABLE IF EXISTS mapcode_translations CASCADE;
DROP TABLE IF EXISTS mapcode_versions CASCADE;

SELECT 'Content Management System rollback completed!' as message;
