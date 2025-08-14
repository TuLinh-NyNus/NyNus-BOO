/**
 * Admin Form Types
 * Consolidated form types for admin interface
 */

import { UserRole, UserStatus } from '../user';

// ===== CORE FORM INTERFACES =====

/**
 * Form Field Type
 * Type cho form field types
 */
export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'file'
  | 'image'
  | 'rich-text'
  | 'json'
  | 'tags';

/**
 * Form Field Interface
 * Interface cho form fields
 */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: unknown;
  validation?: FormFieldValidation;
  options?: FormFieldOption[];
  dependencies?: FormFieldDependency[];
  metadata?: Record<string, unknown>;
}

/**
 * Form Field Option Interface
 * Interface cho form field options
 */
export interface FormFieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  description?: string;
  icon?: string;
  color?: string;
}

/**
 * Form Field Validation Interface
 * Interface cho form field validation
 */
export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: unknown) => string | null;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  positive?: boolean;
}

/**
 * Form Field Dependency Interface
 * Interface cho form field dependencies
 */
export interface FormFieldDependency {
  field: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: unknown;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

// ===== ADMIN FORM INTERFACES =====

/**
 * Admin User Form Interface
 * Interface cho admin user forms
 */
export interface AdminUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions?: string[];
  password?: string;
  confirmPassword?: string;
  avatar?: File | string;
  bio?: string;
  level?: number;
  maxConcurrentSessions?: number;
  notes?: string;
  tags?: string[];
}

/**
 * Admin Course Form Interface
 * Interface cho admin course forms
 */
export interface AdminCourseForm {
  title: string;
  description: string;
  shortDescription?: string;
  image?: File | string;
  instructorId: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration: string;
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];
  featured: boolean;
  popular: boolean;
  isPublished: boolean;
  hasSubtitles: boolean;
  hasCertificate: boolean;
}

/**
 * Admin Question Form Interface
 * Interface cho admin question forms
 */
export interface AdminQuestionForm {
  content: string;
  type: 'multiple-choice' | 'essay' | 'true-false' | 'fill-blank';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  subject: string;
  grade: string;
  chapter?: string;
  lesson?: string;
  points: number;
  timeLimit?: number;
  explanation?: string;
  options?: QuestionOptionForm[];
  correctAnswer?: string | string[];
  tags?: string[];
  isActive: boolean;
}

/**
 * Question Option Form Interface
 * Interface cho question option forms
 */
export interface QuestionOptionForm {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  order: number;
}

/**
 * Admin Settings Form Interface
 * Interface cho admin settings forms
 */
export interface AdminSettingsForm {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  logo?: File | string;
  favicon?: File | string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  enableRegistration: boolean;
  enableEmailVerification: boolean;
  enableTwoFactor: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

// ===== FORM STATE & VALIDATION =====

/**
 * Form State Interface
 * Interface cho form state
 */
export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

/**
 * Form Actions Interface
 * Interface cho form actions
 */
export interface FormActions<T = Record<string, unknown>> {
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  submitForm: () => Promise<void>;
}

// ===== FORM CONFIGURATION =====

/**
 * Form Configuration Interface
 * Interface cho form configuration
 */
export interface FormConfig {
  validateOnChange: boolean;
  validateOnBlur: boolean;
  validateOnSubmit: boolean;
  resetOnSubmit: boolean;
  enableReinitialize: boolean;
  debug: boolean;
}

/**
 * Default Form Configuration
 * Default config cho forms
 */
export const DEFAULT_FORM_CONFIG: FormConfig = {
  validateOnChange: true,
  validateOnBlur: true,
  validateOnSubmit: true,
  resetOnSubmit: false,
  enableReinitialize: false,
  debug: false
};

// ===== FORM BUILDER INTERFACES =====

/**
 * Form Schema Interface
 * Interface cho form schema
 */
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  sections?: FormSection[];
  config: FormConfig;
  metadata?: Record<string, unknown>;
}

/**
 * Form Section Interface
 * Interface cho form sections
 */
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  conditional?: FormFieldDependency;
}

// ===== HOOK RETURN TYPES =====

/**
 * Use Form Hook Return
 * Return type cho useForm hook
 */
export interface UseFormReturn<T = Record<string, unknown>> {
  state: FormState<T>;
  actions: FormActions<T>;
  register: (field: keyof T) => FormFieldProps;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}

/**
 * Form Field Props Interface
 * Interface cho form field props
 */
export interface FormFieldProps {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
}

// ===== BULK OPERATIONS =====

/**
 * Bulk Operation Form Interface
 * Interface cho bulk operation forms
 */
export interface BulkOperationForm {
  action: 'activate' | 'deactivate' | 'delete' | 'update' | 'export';
  selectedIds: string[];
  reason?: string;
  updateData?: Record<string, unknown>;
  exportFormat?: 'csv' | 'xlsx' | 'json';
  exportFields?: string[];
}

/**
 * Import Form Interface
 * Interface cho import forms
 */
export interface ImportForm {
  file: File;
  format: 'csv' | 'xlsx' | 'json';
  hasHeaders: boolean;
  fieldMapping: Record<string, string>;
  validateData: boolean;
  skipErrors: boolean;
  updateExisting: boolean;
}
