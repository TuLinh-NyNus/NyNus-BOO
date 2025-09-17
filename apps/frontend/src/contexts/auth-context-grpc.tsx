"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { AuthService } from '@/services/grpc/auth.service';
import { AuthHelpers } from '@/services/grpc/auth.service';
import type { User } from '@/lib/types/user';

/**
 * Auth Context Types
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Internal Auth Provider Component
 */
function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

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
          role: 'STUDENT',
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
  }, [session, status, user]);

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a token
      if (AuthHelpers.isAuthenticated()) {
        await fetchCurrentUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      AuthHelpers.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    // We intentionally avoid adding checkAuthStatus to deps to prevent re-run loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch current user data
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await AuthService.getCurrentUser();
      const userData = response.getUser();
      
      if (userData) {
        setUser({
          id: userData.getId(),
          email: userData.getEmail(),
          firstName: userData.getName().split(' ')[0] || '',
          lastName: userData.getName().split(' ').slice(1).join(' ') || '',
          role: userData.getRole().toString(),
          level: userData.getLevel().toString(),
          avatar: userData.getAvatar(),
          emailVerified: userData.getEmailVerified(),
          createdAt: userData.getCreatedAt() ? new Date(userData.getCreatedAt() as unknown as string) : new Date(),
          updatedAt: userData.getUpdatedAt() ? new Date(userData.getUpdatedAt() as unknown as string) : new Date(),
        } as User);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.login(email, password);
      
      // Save tokens
      const accessToken = response.getAccessToken();
      const refreshToken = response.getRefreshToken();
      AuthHelpers.saveTokens(accessToken, refreshToken);
      
      // Get user data
      const userData = response.getUser();
      if (userData) {
        setUser({
          id: userData.getId(),
          email: userData.getEmail(),
          firstName: userData.getName().split(' ')[0] || '',
          lastName: userData.getName().split(' ').slice(1).join(' ') || '',
          role: userData.getRole().toString(),
          level: userData.getLevel().toString(),
          avatar: userData.getAvatar(),
          emailVerified: userData.getEmailVerified(),
          createdAt: userData.getCreatedAt() ? new Date(userData.getCreatedAt() as unknown as string) : new Date(),
          updatedAt: userData.getUpdatedAt() ? new Date(userData.getUpdatedAt() as unknown as string) : new Date(),
        } as User);
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = async () => {
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
  };

  /**
   * Register new user
   */
  const register = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.register(
        email,
        password,
        `${firstName} ${lastName}`.trim(),
        1, // ROLE_STUDENT
        3  // LEVEL_HIGH (default)
      );
      
      // Save tokens
      const accessToken = response.getAccessToken();
      const refreshToken = response.getRefreshToken();
      AuthHelpers.saveTokens(accessToken, refreshToken);
      
      // Get user data
      const userData = response.getUser();
      if (userData) {
        setUser({
          id: userData.getId(),
          email: userData.getEmail(),
          firstName: userData.getName().split(' ')[0] || '',
          lastName: userData.getName().split(' ').slice(1).join(' ') || '',
          role: userData.getRole().toString(),
          level: userData.getLevel().toString(),
          avatar: userData.getAvatar(),
          emailVerified: userData.getEmailVerified(),
          createdAt: userData.getCreatedAt() ? new Date(userData.getCreatedAt() as unknown as string) : new Date(),
          updatedAt: userData.getUpdatedAt() ? new Date(userData.getUpdatedAt() as unknown as string) : new Date(),
        } as User);
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [logout]);

  /**
   * Forgot password (placeholder - needs backend implementation)
   */
  const forgotPassword = async (email: string) => {
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
  };

  /**
   * Reset password (placeholder - needs backend implementation)
   */
  const resetPassword = async (token: string, _newPassword: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement reset password gRPC call
      console.log('Reset password with token:', token);
      // For now, just simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Setup token refresh interval
  useEffect(() => {
    if (!user) return;
    
    // Refresh token every 20 minutes (before 24-hour expiry)
    const interval = setInterval(() => {
      refreshToken().catch(console.error);
    }, 20 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
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
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}