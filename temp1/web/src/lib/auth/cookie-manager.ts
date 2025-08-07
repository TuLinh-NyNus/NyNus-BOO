/**
 * 🍪 Enhanced Secure Cookie Manager for NyNus Authentication
 *
 * Quản lý secure cookies cho JWT tokens với:
 * - HttpOnly cookies để bảo vệ khỏi XSS attacks
 * - Token encryption với AES-256-GCM
 * - Session fingerprinting cho security
 * - Secure và SameSite flags
 * - Proper expiration handling
 * - Domain và path configuration
 * - Server-side và client-side support
 * - Security audit logging
 */

// Note: cookies() import is moved to server-only functions to avoid client-side import issues
import logger from '@/lib/utils/logger';

import { SecurityAuditLogger, SecurityEventType, SecuritySeverity } from './security-audit-logger';
import { createSessionFingerprint, validateSessionFingerprint } from './session-fingerprint';
import { TokenEncryption, encryptTokenSafe, decryptTokenSafe } from './token-encryption';


/**
 * Enhanced Cookie configuration constants
 */
export const COOKIE_CONFIG = {
  // Cookie names
  ACCESS_TOKEN: 'nynus_access_token',
  REFRESH_TOKEN: 'nynus_refresh_token',
  SESSION_ID: 'nynus_session_id',
  SESSION_FINGERPRINT: 'nynus_session_fingerprint',

  // Cookie settings
  DOMAIN: process.env.COOKIE_DOMAIN || undefined, // undefined = current domain
  PATH: '/',
  SECURE: process.env.NODE_ENV === 'production', // Only HTTPS in production
  HTTP_ONLY: true,
  SAME_SITE: 'lax' as const, // 'strict' | 'lax' | 'none'

  // Expiration times (in seconds)
  ACCESS_TOKEN_MAX_AGE: 15 * 60, // 15 minutes
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60, // 7 days
  SESSION_MAX_AGE: 7 * 24 * 60 * 60, // 7 days
  FINGERPRINT_MAX_AGE: 24 * 60 * 60, // 24 hours

  // Security settings
  ENABLE_TOKEN_ENCRYPTION: process.env.ENABLE_TOKEN_ENCRYPTION !== 'false', // Default enabled
  ENABLE_SESSION_FINGERPRINTING: process.env.ENABLE_SESSION_FINGERPRINTING !== 'false', // Default enabled
} as const;

/**
 * Cookie options interface
 */
interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Enhanced Token data interface
 */
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  expiresIn?: number; // Access token expiration in seconds
  userId?: string; // For audit logging
  ipAddress?: string; // For security tracking
  userAgent?: string; // For fingerprinting
}

/**
 * Security context for cookie operations
 */
export interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Interface cho Next.js Request object
 */
interface NextRequest {
  headers: {
    get(name: string): string | null;
  };
  ip?: string;
  url: string;
  method: string;
}

/**
 * Interface cho cookie request operations
 */
interface CookieRequest {
  headers: Record<string, string>;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

/**
 * Enhanced Server-side Cookie Manager
 *
 * Sử dụng Next.js cookies() API để manage cookies trên server với:
 * - Token encryption
 * - Session fingerprinting
 * - Security audit logging
 */
export class ServerCookieManager {
  /**
   * Convert NextRequest or CookieRequest to RequestObject format
   */
  private static convertToRequestObject(request: NextRequest | CookieRequest): { headers: Record<string, string | string[] | undefined>; [key: string]: unknown } {
    // Type guard to check if it's a NextRequest with headers.get method
    if (typeof request.headers === 'object' && request.headers !== null && 'get' in request.headers && typeof request.headers.get === 'function') {
      // NextRequest with headers.get() method
      const headers: Record<string, string | string[] | undefined> = {};
      const nextHeaders = request.headers as { get: (name: string) => string | null };

      // Convert NextRequest headers to standard format
      const userAgent = nextHeaders.get('user-agent');
      const acceptLanguage = nextHeaders.get('accept-language');
      const acceptEncoding = nextHeaders.get('accept-encoding');
      const connection = nextHeaders.get('connection');
      const dnt = nextHeaders.get('dnt');

      if (userAgent) headers['user-agent'] = userAgent;
      if (acceptLanguage) headers['accept-language'] = acceptLanguage;
      if (acceptEncoding) headers['accept-encoding'] = acceptEncoding;
      if (connection) headers['connection'] = connection;
      if (dnt) headers['dnt'] = dnt;

      return {
        headers,
        ip: (request as NextRequest).ip,
        url: (request as NextRequest).url,
        method: (request as NextRequest).method
      };
    } else {
      // CookieRequest with standard headers
      const cookieReq = request as CookieRequest;
      return {
        headers: cookieReq.headers,
        ip: cookieReq.ip,
        method: cookieReq.method,
        url: cookieReq.url
      };
    }
  }

