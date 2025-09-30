/**
 * Centralized Timeout and Limit Constants
 * Consolidates all magic numbers used across the NyNus application
 */

// ===== TIMEOUT CONSTANTS =====

export const TIMEOUTS = {
  // Debounce timeouts
  DEBOUNCE_MS: 300,
  SEARCH_DEBOUNCE_MS: 300,
  
  // API timeouts
  API_TIMEOUT_MS: 5000,
  LONG_TIMEOUT_MS: 30000,
  VALIDATION_TIMEOUT_MS: 5000,
  SEARCH_TIMEOUT_MS: 5000,
  
  // Authentication timeouts
  AUTH_TIMEOUT_MS: 5000,
  UPLOAD_TIMEOUT_MS: 30000,
  
  // Cache timeouts
  DEFAULT_STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  DEFAULT_CACHE_TIME_MS: 10 * 60 * 1000, // 10 minutes
  PREFETCH_STALE_TIME_MS: 2 * 60 * 1000, // 2 minutes
  
  // Refresh intervals
  REALTIME_REFRESH_MS: 30 * 1000, // 30 seconds
  STATIC_REFRESH_MS: 15 * 60 * 1000, // 15 minutes
  DASHBOARD_REFRESH_MS: 30000,
  NOTIFICATIONS_REFRESH_MS: 60000,
  SECURITY_REFRESH_MS: 10000,
  
  // Notification timeouts
  NOTIFICATION_TIMEOUT_MS: 5000,
} as const;

// ===== LIMIT CONSTANTS =====

export const LIMITS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  ADMIN_DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File uploads
  MAX_FILE_SIZE_MB: 10,
  MAX_UPLOAD_SIZE_MB: 50,
  MAX_FILES_COUNT: 5,
  MAX_TOTAL_SIZE_MB: 50,
  MIN_FILE_SIZE: 1,
  
  // Content limits
  MAX_QUESTION_LENGTH: 5000,
  MAX_SOLUTION_LENGTH: 10000,
  MAX_TAGS: 10,
  MAX_CATEGORIES: 50,
  MAX_PERMISSIONS: 100,
  
  // Retry limits
  DEFAULT_RETRY_COUNT: 3,
  DEFAULT_RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
  
  // Cache limits
  CACHE_SIZE: 100,
  MAX_MEMORY_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_LOCAL_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ===== AUTHENTICATION CONSTANTS =====

export const AUTH_CONSTANTS = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  
  // Login attempts
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 30,
  
  // Session management
  SESSION_TIMEOUT_SECONDS: 3600,
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_CONCURRENT_SESSIONS: 5,
  
  // Risk scoring
  RISK_SCORE_THRESHOLD: 70,
  HIGH_RISK_SCORE: 85,
} as const;

// ===== SEARCH CONSTANTS =====

export const SEARCH_CONSTANTS = {
  MAX_RESULTS: 20,
  MIN_RELEVANCE: 0.1,
  CACHE_SIZE: 100,
} as const;

// ===== VALIDATION CONSTANTS =====

export const VALIDATION_CONSTANTS = {
  // File validation
  MAX_FILENAME_LENGTH: 255,
  
  // Content validation
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 5000,
  
  // Common patterns
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  URL_PATTERN: /^https?:\/\/.+/,
  
  // File types
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET_TYPES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const;

// ===== NETWORK CONSTANTS =====

export const NETWORK_CONSTANTS = {
  // Connection settings
  KEEP_ALIVE: true,
  MAX_CONNECTIONS: 6,
  
  // Cache durations (in seconds)
  STATIC_ASSETS_CACHE: 31536000, // 1 year
  API_RESPONSES_CACHE: 300, // 5 minutes
  USER_SESSION_CACHE: 900, // 15 minutes
} as const;

// ===== TYPE EXPORTS =====

export type TimeoutKeys = keyof typeof TIMEOUTS;
export type LimitKeys = keyof typeof LIMITS;
export type AuthKeys = keyof typeof AUTH_CONSTANTS;
export type SearchKeys = keyof typeof SEARCH_CONSTANTS;
export type ValidationKeys = keyof typeof VALIDATION_CONSTANTS;
export type NetworkKeys = keyof typeof NETWORK_CONSTANTS;
