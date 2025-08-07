/**
 * CSRF (Cross-Site Request Forgery) Protection System
 * 
 * Implements Double Submit Cookie pattern:
 * 1. CSRF token được store trong httpOnly cookie
 * 2. Client phải gửi token trong X-CSRF-Token header
 * 3. Server validate token match giữa cookie và header
 * 
 * Security Features:
 * - Crypto-secure random token generation
 * - HttpOnly cookie storage
 * - Automatic token rotation
 * - Request method filtering
 */

import { randomBytes } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

/**
 * CSRF configuration constants
 */
export const CSRF_CONFIG = {
  COOKIE_NAME: 'nynus_csrf_token',
  HEADER_NAME: 'X-CSRF-Token',
  TOKEN_LENGTH: 32, // bytes
  MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  SECURE: process.env.NODE_ENV === 'production',
  HTTP_ONLY: true,
  SAME_SITE: 'lax' as const,
  PATH: '/',
} as const;

/**
 * HTTP methods that require CSRF protection
 * Safe methods (GET, HEAD, OPTIONS) are excluded
 */
export const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

/**
 * CSRF token data structure
 */
export interface CSRFTokenData {
  token: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * CSRF validation result
 */
export interface CSRFValidationResult {
  isValid: boolean;
  error?: string;
  shouldRefresh?: boolean;
}

/**
 * Server-side CSRF Token Manager
 * Handles token generation, validation, và cookie operations
 */
export class ServerCSRFManager {
  /**
   * Generate một secure CSRF token
   */
  static generateToken(): string {
    try {
      const buffer = randomBytes(CSRF_CONFIG.TOKEN_LENGTH);
      // Convert Uint8Array to base64url string
      const token = btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      logger.info('🔐 ServerCSRFManager: Generated new CSRF token');
      return token;
    } catch (error) {
      logger.error('❌ ServerCSRFManager: Error generating CSRF token:', error);
      throw new Error('Failed to generate CSRF token');
    }
  }

  /**
   * Create CSRF token data với timestamp và expiration
   */
  static createTokenData(token?: string): CSRFTokenData {
    const now = Date.now();
    const generatedToken = token || this.generateToken();
    
    return {
      token: generatedToken,
      timestamp: now,
      expiresAt: now + (CSRF_CONFIG.MAX_AGE * 1000),
    };
  }

  /**
   * Set CSRF token trong secure cookie
   */
  static setCSRFCookie(tokenData: CSRFTokenData): void {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();

      // Set CSRF token cookie với secure settings
      cookieStore.set(CSRF_CONFIG.COOKIE_NAME, tokenData.token, {
        httpOnly: CSRF_CONFIG.HTTP_ONLY,
        secure: CSRF_CONFIG.SECURE,
        sameSite: CSRF_CONFIG.SAME_SITE,
        path: CSRF_CONFIG.PATH,
        maxAge: CSRF_CONFIG.MAX_AGE,
      });

      logger.info('🍪 ServerCSRFManager: CSRF token cookie set successfully');
    } catch (error) {
      logger.error('❌ ServerCSRFManager: Error setting CSRF cookie:', error);
      throw new Error('Failed to set CSRF cookie');
    }
  }

