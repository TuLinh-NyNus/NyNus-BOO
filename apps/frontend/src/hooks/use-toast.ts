/**
 * Toast Hook
 * Simple toast notification hook for user feedback
 */

import React, { useState, useCallback } from 'react';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export interface Toast extends ToastProps {
  id: string;
  timestamp: number;
}

let toastCounter = 0;

// Global toast state (simple implementation)
const toastListeners: Array<(toasts: Toast[]) => void> = [];
let globalToasts: Toast[] = [];

const addToast = (toast: ToastProps): string => {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = {
    ...toast,
    id,
    timestamp: Date.now(),
    duration: toast.duration || 5000,
  };

  globalToasts = [...globalToasts, newToast];
  toastListeners.forEach(listener => listener(globalToasts));

  // Auto remove after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }

  return id;
};

const removeToast = (id: string) => {
  globalToasts = globalToasts.filter(toast => toast.id !== id);
  toastListeners.forEach(listener => listener(globalToasts));
};

const clearToasts = () => {
  globalToasts = [];
  toastListeners.forEach(listener => listener(globalToasts));
};

export const toast = (props: ToastProps) => {
  return addToast(props);
};

// Add convenience methods
toast.success = (title: string, description?: string) => {
  return addToast({ title, description, variant: 'success' });
};

toast.error = (title: string, description?: string) => {
  return addToast({ title, description, variant: 'destructive' });
};

toast.warning = (title: string, description?: string) => {
  return addToast({ title, description, variant: 'warning' });
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  // Subscribe to global toast changes
  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  // Subscribe on mount
  React.useEffect(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  }, [subscribe]);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  const clear = useCallback(() => {
    clearToasts();
  }, []);

  return {
    toasts,
    toast: addToast,
    dismiss,
    clear,
  };
};

// Export for compatibility
export { toast as default };
