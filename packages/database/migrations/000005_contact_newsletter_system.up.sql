-- Migration: 000005_contact_newsletter_system
-- Description: Create tables for contact form submissions and newsletter subscriptions
-- Author: NyNus Team
-- Date: 2025-01-17

-- ===================================================================
-- CONTACT SUBMISSIONS TABLE
-- ===================================================================

-- Create enum for contact status
CREATE TYPE contact_status AS ENUM ('pending', 'read', 'replied', 'archived');

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    phone VARCHAR(50),
    status contact_status DEFAULT 'pending' NOT NULL,
    submission_id VARCHAR(100) UNIQUE NOT NULL, -- Unique submission identifier
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    replied_at TIMESTAMPTZ,
    reply_message TEXT,
    replied_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for contact_submissions
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_search ON contact_submissions USING GIN (
    to_tsvector('english', name || ' ' || email || ' ' || subject || ' ' || message)
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- ===================================================================

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'unsubscribed', 'bounced', 'pending');

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status subscription_status DEFAULT 'pending' NOT NULL,
    subscription_id VARCHAR(100) UNIQUE NOT NULL,
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_reason TEXT,
    ip_address INET,
    source VARCHAR(100), -- website, admin, import, etc.
    tags TEXT[], -- Array of tags for segmentation
    metadata JSONB, -- Additional metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for newsletter_subscriptions
CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_created_at ON newsletter_subscriptions(created_at DESC);
CREATE INDEX idx_newsletter_subscriptions_tags ON newsletter_subscriptions USING GIN(tags);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_newsletter_subscriptions_updated_at
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- NEWSLETTER CAMPAIGNS TABLE (for future use)
-- ===================================================================

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL, -- draft, scheduled, sending, sent
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    open_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    bounce_count INT DEFAULT 0,
    unsubscribe_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_newsletter_campaigns_updated_at
    BEFORE UPDATE ON newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON TABLE newsletter_subscriptions IS 'Manages newsletter email subscriptions';
COMMENT ON TABLE newsletter_campaigns IS 'Tracks newsletter campaigns and their statistics';