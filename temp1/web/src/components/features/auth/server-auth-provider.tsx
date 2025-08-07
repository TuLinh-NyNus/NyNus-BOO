'use client';

import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

interface ServerAuthProviderProps {
  children: React.ReactNode;
  initialUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  initialToken?: string | null;
}

/**
 * Provider để inject server auth data vào AuthContext
 * Chạy trong client-side để update auth state
 */
export function ServerAuthProvider({ children, initialUser, initialToken }: ServerAuthProviderProps) {
  const { user, token, setUser, setToken, setIsLoading } = useAuth();

  useEffect(() => {
    console.log('ServerAuthProvider: useEffect triggered', {
      hasUser: !!user,
      hasToken: !!token,
      hasInitialUser: !!initialUser,
      hasInitialToken: !!initialToken,
      isClient: typeof window !== 'undefined'
    });

    // Chỉ chạy trong client-side
    if (typeof window === 'undefined') {
      console.log('ServerAuthProvider: Skipping - running in SSR');
      return;
    }

    // Nếu server có auth data nhưng client chưa có
    if (initialUser && initialToken && !user && !token) {
      console.log('ServerAuthProvider: Injecting server auth data into AuthContext');
      
      try {
        // Set localStorage để persist
        localStorage.setItem('authToken', initialToken);
        localStorage.setItem('user', JSON.stringify(initialUser));
        
        // Trực tiếp update AuthContext state
        setUser(initialUser);
        setToken(initialToken);
        setIsLoading(false);
        
        console.log('ServerAuthProvider: Successfully updated AuthContext', {
          userEmail: initialUser.email,
          tokenLength: initialToken.length
        });
        
      } catch (error) {
        console.error('ServerAuthProvider: Error updating AuthContext:', error);
        setIsLoading(false);
      }
    } else if (!initialUser && !initialToken) {
      // Server không có auth data, đảm bảo loading state được clear
      console.log('ServerAuthProvider: No server auth data, clearing loading state');
      setIsLoading(false);
    } else if (user && token) {
      // Client đã có auth data
      console.log('ServerAuthProvider: Client already has auth data');
      setIsLoading(false);
    }
  }, [initialUser, initialToken, user, token, setUser, setToken, setIsLoading]);

  return <>{children}</>;
}
