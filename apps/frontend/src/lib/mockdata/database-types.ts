/**
 * Database-Aligned Types
 * 
 * Interfaces that exactly match the database schema
 * Based on migration files: 000001_initial_schema.up.sql & 000002_question_bank_system.up.sql
 */

import {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  CodeFormat,
  ImageType,
  ImageStatus,
  FeedbackType,
  TimestampFields
} from './core-types';

// ===== DATABASE TABLES =====

/**
 * Users table - matches 000001_initial_schema.up.sql
 */
export interface DatabaseUser extends TimestampFields {
  id: string;                    // UUID PRIMARY KEY (as string in TypeScript)
  email: string;                 // VARCHAR(255) UNIQUE NOT NULL
  password_hash: string;         // VARCHAR(255) NOT NULL
  first_name: string;            // VARCHAR(100) NOT NULL
  last_name: string;             // VARCHAR(100) NOT NULL
  role: string;                  // VARCHAR(20) NOT NULL DEFAULT 'student'
  is_active: boolean;            // BOOLEAN NOT NULL DEFAULT true
}

/**
 * QuestionCode table - matches 000002_question_bank_system.up.sql
 */
export interface DatabaseQuestionCode extends TimestampFields {
  code: string;                  // VARCHAR(7) PRIMARY KEY
  format: CodeFormat;            // CodeFormat NOT NULL
  grade: string;                 // CHAR(1) NOT NULL
  subject: string;               // CHAR(1) NOT NULL
  chapter: string;               // CHAR(1) NOT NULL
  lesson: string;                // CHAR(1) NOT NULL
  form: string | null;           // CHAR(1)
  level: string;                 // CHAR(1) NOT NULL
}

/**
 * Question table - matches 000002_question_bank_system.up.sql
 */
export interface DatabaseQuestion extends TimestampFields {
  id: string;                    // TEXT PRIMARY KEY
  rawContent: string;            // TEXT NOT NULL
  content: string;               // TEXT NOT NULL
  subcount: string | null;       // VARCHAR(10)
  type: QuestionType;            // QuestionType NOT NULL
  source: string | null;         // TEXT
  answers: string[] | Record<string, unknown> | null;                  // JSONB
  correctAnswer: string | string[] | Record<string, unknown> | null;            // JSONB
  solution: string | null;       // TEXT
  tag: string[];                 // TEXT[] DEFAULT '{}' (note: 'tag' not 'tags')
  usageCount: number;            // INT DEFAULT 0
  creator: string;               // TEXT DEFAULT 'ADMIN'
  status: QuestionStatus;        // QuestionStatus DEFAULT 'ACTIVE'
  feedback: number;              // INT DEFAULT 0
  difficulty: QuestionDifficulty; // QuestionDifficulty DEFAULT 'MEDIUM'
  questionCodeId: string;        // VARCHAR(7) NOT NULL REFERENCES QuestionCode(code)
}

/**
 * QuestionImage table - matches 000002_question_bank_system.up.sql
 */
export interface DatabaseQuestionImage extends TimestampFields {
  id: string;                    // TEXT PRIMARY KEY
  questionId: string;            // TEXT NOT NULL REFERENCES Question(id)
  imageType: ImageType;          // ImageType NOT NULL
  imagePath: string | null;      // TEXT
  driveUrl: string | null;       // TEXT
  driveFileId: string | null;    // VARCHAR(100)
  status: ImageStatus;           // ImageStatus DEFAULT 'PENDING'
}

/**
 * QuestionTag table - matches 000002_question_bank_system.up.sql
 */
export interface DatabaseQuestionTag {
  id: string;                    // TEXT PRIMARY KEY
  questionId: string;            // TEXT NOT NULL REFERENCES Question(id)
  tagName: string;               // VARCHAR(100) NOT NULL
  created_at: Date;              // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  // Note: No updated_at field in this table
}

/**
 * QuestionFeedback table - matches 000002_question_bank_system.up.sql
 */
export interface DatabaseQuestionFeedback {
  id: string;                    // TEXT PRIMARY KEY
  questionId: string;            // TEXT NOT NULL REFERENCES Question(id)
  userId: string | null;         // TEXT
  feedbackType: FeedbackType;    // FeedbackType NOT NULL
  content: string | null;        // TEXT
  rating: number | null;         // INT
  created_at: Date;              // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  // Note: No updated_at field in this table
}

