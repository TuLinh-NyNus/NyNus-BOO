/**
 * Auth Helpers - Hybrid Token Storage for gRPC Authentication
 * ===========================================================
 *
 * ARCHITECTURE:
 * - NextAuth manages session cookies (httpOnly, secure) for web authentication
 * - localStorage stores backend JWT tokens for client-side gRPC calls
 *
 * SECURITY NOTES:
 * - localStorage token storage is REQUIRED for gRPC client authentication
 * - httpOnly cookies cannot be accessed by JavaScript (gRPC needs tokens)
 * - XSS risk is mitigated by: token validation, short expiry, CSRF protection
 * - Future: Consider moving gRPC calls to server-side API routes
 *
 * DEPRECATION TIMELINE:
 * - v2.0: Restore localStorage methods for gRPC compatibility
 * - v3.0: Migrate gRPC calls to server-side (remove localStorage)
 *
 * @author NyNus Development Team
 * @version 2.0.1 - Restored localStorage for gRPC Compatibility
 */

import { logger } from '@/lib/logger';

// ===== CONSTANTS =====

const ACCESS_TOKEN_KEY = 'nynus-auth-token';
const REFRESH_TOKEN_KEY = 'nynus-refresh-token';

/**
 * JWT Token Payload Interface
 */
interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Auth Helpers Class
 * Provides utility functions for authentication operations
 */
