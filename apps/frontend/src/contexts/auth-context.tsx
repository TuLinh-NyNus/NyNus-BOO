'use client';

import React from 'react';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Import User interface và mockAdminUser từ mockdata
import { type User, mockAdminUser } from '../lib/mockdata/auth';

// Interface cho Auth Context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
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
          const googleUser: User = {
            id: session.user.id || session.user.email || 'google-user',
            email: session.user.email || '',
            firstName: session.user.name?.split(' ')[0] || 'User',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            role: 'student', // Default role cho Google users
            avatar: session.user.image || undefined,
            isActive: true,
            lastLoginAt: new Date()
          };
          setUser(googleUser);
          setIsLoading(false);
          return;
        }

        // Fallback to localStorage cho mock auth - chỉ trên client
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('nynus-auth-user');
          const authToken = localStorage.getItem('nynus-auth-token');

          if (savedUser && authToken) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (parseError) {
              console.error('Error parsing saved user data:', parseError);
              // Clear invalid data
              localStorage.removeItem('nynus-auth-user');
              localStorage.removeItem('nynus-auth-token');
            }
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

  // Login function với mockdata
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication logic
      if (email === 'admin@nynus.edu.vn' && password === 'admin123') {
        const userData = { ...mockAdminUser, lastLoginAt: new Date() };

        // Save to localStorage - chỉ trên client
        if (typeof window !== 'undefined') {
          localStorage.setItem('nynus-auth-user', JSON.stringify(userData));
          localStorage.setItem('nynus-auth-token', 'mock-jwt-token-admin');
        }

        setUser(userData);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
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

      // Clear localStorage for mock auth - chỉ trên client
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nynus-auth-user');
        localStorage.removeItem('nynus-auth-token');
      }

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // Update localStorage - chỉ trên client
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
    updateUser
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

