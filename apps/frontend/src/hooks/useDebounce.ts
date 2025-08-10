/**
 * useDebounce Hook
 * Custom hook cho debouncing values và functions với advanced features
 * Optimized cho search functionality với 300ms delay
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ===== TYPES =====

export interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

// ===== BASIC DEBOUNCE HOOK =====

/**
 * Basic useDebounce hook cho values
 * @param value - Value cần debounce
 * @param delay - Delay time in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ===== ADVANCED DEBOUNCE HOOK =====

/**
 * Advanced useDebounce với options
 * @param value - Value cần debounce
 * @param options - Debounce options
 * @returns Object với debounced value và control functions
 */
export function useAdvancedDebounce<T>(
  value: T,
  options: DebounceOptions = {}
): {
  debouncedValue: T;
  isDebouncing: boolean;
  cancel: () => void;
  flush: () => void;
} {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number | undefined>(undefined);
  const lastInvokeTimeRef = useRef<number>(0);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    setIsDebouncing(false);
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      setDebouncedValue(value);
      cancel();
    }
  }, [value, cancel]);

  useEffect(() => {
    const now = Date.now();
    lastCallTimeRef.current = now;
    setIsDebouncing(true);

    const invokeFunc = () => {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = Date.now();
      setIsDebouncing(false);
    };

    const shouldInvokeLeading = leading && (!lastInvokeTimeRef.current || 
      (now - lastInvokeTimeRef.current) >= delay);

    if (shouldInvokeLeading) {
      invokeFunc();
      return;
    }

    // Clear existing timeouts
    cancel();

    // Set up trailing invoke
    if (trailing) {
      timeoutRef.current = setTimeout(invokeFunc, delay);
    }

    // Set up max wait timeout
    if (maxWait && maxWait > delay) {
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
      const remainingWait = maxWait - timeSinceLastInvoke;
      
      if (remainingWait > 0) {
        maxTimeoutRef.current = setTimeout(invokeFunc, remainingWait);
      } else {
        invokeFunc();
      }
    }

    return cancel;
  }, [value, delay, leading, trailing, maxWait, cancel]);

  return {
    debouncedValue,
    isDebouncing,
    cancel,
    flush,
  };
}

// ===== DEBOUNCED FUNCTION HOOK =====

/**
 * useDebounceCallback - Debounce một function
 * @param callback - Function cần debounce
 * @param delay - Delay time in milliseconds
 * @param options - Debounce options
 * @returns Debounced function với control methods
 */
export function useDebounceCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number = 300,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number | undefined>(undefined);
  const lastInvokeTimeRef = useRef<number>(0);
  const argsRef = useRef<Parameters<T> | undefined>(undefined);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      callback(...argsRef.current);
      cancel();
    }
  }, [callback, cancel]);

  const pending = useCallback(() => {
    return timeoutRef.current !== undefined;
  }, []);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    lastCallTimeRef.current = now;
    argsRef.current = args;

    const invokeFunc = () => {
      callback(...args);
      lastInvokeTimeRef.current = Date.now();
    };

    const shouldInvokeLeading = leading && (!lastInvokeTimeRef.current || 
      (now - lastInvokeTimeRef.current) >= delay);

    if (shouldInvokeLeading) {
      invokeFunc();
      return;
    }

    // Clear existing timeouts
    cancel();

    // Set up trailing invoke
    if (trailing) {
      timeoutRef.current = setTimeout(invokeFunc, delay);
    }

    // Set up max wait timeout
    if (maxWait && maxWait > delay) {
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
      const remainingWait = maxWait - timeSinceLastInvoke;
      
      if (remainingWait > 0) {
        maxTimeoutRef.current = setTimeout(invokeFunc, remainingWait);
      } else {
        invokeFunc();
      }
    }
  }, [callback, delay, leading, trailing, maxWait, cancel]);

  // Attach control methods
  (debouncedFunction as DebouncedFunction<T>).cancel = cancel;
  (debouncedFunction as DebouncedFunction<T>).flush = flush;
  (debouncedFunction as DebouncedFunction<T>).pending = pending;

  return debouncedFunction as DebouncedFunction<T>;
}

// ===== SEARCH SPECIFIC HOOKS =====

/**
 * useSearchDebounce - Specialized hook cho search functionality
 * @param searchTerm - Search term
 * @param onSearch - Search callback function
 * @param delay - Delay time (default: 300ms)
 * @returns Search state và control functions
 */
export function useSearchDebounce(
  searchTerm: string,
  onSearch: (term: string) => void,
  delay: number = 300
): {
  debouncedSearchTerm: string;
  isSearching: boolean;
  cancelSearch: () => void;
  executeSearch: () => void;
} {
  const [isSearching, setIsSearching] = useState(false);
  
  const { debouncedValue: debouncedSearchTerm, cancel } = useAdvancedDebounce(
    searchTerm,
    { delay, trailing: true }
  );

  const debouncedSearch = useDebounceCallback(
    (term: string) => {
      setIsSearching(true);
      onSearch(term);
      setIsSearching(false);
    },
    delay
  );

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      debouncedSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, debouncedSearch]);

  const cancelSearch = useCallback(() => {
    cancel();
    debouncedSearch.cancel();
    setIsSearching(false);
  }, [cancel, debouncedSearch]);

  const executeSearch = useCallback(() => {
    debouncedSearch.flush();
  }, [debouncedSearch]);

  return {
    debouncedSearchTerm,
    isSearching,
    cancelSearch,
    executeSearch,
  };
}

// ===== UTILITY HOOKS =====

/**
 * useDebounceEffect - Debounced useEffect
 * @param effect - Effect function
 * @param deps - Dependencies
 * @param delay - Delay time
 */
export function useDebounceEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number = 300
): void {
  const debouncedEffect = useDebounceCallback(effect, delay);

  useEffect(() => {
    debouncedEffect();
    return () => {
      debouncedEffect.cancel();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * useDebounceState - State với debounced updates
 * @param initialValue - Initial state value
 * @param delay - Delay time
 * @returns [state, debouncedState, setState, setDebouncedState]
 */
export function useDebounceState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  const debouncedState = useDebounce(state, delay);

  const setDebouncedState = useCallback((value: T) => {
    setState(value);
  }, []);

  return [state, debouncedState, setState, setDebouncedState];
}

// ===== PERFORMANCE MONITORING =====

/**
 * useDebounceWithMetrics - Debounce với performance tracking
 */
export function useDebounceWithMetrics<T>(
  value: T,
  delay: number = 300,
  metricName?: string
): {
  debouncedValue: T;
  metrics: {
    callCount: number;
    averageDelay: number;
    lastCallTime: number;
  };
} {
  const [callCount, setCallCount] = useState(0);
  const [totalDelay, setTotalDelay] = useState(0);
  const [lastCallTime, setLastCallTime] = useState(0);
  
  const startTimeRef = useRef<number | undefined>(undefined);
  
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setCallCount(prev => prev + 1);
    setLastCallTime(Date.now());
  }, [value]);

  useEffect(() => {
    if (startTimeRef.current) {
      const actualDelay = Date.now() - startTimeRef.current;
      setTotalDelay(prev => prev + actualDelay);
      
      // Log metrics in development
      if (process.env.NODE_ENV === 'development' && metricName) {
        console.log(`[Debounce Metrics - ${metricName}] Actual delay: ${actualDelay}ms`);
      }
    }
  }, [debouncedValue, metricName]);

  return {
    debouncedValue,
    metrics: {
      callCount,
      averageDelay: callCount > 0 ? totalDelay / callCount : 0,
      lastCallTime,
    },
  };
}
