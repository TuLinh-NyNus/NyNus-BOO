/**
 * CSRF Token Component
 * 
 * Provides CSRF token functionality cho forms và client-side operations
 * Automatically fetches và manages CSRF tokens
 */

'use client';

import { useEffect, useState } from 'react';

import { ClientCSRFManager } from '@/lib/auth/csrf';
import logger from '@/lib/utils/logger';

/**
 * Props cho CSRFToken component
 */
interface CSRFTokenProps {
  /**
   * Callback khi CSRF token được load thành công
   */
  onTokenLoaded?: (token: string) => void;
  
  /**
   * Callback khi có lỗi loading CSRF token
   */
  onError?: (error: string) => void;
  
  /**
   * Có render hidden input field không
   */
  renderHiddenInput?: boolean;
  
  /**
   * Name attribute cho hidden input field
   */
  inputName?: string;
  
  /**
   * Custom className cho hidden input
   */
  className?: string;
}

/**
 * CSRF Token Hook
 * 
 * Custom hook để manage CSRF token state
 */
export function useCSRFToken():  {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => void;
} {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const csrfToken = await ClientCSRFManager.fetchCSRFToken();
      
      if (csrfToken) {
        setToken(csrfToken);
        logger.info('✅ useCSRFToken: CSRF token loaded successfully');
      } else {
        throw new Error('Failed to fetch CSRF token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('❌ useCSRFToken: Error loading CSRF token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    ClientCSRFManager.clearToken();
    await fetchToken();
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return {
    token,
    isLoading,
    error,
    refreshToken,
  };
}

/**
 * CSRF Token Component
 * 
 * Component để automatically fetch và provide CSRF token
 */
export function CSRFToken({ 
  onTokenLoaded, 
  onError, 
  renderHiddenInput = false,
  inputName = '_csrf',
  className = ''
}: CSRFTokenProps): JSX.Element | null {
  const { token, isLoading, error } = useCSRFToken();

  // Call callbacks khi token state changes
  useEffect(() => {
    if (token && onTokenLoaded) {
      onTokenLoaded(token);
    }
  }, [token, onTokenLoaded]);

  useEffect(() => {
    if (error && onError) {
      onError(error || 'Unknown error');
    }
  }, [error, onError]);

  // Render hidden input field nếu requested
  if (renderHiddenInput && token) {
    return (
      <input
        type="hidden"
        name={inputName}
        value={token}
        className={className}
        data-csrf-token="true"
      />
    );
  }

  // Component không render gì visible by default
  return null;
}

/**
 * CSRF Token Provider Component
 * 
 * Component để initialize CSRF token cho entire app
 */
export function CSRFTokenProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { token, isLoading, error } = useCSRFToken();

  useEffect(() => {
    if (token) {
      logger.info('🛡️ CSRFTokenProvider: CSRF protection initialized');
    }
    
    if (error) {
      logger.error('❌ CSRFTokenProvider: CSRF initialization failed:', error);
    }
  }, [token, error]);

  // Provider không render gì visible, chỉ initialize CSRF token
  return <>{children}</>;
}

/**
 * Utility function để get CSRF token từ DOM
 */
export function getCSRFTokenFromDOM(): string | null {
  // Try to get from hidden input
  const hiddenInput = document.querySelector('input[data-csrf-token="true"]') as HTMLInputElement;
  if (hiddenInput?.value) {
    return hiddenInput.value;
  }

  // Try to get from meta tag (alternative approach)
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  if (metaTag?.content) {
    return metaTag.content;
  }

  return null;
}

/**
 * Utility function để add CSRF token to form data
 */
export async function addCSRFToFormData(formData: FormData, fieldName: string = '_csrf'): Promise<FormData> {
  try {
    const token = await ClientCSRFManager.getCSRFToken();
    
    if (token) {
      formData.append(fieldName, token);
      logger.info('🛡️ addCSRFToFormData: CSRF token added to form data');
    } else {
      logger.warn('⚠️ addCSRFToFormData: No CSRF token available');
    }
  } catch (error) {
    logger.error('❌ addCSRFToFormData: Error adding CSRF token:', error);
  }

  return formData;
}

/**
 * Utility function để add CSRF token to request headers
 */
export async function addCSRFToHeaders(headers: Record<string, string> = {}): Promise<Record<string, string>> {
  return await ClientCSRFManager.addCSRFHeader(headers);
}

export default CSRFToken;
