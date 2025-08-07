'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { emailSchema, passwordSchema, nameSchema } from '@/lib/validation/auth-schemas';

interface ValidationState {
  isValid: boolean;
  error: string | null;
  isValidating: boolean;
}

interface UseEmailValidationReturn extends ValidationState {
  validateEmail: (email: string) => void;
  clearValidation: () => void;
}

interface UsePasswordValidationReturn extends ValidationState {
  validatePassword: (password: string) => void;
  clearValidation: () => void;
}

interface UseNameValidationReturn extends ValidationState {
  validateName: (name: string) => void;
  clearValidation: () => void;
}

interface UsePasswordMatchReturn {
  isMatching: boolean;
  error: string | null;
  validateMatch: (password: string, confirmPassword: string) => void;
  clearValidation: () => void;
}

// Email validation hook với debouncing
export function useEmailValidation(debounceMs: number = 500): UseEmailValidationReturn {
  const [state, setState] = useState<ValidationState>({
    isValid: false,
    error: null,
    isValidating: false,
  });

  const [email, setEmail] = useState('');
  const [debouncedEmail] = useDebounce(email, debounceMs);

  const validateEmail = useCallback((emailValue: string) => {
    setEmail(emailValue);
    
    if (!emailValue) {
      setState({
        isValid: false,
        error: null,
        isValidating: false,
      });
      return;
    }

    setState(prev => ({ ...prev, isValidating: true }));
  }, []);

  const clearValidation = useCallback(() => {
    setState({
      isValid: false,
      error: null,
      isValidating: false,
    });
    setEmail('');
  }, []);

  useEffect(() => {
    if (!debouncedEmail) {
      setState({
        isValid: false,
        error: null,
        isValidating: false,
      });
      return;
    }

    const result = emailSchema.safeParse(debouncedEmail);
    
    setState({
      isValid: result.success,
      error: result.success ? null : result.error.errors[0]?.message || 'Email không hợp lệ',
      isValidating: false,
    });
  }, [debouncedEmail]);

  return {
    ...state,
    validateEmail,
    clearValidation,
  };
}

// Password validation hook
export function usePasswordValidation(): UsePasswordValidationReturn {
  const [state, setState] = useState<ValidationState>({
    isValid: false,
    error: null,
    isValidating: false,
  });

  const validatePassword = useCallback((password: string) => {
    if (!password) {
      setState({
        isValid: false,
        error: null,
        isValidating: false,
      });
      return;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    // Immediate validation for password
    const result = passwordSchema.safeParse(password);
    
    setState({
      isValid: result.success,
      error: result.success ? null : result.error.errors[0]?.message || 'Mật khẩu không hợp lệ',
      isValidating: false,
    });
  }, []);

  const clearValidation = useCallback(() => {
    setState({
      isValid: false,
      error: null,
      isValidating: false,
    });
  }, []);

  return {
    ...state,
    validatePassword,
    clearValidation,
  };
}

// Name validation hook
export function useNameValidation(): UseNameValidationReturn {
  const [state, setState] = useState<ValidationState>({
    isValid: false,
    error: null,
    isValidating: false,
  });

  const validateName = useCallback((name: string) => {
    if (!name) {
      setState({
        isValid: false,
        error: null,
        isValidating: false,
      });
      return;
    }

    const result = nameSchema.safeParse(name);
    
    setState({
      isValid: result.success,
      error: result.success ? null : result.error.errors[0]?.message || 'Họ tên không hợp lệ',
      isValidating: false,
    });
  }, []);

  const clearValidation = useCallback(() => {
    setState({
      isValid: false,
      error: null,
      isValidating: false,
    });
  }, []);

  return {
    ...state,
    validateName,
    clearValidation,
  };
}

// Password matching validation hook
export function usePasswordMatch(): UsePasswordMatchReturn {
  const [state, setState] = useState({
    isMatching: false,
    error: null as string | null,
  });

  const validateMatch = useCallback((password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      setState({
        isMatching: false,
        error: null,
      });
      return;
    }

    if (!password) {
      setState({
        isMatching: false,
        error: 'Vui lòng nhập mật khẩu trước',
      });
      return;
    }

    const isMatching = password === confirmPassword;
    setState({
      isMatching,
      error: isMatching ? null : 'Mật khẩu xác nhận không khớp',
    });
  }, []);

  const clearValidation = useCallback(() => {
    setState({
      isMatching: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    validateMatch,
    clearValidation,
  };
}

// Combined auth form validation hook
export function useAuthFormValidation() {
  const emailValidation = useEmailValidation();
  const passwordValidation = usePasswordValidation();
  const nameValidation = useNameValidation();
  const passwordMatch = usePasswordMatch();

  const clearAllValidations = useCallback(() => {
    emailValidation.clearValidation();
    passwordValidation.clearValidation();
    nameValidation.clearValidation();
    passwordMatch.clearValidation();
  }, []); // Removed dependencies to prevent infinite loop

  return {
    email: emailValidation,
    password: passwordValidation,
    name: nameValidation,
    passwordMatch,
    clearAll: clearAllValidations,
  };
}

// Success message hook
export function useSuccessMessage(duration: number = 3000) {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showSuccess = useCallback((msg: string) => {
    setMessage(msg);
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setMessage(null), 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const hideSuccess = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setMessage(null), 300);
  }, []);

  return {
    message,
    isVisible,
    showSuccess,
    hideSuccess,
  };
}
