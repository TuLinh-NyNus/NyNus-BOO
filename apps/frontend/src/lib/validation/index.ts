/**
 * Validation Module Exports
 * Central export point cho tất cả validation schemas và utilities
 */

// Authentication schemas
export * from './auth-schemas';

// Question validation schemas
export * from './question-schemas';

// File upload validation
export * from './file-upload-schemas';

// Sanitization utilities
export * from './sanitization/xss-prevention';

// Shared validation utilities
export * from './shared/common-schemas';

// Re-export commonly used types
export type {
  QuestionFormData,
  CreateQuestionFormData,
  UpdateQuestionFormData,
  BulkActionData,
} from './question-schemas';

export type {
  SingleFileUpload,
  MultipleFilesUpload,
  FileContentValidation,
  LaTeXFileUpload,
  CSVImportData,
} from './file-upload-schemas';
