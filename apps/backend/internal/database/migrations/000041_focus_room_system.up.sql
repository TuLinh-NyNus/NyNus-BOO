-- ==========================================
-- Focus Room System - Phòng Học Tập Trung
-- Migration 000041
-- ==========================================

-- Focus Rooms Table
-- Quản lý các phòng học tập trung
CREATE TABLE IF NOT EXISTS focus_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('public', 'private', 'class')),
    max_participants INT DEFAULT 50 CHECK (max_participants > 0 AND max_participants <= 100),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}', -- timer defaults, sounds, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Room Participants Table (Active sessions)
-- Tracking người dùng đang trong phòng
CREATE TABLE IF NOT EXISTS room_participants (
    id SERIAL PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_focusing BOOLEAN DEFAULT false,
    current_task TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Focus Sessions Table (History)
-- Lưu trữ lịch sử các phiên học tập
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES focus_rooms(id) ON DELETE SET NULL,
    duration_seconds INT NOT NULL CHECK (duration_seconds >= 0),
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('focus', 'short_break', 'long_break')),
    subject_tag VARCHAR(100),
    task_description TEXT,
    completed BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Streaks Table
-- Tracking streak (chuỗi ngày học liên tục)
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INT DEFAULT 0 CHECK (longest_streak >= 0),
    last_study_date DATE,
    total_study_days INT DEFAULT 0 CHECK (total_study_days >= 0),
    total_focus_time_seconds BIGINT DEFAULT 0 CHECK (total_focus_time_seconds >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study Analytics Table (Aggregated daily)
-- Thống kê học tập theo ngày
CREATE TABLE IF NOT EXISTS study_analytics (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_focus_time_seconds INT DEFAULT 0 CHECK (total_focus_time_seconds >= 0),
    total_break_time_seconds INT DEFAULT 0 CHECK (total_break_time_seconds >= 0),
    sessions_completed INT DEFAULT 0 CHECK (sessions_completed >= 0),
    tasks_completed INT DEFAULT 0 CHECK (tasks_completed >= 0),
    most_productive_hour INT CHECK (most_productive_hour >= 0 AND most_productive_hour <= 23),
    subjects_studied JSONB DEFAULT '{}', -- {"math": 3600, "physics": 1800}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Leaderboard Table (Materialized view, refreshed periodically)
-- Bảng xếp hạng
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_start DATE NOT NULL,
    period_end DATE,
    total_focus_time_seconds BIGINT DEFAULT 0 CHECK (total_focus_time_seconds >= 0),
    rank INT CHECK (rank > 0),
    score DECIMAL(10,2) DEFAULT 0 CHECK (score >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, period, period_start)
);

-- Focus Tasks Table
-- Quản lý công việc cần làm
CREATE TABLE IF NOT EXISTS focus_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    subject_tag VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    estimated_pomodoros INT CHECK (estimated_pomodoros > 0),
    actual_pomodoros INT DEFAULT 0 CHECK (actual_pomodoros >= 0),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Room Chat Messages Table
-- Lưu trữ tin nhắn chat trong phòng
CREATE TABLE IF NOT EXISTS room_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'emoji')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Achievements Table
-- Rewards & Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL, -- first_session, 7_day_streak, 100h_total
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================

-- Focus Rooms Indexes
CREATE INDEX IF NOT EXISTS idx_focus_rooms_owner ON focus_rooms(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_focus_rooms_type ON focus_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_focus_rooms_active ON focus_rooms(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_focus_rooms_created ON focus_rooms(created_at DESC);

-- Room Participants Indexes
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants(room_id, joined_at);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_active ON room_participants(room_id) WHERE is_focusing = true;

-- Focus Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_room ON focus_sessions(room_id) WHERE room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_focus_sessions_type ON focus_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_subject ON focus_sessions(subject_tag) WHERE subject_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_focus_sessions_created ON focus_sessions(created_at DESC);

-- User Streaks Indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_longest ON user_streaks(longest_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_date ON user_streaks(last_study_date DESC);

-- Study Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_study_analytics_user_date ON study_analytics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_study_analytics_date ON study_analytics(date DESC);

-- Leaderboard Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_period_rank ON leaderboard(period, period_start, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(user_id, period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(period, period_start, score DESC);

-- Focus Tasks Indexes
CREATE INDEX IF NOT EXISTS idx_focus_tasks_user ON focus_tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_tasks_completed ON focus_tasks(is_completed, user_id);
CREATE INDEX IF NOT EXISTS idx_focus_tasks_subject ON focus_tasks(subject_tag) WHERE subject_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_focus_tasks_due ON focus_tasks(due_date) WHERE due_date IS NOT NULL AND is_completed = false;

-- Room Chat Messages Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON room_chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON room_chat_messages(user_id);

-- User Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements(achievement_type);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at on focus_rooms
CREATE OR REPLACE FUNCTION update_focus_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_focus_room_timestamp
BEFORE UPDATE ON focus_rooms
FOR EACH ROW
EXECUTE FUNCTION update_focus_room_timestamp();

-- Auto-update updated_at on focus_tasks
CREATE OR REPLACE FUNCTION update_focus_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_focus_task_timestamp
BEFORE UPDATE ON focus_tasks
FOR EACH ROW
EXECUTE FUNCTION update_focus_task_timestamp();

-- Auto-update last_activity_at on room_participants
CREATE OR REPLACE FUNCTION update_participant_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_activity
BEFORE UPDATE ON room_participants
FOR EACH ROW
EXECUTE FUNCTION update_participant_activity();

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to calculate contribution level (0-4)
CREATE OR REPLACE FUNCTION get_contribution_level(focus_time_seconds INT)
RETURNS INT AS $$
BEGIN
    IF focus_time_seconds = 0 THEN RETURN 0;
    ELSIF focus_time_seconds < 1800 THEN RETURN 1;  -- < 30 min
    ELSIF focus_time_seconds < 3600 THEN RETURN 2;  -- 30-60 min
    ELSIF focus_time_seconds < 7200 THEN RETURN 3;  -- 1-2h
    ELSE RETURN 4;  -- > 2h
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to cleanup old chat messages (30 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM room_chat_messages
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup inactive room participants
CREATE OR REPLACE FUNCTION cleanup_inactive_participants()
RETURNS void AS $$
BEGIN
    DELETE FROM room_participants
    WHERE last_activity_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE focus_rooms IS 'Phòng học tập trung - Quản lý các phòng học Pomodoro';
COMMENT ON TABLE room_participants IS 'Người tham gia phòng - Tracking real-time participants';
COMMENT ON TABLE focus_sessions IS 'Lịch sử phiên học - Lưu trữ tất cả focus sessions';
COMMENT ON TABLE user_streaks IS 'Streak học tập - GitHub-style contribution tracking';
COMMENT ON TABLE study_analytics IS 'Thống kê học tập - Daily aggregated statistics';
COMMENT ON TABLE leaderboard IS 'Bảng xếp hạng - Global/Class/School rankings';
COMMENT ON TABLE focus_tasks IS 'Công việc - Simple task management for students';
COMMENT ON TABLE room_chat_messages IS 'Chat trong phòng - Text-only communication';
COMMENT ON TABLE user_achievements IS 'Thành tựu - Gamification badges and rewards';

COMMENT ON COLUMN focus_rooms.settings IS 'JSONB settings: {"timer_defaults": {"focus": 1500, "short_break": 300, "long_break": 900}}';
COMMENT ON COLUMN study_analytics.subjects_studied IS 'JSONB tracking time per subject: {"math": 3600, "physics": 1800}';


