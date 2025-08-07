/**
 * useDebounce Hook
 * Debounce hook để delay API calls khi user typing
 *
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useEffect } from "react";

/**
 * useDebounce Hook
 * Delays the update of a value until after a specified delay
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
