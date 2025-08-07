'use client';

import { decodeJwt } from 'jose';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

import { toast } from '@/hooks/use-toast';
import { authService, type User, type LoginRequest, type RegisterRequest } from '@/lib/api/auth.service';
import logger from '@/lib/utils/logger';

/**
 * Interface cho JWT payload từ backend
 */
interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number; // Issued at
  exp: number; // Expiration time
  sessionId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAuth: () => void;
  // Token management methods
  getCurrentToken: () => string | null;
  isTokenValid: () => boolean;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 *
 * Enhanced authentication provider với:
 * - Token management integration
 * - Improved error handling
 * - State consistency
 * - Token refresh handling
 */
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refs để tránh race conditions
  const isCheckingAuthRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear authentication state
   */
  const clearAuth = useCallback((): void => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);

    // Clear any pending refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((): void => {
    const token = authService.getCurrentToken();
    if (!token) return;

    try {
      const payload = decodeJwt(token) as JwtPayload;
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Refresh 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshTokens().catch(() => {
            // If refresh fails, clear auth
            clearAuth();
          });
        }, refreshTime);
      }
    } catch (error) {
      logger.error('Error scheduling token refresh:', error);
    }
  }, [clearAuth]);

  /**
   * Check authentication status on mount
   */
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    if (isCheckingAuthRef.current) return;
    
    isCheckingAuthRef.current = true;
    setIsLoading(true);

    try {
      const token = authService.getCurrentToken();
      
      if (!token) {
        clearAuth();
        return;
      }

      // Validate token format and expiration
      try {
        const payload = decodeJwt(token) as JwtPayload;
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          // Try to refresh token
          await authService.refreshTokens();
        }
      } catch (tokenError) {
        logger.error('Invalid token format:', tokenError);
        clearAuth();
        return;
      }

      // Get current user info
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Schedule automatic refresh
        scheduleTokenRefresh();
      } else {
        clearAuth();
      }

    } catch (error) {
      logger.error('❌ AuthContext: Auth check failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
      isCheckingAuthRef.current = false;
    }
  }, [clearAuth, scheduleTokenRefresh]);

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    checkAuthStatus();
    
    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [checkAuthStatus]);

  /**
   * Get current token
   */
  const getCurrentToken = useCallback((): string | null => {
    return authService.getCurrentToken();
  }, []);

  /**
   * Check if current token is valid
   */
  const isTokenValid = useCallback((): boolean => {
    const token = authService.getCurrentToken();
    if (!token) return false;

    try {
      const payload = decodeJwt(token) as JwtPayload;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      logger.error('❌ AuthContext: Failed to refresh user:', error);
      // Don't clear auth on user refresh failure
    }
  }, [isAuthenticated]);

  /**
   * Đăng nhập người dùng
   * Enhanced với better state management
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);

      setUser(response.user);
      setIsAuthenticated(true);

      // Schedule automatic token refresh
      scheduleTokenRefresh();

      toast({
        title: 'Đăng nhập thành công!',
        description: `Chào mừng ${response.user.firstName || response.user.email}`,
      });

    } catch (error) {
      logger.error('❌ AuthContext: Login failed:', error);

      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';

      toast({
        title: 'Đăng nhập thất bại',
        description: message,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Đăng ký người dùng mới
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await authService.register(userData);

      // Handle optional user property in response
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }

      // Schedule automatic token refresh
      scheduleTokenRefresh();

      toast({
        title: 'Đăng ký thành công!',
        description: `Chào mừng ${response.user?.firstName || response.user?.email || response.email}`,
      });

    } catch (error) {
      logger.error('❌ AuthContext: Registration failed:', error);

      const message = error instanceof Error ? error.message : 'Đăng ký thất bại';

      toast({
        title: 'Đăng ký thất bại',
        description: message,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Đăng xuất người dùng
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
      
      clearAuth();

      toast({
        title: 'Đăng xuất thành công',
        description: 'Hẹn gặp lại bạn!',
      });

    } catch (error) {
      logger.error('❌ AuthContext: Logout failed:', error);
      
      // Clear auth even if logout request fails
      clearAuth();

      toast({
        title: 'Đăng xuất',
        description: 'Đã đăng xuất khỏi hệ thống',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = useCallback(async (): Promise<void> => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      await authService.refreshTokens();

      // Schedule next refresh
      scheduleTokenRefresh();

    } catch (error) {
      // Only log actual errors in development
      if (process.env.NODE_ENV === 'development') {
        logger.error('Token refresh failed:', error);
      }

      // Clear auth if refresh fails
      clearAuth();

      throw error;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [clearAuth]);

  // Context value với all methods
  const contextValue = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshUser,
    clearAuth,
    getCurrentToken,
    isTokenValid,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook để sử dụng AuthContext
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