  /**
   * Set authentication tokens in secure encrypted cookies
   */
  static setTokens(tokenData: TokenData, request?: NextRequest | CookieRequest, securityContext?: SecurityContext): void {
    const { cookies } = require('next/headers');
    const cookieStore = cookies();

    try {
      logger.info('🍪 ServerCookieManager: Setting authentication tokens with encryption');

      // Prepare tokens for storage
      let accessTokenToStore = tokenData.accessToken;
      let refreshTokenToStore = tokenData.refreshToken;

      // Encrypt tokens if encryption is enabled
      if (COOKIE_CONFIG.ENABLE_TOKEN_ENCRYPTION) {
        const encryptedAccessToken = encryptTokenSafe(tokenData.accessToken);
        const encryptedRefreshToken = encryptTokenSafe(tokenData.refreshToken);

        if (encryptedAccessToken && encryptedRefreshToken) {
          accessTokenToStore = encryptedAccessToken;
          refreshTokenToStore = encryptedRefreshToken;
          logger.info('🔐 ServerCookieManager: Tokens encrypted successfully');
        } else {
          logger.warn('⚠️ ServerCookieManager: Token encryption failed, storing unencrypted');
          // Log security event
          SecurityAuditLogger.logEvent(
            SecurityEventType.TOKEN_ENCRYPTION_FAILED,
            SecuritySeverity.HIGH,
            { reason: 'Failed to encrypt tokens before storage' },
            securityContext
          );
        }
      }

      // Set access token cookie
      cookieStore.set(COOKIE_CONFIG.ACCESS_TOKEN, accessTokenToStore, {
        maxAge: tokenData.expiresIn || COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
        domain: COOKIE_CONFIG.DOMAIN,
        path: COOKIE_CONFIG.PATH,
        secure: COOKIE_CONFIG.SECURE,
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        sameSite: COOKIE_CONFIG.SAME_SITE,
      });

      // Set refresh token cookie
      cookieStore.set(COOKIE_CONFIG.REFRESH_TOKEN, refreshTokenToStore, {
        maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
        domain: COOKIE_CONFIG.DOMAIN,
        path: COOKIE_CONFIG.PATH,
        secure: COOKIE_CONFIG.SECURE,
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        sameSite: COOKIE_CONFIG.SAME_SITE,
      });

      // Set session ID if provided
      if (tokenData.sessionId) {
        cookieStore.set(COOKIE_CONFIG.SESSION_ID, tokenData.sessionId, {
          maxAge: COOKIE_CONFIG.SESSION_MAX_AGE,
          domain: COOKIE_CONFIG.DOMAIN,
          path: COOKIE_CONFIG.PATH,
          secure: COOKIE_CONFIG.SECURE,
          httpOnly: COOKIE_CONFIG.HTTP_ONLY,
          sameSite: COOKIE_CONFIG.SAME_SITE,
        });
      }

      // Create and store session fingerprint if enabled
      if (COOKIE_CONFIG.ENABLE_SESSION_FINGERPRINTING && request) {
        try {
          // Convert request to RequestObject format for fingerprint creation
          const requestObject = this.convertToRequestObject(request);
          const fingerprint = createSessionFingerprint(requestObject);
          cookieStore.set(COOKIE_CONFIG.SESSION_FINGERPRINT, fingerprint, {
            maxAge: COOKIE_CONFIG.FINGERPRINT_MAX_AGE,
            domain: COOKIE_CONFIG.DOMAIN,
            path: COOKIE_CONFIG.PATH,
            secure: COOKIE_CONFIG.SECURE,
            httpOnly: COOKIE_CONFIG.HTTP_ONLY,
            sameSite: COOKIE_CONFIG.SAME_SITE,
          });
          logger.info('🔍 ServerCookieManager: Session fingerprint created');
        } catch (fingerprintError) {
          logger.warn('⚠️ ServerCookieManager: Failed to create session fingerprint:', fingerprintError);
        }
      }

      // Log security event
      SecurityAuditLogger.logEvent(
        SecurityEventType.SESSION_CREATED,
        SecuritySeverity.LOW,
        {
          encrypted: COOKIE_CONFIG.ENABLE_TOKEN_ENCRYPTION,
          fingerprinted: COOKIE_CONFIG.ENABLE_SESSION_FINGERPRINTING
        },
        securityContext
      );

      logger.info('✅ ServerCookieManager: Tokens set successfully');

    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to set tokens:', error);

      // Log security event
      SecurityAuditLogger.logEvent(
        SecurityEventType.TOKEN_ENCRYPTION_FAILED,
        SecuritySeverity.HIGH,
        { error: error instanceof Error ? error.message : String(error) },
        securityContext
      );

      throw new Error('Failed to set authentication cookies');
    }
  }
  
