/**
 * Main components barrel export
 * Optimized for tree shaking and bundle size
 */

// UI Components (most commonly used)
export * from './ui/form/button';
export * from './ui/form/input';
export * from './ui/display/card';
export * from './ui/display/badge';
export * from './ui/overlay/tooltip';
export * from './ui/feedback/alert';

// UI Module exports
export * from './ui';

// Shared Components (frequently used)
export * from './shared';

// LaTeX Components (lazy loaded)
export { default as LaTeXComponents } from './latex';

// Layout Components (always loaded)
export * from './layout';

// Feature Components (lazy loaded) - using namespace to avoid conflicts
export * as Features from './features';

// Provider Components
export * from './providers';

// Lazy Components
export * from './lazy';
