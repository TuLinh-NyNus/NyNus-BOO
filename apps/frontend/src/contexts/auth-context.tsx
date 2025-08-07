'use client';

import React from 'react';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface cho User từ mockdata
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student';
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

// Interface cho Auth Context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data cho admin
const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@nynus.edu.vn',
  firstName: 'Admin',
  lastName: 'NyNus',
  role: 'admin',
  avatar: '/avatars/admin.jpg',
  isActive: true,
  lastLoginAt: new Date()
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Kiểm tra authentication status khi component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Kiểm tra localStorage cho session
        const savedUser = localStorage.getItem('nynus-auth-user');
        const authToken = localStorage.getItem('nynus-auth-token');

        if (savedUser && authToken) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('nynus-auth-user');
        localStorage.removeItem('nynus-auth-token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function với mockdata
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication logic
      if (email === 'admin@nynus.edu.vn' && password === 'admin123') {
        const userData = { ...mockAdminUser, lastLoginAt: new Date() };
        
        // Save to localStorage
        localStorage.setItem('nynus-auth-user', JSON.stringify(userData));
        localStorage.setItem('nynus-auth-token', 'mock-jwt-token-admin');
        
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

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear localStorage
      localStorage.removeItem('nynus-auth-user');
      localStorage.removeItem('nynus-auth-token');
      
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
      
      // Update localStorage
      localStorage.setItem('nynus-auth-user', JSON.stringify(updatedUser));
    }
  };

  // Computed values
  const isAuthenticated = !!user;

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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

