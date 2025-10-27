/**
 * Unified Authentication Configuration
 * Centralizes all auth-related constants and settings for NyNus system
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

// ===== ENVIRONMENT DETECTION =====

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isStaging = process.env.APP_ENV === 'staging';

// ===== JWT CONFIGURATION =====

export const JWT_CONFIG = {
  // Token expiry times (in milliseconds)
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Token expiry times (in seconds for backend compatibility)
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 days
  
  // Token refresh threshold (refresh when token expires in X ms)
  REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes before expiry
  
  // JWT issuer
  ISSUER: 'exam-bank-system',
  
  // Token storage keys
  ACCESS_TOKEN_KEY: 'nynus-auth-token',
  REFRESH_TOKEN_KEY: 'nynus-refresh-token', // Deprecated but kept for compatibility
  
  // Cookie names (environment-specific)
  COOKIE_NAMES: {
    SESSION_TOKEN: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
    CALLBACK_URL: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
    CSRF_TOKEN: isProduction ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
  }
} as const;

// ===== SESSION CONFIGURATION =====

export const SESSION_CONFIG = {
  // Session timeout (aligned with JWT expiry)
  TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  TIMEOUT_SECONDS: 24 * 60 * 60, // 24 hours
  TIMEOUT_MINUTES: 24 * 60, // 24 hours
  
  // Session limits
  MAX_CONCURRENT_SESSIONS: 5,
  
  // Session security
  REQUIRE_HTTPS: isProduction,
  SAME_SITE: 'lax' as const,
  HTTP_ONLY: true,
  
  // Session refresh intervals
  REFRESH_INTERVAL_MS: 30 * 1000, // 30 seconds
  SECURITY_CHECK_INTERVAL_MS: 10 * 1000, // 10 seconds
} as const;

// ===== AUTHENTICATION LIMITS =====

export const AUTH_LIMITS = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Login attempts
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 30,
  LOCK_DURATION_MS: 30 * 60 * 1000,
  
  // Rate limiting
  LOGIN_RATE_LIMIT_PER_MINUTE: 5,
  REGISTRATION_RATE_LIMIT_PER_HOUR: 3,
  PASSWORD_RESET_RATE_LIMIT_PER_HOUR: 3,
  
  // Risk scoring
  RISK_SCORE_THRESHOLD: 70,
  HIGH_RISK_SCORE: 85,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 80,
} as const;

// ===== OAUTH CONFIGURATION =====

export const OAUTH_CONFIG = {
  // Google OAuth
  GOOGLE: {
    ENABLED: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
    SCOPES: ['openid', 'email', 'profile'],
  },
  
  // OAuth timeouts
  TIMEOUT_MS: 30 * 1000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// ===== SECURITY CONFIGURATION =====

export const SECURITY_CONFIG = {
  // CSRF Protection
  // SECURITY: Enable CSRF protection in all environments for early testing
  CSRF_ENABLED: true,
  TRUST_HOST: isDevelopment, // Only trust host in development
  
  // Cookie security
  SECURE_COOKIES: isProduction,
  COOKIE_DOMAIN: isProduction ? '.nynus.edu.vn' : undefined,
  
  // Password hashing
  BCRYPT_COST: isProduction ? 12 : 10, // Lower cost in development for speed
  
  // Security headers
  ENABLE_HSTS: isProduction,
  ENABLE_CSP: isProduction,
  ENABLE_XSS_PROTECTION: true,
  
  // Session security
  ENABLE_SESSION_ROTATION: true,
  ENABLE_DEVICE_TRACKING: false, // Simplified - disabled complex device tracking
  ENABLE_IP_VALIDATION: false, // Simplified - disabled IP validation
} as const;

// ===== FEATURE FLAGS =====

export const AUTH_FEATURE_FLAGS = {
  // Authentication methods
  ENABLE_EMAIL_PASSWORD: true,
  ENABLE_GOOGLE_OAUTH: OAUTH_CONFIG.GOOGLE.ENABLED,
  ENABLE_TWO_FACTOR: false, // Future feature
  
  // Email features
  ENABLE_EMAIL_VERIFICATION: isProduction,
  ENABLE_PASSWORD_RESET: true,
  ENABLE_EMAIL_NOTIFICATIONS: false, // Future feature
  
  // Session features
  ENABLE_SESSION_MANAGEMENT: true,
  ENABLE_DEVICE_MANAGEMENT: true,
  ENABLE_CONCURRENT_SESSION_LIMITS: false, // Simplified - disabled
  
  // Security features
  ENABLE_RISK_SCORING: false, // Simplified - disabled
  ENABLE_SUSPICIOUS_ACTIVITY_DETECTION: false, // Simplified - disabled
  ENABLE_AUTO_LOGOUT: true,
  
  // Development features
  ENABLE_DEBUG_LOGGING: isDevelopment,
  ENABLE_AUTH_DEBUGGING: isDevelopment,
} as const;

// ===== API TIMEOUTS =====

export const AUTH_TIMEOUTS = {
  // API call timeouts
  LOGIN_TIMEOUT_MS: 5000,
  LOGOUT_TIMEOUT_MS: 3000,
  REFRESH_TOKEN_TIMEOUT_MS: 5000,
  OAUTH_TIMEOUT_MS: 30000,
  
  // Email operations
  SEND_VERIFICATION_EMAIL_TIMEOUT_MS: 10000,
  SEND_PASSWORD_RESET_TIMEOUT_MS: 10000,
  
  // Session operations
  GET_SESSIONS_TIMEOUT_MS: 5000,
  TERMINATE_SESSION_TIMEOUT_MS: 3000,
  
  // Debounce timeouts
  LOGIN_DEBOUNCE_MS: 300,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// ===== VALIDATION PATTERNS =====

export const AUTH_VALIDATION = {
  // Email validation
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MAX_LENGTH: 255,
  
  // Password validation patterns
  PASSWORD_PATTERNS: {
    HAS_UPPERCASE: /[A-Z]/,
    HAS_LOWERCASE: /[a-z]/,
    HAS_NUMBER: /[0-9]/,
    HAS_SPECIAL_CHAR: /[^A-Za-z0-9]/,
  },
  
  // Name validation
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  NAME_PATTERN: /^[a-zA-ZÀ-ỹ\s]+$/,
  
  // Phone validation (Vietnamese format)
  PHONE_PATTERN: /^(\+84|0)[0-9]{9,10}$/,
} as const;

// ===== ENVIRONMENT VARIABLES =====

export const AUTH_ENV = {
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  // ✅ FIX: Use validated env from env.ts instead of allowing empty string
  // If NEXTAUTH_SECRET is missing, env.parseEnv() will throw error before this point
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // API URLs
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Get JWT expiry time in milliseconds from now
 */