  /**
   * Get CSRF token từ cookie
   */
  static getCSRFToken(): string | null {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      
      const tokenCookie = cookieStore.get(CSRF_CONFIG.COOKIE_NAME);
      
      if (tokenCookie?.value) {
        logger.info('🔍 ServerCSRFManager: Retrieved CSRF token from cookie');
        return tokenCookie.value;
      }
      
      logger.info('⚠️ ServerCSRFManager: No CSRF token found in cookies');
      return null;
    } catch (error) {
      logger.error('❌ ServerCSRFManager: Error getting CSRF token:', error);
      return null;
    }
  }

  /**
   * Validate CSRF token từ request
   */
  static validateCSRFToken(headerToken: string | null, cookieToken: string | null): CSRFValidationResult {
    logger.info('🔍 ServerCSRFManager: Validating CSRF token');
    
    // Check if tokens exist
    if (!headerToken) {
      logger.info('❌ ServerCSRFManager: Missing CSRF token in header');
      return {
        isValid: false,
        error: 'Missing CSRF token in request header',
      };
    }

    if (!cookieToken) {
      logger.info('❌ ServerCSRFManager: Missing CSRF token in cookie');
      return {
        isValid: false,
        error: 'Missing CSRF token in cookie',
        shouldRefresh: true,
      };
    }

    // Validate token match
    if (headerToken !== cookieToken) {
      logger.info('❌ ServerCSRFManager: CSRF token mismatch');
      return {
        isValid: false,
        error: 'CSRF token mismatch',
        shouldRefresh: true,
      };
    }

    logger.info('✅ ServerCSRFManager: CSRF token validation successful');
    return {
      isValid: true,
    };
  }

  /**
   * Clear CSRF token cookie
   */
  static clearCSRFCookie(): void {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();

      cookieStore.delete(CSRF_CONFIG.COOKIE_NAME);
      logger.info('🧹 ServerCSRFManager: CSRF token cookie cleared');
    } catch (error) {
      logger.error('❌ ServerCSRFManager: Error clearing CSRF cookie:', error);
    }
  }

  /**
   * Check if request method requires CSRF protection
   */
  static requiresCSRFProtection(method: string): boolean {
    return CSRF_PROTECTED_METHODS.includes(method.toUpperCase() as any);
  }
}

/**
 * Client-side CSRF Token Manager
 * Handles token retrieval và inclusion trong requests
 */
export class ClientCSRFManager {
  private static currentToken: string | null = null;

  /**
   * Fetch CSRF token từ server
   */
  static async fetchCSRFToken(): Promise<string | null> {
    try {
      logger.info('🔄 ClientCSRFManager: Fetching CSRF token from server');
      
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        logger.error('❌ ClientCSRFManager: Failed to fetch CSRF token:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        this.currentToken = data.token;
        logger.info('✅ ClientCSRFManager: CSRF token fetched successfully');
        return data.token;
      }

      logger.error('❌ ClientCSRFManager: Invalid CSRF token response:', data);
      return null;
    } catch (error) {
      logger.error('❌ ClientCSRFManager: Error fetching CSRF token:', error);
      return null;
    }
  }

  /**
   * Get current CSRF token (fetch if not available)
   */
  static async getCSRFToken(): Promise<string | null> {
    if (this.currentToken) {
      return this.currentToken;
    }

    return await this.fetchCSRFToken();
  }

  /**
   * Add CSRF token to request headers
   */
  static async addCSRFHeader(headers: Record<string, string> = {}): Promise<Record<string, string>> {
    const token = await this.getCSRFToken();
    
    if (token) {
      headers[CSRF_CONFIG.HEADER_NAME] = token;
      logger.info('🔐 ClientCSRFManager: Added CSRF token to request headers');
    } else {
      logger.warn('⚠️ ClientCSRFManager: No CSRF token available for request');
    }

    return headers;
  }

  /**
   * Clear cached CSRF token (force refresh on next request)
   */
  static clearToken(): void {
    this.currentToken = null;
    logger.info('🧹 ClientCSRFManager: Cached CSRF token cleared');
  }

  /**
   * Check if method requires CSRF protection
   */
  static requiresCSRFProtection(method: string): boolean {
    return ServerCSRFManager.requiresCSRFProtection(method);
  }
}

/**
 * Utility functions cho CSRF protection
 */
export const CSRFUtils = {
  /**
   * Generate secure random string
   */
  generateSecureToken: (length: number = CSRF_CONFIG.TOKEN_LENGTH): string => {
    const bytes = randomBytes(length);
    // Convert Uint8Array to base64url string manually
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (tokenData: CSRFTokenData): boolean => {
    return Date.now() > tokenData.expiresAt;
  },

  /**
   * Get token expiration time in seconds
   */
  getTokenTTL: (tokenData: CSRFTokenData): number => {
    const ttl = Math.max(0, tokenData.expiresAt - Date.now()) / 1000;
    return Math.floor(ttl);
  },
} as const;

export default {
  ServerCSRFManager,
  ClientCSRFManager,
  CSRFUtils,
  CSRF_CONFIG,
  CSRF_PROTECTED_METHODS,
};
