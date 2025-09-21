'use client';

import React from 'react';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Import enhanced User interface từ types (production-ready)
import { type User } from '../lib/types/user/base';
// Import UserRole và UserStatus từ protobuf generated types (primary)
import { UserRole, UserStatus } from '../generated/common/common_pb';


// Import gRPC AuthService
import { AuthService, getAuthErrorMessage } from '../lib/services/api/auth.api';

// Interface cho Auth Context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
}

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Internal AuthProvider component that uses NextAuth session
function InternalAuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Client-side mounting check để tránh hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Kiểm tra authentication status từ NextAuth session và localStorage
  useEffect(() => {
    // Chỉ chạy sau khi component đã mounted trên client và NextAuth đã load xong
    if (!isMounted || status === 'loading') {
      return;
    }

    const checkAuthStatus = () => {
      try {
        // Ưu tiên NextAuth session trước
        if (session?.user) {
          // Thử lấy role từ backend hoặc session metadata
          // Nếu không có, mặc định là STUDENT theo thiết kế AUTH_COMPLETE_GUIDE.md
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userRole = (session as any)?.user?.role ||
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           (session as any)?.role ||
                           UserRole.STUDENT; // Sử dụng protobuf enum value
          
          const googleUser: User = {
            id: session.user.id || session.user.email || 'google-user',
            email: session.user.email || '',
            firstName: session.user.name?.split(' ')[0] || 'User',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            role: userRole, // Dynamic role từ backend hoặc default STUDENT
            avatar: session.user.image || undefined,
            isActive: true,
            lastLoginAt: new Date(),
            // Enhanced fields với defaults
            status: UserStatus.ACTIVE,
            emailVerified: true, // Google users đã verify email
            level: userRole === UserRole.GUEST ? undefined : 1, // Default level 1 cho authenticated users (trừ GUEST),
            maxConcurrentSessions: 3,
            loginAttempts: 0,
            // Required timestamp fields
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setUser(googleUser);
          setIsLoading(false);
          return;
        }

        // Check localStorage for existing auth session
        if (typeof window !== 'undefined') {
          const storedUser = AuthService.getStoredUser();
          const token = AuthService.getToken();

          if (storedUser && token && AuthService.isTokenValid(token)) {
            setUser(storedUser);
          } else {
            // Clear invalid/expired data
            AuthService.clearAuth();
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data - chỉ trên client
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nynus-auth-user');
          localStorage.removeItem('nynus-auth-token');
        }
      } finally {
        // Đảm bảo luôn set isLoading = false sau khi check xong
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [session, status, isMounted]);

  // Login function với gRPC AuthService
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Call gRPC login service
      const response = await AuthService.login({ email, password });
      
      // AuthService.login đã tự động save tokens và user vào localStorage
      // Chỉ cần cập nhật state
      setUser(response.user);
    } catch (error) {
      // Convert gRPC error to user-friendly message
      const errorMessage = getAuthErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login function
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await nextAuthSignIn('google', {
        callbackUrl: '/',
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // If user logged in via Google, sign out from NextAuth
      if (session) {
        await nextAuthSignOut({ callbackUrl: '/', redirect: false });
      }

      // Clear authentication using AuthService
      AuthService.clearAuth();

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password (mock)
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real impl: call backend to send reset email
      if (!email || !email.includes('@')) {
        throw new Error('Email không hợp lệ');
      }
      // Success: no state change needed
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // Update localStorage using AuthService pattern
      if (typeof window !== 'undefined') {
        localStorage.setItem('nynus-auth-user', JSON.stringify(updatedUser));
      }
    }
  };

  // Computed values
  const isAuthenticated = !!user;

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Main AuthProvider that wraps with SessionProvider
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <InternalAuthProvider>
        {children}
      </InternalAuthProvider>
    </SessionProvider>
  );
}

// Custom hook để sử dụng Auth Context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export types
export type { User, AuthContextType };

