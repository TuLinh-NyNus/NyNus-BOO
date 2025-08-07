/**
 * 🍪 Cookie-based Authentication Client
 * 
 * Client-side utilities để work với cookie-based authentication.
 * Provides methods để interact với secure httpOnly cookies thông qua API routes.
 */

import logger from '@/lib/utils/logger';

import { ClientCookieManager } from './cookie-manager';

/**
 * Token response interface
 */
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  expiresIn?: number;
}

/**
 * API response interface
 */
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

/**
 * Cookie Authentication Client
 * 
 * Handles cookie-based authentication operations từ client-side
 */
export class CookieAuthClient {
  private static readonly SET_COOKIES_ENDPOINT = '/api/auth/set-cookies';
  private static readonly CLEAR_COOKIES_ENDPOINT = '/api/auth/clear-cookies';
  
  /**
   * Set authentication tokens in secure cookies
   * 
   * @param tokens - Token data từ login/register response
   * @returns Promise<boolean> - Success status
   */
  static async setAuthTokens(tokens: TokenResponse): Promise<boolean> {
    try {
      logger.info('🍪 CookieAuthClient: Setting authentication tokens');
      
      const response = await fetch(this.SET_COOKIES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          sessionId: tokens.sessionId,
          expiresIn: tokens.expiresIn,
        }),
        credentials: 'same-origin', // Include cookies in request
      });
      
      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        logger.error('❌ CookieAuthClient: Failed to set tokens:', errorData);
        return false;
      }
      
      const data: ApiResponse = await response.json();
      logger.info('✅ CookieAuthClient: Tokens set successfully:', data.message);
      
      return true;
      
    } catch (error) {
      logger.error('❌ CookieAuthClient: Error setting tokens:', error);
      return false;
    }
  }
  
  /**
   * Clear authentication tokens from cookies
   * 
   * @returns Promise<boolean> - Success status
   */
  static async clearAuthTokens(): Promise<boolean> {
    try {
      logger.info('🍪 CookieAuthClient: Clearing authentication tokens');
      
      const response = await fetch(this.CLEAR_COOKIES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Include cookies in request
      });
      
      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        logger.error('❌ CookieAuthClient: Failed to clear tokens:', errorData);
        
        // Fallback: try client-side cookie clearing
        logger.info('🍪 CookieAuthClient: Attempting client-side cookie clearing');
        ClientCookieManager.clearAuthCookies();
        
        return false;
      }
      
      const data: ApiResponse = await response.json();
      logger.info('✅ CookieAuthClient: Tokens cleared successfully:', data.message);
      
      // Also clear client-side cookies as backup
      ClientCookieManager.clearAuthCookies();
      
      return true;
      
    } catch (error) {
      logger.error('❌ CookieAuthClient: Error clearing tokens:', error);
      
      // Fallback: try client-side cookie clearing
      logger.info('🍪 CookieAuthClient: Attempting client-side cookie clearing as fallback');
      ClientCookieManager.clearAuthCookies();
      
      return false;
    }
  }
  
  /**
   * Check if user has authentication cookies
   * 
   * @returns boolean - Whether auth cookies exist
   */
  static hasAuthTokens(): boolean {
    return ClientCookieManager.hasAuthCookies();
  }
  
  /**
   * Refresh authentication tokens
   * 
   * Note: This will be implemented when we add refresh token endpoint
   * For now, it's a placeholder
   * 
   * @returns Promise<boolean> - Success status
   */
  static async refreshAuthTokens(): Promise<boolean> {
    try {
      logger.info('🔄 CookieAuthClient: Refreshing authentication tokens');
      
      // TODO: Implement refresh token logic
      // This will call the refresh token endpoint which will:
      // 1. Get refresh token from httpOnly cookie
      // 2. Validate refresh token
      // 3. Generate new access token
      // 4. Set new tokens in cookies
      
      logger.warn('🚧 CookieAuthClient: Token refresh not yet implemented');
      return false;
      
    } catch (error) {
      logger.error('❌ CookieAuthClient: Error refreshing tokens:', error);
      return false;
    }
  }
  
  /**
   * Handle authentication after successful login/register
   * 
   * @param tokens - Token data từ authentication response
   * @returns Promise<boolean> - Success status
   */
  static async handleAuthSuccess(tokens: TokenResponse): Promise<boolean> {
    try {
      logger.info('🎉 CookieAuthClient: Handling authentication success');
      
      // Set tokens in secure cookies
      const success = await this.setAuthTokens(tokens);
      
      if (success) {
        logger.info('✅ CookieAuthClient: Authentication setup completed');
        
        // Optional: Trigger any post-auth actions
        // e.g., analytics, user tracking, etc.
        
        return true;
      } else {
        logger.error('❌ CookieAuthClient: Failed to setup authentication');
        return false;
      }
      
    } catch (error) {
      logger.error('❌ CookieAuthClient: Error handling auth success:', error);
      return false;
    }
  }
  
  /**
   * Handle logout
   * 
   * @returns Promise<boolean> - Success status
   */
  static async handleLogout(): Promise<boolean> {
    try {
      logger.info('👋 CookieAuthClient: Handling logout');
      
      // Clear tokens from cookies
      const success = await this.clearAuthTokens();
      
      if (success) {
        logger.info('✅ CookieAuthClient: Logout completed');
        
        // Optional: Trigger any post-logout actions
        // e.g., analytics, cleanup, etc.
        
        return true;
      } else {
        logger.error('❌ CookieAuthClient: Failed to complete logout');
        return false;
      }
      
    } catch (error) {
      logger.error('❌ CookieAuthClient: Error handling logout:', error);
      return false;
    }
  }
}

export default CookieAuthClient;
