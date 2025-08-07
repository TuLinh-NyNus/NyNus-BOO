// MapID components exports
export { UnifiedMapIDDecoder as default } from './unified-map-id-decoder';
export { UnifiedMapIDDecoder } from './unified-map-id-decoder';
export { UnifiedQuestionIDInfo } from './unified-question-id-info';

// New decomposed components (Task 1.3.1)
export { QuestionIDForm } from './QuestionIDForm';
export { QuestionIDDisplay } from './QuestionIDDisplay';
export { QuestionIDValidation } from './QuestionIDValidation';
export { MapIDDecoder as NewMapIDDecoder } from './MapIDDecoder';

// Legacy components (for backward compatibility)
export { default as MapIDDecoder } from './map-id-decoder';
export { QuestionIDDecoder } from './question-id-decoder';
export { default as QuestionIDDetailedMeaning } from './question-id-detailed-meaning';
export { default as QuestionIDInfo } from './question-id-info';
export { QuestionIDMeaning } from './question-id-meaning';
export { default as MapIDDisplay } from './map-id-display';
export { default as MapIDSearch } from './map-id-search';
