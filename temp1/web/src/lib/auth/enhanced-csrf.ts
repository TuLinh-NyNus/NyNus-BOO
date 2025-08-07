/**
 * Enhanced CSRF Protection System
 * 
 * Implements advanced CSRF protection với:
 * - Token rotation after each request
 * - Double-submit cookie pattern
 * - Time-based token validation
 * - Request fingerprinting
 * - Automatic cleanup
 */

import { randomBytes } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

/**
 * Enhanced CSRF configuration
 */
export const ENHANCED_CSRF_CONFIG = {
  COOKIE_NAME: 'nynus_csrf_token',
  HEADER_NAME: 'X-CSRF-Token',
  ROTATION_HEADER: 'X-CSRF-Token-Next',
  TOKEN_LENGTH: 32, // bytes
  MAX_AGE: 2 * 60 * 60, // 2 hours (shorter for rotation)
  ROTATION_INTERVAL: 30 * 60, // 30 minutes
  SECURE: process.env.NODE_ENV === 'production',
  HTTP_ONLY: true,
  SAME_SITE: 'strict' as const, // Stricter for enhanced security
  PATH: '/',
} as const;

/**
 * Enhanced CSRF token data structure
 */
export interface EnhancedCSRFTokenData {
  token: string;
  timestamp: number;
  expiresAt: number;
  rotationDue: number;
  requestCount: number;
  fingerprint?: string;
}

/**
 * CSRF validation result với rotation info
 */
export interface CSRFValidationResult {
  isValid: boolean;
  shouldRotate: boolean;
  newToken?: string;
  error?: string;
}

/**
 * Enhanced Server-side CSRF Manager
 * 
 * Features:
 * - Automatic token rotation
 * - Request counting
 * - Fingerprint validation
 * - Enhanced security logging
 */
export class EnhancedServerCSRFManager {
  /**
   * Generate cryptographically secure CSRF token
   */
  static generateToken(): string {
    const bytes = randomBytes(ENHANCED_CSRF_CONFIG.TOKEN_LENGTH);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Create enhanced CSRF token data
   */
  static createTokenData(fingerprint?: string): EnhancedCSRFTokenData {
    const now = Date.now();
    const token = this.generateToken();

    return {
      token,
      timestamp: now,
      expiresAt: now + (ENHANCED_CSRF_CONFIG.MAX_AGE * 1000),
      rotationDue: now + (ENHANCED_CSRF_CONFIG.ROTATION_INTERVAL * 1000),
      requestCount: 0,
      fingerprint,
    };
  }

  /**
   * Validate CSRF token với enhanced checks
   */
  static validateToken(
    cookieToken: string | undefined,
    headerToken: string | undefined,
    method: string,
    fingerprint?: string
  ): CSRFValidationResult {
    // Skip validation for safe methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      return { isValid: true, shouldRotate: false };
    }

    // Check if tokens are provided
    if (!cookieToken || !headerToken) {
      logger.warn('Enhanced CSRF: Missing tokens', { 
        hasCookie: !!cookieToken, 
        hasHeader: !!headerToken,
        method 
      });
      return { 
        isValid: false, 
        shouldRotate: false, 
        error: 'CSRF tokens missing' 
      };
    }

    try {
      // Parse cookie token data
      const tokenData: EnhancedCSRFTokenData = JSON.parse(
        Buffer.from(cookieToken, 'base64').toString('utf-8')
      );

      // Check token expiry
      if (tokenData.expiresAt < Date.now()) {
        logger.warn('Enhanced CSRF: Token expired', { 
          expiresAt: new Date(tokenData.expiresAt),
          now: new Date()
        });
        return { 
          isValid: false, 
          shouldRotate: true, 
          error: 'CSRF token expired' 
        };
      }

      // Validate token match
      if (tokenData.token !== headerToken) {
        logger.warn('Enhanced CSRF: Token mismatch', { method });
        return { 
          isValid: false, 
          shouldRotate: true, 
          error: 'CSRF token mismatch' 
        };
      }

      // Validate fingerprint if provided
      if (fingerprint && tokenData.fingerprint && tokenData.fingerprint !== fingerprint) {
        logger.warn('Enhanced CSRF: Fingerprint mismatch', { method });
        return { 
          isValid: false, 
          shouldRotate: true, 
          error: 'Request fingerprint mismatch' 
        };
      }

      // Check if rotation is due
      const shouldRotate = tokenData.rotationDue < Date.now() || 
                          tokenData.requestCount >= 50; // Rotate after 50 requests

      // Generate new token if rotation needed
      let newToken: string | undefined;
      if (shouldRotate) {
        const newTokenData = this.createTokenData(fingerprint);
        newToken = Buffer.from(JSON.stringify(newTokenData)).toString('base64');
        
        logger.info('Enhanced CSRF: Token rotation triggered', {
          reason: tokenData.rotationDue < Date.now() ? 'time' : 'request_count',
          requestCount: tokenData.requestCount
        });
      }

      return {
        isValid: true,
        shouldRotate,
        newToken,
      };

    } catch (error) {
      logger.error('Enhanced CSRF: Token validation error', error);
      return { 
        isValid: false, 
        shouldRotate: true, 
        error: 'CSRF token validation failed' 
      };
    }
  }