  /**
   * Get access token from cookies with decryption
   */
  static getAccessToken(securityContext?: SecurityContext): string | null {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const encryptedToken = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN)?.value || null;

      if (!encryptedToken) {
        logger.info('🍪 ServerCookieManager: No access token found');
        return null;
      }

      // Decrypt token if encryption is enabled
      if (COOKIE_CONFIG.ENABLE_TOKEN_ENCRYPTION) {
        const decryptedToken = decryptTokenSafe(encryptedToken);

        if (decryptedToken) {
          logger.info('🔓 ServerCookieManager: Access token decrypted successfully');
          return decryptedToken;
        } else {
          logger.error('❌ ServerCookieManager: Failed to decrypt access token');

          // Log security event
          SecurityAuditLogger.logEvent(
            SecurityEventType.TOKEN_DECRYPTION_FAILED,
            SecuritySeverity.HIGH,
            { tokenType: 'access_token' },
            securityContext
          );

          return null;
        }
      }

      logger.info('🍪 ServerCookieManager: Access token found (unencrypted)');
      return encryptedToken;

    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to get access token:', error);
      return null;
    }
  }
  
  /**
   * Get refresh token from cookies with decryption
   */
  static getRefreshToken(securityContext?: SecurityContext): string | null {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const encryptedToken = cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN)?.value || null;

      if (!encryptedToken) {
        logger.info('🍪 ServerCookieManager: No refresh token found');
        return null;
      }

      // Decrypt token if encryption is enabled
      if (COOKIE_CONFIG.ENABLE_TOKEN_ENCRYPTION) {
        const decryptedToken = decryptTokenSafe(encryptedToken);

        if (decryptedToken) {
          logger.info('🔓 ServerCookieManager: Refresh token decrypted successfully');
          return decryptedToken;
        } else {
          logger.error('❌ ServerCookieManager: Failed to decrypt refresh token');

          // Log security event
          SecurityAuditLogger.logEvent(
            SecurityEventType.TOKEN_DECRYPTION_FAILED,
            SecuritySeverity.HIGH,
            { tokenType: 'refresh_token' },
            securityContext
          );

          return null;
        }
      }

      logger.info('🍪 ServerCookieManager: Refresh token found (unencrypted)');
      return encryptedToken;

    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to get refresh token:', error);
      return null;
    }
  }
  
  /**
   * Get session ID from cookies
   */
  static getSessionId(): string | null {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const sessionId = cookieStore.get(COOKIE_CONFIG.SESSION_ID)?.value || null;

      if (sessionId) {
        logger.info('🍪 ServerCookieManager: Session ID found');
      } else {
        logger.info('🍪 ServerCookieManager: No session ID found');
      }

      return sessionId;
    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to get session ID:', error);
      return null;
    }
  }

  /**
   * Validate session fingerprint
   */
  static validateSessionFingerprint(request: NextRequest | CookieRequest, securityContext?: SecurityContext): boolean {
    if (!COOKIE_CONFIG.ENABLE_SESSION_FINGERPRINTING) {
      return true; // Skip validation if fingerprinting is disabled
    }

    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const storedFingerprint = cookieStore.get(COOKIE_CONFIG.SESSION_FINGERPRINT)?.value;

      if (!storedFingerprint) {
        logger.warn('⚠️ ServerCookieManager: No session fingerprint found');
        return false;
      }

      // Convert request to RequestObject format for fingerprint validation
      const requestObject = this.convertToRequestObject(request);
      const validation = validateSessionFingerprint(requestObject, storedFingerprint);

      if (!validation.isValid) {
        logger.warn('⚠️ ServerCookieManager: Session fingerprint validation failed:', {
          confidence: validation.confidence,
          riskLevel: validation.riskLevel,
          changedFields: validation.changedFields,
          reason: validation.reason
        });

        // Log security event
        SecurityAuditLogger.logEvent(
          SecurityEventType.FINGERPRINT_MISMATCH,
          validation.riskLevel === 'HIGH' ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM,
          {
            confidence: validation.confidence,
            riskLevel: validation.riskLevel,
            changedFields: validation.changedFields,
            reason: validation.reason
          },
          securityContext
        );

        return false;
      }

      logger.info('✅ ServerCookieManager: Session fingerprint validated successfully');
      return true;

    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to validate session fingerprint:', error);
      return false;
    }
  }
  
  /**
   * Clear all authentication cookies including fingerprint
   */
  static clearTokens(securityContext?: SecurityContext): void {
    const { cookies } = require('next/headers');
    const cookieStore = cookies();

    try {
      logger.info('🍪 ServerCookieManager: Clearing authentication tokens');

      // Clear access token
      cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN);

      // Clear refresh token
      cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN);

      // Clear session ID
      cookieStore.delete(COOKIE_CONFIG.SESSION_ID);

      // Clear session fingerprint
      cookieStore.delete(COOKIE_CONFIG.SESSION_FINGERPRINT);

      // Log security event
      SecurityAuditLogger.logEvent(
        SecurityEventType.LOGOUT,
        SecuritySeverity.LOW,
        { message: 'Authentication cookies cleared' },
        securityContext
      );

      logger.info('✅ ServerCookieManager: Tokens cleared successfully');

    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to clear tokens:', error);
      throw new Error('Failed to clear authentication cookies');
    }
  }
  
  /**
   * Check if user has valid tokens with enhanced security validation
   */
  static hasValidTokens(request?: NextRequest | CookieRequest, securityContext?: SecurityContext): boolean {
    try {
      const accessToken = this.getAccessToken(securityContext);
      const refreshToken = this.getRefreshToken(securityContext);

      const hasTokens = !!(accessToken && refreshToken);

      if (!hasTokens) {
        logger.info('🍪 ServerCookieManager: No valid tokens found');
        return false;
      }

      // Validate session fingerprint if enabled and request is provided
      if (request && COOKIE_CONFIG.ENABLE_SESSION_FINGERPRINTING) {
        const fingerprintValid = this.validateSessionFingerprint(request, securityContext);
        if (!fingerprintValid) {
          logger.warn('⚠️ ServerCookieManager: Session fingerprint validation failed');
          return false;
        }
      }

      logger.info('✅ ServerCookieManager: Token validation successful');
      return true;

    } catch (error) {
      logger.error('❌ ServerCookieManager: Failed to validate tokens:', error);
      return false;
    }
  }
}

