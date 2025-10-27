-- Migration: Create audit_logs table for tracking sensitive operations
-- Purpose: Store audit trail for compliance and security monitoring

-- +migrate Up
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_entity (entity, entity_id),
    INDEX idx_audit_logs_created_at (created_at DESC),
    INDEX idx_audit_logs_user_action (user_id, action, created_at DESC)
);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for sensitive operations';
COMMENT ON COLUMN audit_logs.id IS 'Unique identifier for audit log entry';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of user performing the action';
COMMENT ON COLUMN audit_logs.user_role IS 'Role of user at time of action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (APPROVE, REJECT, DELETE, etc.)';
COMMENT ON COLUMN audit_logs.entity IS 'Type of entity affected (library_item, exam, tag, etc.)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.description IS 'Human-readable description of the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context as JSON (reasons, old/new values, etc.)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string of the client';
COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the action occurred';

-- Create partition by month for better performance (optional, can be enabled later)
-- CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- +migrate Down
DROP TABLE IF EXISTS audit_logs;