export function getJWTExpiryTime(isRefreshToken = false): number {
  const expiry = isRefreshToken 
    ? JWT_CONFIG.REFRESH_TOKEN_EXPIRY_MS 
    : JWT_CONFIG.ACCESS_TOKEN_EXPIRY_MS;
  return Date.now() + expiry;
}

/**
 * Check if token should be refreshed
 */
export function shouldRefreshToken(expiryTime: number): boolean {
  return Date.now() >= (expiryTime - JWT_CONFIG.REFRESH_THRESHOLD_MS);
}

/**
 * Get cookie configuration for environment
 */
export function getCookieConfig() {
  return {
    httpOnly: SESSION_CONFIG.HTTP_ONLY,
    secure: SESSION_CONFIG.REQUIRE_HTTPS,
    sameSite: SESSION_CONFIG.SAME_SITE,
    domain: SECURITY_CONFIG.COOKIE_DOMAIN,
  };
}

/**
 * Check if feature is enabled
 */
export function isAuthFeatureEnabled(feature: keyof typeof AUTH_FEATURE_FLAGS): boolean {
  return AUTH_FEATURE_FLAGS[feature] === true;
}

// ===== TYPE EXPORTS =====

export type JWTConfigKeys = keyof typeof JWT_CONFIG;
export type SessionConfigKeys = keyof typeof SESSION_CONFIG;
export type AuthLimitKeys = keyof typeof AUTH_LIMITS;
export type OAuthConfigKeys = keyof typeof OAUTH_CONFIG;
export type SecurityConfigKeys = keyof typeof SECURITY_CONFIG;
export type AuthFeatureFlagKeys = keyof typeof AUTH_FEATURE_FLAGS;
export type AuthTimeoutKeys = keyof typeof AUTH_TIMEOUTS;
export type AuthValidationKeys = keyof typeof AUTH_VALIDATION;

// ===== DEFAULT EXPORT =====

export default {
  JWT_CONFIG,
  SESSION_CONFIG,
  AUTH_LIMITS,
  OAUTH_CONFIG,
  SECURITY_CONFIG,
  AUTH_FEATURE_FLAGS,
  AUTH_TIMEOUTS,
  AUTH_VALIDATION,
  AUTH_ENV,
  // Utility functions
  getJWTExpiryTime,
  shouldRefreshToken,
  getCookieConfig,
  isAuthFeatureEnabled,
} as const;