/**
 * Client-side Cookie Manager
 * 
 * Sử dụng document.cookie API để read cookies trên client
 * Note: HttpOnly cookies không thể được access từ client-side JavaScript
 */
export class ClientCookieManager {
  /**
   * Check if authentication cookies exist (client-side)
   * Note: Chỉ có thể check existence, không thể read values của httpOnly cookies
   */
  static hasAuthCookies(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      const cookies = document.cookie;
      const hasAccessToken = cookies.includes(COOKIE_CONFIG.ACCESS_TOKEN);
      const hasRefreshToken = cookies.includes(COOKIE_CONFIG.REFRESH_TOKEN);
      
      logger.info('🍪 ClientCookieManager: Auth cookies check:', {
        hasAccessToken,
        hasRefreshToken,
      });
      
      return hasAccessToken && hasRefreshToken;
    } catch (error) {
      logger.error('❌ ClientCookieManager: Failed to check cookies:', error);
      return false;
    }
  }
  
  /**
   * Clear authentication cookies (client-side)
   * Note: Chỉ có thể clear bằng cách set expired date
   */
  static clearAuthCookies(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      logger.info('🍪 ClientCookieManager: Clearing authentication cookies');
      
      const expiredDate = new Date(0).toUTCString();
      const cookieOptions = `path=${COOKIE_CONFIG.PATH}; expires=${expiredDate}`;
      
      // Clear access token
      document.cookie = `${COOKIE_CONFIG.ACCESS_TOKEN}=; ${cookieOptions}`;
      
      // Clear refresh token
      document.cookie = `${COOKIE_CONFIG.REFRESH_TOKEN}=; ${cookieOptions}`;
      
      // Clear session ID
      document.cookie = `${COOKIE_CONFIG.SESSION_ID}=; ${cookieOptions}`;
      
      logger.info('✅ ClientCookieManager: Cookies cleared successfully');
      
    } catch (error) {
      logger.error('❌ ClientCookieManager: Failed to clear cookies:', error);
    }
  }
}