// ===== EXTENDED TYPES FOR ADMIN FEATURES =====

/**
 * Extended User for admin features (not in database yet)
 * These fields would need to be added to users table in future migration
 */
export interface ExtendedDatabaseUser extends DatabaseUser {
  // Additional fields for admin features
  phone?: string;
  bio?: string;
  avatar?: string;
  last_login_at?: Date;
  max_concurrent_ips?: number;
  admin_notes?: string;
}

/**
 * User Sessions table (would need new migration)
 */
export interface DatabaseUserSession extends TimestampFields {
  id: string;                    // TEXT PRIMARY KEY
  user_id: string;               // TEXT NOT NULL REFERENCES users(id)
  session_token: string;         // TEXT NOT NULL UNIQUE
  ip_address: string;            // INET NOT NULL
  user_agent: string | null;     // TEXT
  device_fingerprint: string | null; // TEXT
  location: string | null;       // TEXT
  is_active: boolean;            // BOOLEAN DEFAULT true
  last_activity: Date;           // TIMESTAMPTZ NOT NULL
  expires_at: Date;              // TIMESTAMPTZ NOT NULL
}

/**
 * OAuth Accounts table (would need new migration)
 */
export interface DatabaseOAuthAccount extends TimestampFields {
  id: string;                    // TEXT PRIMARY KEY
  user_id: string;               // TEXT NOT NULL REFERENCES users(id)
  provider: string;              // VARCHAR(50) NOT NULL
  provider_account_id: string;   // TEXT NOT NULL
  type: string;                  // VARCHAR(20) NOT NULL
  scope: string | null;          // TEXT
  access_token: string | null;   // TEXT
  refresh_token: string | null;  // TEXT
  id_token: string | null;       // TEXT
  expires_at: number | null;     // BIGINT
  token_type: string | null;     // VARCHAR(50)
}

/**
 * Resource Access table (would need new migration)
 */
export interface DatabaseResourceAccess {
  id: string;                    // TEXT PRIMARY KEY
  user_id: string;               // TEXT NOT NULL REFERENCES users(id)
  resource_type: string;         // VARCHAR(20) NOT NULL
  resource_id: string;           // TEXT NOT NULL
  action: string;                // VARCHAR(20) NOT NULL
  ip_address: string;            // INET NOT NULL
  user_agent: string | null;     // TEXT
  session_token: string | null;  // TEXT
  is_valid_access: boolean;      // BOOLEAN DEFAULT true
  risk_score: number;            // INT DEFAULT 0
  duration: number | null;       // INT (seconds)
  metadata: Record<string, unknown>;                 // JSONB
  created_at: Date;              // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
}

/**
 * User Preferences table (would need new migration)
 */
export interface DatabaseUserPreferences {
  id: string;                    // TEXT PRIMARY KEY
  user_id: string;               // TEXT NOT NULL REFERENCES users(id) UNIQUE
  email_notifications: boolean;  // BOOLEAN DEFAULT true
  push_notifications: boolean;   // BOOLEAN DEFAULT true
  sms_notifications: boolean;    // BOOLEAN DEFAULT false
  auto_play_videos: boolean;     // BOOLEAN DEFAULT true
  default_video_quality: string; // VARCHAR(10) DEFAULT '720p'
  playback_speed: number;        // DECIMAL(3,2) DEFAULT 1.0
  profile_visibility: string;    // VARCHAR(20) DEFAULT 'PUBLIC'
  show_online_status: boolean;   // BOOLEAN DEFAULT true
  allow_direct_messages: boolean; // BOOLEAN DEFAULT true
  timezone: string;              // VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh'
  language: string;              // VARCHAR(5) DEFAULT 'vi'
  date_format: string;           // VARCHAR(20) DEFAULT 'DD/MM/YYYY'
  updated_at: Date;              // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
}

/**
 * Audit Logs table (would need new migration)
 */
