'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { type User, mockAdminUser } from '../lib/mockdata/auth';

// 🔥 KEY OPTIMIZATION: Split Context thành State và Actions
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Separate contexts để prevent unnecessary re-renders
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

function InternalAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 🔥 OPTIMIZATION: Memoize state object
  const authState = useMemo((): AuthState => ({
    user,
    isLoading,
    isAuthenticated: !!user
  }), [user, isLoading]);

  // 🔥 OPTIMIZATION: Memoize actions object với proper dependencies
  const authActions = useMemo((): AuthActions => {
    const login = async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === 'admin@nynus.edu.vn' && password === 'admin123') {
          const userData = { ...mockAdminUser, lastLoginAt: new Date() };

          if (typeof window !== 'undefined') {
            localStorage.setItem('nynus-auth-user', JSON.stringify(userData));
            localStorage.setItem('nynus-auth-token', 'mock-jwt-token-admin');
          }

          setUser(userData);
        } else {
          throw new Error('Thông tin đăng nhập không chính xác');
        }
      } finally {
        setIsLoading(false);
      }
    };

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

    const logout = async (): Promise<void> => {
      setIsLoading(true);
      try {
        if (session) {
          await nextAuthSignOut({ callbackUrl: '/', redirect: false });
        }

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

    const updateUser = (userData: Partial<User>): void => {
      setUser(currentUser => {
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('nynus-auth-user', JSON.stringify(updatedUser));
          }
          
          return updatedUser;
        }
        return currentUser;
      });
    };

    return { login, loginWithGoogle, logout, updateUser };
  }, [session]); // ESLint: only depend on session

  // Mount detection để hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔥 OPTIMIZATION: Debounced auth status check
  useEffect(() => {
    if (!isMounted || status === 'loading') return;

    let mounted = true; // Prevent state updates after unmount

    const checkAuthStatus = async () => {
      try {
        if (session?.user) {
          const googleUser: User = {
            id: session.user.id || session.user.email || 'google-user',
            email: session.user.email || '',
            firstName: session.user.name?.split(' ')[0] || 'User',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            role: 'student',
            avatar: session.user.image || undefined,
            isActive: true,
            lastLoginAt: new Date()
          };
          
          if (mounted) setUser(googleUser);
          return;
        }

        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('nynus-auth-user');
          const authToken = localStorage.getItem('nynus-auth-token');

          if (savedUser && authToken) {
            try {
              const parsedUser = JSON.parse(savedUser);
              if (mounted) setUser(parsedUser);
            } catch (parseError) {
              console.error('Error parsing saved user data:', parseError);
              localStorage.removeItem('nynus-auth-user');
              localStorage.removeItem('nynus-auth-token');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nynus-auth-user');
          localStorage.removeItem('nynus-auth-token');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Small delay để prevent hydration mismatch
    const timeoutId = setTimeout(checkAuthStatus, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [session, status, isMounted]);

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InternalAuthProvider>
        {children}
      </InternalAuthProvider>
    </SessionProvider>
  );
}

// 🔥 OPTIMIZATION: Separate hooks cho state và actions
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

// Backwards compatibility - components có thể vẫn sử dụng useAuth()
export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions };
}

export type { User, AuthState, AuthActions };