/**
 * Enhanced Unified Cookie Manager
 *
 * Provides a unified interface cho both server và client-side cookie operations
 * với enhanced security features
 */
export class CookieManager {
  /**
   * Check if running on server-side
   */
  private static isServer(): boolean {
    return typeof window === 'undefined';
  }

  /**
   * Check if user has authentication cookies with enhanced validation
   */
  static hasAuthTokens(request?: NextRequest | CookieRequest, securityContext?: SecurityContext): boolean {
    if (this.isServer()) {
      return ServerCookieManager.hasValidTokens(request, securityContext);
    } else {
      return ClientCookieManager.hasAuthCookies();
    }
  }

  /**
   * Clear authentication cookies with security logging
   */
  static clearAuthTokens(securityContext?: SecurityContext): void {
    if (this.isServer()) {
      ServerCookieManager.clearTokens(securityContext);
    } else {
      ClientCookieManager.clearAuthCookies();
    }
  }

  /**
   * Get access token with decryption (server-side only)
   */
  static getAccessToken(securityContext?: SecurityContext): string | null {
    if (!this.isServer()) {
      logger.warn('🍪 CookieManager: Access token can only be retrieved server-side');
      return null;
    }

    return ServerCookieManager.getAccessToken(securityContext);
  }

  /**
   * Get refresh token with decryption (server-side only)
   */
  static getRefreshToken(securityContext?: SecurityContext): string | null {
    if (!this.isServer()) {
      logger.warn('🍪 CookieManager: Refresh token can only be retrieved server-side');
      return null;
    }

    return ServerCookieManager.getRefreshToken(securityContext);
  }

  /**
   * Set tokens with enhanced security (server-side only)
   */
  static setTokens(tokenData: TokenData, request?: NextRequest | CookieRequest, securityContext?: SecurityContext): void {
    if (!this.isServer()) {
      logger.warn('🍪 CookieManager: Tokens can only be set server-side');
      return;
    }

    return ServerCookieManager.setTokens(tokenData, request, securityContext);
  }

  /**
   * Validate session fingerprint (server-side only)
   */
  static validateSessionFingerprint(request: NextRequest | CookieRequest, securityContext?: SecurityContext): boolean {
    if (!this.isServer()) {
      logger.warn('🍪 CookieManager: Session fingerprint can only be validated server-side');
      return false;
    }

    return ServerCookieManager.validateSessionFingerprint(request, securityContext);
  }

  /**
   * Get session ID (server-side only)
   */
  static getSessionId(): string | null {
    if (!this.isServer()) {
      logger.warn('🍪 CookieManager: Session ID can only be retrieved server-side');
      return null;
    }

    return ServerCookieManager.getSessionId();
  }
}

export default CookieManager;