export class AuthHelpers {
  /**
   * Validate JWT token structure and expiration
   * 
   * Business Logic:
   * - Check JWT has 3 parts (header.payload.signature)
   * - Decode payload and check expiration time
   * - Return true if token is valid and not expired
   * 
   * @param token - JWT token string
   * @returns true if token is valid and not expired
   * 
   * @example
   * ```typescript
   * const isValid = AuthHelpers.isTokenValid(token);
   * if (!isValid) {
   *   // Token expired or invalid, redirect to login
   * }
   * ```
   */
  static isTokenValid(token?: string): boolean {
    if (!token) {
      logger.debug('[AuthHelpers] No token provided for validation');
      return false;
    }

    try {
      // Check JWT structure (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        logger.debug('[AuthHelpers] Invalid JWT structure', {
          parts: parts.length,
        });
        return false;
      }

      // Decode payload
      const payload = JSON.parse(atob(parts[1])) as JWTPayload;

      // Check expiration
      if (!payload.exp) {
        logger.debug('[AuthHelpers] Token missing expiration claim');
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;

      if (!isValid) {
        logger.debug('[AuthHelpers] Token expired', {
          exp: payload.exp,
          now: currentTime,
        });
      }

      return isValid;
    } catch (error) {
      logger.error('[AuthHelpers] Token validation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get CSRF token from NextAuth cookies
   * 
   * Business Logic:
   * - CSRF token is automatically managed by NextAuth in cookies
   * - This method extracts it for manual API calls if needed
   * - Supports both development and production cookie names
   * 
   * Security:
   * - CSRF token is httpOnly: false (required for client access)
   * - Used to prevent CSRF attacks on state-changing operations
   * 
   * @returns CSRF token string or null if not found
   * 
   * @example
   * ```typescript
   * const csrfToken = AuthHelpers.getCSRFToken();
   * if (csrfToken) {
   *   headers['x-csrf-token'] = csrfToken;
   * }
   * ```
   */
  static getCSRFToken(): string | null {
    if (typeof window === 'undefined') {
      return null; // SSR safety
    }

    try {
      // Find CSRF token cookie (development or production name)
      const csrfCookie = document.cookie
        .split('; ')
        .find(row => 
          row.startsWith('next-auth.csrf-token=') || 
          row.startsWith('__Host-next-auth.csrf-token=')
        );

      if (!csrfCookie) {
        logger.debug('[AuthHelpers] CSRF token cookie not found');
        return null;
      }

      // Extract token value
      const tokenValue = csrfCookie.split('=')[1];
      const decodedToken = decodeURIComponent(tokenValue);

      // ✅ FIX: NextAuth CSRF token format is "token|hash"
      // We only need the token part (before the pipe)
      const tokenParts = decodedToken.split('|');
      return tokenParts[0];
    } catch (error) {
      logger.error('[AuthHelpers] Failed to get CSRF token', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Get authentication metadata headers for gRPC calls
   * 
   * Business Logic:
   * - Includes CSRF token for state-changing operations
   * - Can include additional metadata as needed
   * 
   * Security:
   * - CSRF protection for all state-changing gRPC calls
   * - Headers are sent with every authenticated request
   * 
   * @param additionalHeaders - Optional additional headers to include
   * @returns Headers object for gRPC metadata
   * 
   * @example
   * ```typescript
   * const metadata = AuthHelpers.getAuthMetadata({
   *   'x-request-id': requestId
   * });
   * // Use metadata in gRPC call
   * ```
   */
  static getAuthMetadata(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {};

    // Add CSRF token if available
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
      logger.debug('[AuthHelpers] Added CSRF token to metadata');
    }

    // Merge additional headers
    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }

    return headers;
  }

  /**
   * Decode JWT token payload without validation
   * 
   * Business Logic:
   * - Decode JWT payload for inspection
   * - Does NOT validate signature or expiration
   * - Use isTokenValid() for validation
   * 
   * @param token - JWT token string
   * @returns Decoded payload or null if invalid
   * 
   * @example
   * ```typescript
   * const payload = AuthHelpers.decodeToken(token);
   * if (payload) {
   *   console.log('User ID:', payload.sub);
   * }
   * ```
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1])) as JWTPayload;
      return payload;
    } catch (error) {
      logger.error('[AuthHelpers] Failed to decode token', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Get token expiration time in seconds
   * 
   * @param token - JWT token string
   * @returns Expiration timestamp or null if not found
   * 
   * @example
   * ```typescript
   * const exp = AuthHelpers.getTokenExpiration(token);
   * if (exp) {
   *   const timeLeft = exp - Math.floor(Date.now() / 1000);
   *   console.log(`Token expires in ${timeLeft} seconds`);
   * }
   * ```
   */
  static getTokenExpiration(token: string): number | null {
    const payload = this.decodeToken(token);
    return payload?.exp || null;
  }

  /**
   * Check if token will expire soon
   *
   * @param token - JWT token string
   * @param thresholdSeconds - Threshold in seconds (default: 300 = 5 minutes)
   * @returns true if token expires within threshold
   *
   * @example
   * ```typescript
   * if (AuthHelpers.isTokenExpiringSoon(token, 300)) {
   *   // Refresh token
   * }
   * ```
   */
  static isTokenExpiringSoon(token: string, thresholdSeconds = 300): boolean {
    const exp = this.getTokenExpiration(token);
    if (!exp) {
      return true; // No expiration = treat as expiring
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = exp - currentTime;

    return timeUntilExpiry < thresholdSeconds;
  }

  // ===== LOCALSTORAGE METHODS (Required for gRPC Authentication) =====

  /**
   * Save access token to localStorage
   *
   * ⚠️ SECURITY WARNING:
   * - localStorage is vulnerable to XSS attacks
   * - Only use for client-side gRPC authentication
   * - Tokens have short expiry (15 minutes)
   * - Always validate tokens before use
   *
   * Business Logic:
   * - Store backend JWT token for gRPC calls
   * - gRPC client needs accessible tokens (httpOnly cookies won't work)
   *
   * @param token - JWT access token
   *
   * @example
   * ```typescript
   * AuthHelpers.saveAccessToken(response.accessToken);
   * ```
   */
  static saveAccessToken(token: string): void {
    if (typeof window === 'undefined') {
      logger.warn('[AuthHelpers] Cannot save token in SSR context');
      return;
    }

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      logger.debug('[AuthHelpers] Access token saved to localStorage');
    } catch (error) {
      logger.error('[AuthHelpers] Failed to save access token', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get access token from localStorage
   *
   * Business Logic:
   * - Retrieve backend JWT token for gRPC authentication
   * - Returns null if not found or in SSR context
   *
   * @returns Access token string or null
   *
   * @example
   * ```typescript
   * const token = AuthHelpers.getAccessToken();
   * if (token && AuthHelpers.isTokenValid(token)) {
   *   // Use token for gRPC call
   * }
   * ```
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null; // SSR safety
    }

    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      logger.error('[AuthHelpers] Failed to get access token', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Save both access and refresh tokens to localStorage
   *
   * ⚠️ SECURITY WARNING: See saveAccessToken() documentation
   *
   * @param accessToken - JWT access token
   * @param refreshToken - JWT refresh token
   *
   * @example
   * ```typescript
   * AuthHelpers.saveTokens(response.accessToken, response.refreshToken);
   * ```
   */
  static saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') {
      logger.warn('[AuthHelpers] Cannot save tokens in SSR context');
      return;
    }

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      logger.debug('[AuthHelpers] Tokens saved to localStorage');
    } catch (error) {
      logger.error('[AuthHelpers] Failed to save tokens', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Clear all tokens from localStorage
   *
   * Business Logic:
   * - Remove both access and refresh tokens
   * - Called on logout or token expiration
   *
   * @example
   * ```typescript
   * AuthHelpers.clearTokens();
   * ```
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      logger.debug('[AuthHelpers] Tokens cleared from localStorage');
    } catch (error) {
      logger.error('[AuthHelpers] Failed to clear tokens', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Clear all authentication data
   *
   * Business Logic:
   * - Clear tokens from localStorage
   * - Alias for clearTokens() for backward compatibility
   *
   * @example
   * ```typescript
   * AuthHelpers.clearAuth();
   * ```
   */
  static clearAuth(): void {
    this.clearTokens();
  }
}

/**
 * Export singleton instance for convenience
 * @deprecated Use AuthHelpers class methods directly
 */
export const authHelpers = AuthHelpers;

/**
 * Export default for backward compatibility
 */
export default AuthHelpers;


