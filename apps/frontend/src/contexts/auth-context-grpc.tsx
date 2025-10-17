"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { AuthService, AuthHelpers } from '@/services/grpc/auth.service';
import { type User } from '@/types/user';
import { UserRole, UserStatus } from '@/generated/common/common_pb';
import {
  convertProtobufUserToLocal,
  convertProtobufLoginResponse,
  convertProtobufRegisterResponse
} from '@/lib/utils/protobuf-converters';
import { devLogger } from '@/lib/utils/dev-logger';
import { logger } from '@/lib/utils/logger';

/**
 * Unified Auth Context Types - SIMPLIFIED
 * Removed split contexts as they were over-engineering (not used by any components)
 */
interface AuthContextType {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

/**
 * Single Unified Auth Context - SIMPLIFIED
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Internal Auth Provider with enhanced token validation
 */
function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  logger.debug('[AuthContext] Initializing InternalAuthProvider with enhanced token validation');

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingUser, setIsFetchingUser] = useState(false); // ✅ Guard against multiple calls
  const hasInitializedRef = React.useRef(false); // ✅ FIX: Track if user has been initialized
  const router = useRouter();
  const { data: session, status } = useSession();



  // NextAuth session sync with enhanced token validation
  useEffect(() => {
    devLogger.debug('[AUTH] NextAuth sync effect - status:', status, 'session:', !!session?.user, 'hasInitialized:', hasInitializedRef.current);

    if (session?.user) {
      // Store backend tokens if available
      if (session.backendAccessToken) {
        devLogger.debug('[AUTH] Found backendAccessToken in session, checking validity...');
        // Check token expiry before restoring from NextAuth session
        // This prevents expired tokens from overwriting fresh tokens in localStorage
        const isValid = AuthHelpers.isTokenValid(session.backendAccessToken);
        devLogger.debug('[AUTH] Token validity check result:', isValid);

        if (isValid) {
          // Token is still valid, restore it to localStorage
          devLogger.debug('[AUTH] Restoring valid token to localStorage');
          AuthHelpers.saveAccessToken(session.backendAccessToken);
        } else {
          // Token expired, clear it from localStorage
          devLogger.warn('[AUTH] NextAuth session contains expired token, clearing localStorage');
          AuthHelpers.clearTokens();
          // NextAuth session will handle token refresh automatically
        }
      } else {
        devLogger.debug('[AUTH] No backendAccessToken in session');
      }

      // ✅ FIX: Only fetch user once when session is available
      // Check hasInitializedRef to prevent infinite loop
      if (!hasInitializedRef.current && session.backendAccessToken && AuthHelpers.isTokenValid(session.backendAccessToken)) {
        hasInitializedRef.current = true; // Mark as initialized
        fetchCurrentUser();
      } else if (!session.backendAccessToken && !hasInitializedRef.current) {
        // No backend token, use session data directly (Google OAuth case)
        hasInitializedRef.current = true; // Mark as initialized
        setUser({
          id: session.user.id || session.user.email || '',
          email: session.user.email || '',
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
          role: UserRole.USER_ROLE_STUDENT,
          status: UserStatus.USER_STATUS_ACTIVE,
          avatar: session.user.image || undefined,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  // ✅ FIX: Remove 'user' from dependencies to prevent infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]); // fetchCurrentUser is stable via useCallback

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // ✅ CRITICAL FIX: Kiểm tra token trước khi gọi fetchCurrentUser
      const token = AuthHelpers.getAccessToken();
      if (token && AuthHelpers.isTokenValid(token)) {
        await fetchCurrentUser();
      } else {
        // Không có token hoặc token không hợp lệ - đây là trạng thái bình thường
        // Không log error, chỉ set loading = false
        devLogger.debug('[AUTH] No valid token found, user remains unauthenticated');
      }
    } catch (error) {
      devLogger.error('Auth check failed:', error);
      AuthHelpers.clearTokens();
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchCurrentUser is stable, no need to include in deps

  // Check auth status on mount with enhanced token validation
  useEffect(() => {
    logger.debug('[AuthContext] Checking auth status on mount');
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Fetch current user with enhanced error handling and token validation
   */
  const fetchCurrentUser = useCallback(async () => {
    // Prevent multiple concurrent calls
    if (isFetchingUser) {
      logger.debug('[AuthContext] fetchCurrentUser already in progress, skipping');
      return;
    }

    try {
      setIsFetchingUser(true);
      devLogger.debug('[AUTH] Fetching current user...');

      // ✅ CRITICAL: Check token validity before making API call
      const token = AuthHelpers.getAccessToken();
      if (!token || !AuthHelpers.isTokenValid(token)) {
        devLogger.debug('[AUTH] No valid token available, cannot fetch user');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await AuthService.getCurrentUser();
      const userData = convertProtobufUserToLocal(response.getUser()!);

      devLogger.info('[AUTH] Successfully fetched user:', userData.email);
      setUser(userData);

      // Store user data in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('nynus-auth-user', JSON.stringify(userData));
      }
    } catch (error: unknown) {
      logger.error('[AuthContext] Failed to fetch current user', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Categorized error handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('401') || errorMessage?.includes('Unauthorized')) {
        logger.warn('[AuthContext] Token expired or invalid, clearing auth state');
        AuthHelpers.clearTokens();
        setUser(null);
      } else if (errorMessage?.includes('Network') || errorMessage?.includes('fetch')) {
        logger.warn('[AuthContext] Network error, keeping current auth state');
        // Don't clear user state on network errors
      } else {
        logger.error('[AuthContext] Unexpected error, clearing auth state', {
          error: errorMessage,
        });
        AuthHelpers.clearTokens();
        setUser(null);
      }
    } finally {
      setIsFetchingUser(false);
      setIsLoading(false);
    }
  }, [isFetchingUser]);

  /**
   * Login with email and password
   *
   * Business Logic:
   * 1. Call gRPC backend to authenticate user
   * 2. Save tokens from gRPC response
   * 3. Call NextAuth signIn to create NextAuth session (CRITICAL for middleware)
   * 4. Redirect to dashboard after successful authentication
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Step 1: Authenticate with gRPC backend
      const protobufResponse = await AuthService.login(email, password);
      const response = convertProtobufLoginResponse(protobufResponse);

      // Step 2: Save tokens from gRPC response
      if (response.accessToken && response.refreshToken) {
        AuthHelpers.saveTokens(response.accessToken, response.refreshToken);
      }

      // Step 3: Set user data
      if (response.user) {
        setUser(response.user);
      }

      // Step 4: ✅ CRITICAL FIX - Call NextAuth signIn to create session
      // This is required for middleware authentication check
      // Without this, middleware will redirect to /login because no NextAuth session exists
      logger.debug('[AuthContext] Creating NextAuth session after gRPC login');
      const nextAuthResult = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't auto-redirect, we handle it manually
      });

      if (nextAuthResult?.error) {
        logger.error('[AuthContext] NextAuth session creation failed', {
          error: nextAuthResult.error,
        });
        // Continue anyway - gRPC login was successful
      }

      // Step 5: ✅ FIX: Use window.location.href instead of router.push()
      // This forces a full page reload, ensuring NextAuth session is properly set
      // before middleware checks authentication (same fix as login page)
      window.location.href = '/dashboard';
    } catch (error) {
      logger.error('[AuthContext] Login failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed - window.location.href doesn't require router

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);

      // Use NextAuth to get Google ID token
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // After NextAuth handles OAuth, we need to exchange the token with our backend
      // This would typically be done in the NextAuth callback
      // For now, we'll fetch the current user after NextAuth completes
      if (result?.ok) {
        await fetchCurrentUser();
        // ✅ FIX: Use window.location.href instead of router.push()
        // This forces a full page reload, ensuring NextAuth session is properly set
        // before middleware checks authentication
        window.location.href = '/dashboard';
      }
    } catch (error) {
      logger.error('[AuthContext] Google login failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]); // Removed router - window.location.href doesn't require it

  /**
   * Register new user
   *
   * Business Logic:
   * 1. Call gRPC backend to register user
   * 2. Save tokens from gRPC response
   * 3. Call NextAuth signIn to create NextAuth session (CRITICAL for middleware)
   * 4. Redirect to dashboard after successful registration
   */
  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setIsLoading(true);

      // Step 1: Register with gRPC backend
      const protobufResponse = await AuthService.register({
        email,
        password,
        firstName,
        lastName
      });

      const response = convertProtobufRegisterResponse(protobufResponse);

      // Step 2: Save tokens from gRPC response
      if (response.accessToken && response.refreshToken) {
        AuthHelpers.saveTokens(response.accessToken, response.refreshToken);
      }

      // Step 3: Set user data
      if (response.user) {
        setUser(response.user);
      }

      // Step 4: ✅ CRITICAL FIX - Call NextAuth signIn to create session
      // This is required for middleware authentication check
      // Without this, middleware will redirect to /login because no NextAuth session exists
      logger.debug('[AuthContext] Creating NextAuth session after gRPC registration');
      const nextAuthResult = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't auto-redirect, we handle it manually
      });

      if (nextAuthResult?.error) {
        logger.error('[AuthContext] NextAuth session creation failed', {
          error: nextAuthResult.error,
        });
        // Continue anyway - gRPC registration was successful
      }

      // Step 5: ✅ FIX: Use window.location.href instead of router.push()
      // This forces a full page reload, ensuring NextAuth session is properly set
      // before middleware checks authentication (same fix as login page)
      window.location.href = '/dashboard';
    } catch (error) {
      logger.error('[AuthContext] Registration failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed - window.location.href doesn't require router

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Clear tokens
      AuthHelpers.clearTokens();

      // Clear user state
      setUser(null);

      // Sign out from NextAuth
      await nextAuthSignOut({ redirect: false });

      // Redirect to home
      router.push('/');
    } catch (error) {
      logger.error('[AuthContext] Logout failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * SIMPLIFIED: Token refresh handled by NextAuth
   * This is kept for backward compatibility but simplified
   */
  const refreshToken = useCallback(async () => {
    try {
      logger.debug('[AuthContext] Token refresh requested - delegating to NextAuth session');
      // In simplified approach, NextAuth handles token refresh automatically
      // We just need to fetch updated user data
      await fetchCurrentUser();
    } catch (error) {
      logger.error('[AuthContext] Token refresh failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  }, [logout, fetchCurrentUser]);

  /**
   * Forgot password (placeholder - needs backend implementation)
   */
  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement forgot password gRPC call
      logger.info('[AuthContext] Forgot password requested', { email });
      // For now, just simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error('[AuthContext] Forgot password failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);

      // Call reset password gRPC service
      const response = await AuthService.resetPassword({
        token,
        newPassword
      });

      // Check if reset was successful
      if (!response.getResponse()?.getSuccess()) {
        throw new Error(response.getResponse()?.getMessage() || 'Reset password failed');
      }

      // Password reset successful - user needs to login again
      logger.info('[AuthContext] Password reset successful');
    } catch (error) {
      logger.error('[AuthContext] Reset password failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };

        // Update localStorage if available
        if (typeof window !== 'undefined') {
          localStorage.setItem('nynus-auth-user', JSON.stringify(updatedUser));
        }

        return updatedUser;
      }
      return currentUser;
    });
  }, []);

  // SIMPLIFIED: Remove complex token refresh interval
  // NextAuth handles token refresh automatically

  // Memoize unified context value to prevent unnecessary re-renders
  const contextValue = useMemo((): AuthContextType => ({
    // State
    user,
    isLoading,
    isAuthenticated: !!user,

    // Actions
    login,
    loginWithGoogle,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    updateUser,
  }), [user, isLoading, login, loginWithGoogle, register, logout, refreshToken, forgotPassword, resetPassword, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Main Auth Provider that wraps with SessionProvider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InternalAuthProvider>{children}</InternalAuthProvider>
    </SessionProvider>
  );
}

/**
 * Unified Auth Hook - SIMPLIFIED
 * Single hook for all auth state and actions
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export types for external use
export type { AuthContextType };