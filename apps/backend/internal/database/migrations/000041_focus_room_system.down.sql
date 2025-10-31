-- ==========================================
-- Focus Room System - Rollback
-- Migration 000041 DOWN
-- ==========================================

-- Drop tables in reverse order (respecting foreign key dependencies)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS room_chat_messages CASCADE;
DROP TABLE IF EXISTS focus_tasks CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF NOT EXISTS study_analytics CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS focus_sessions CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS focus_rooms CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_inactive_participants();
DROP FUNCTION IF EXISTS cleanup_old_chat_messages();
DROP FUNCTION IF EXISTS get_contribution_level(INT);
DROP FUNCTION IF EXISTS update_participant_activity();
DROP FUNCTION IF EXISTS update_focus_task_timestamp();
DROP FUNCTION IF EXISTS update_focus_room_timestamp();


