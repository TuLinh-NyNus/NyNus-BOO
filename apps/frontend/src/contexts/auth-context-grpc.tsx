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

/**
 * Auth Context Types - Split State and Actions for Performance
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Legacy interface for backwards compatibility
interface AuthContextType extends AuthState, AuthActions {}

/**
 * Split Contexts for Performance Optimization
 */
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

// Legacy context for backwards compatibility
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Internal Auth Provider Component
 */
function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Memoize state object to prevent unnecessary re-renders
  const authState = useMemo((): AuthState => ({
    user,
    isLoading,
    isAuthenticated: !!user
  }), [user, isLoading]);

  // Sync with NextAuth session
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      // Store backend tokens if available
      if (session.backendAccessToken) {
        AuthHelpers.saveTokens(
          session.backendAccessToken,
          session.backendRefreshToken
        );
      }
      
      // If we have a NextAuth session but no gRPC user, fetch user data
      if (!user && session.backendAccessToken) {
        fetchCurrentUser();
      } else if (!session.backendAccessToken) {
        // No backend token, use session data directly
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, user]); // fetchCurrentUser will be defined below

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a token
      if (AuthHelpers.isTokenValid()) {
        await fetchCurrentUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      AuthHelpers.clearTokens();
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchCurrentUser is stable, no need to include in deps

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Fetch current user data
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await AuthService.getCurrentUser();
      const userData = response.getUser();

      if (userData) {
        const localUser = convertProtobufUserToLocal(userData);
        setUser(localUser);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const protobufResponse = await AuthService.login(email, password);
      const response = convertProtobufLoginResponse(protobufResponse);

      // Save tokens
      if (response.accessToken && response.refreshToken) {
        AuthHelpers.saveTokens(response.accessToken, response.refreshToken);
      }

      // Set user data
      if (response.user) {
        setUser(response.user);
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, router]);

  /**
   * Register new user
   */
  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setIsLoading(true);
      
      const protobufResponse = await AuthService.register({
        email,
        password,
        firstName,
        lastName
      });

      const response = convertProtobufRegisterResponse(protobufResponse);

      // Save tokens
      if (response.accessToken && response.refreshToken) {
        AuthHelpers.saveTokens(response.accessToken, response.refreshToken);
      }

      // Set user data
      if (response.user) {
        setUser(response.user);
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      const currentRefreshToken = AuthHelpers.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await AuthService.refreshToken(currentRefreshToken);
      
      // Update tokens
      const newAccessToken = response.getAccessToken();
      const newRefreshToken = response.getRefreshToken();
      AuthHelpers.saveTokens(newAccessToken, newRefreshToken);
      
      // Fetch updated user data
      await fetchCurrentUser();
    } catch (error) {
      console.error('Token refresh failed:', error);
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
      console.log('Forgot password for:', email);
      // For now, just simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Forgot password failed:', error);
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
      console.log('Password reset successful');
    } catch (error) {
      console.error('Reset password failed:', error);
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

  // Setup token refresh interval
  useEffect(() => {
    if (!user) return;
    
    // Refresh token every 20 minutes (before 24-hour expiry)
    const interval = setInterval(() => {
      refreshToken().catch(console.error);
    }, 20 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  // Memoize actions object to prevent unnecessary re-renders
  const authActions = useMemo((): AuthActions => ({
    login,
    loginWithGoogle,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    updateUser,
  }), [login, loginWithGoogle, register, logout, refreshToken, forgotPassword, resetPassword, updateUser]);

  // Legacy value for backwards compatibility
  const value: AuthContextType = {
    ...authState,
    ...authActions,
  };

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
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
 * Optimized hooks for state and actions
 */
export function useAuthState(): AuthState {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

export function useAuthActions(): AuthActions {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
}

/**
 * Legacy hook for backwards compatibility
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export types for external use
export type { AuthState, AuthActions, AuthContextType };