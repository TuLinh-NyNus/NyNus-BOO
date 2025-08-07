/**
 * Questions components barrel export
 * Restructured for better organization and tree shaking
 */

// Core components from new structure
export * from './components/question-item';
export * from './components/question-form';
export * from './components/question-display';
export * from './components/question-bank';

// MapID components (maintained in dedicated directory)
export * from './mapid';

// Info components (legacy structure maintained)
export * from './info';

// Search components
export * from './search';

// Types
export * from './types';

// Utils
export * from './utils';

// Error Boundaries
export * from './error-boundaries';

// Core MapID components (most used - direct exports)
export { UnifiedMapIDDecoder } from './mapid/unified-map-id-decoder';
export { UnifiedQuestionIDInfo } from './mapid/unified-question-id-info';