export interface DatabaseAuditLog {
  id: string;                    // TEXT PRIMARY KEY
  user_id: string | null;        // TEXT REFERENCES users(id)
  action: string;                // VARCHAR(50) NOT NULL
  resource: string | null;       // VARCHAR(50)
  resource_id: string | null;    // TEXT
  old_values: Record<string, unknown>;               // JSONB
  new_values: Record<string, unknown>;               // JSONB
  ip_address: string;            // INET NOT NULL
  user_agent: string | null;     // TEXT
  session_id: string | null;     // TEXT
  success: boolean;              // BOOLEAN NOT NULL
  error_message: string | null;  // TEXT
  metadata: Record<string, unknown>;                 // JSONB
  created_at: Date;              // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
}

/**
 * Notifications table (would need new migration)
 */
export interface DatabaseNotification {
  id: string;                    // TEXT PRIMARY KEY
  user_id: string;               // TEXT NOT NULL REFERENCES users(id)
  type: string;                  // VARCHAR(20) NOT NULL
  title: string;                 // VARCHAR(255) NOT NULL
  message: string;               // TEXT NOT NULL
  data: Record<string, unknown>;                     // JSONB
  is_read: boolean;              // BOOLEAN DEFAULT false
  read_at: Date | null;          // TIMESTAMPTZ
  created_at: Date;              // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  expires_at: Date | null;       // TIMESTAMPTZ
}

// ===== MIGRATION SUGGESTIONS =====

/**
 * SQL migrations needed to align database with mockdata features
 */
export const SUGGESTED_MIGRATIONS = {
  // Add fields to existing users table
  ALTER_USERS_TABLE: `
    ALTER TABLE users 
    ADD COLUMN phone VARCHAR(20),
    ADD COLUMN bio TEXT,
    ADD COLUMN avatar TEXT,
    ADD COLUMN last_login_at TIMESTAMPTZ,
    ADD COLUMN max_concurrent_ips INT DEFAULT 1,
    ADD COLUMN admin_notes TEXT;
  `,

  // Create user sessions table
  CREATE_USER_SESSIONS: `
    CREATE TABLE user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL UNIQUE,
      ip_address INET NOT NULL,
      user_agent TEXT,
      device_fingerprint TEXT,
      location TEXT,
      is_active BOOLEAN DEFAULT true,
      last_activity TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Create oauth accounts table
  CREATE_OAUTH_ACCOUNTS: `
    CREATE TABLE oauth_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      provider_account_id TEXT NOT NULL,
      type VARCHAR(20) NOT NULL,
      scope TEXT,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      expires_at BIGINT,
      token_type VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider, provider_account_id)
    );
  `,

  // Create resource access table
  CREATE_RESOURCE_ACCESS: `
    CREATE TABLE resource_access (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resource_type VARCHAR(20) NOT NULL,
      resource_id TEXT NOT NULL,
      action VARCHAR(20) NOT NULL,
      ip_address INET NOT NULL,
      user_agent TEXT,
      session_token TEXT,
      is_valid_access BOOLEAN DEFAULT true,
      risk_score INT DEFAULT 0,
      duration INT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Create user preferences table
  CREATE_USER_PREFERENCES: `
    CREATE TABLE user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      email_notifications BOOLEAN DEFAULT true,
      push_notifications BOOLEAN DEFAULT true,
      sms_notifications BOOLEAN DEFAULT false,
      auto_play_videos BOOLEAN DEFAULT true,
      default_video_quality VARCHAR(10) DEFAULT '720p',
      playback_speed DECIMAL(3,2) DEFAULT 1.0,
      profile_visibility VARCHAR(20) DEFAULT 'PUBLIC',
      show_online_status BOOLEAN DEFAULT true,
      allow_direct_messages BOOLEAN DEFAULT true,
      timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
      language VARCHAR(5) DEFAULT 'vi',
      date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Create audit logs table
  CREATE_AUDIT_LOGS: `
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action VARCHAR(50) NOT NULL,
      resource VARCHAR(50),
      resource_id TEXT,
      old_values JSONB,
      new_values JSONB,
      ip_address INET NOT NULL,
      user_agent TEXT,
      session_id TEXT,
      success BOOLEAN NOT NULL,
      error_message TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Create notifications table
  CREATE_NOTIFICATIONS: `
    CREATE TABLE notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMPTZ
    );
  `
} as const;
