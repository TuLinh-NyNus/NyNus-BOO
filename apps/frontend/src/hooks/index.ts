/**
 * Hooks Index
 * Export all hooks from this directory
 */

// Performance hooks
export {
  useDebounce,
  useAdvancedDebounce,
  useDebounceCallback,
  useSearchDebounce,
  useDebounceEffect,
  useDebounceState,
  useDebounceWithMetrics,
} from './useDebounce';

// Performance types
export type {
  DebounceOptions,
  DebouncedFunction,
} from './useDebounce';

// Toast hook
export { useToast, toast } from './use-toast';
export type { ToastProps, Toast } from './use-toast';

// Core hooks
export * from './use-homepage';

// Courses hooks
export * from './use-featured-courses';
export * from './use-tutorials';
