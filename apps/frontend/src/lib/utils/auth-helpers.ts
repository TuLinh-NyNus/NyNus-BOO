/**
 * Auth Helpers
 * ============
 * Utility functions for authentication token management
 * Works with localStorage and provides type-safe methods
 */

const ACCESS_TOKEN_KEY = 'nynus-auth-token';
const REFRESH_TOKEN_KEY = 'nynus-refresh-token';
const USER_KEY = 'nynus-auth-user';

export class AuthHelpers {
  /**
   * Save access token (and optionally refresh token) to localStorage
   */
  static saveTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return; // SSR safety
    
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all auth tokens from localStorage
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return; // SSR safety
    
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if access token exists and is valid (not expired)
   * Simple implementation - in production might want to decode JWT
   */
  static isTokenValid(token?: string): boolean {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return false;

    try {
      // Basic JWT structure check
      const parts = accessToken.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp && payload.exp > currentTime;
    } catch (error) {
      console.warn('Invalid token format:', error);
      return false;
    }
  }

  /**
   * Save user data to localStorage
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static saveUser(user: any): void {
    if (typeof window === 'undefined') return; // SSR safety
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored user data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getStoredUser(): any | null {
    if (typeof window === 'undefined') return null; // SSR safety
    
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Clear all auth data
   */
  static clearAuth(): void {
    this.clearTokens();
  }

  /**
   * Get metadata headers for gRPC calls
   */
  static getAuthMetadata(): { [key: string]: string } {
    const token = this.getAccessToken();
    if (token) {
      return {
        'authorization': `Bearer ${token}`,
      };
    }
    return {};
  }
}