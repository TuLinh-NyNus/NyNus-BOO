-- Create login_attempts table for tracking failed login attempts (aligned with users.id TEXT)
CREATE TABLE IF NOT EXISTS login_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    attempt_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    
    -- Foreign key (optional - user might not exist)
    CONSTRAINT fk_login_attempt_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempt_time);

-- Create account_locks table for tracking locked accounts (aligned with users.id TEXT)
CREATE TABLE IF NOT EXISTS account_locks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL UNIQUE,
    locked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMPTZ NOT NULL,
    lock_reason VARCHAR(255),
    failed_attempts INT DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    unlocked_by TEXT,
    
    -- Foreign key
    CONSTRAINT fk_account_lock_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_account_lock_unlocker
        FOREIGN KEY (unlocked_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Index for finding active locks
CREATE INDEX IF NOT EXISTS idx_account_locks_active ON account_locks(user_id) WHERE unlocked_at IS NULL;
