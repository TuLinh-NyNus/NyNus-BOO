/**
 * Global Form Types
 * Shared form types and validation interfaces
 */

// ===== CORE FORM TYPES =====

/**
 * Form Field Base Type
 * Base type for all form fields
 */
export type FormFieldBaseType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'hidden';

// Alias for backward compatibility
export type FormFieldType = FormFieldBaseType;

/**
 * Form Validation Rule
 * Individual validation rule
 */
export interface FormValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | Promise<boolean>;
}

/**
 * Form Field Validation
 * Validation configuration for form fields
 */
export interface FormFieldValidation {
  rules: FormValidationRule[];
  validateOn?: 'change' | 'blur' | 'submit';
  debounceMs?: number;
}

/**
 * Form Field Error
 * Error state for form fields
 */
export interface FormFieldError {
  field: string;
  message: string;
  type: string;
  value?: unknown;
}

/**
 * Form Submission State
 * State during form submission
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
  errors: FormFieldError[];
  touchedFields: string[];
}

// ===== FORM CONFIGURATION =====

/**
 * Form Configuration
 * Global form behavior configuration
 */
export interface FormConfiguration {
  validateOnChange: boolean;
  validateOnBlur: boolean;
  validateOnSubmit: boolean;
  resetOnSubmit: boolean;
  focusFirstError: boolean;
  scrollToError: boolean;
  debounceValidation: number;
  showErrorSummary: boolean;
}

/**
 * Default Form Configuration
 * Default values for form configuration
 */
export const DEFAULT_FORM_CONFIGURATION: FormConfiguration = {
  validateOnChange: true,
  validateOnBlur: true,
  validateOnSubmit: true,
  resetOnSubmit: false,
  focusFirstError: true,
  scrollToError: true,
  debounceValidation: 300,
  showErrorSummary: false
};

// ===== FORM FIELD PROPS =====

/**
 * Base Form Field Props
 * Common props for all form field components
 */
export interface BaseFormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoFocus?: boolean;
  className?: string;
  error?: string;
  touched?: boolean;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Text Input Props
 * Props for text-based input fields
 */
export interface TextInputProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  spellCheck?: boolean;
}

/**
 * Number Input Props
 * Props for number input fields
 */
export interface NumberInputProps extends BaseFormFieldProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

/**
 * Select Input Props
 * Props for select/dropdown fields
 */
export interface SelectInputProps extends BaseFormFieldProps {
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
    group?: string;
  }>;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
}

/**
 * File Input Props
 * Props for file upload fields
 */
export interface FileInputProps extends BaseFormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  preview?: boolean;
  dragDrop?: boolean;
}

// ===== FORM HOOKS TYPES =====

/**
 * Form Hook Return Type
 * Return type for form management hooks
 */
export interface FormHookReturn<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: unknown) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  submitForm: (onSubmit: (values: T) => Promise<void>) => Promise<void>;
}

// ===== VALIDATION HELPERS =====

/**
 * Validation Result
 * Result of field validation
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Async Validation Function
 * Function type for async validation
 */
export type AsyncValidationFunction<T = unknown> = (
  value: T,
  allValues: Record<string, unknown>
) => Promise<ValidationResult>;

/**
 * Sync Validation Function
 * Function type for sync validation
 */
export type SyncValidationFunction<T = unknown> = (
  value: T,
  allValues: Record<string, unknown>
) => ValidationResult;

// ===== FORM CONSTANTS =====

import { TIMEOUTS, LIMITS, VALIDATION_CONSTANTS } from '@/lib/constants/timeouts';

/**
 * Form Constants
 * Common constants for forms
 */
export const FORM_CONSTANTS = {
  DEFAULT_DEBOUNCE_MS: TIMEOUTS.DEBOUNCE_MS,
  MAX_FILE_SIZE_MB: LIMITS.MAX_FILE_SIZE_MB,
  MAX_FILES_COUNT: LIMITS.MAX_FILES_COUNT,
  VALIDATION_TIMEOUT_MS: TIMEOUTS.VALIDATION_TIMEOUT_MS,

  // Common validation patterns
  EMAIL_PATTERN: VALIDATION_CONSTANTS.EMAIL_PATTERN,
  PHONE_PATTERN: VALIDATION_CONSTANTS.PHONE_PATTERN,
  URL_PATTERN: VALIDATION_CONSTANTS.URL_PATTERN,

  // File type groups
  IMAGE_TYPES: VALIDATION_CONSTANTS.IMAGE_TYPES,
  DOCUMENT_TYPES: VALIDATION_CONSTANTS.DOCUMENT_TYPES,
  SPREADSHEET_TYPES: VALIDATION_CONSTANTS.SPREADSHEET_TYPES
} as const;

/**
 * Form Error Messages
 * Default error messages for validation
 */
export const FORM_ERROR_MESSAGES = {
  required: 'Trường này là bắt buộc',
  email: 'Email không hợp lệ',
  minLength: 'Tối thiểu {min} ký tự',
  maxLength: 'Tối đa {max} ký tự',
  min: 'Giá trị tối thiểu là {min}',
  max: 'Giá trị tối đa là {max}',
  pattern: 'Định dạng không hợp lệ',
  url: 'URL không hợp lệ',
  fileSize: 'Kích thước file quá lớn (tối đa {max}MB)',
  fileType: 'Loại file không được hỗ trợ',
  maxFiles: 'Tối đa {max} files'
} as const;
