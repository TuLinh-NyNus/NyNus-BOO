-- Create notifications table (aligned with AUTH_COMPLETE_GUIDE.md design)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,

    -- Notification Content
    type TEXT NOT NULL CHECK (type IN ('SECURITY_ALERT', 'COURSE_UPDATE', 'SYSTEM_MESSAGE', 'ACHIEVEMENT', 'SOCIAL', 'PAYMENT')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,

    -- Status Tracking
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Lifecycle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    -- Foreign key
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Indexes for performance (from AUTH_COMPLETE_GUIDE.md)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);