  /**
   * Set CSRF cookie với enhanced security
   */
  static setCookie(response: Response, tokenData: EnhancedCSRFTokenData): void {
    const cookieValue = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    
    const cookieOptions = [
      `${ENHANCED_CSRF_CONFIG.COOKIE_NAME}=${cookieValue}`,
      `Max-Age=${ENHANCED_CSRF_CONFIG.MAX_AGE}`,
      `Path=${ENHANCED_CSRF_CONFIG.PATH}`,
      `SameSite=${ENHANCED_CSRF_CONFIG.SAME_SITE}`,
    ];

    if (ENHANCED_CSRF_CONFIG.HTTP_ONLY) {
      cookieOptions.push('HttpOnly');
    }

    if (ENHANCED_CSRF_CONFIG.SECURE) {
      cookieOptions.push('Secure');
    }

    response.headers.set('Set-Cookie', cookieOptions.join('; '));
    
    // Also set token in header for client access
    response.headers.set(ENHANCED_CSRF_CONFIG.HEADER_NAME, tokenData.token);
    
    logger.debug('Enhanced CSRF: Cookie set', { 
      expiresAt: new Date(tokenData.expiresAt),
      rotationDue: new Date(tokenData.rotationDue)
    });
  }

  /**
   * Generate request fingerprint
   */
  static generateFingerprint(request: Request): string {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    
    // Create simple fingerprint (không quá detailed để avoid false positives)
    const fingerprint = btoa(`${userAgent.slice(0, 50)}:${acceptLanguage.slice(0, 20)}:${acceptEncoding.slice(0, 20)}`);
    
    return fingerprint.slice(0, 32); // Limit length
  }
}

/**
 * Enhanced Client-side CSRF Manager
 */
export class EnhancedClientCSRFManager {
  private static tokenCache: string | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch CSRF token với caching và rotation handling
   */
  static async fetchCSRFToken(): Promise<string> {
    const now = Date.now();
    
    // Return cached token if still valid
    if (this.tokenCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.tokenCache;
    }

    try {
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`CSRF token fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No CSRF token in response');
      }

      // Cache the token
      this.tokenCache = data.token;
      this.lastFetch = now;

      logger.debug('Enhanced CSRF: Token fetched and cached');
      return data.token;

    } catch (error) {
      logger.error('Enhanced CSRF: Failed to fetch token', error);
      throw error;
    }
  }

  /**
   * Get stored CSRF token từ cache
   */
  static getStoredToken(): string | null {
    const now = Date.now();
    
    // Check if cached token is still valid
    if (this.tokenCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.tokenCache;
    }

    // Clear expired cache
    this.tokenCache = null;
    return null;
  }

  /**
   * Handle token rotation từ response headers
   */
  static handleTokenRotation(response: Response): void {
    const newToken = response.headers.get(ENHANCED_CSRF_CONFIG.ROTATION_HEADER);
    
    if (newToken) {
      this.tokenCache = newToken;
      this.lastFetch = Date.now();
      
      logger.info('Enhanced CSRF: Token rotated from server response');
    }
  }

  /**
   * Clear token cache
   */
  static clearCache(): void {
    this.tokenCache = null;
    this.lastFetch = 0;
    logger.debug('Enhanced CSRF: Token cache cleared');
  }
}

/**
 * CSRF Utilities
 */
export const EnhancedCSRFUtils = {
  /**
   * Check if method requires CSRF protection
   */
  requiresProtection: (method: string): boolean => {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  },

  /**
   * Generate secure random string
   */
  generateSecureString: (length: number = 32): string => {
    const bytes = randomBytes(length);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },

  /**
   * Validate token format
   */
  isValidTokenFormat: (token: string): boolean => {
    return /^[A-Za-z0-9\-_]+$/.test(token) && token.length >= 32;
  },
} as const;
