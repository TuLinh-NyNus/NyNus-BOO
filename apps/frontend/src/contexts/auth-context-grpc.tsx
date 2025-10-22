"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut as nextAuthSignOut, useSession, getSession, getCsrfToken } from 'next-auth/react';
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

    // ✅ CRITICAL FIX: Wait for useSession() to finish loading before making decisions
    // This prevents setting isLoading=false too early when session is still being fetched
    if (status === "loading") {
      devLogger.debug('[AUTH] NextAuth session is loading, waiting...');
      setIsLoading(true); // ✅ Set loading while session is being fetched
      return; // Don't do anything while session is loading
    }

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
        setIsLoading(true); // ✅ CRITICAL: Set loading BEFORE fetching user
        devLogger.debug('[AUTH] Fetching current user from backend...');
        fetchCurrentUser();
      } else if (!session.backendAccessToken && !hasInitializedRef.current) {
        // No backend token, use session data directly (Google OAuth case)
        hasInitializedRef.current = true; // Mark as initialized
        devLogger.debug('[AUTH] Using session data directly (no backend token)');
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
      } else if (session.backendAccessToken && !AuthHelpers.isTokenValid(session.backendAccessToken) && !hasInitializedRef.current) {
        // ✅ NEW: Token exists but is invalid/expired
        hasInitializedRef.current = true; // Mark as initialized to prevent retry
        devLogger.warn('[AUTH] Backend token is invalid/expired, clearing auth state');
        AuthHelpers.clearTokens();
        setUser(null);
        setIsLoading(false);
      } else if (hasInitializedRef.current && user) {
        // Already initialized and user exists
        devLogger.debug('[AUTH] Already initialized with user');
        setIsLoading(false);
      }
    } else {
      // ✅ CRITICAL FIX: Only set isLoading=false when status is NOT loading
      // AND we have already tried to initialize (hasInitializedRef = true)
      // This prevents premature isLoading=false on initial page load
      if (status !== "loading" && hasInitializedRef.current) {
        devLogger.debug('[AUTH] No session and status is not loading, setting isLoading=false');
        setIsLoading(false);
      } else if (status === "unauthenticated" && !hasInitializedRef.current) {
        // ✅ NEW: If status is unauthenticated and we haven't initialized yet,
        // mark as initialized and set isLoading=false (user is not logged in)
        hasInitializedRef.current = true;
        devLogger.debug('[AUTH] Status is unauthenticated, no session available, setting isLoading=false');
        setIsLoading(false);
      }
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

  // ✅ CRITICAL FIX: DISABLE checkAuthStatus on mount
  // This was causing race condition with NextAuth session sync useEffect (line 60-140)
  // The NextAuth sync effect already handles user fetching when session is available
  // Running checkAuthStatus on mount was setting isLoading=false too early
  // useEffect(() => {
  //   logger.debug('[AuthContext] Checking auth status on mount');
  //   checkAuthStatus();
  // }, [checkAuthStatus]);

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
   * 1. Call NextAuth signIn with credentials provider
   * 2. NextAuth calls authorize() → gRPC backend authentication (SINGLE CALL)
   * 3. Verify NextAuth session is created
   * 4. Redirect to dashboard after successful authentication
   *
   * ✅ FIX: Removed double authentication call
   * - OLD: AuthContext.login() → gRPC (1st) → signIn() → authorize() → gRPC (2nd)
   * - NEW: AuthContext.login() → signIn() → authorize() → gRPC (ONCE)
   * - This matches /login page pattern and prevents session creation failures
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Step 1: ✅ FIX - Get CSRF token before signIn
      // NextAuth v5 requires CSRF token for all authentication actions
      // This prevents "MissingCSRF" error and ensures session cookie is created
      logger.debug('[AuthContext] Getting CSRF token');
      const csrfToken = await getCsrfToken();

      if (!csrfToken) {
        logger.error('[AuthContext] Failed to get CSRF token');
        throw new Error('Không thể lấy CSRF token. Vui lòng thử lại.');
      }

      logger.debug('[AuthContext] CSRF token obtained, calling NextAuth signIn');

      // Step 2: ✅ SIMPLIFIED - Call NextAuth signIn with CSRF token
      // This will trigger authorize() callback which calls gRPC backend ONCE
      // No need to call AuthService.login() separately (was causing double authentication)
      const nextAuthResult = await signIn('credentials', {
        email,
        password,
        csrfToken, // ✅ Pass CSRF token to prevent MissingCSRF error
        redirect: false, // Don't auto-redirect, we handle it manually
      });

      if (nextAuthResult?.error) {
        logger.error('[AuthContext] NextAuth signIn failed', {
          error: nextAuthResult.error,
        });
        throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      }

      // Step 3: ✅ Verify session before redirect
      // Wait for NextAuth session to be properly set to avoid timing issues
      // This prevents redirect to /login?callbackUrl=%2Fdashboard
      logger.debug('[AuthContext] Verifying NextAuth session before redirect');
      const session = await getSession();

      if (!session) {
        logger.error('[AuthContext] Session verification failed - no session found');
        throw new Error('Authentication session not created');
      }

      logger.info('[AuthContext] Session verified successfully, redirecting to dashboard');

      // Step 4: ✅ Poll for session cookie before redirect
      // This ensures cookie is set before page reload
      const waitForSessionCookie = async (maxAttempts = 20): Promise<boolean> => {
        for (let i = 0; i < maxAttempts; i++) {
          const cookies = document.cookie;
          // Check for both dev and production cookie names
          if (cookies.includes('next-auth.session-token') || cookies.includes('__Secure-next-auth.session-token')) {
            logger.debug(`[AuthContext] Session cookie found after ${i * 100}ms`);
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        logger.error('[AuthContext] Session cookie not found after 2000ms');
        return false;
      };

      const cookieReady = await waitForSessionCookie();
      if (!cookieReady) {
        logger.error('[AuthContext] Session cookie not set after login - redirect may fail');
        // Continue anyway - user can manually navigate if needed
      }

      // Step 5: ✅ Use window.location.href for FULL PAGE RELOAD
      //
      // WHY NOT router.push()?
      // - router.push() triggers client-side navigation (SPA-style)
      // - Middleware runs BEFORE NextAuth session cookie is attached to request
      // - getToken() in middleware returns NULL → redirect to /login?callbackUrl=%2Fdashboard
      //
      // WHY window.location.href?
      // - Forces FULL PAGE RELOAD (not client-side navigation)
      // - Browser makes a fresh HTTP request with ALL cookies attached
      // - Middleware gets the NextAuth session cookie → authentication succeeds
      // - User lands on /dashboard successfully
      //
      // This is the ONLY reliable way to ensure middleware sees the session cookie
      window.location.href = '/dashboard';
    } catch (error) {
      logger.error('[AuthContext] Login failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - window.location.href doesn't require router

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

        // ✅ CRITICAL FIX - Use window.location.href for FULL PAGE RELOAD
        // Same reason as login() - router.push() causes middleware to run before cookie is attached
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
  }, [fetchCurrentUser]); // No router dependency - window.location.href doesn't require it

  /**
   * Register new user
   *
   * Business Logic:
   * 1. Call gRPC backend to register user
   * 2. Save tokens from gRPC response
   * 3. Call NextAuth signIn to create NextAuth session (CRITICAL for middleware)
   * 4. Verify session is created before redirect (FIX for redirect loop)
   * 5. Redirect to dashboard after successful registration
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

      // Verify registration was successful
      if (!response.user) {
        throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
      }

      logger.info('[AuthContext] Registration successful, logging in user');

      // Step 2: ✅ SIMPLIFIED - Call NextAuth signIn directly after registration
      // This will trigger authorize() callback which calls gRPC backend to login
      // No need to save tokens manually - NextAuth handles it
      logger.debug('[AuthContext] Calling NextAuth signIn after registration');
      const nextAuthResult = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't auto-redirect, we handle it manually
      });

      if (nextAuthResult?.error) {
        logger.error('[AuthContext] NextAuth signIn failed after registration', {
          error: nextAuthResult.error,
        });
        throw new Error('Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập thủ công.');
      }

      // Step 3: ✅ Verify session before redirect
      logger.debug('[AuthContext] Verifying NextAuth session before redirect');
      const session = await getSession();

      if (!session) {
        logger.error('[AuthContext] Session verification failed - no session found');
        throw new Error('Authentication session not created');
      }

      logger.info('[AuthContext] Session verified successfully, redirecting to dashboard');

      // Step 4: ✅ Use window.location.href for FULL PAGE RELOAD
      // Same reason as login() - router.push() causes middleware to run before cookie is attached
      window.location.href = '/dashboard';
    } catch (error) {
      logger.error('[AuthContext] Registration failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - window.location.href doesn't require router

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