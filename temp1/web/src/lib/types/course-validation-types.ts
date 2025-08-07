/**
 * Comprehensive course validation type definitions
 * Fixes TypeScript errors in course validation functions
 */

// Base course data interface for validation
export interface CourseValidationData {
  // Basic Info - Step 1
  title?: string;
  description?: string;
  instructor?: string;
  category?: string;
  level?: string;
  duration?: string;
  price?: string;
  language?: string;

  // Settings - Step 3
  hasSubtitles?: boolean;
  hasCertificate?: boolean;
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];

  // Additional properties that might be present
  [key: string]: unknown;
}

// Strict course data interface for complete validation
export interface StrictCourseData {
  // Required fields
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;

  // Optional fields
  duration?: string;
  price?: string;
  language?: string;
  hasSubtitles?: boolean;
  hasCertificate?: boolean;
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
}

// Partial course data for step-by-step validation
export interface PartialCourseData {
  title?: string;
  description?: string;
  instructor?: string;
  category?: string;
  level?: string;
  duration?: string;
  price?: string;
  language?: string;
  hasSubtitles?: boolean;
  hasCertificate?: boolean;
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
  [key: string]: unknown;
}

// Validation result interfaces
export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationResult {
  success: boolean;
  error: string | null;
}

export interface CompletionResult {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
}

// Type guards for course data validation
export function isCourseValidationData(data: unknown): data is CourseValidationData {
  return typeof data === 'object' && data !== null;
}

export function hasStringProperty(data: unknown, property: string): data is Record<string, string> {
  return isCourseValidationData(data) && 
         property in data && 
         typeof (data as any)[property] === 'string';
}

export function hasArrayProperty(data: unknown, property: string): data is Record<string, string[]> {
  return isCourseValidationData(data) && 
         property in data && 
         Array.isArray((data as any)[property]);
}

export function hasBooleanProperty(data: unknown, property: string): data is Record<string, boolean> {
  return isCourseValidationData(data) && 
         property in data && 
         typeof (data as any)[property] === 'boolean';
}

// Safe property access functions
export function getStringProperty(data: unknown, property: string): string | undefined {
  if (hasStringProperty(data, property)) {
    return data[property];
  }
  return undefined;
}

export function getArrayProperty(data: unknown, property: string): string[] | undefined {
  if (hasArrayProperty(data, property)) {
    return data[property];
  }
  return undefined;
}

export function getBooleanProperty(data: unknown, property: string): boolean | undefined {
  if (hasBooleanProperty(data, property)) {
    return data[property];
  }
  return undefined;
}

// Safe property access with defaults
export function safeGetString(data: unknown, property: string, defaultValue: string = ''): string {
  const value = getStringProperty(data, property);
  return value !== undefined ? value : defaultValue;
}

export function safeGetArray(data: unknown, property: string, defaultValue: string[] = []): string[] {
  const value = getArrayProperty(data, property);
  return value !== undefined ? value : defaultValue;
}

export function safeGetBoolean(data: unknown, property: string, defaultValue: boolean = false): boolean {
  const value = getBooleanProperty(data, property);
  return value !== undefined ? value : defaultValue;
}

// Validation helper functions
export function validateRequiredField(data: unknown, fieldName: string): boolean {
  const value = getStringProperty(data, fieldName);
  return value !== undefined && value.trim().length > 0;
}

export function validateOptionalField(data: unknown, fieldName: string): boolean {
  const value = getStringProperty(data, fieldName);
  return value === undefined || value.trim().length > 0;
}

export function validateArrayField(data: unknown, fieldName: string): boolean {
  const value = getArrayProperty(data, fieldName);
  return value === undefined || (Array.isArray(value) && value.length > 0);
}

// Data sanitization helpers
export function sanitizeStringField(data: unknown, fieldName: string): string | undefined {
  const value = getStringProperty(data, fieldName);
  return value?.trim();
}

export function sanitizeArrayField(data: unknown, fieldName: string): string[] {
  const value = getArrayProperty(data, fieldName);
  if (!value) return [];
  return value.filter((item: string) => typeof item === 'string' && item.trim().length > 0);
}

// Course data normalization
export function normalizeCourseData(data: unknown): CourseValidationData {
  if (!isCourseValidationData(data)) {
    return {};
  }

  return {
    title: sanitizeStringField(data, 'title'),
    description: sanitizeStringField(data, 'description'),
    instructor: sanitizeStringField(data, 'instructor'),
    category: sanitizeStringField(data, 'category'),
    level: sanitizeStringField(data, 'level'),
    duration: sanitizeStringField(data, 'duration'),
    price: sanitizeStringField(data, 'price'),
    language: sanitizeStringField(data, 'language'),
    hasSubtitles: safeGetBoolean(data, 'hasSubtitles'),
    hasCertificate: safeGetBoolean(data, 'hasCertificate'),
    requirements: sanitizeArrayField(data, 'requirements'),
    whatYouWillLearn: sanitizeArrayField(data, 'whatYouWillLearn'),
    targetAudience: sanitizeArrayField(data, 'targetAudience'),
  };
}

// Field completion checking
export function isFieldCompleted(data: unknown, fieldName: string): boolean {
  if (hasStringProperty(data, fieldName)) {
    const value = data[fieldName];
    return value !== undefined && value.trim().length > 0;
  }
  
  if (hasArrayProperty(data, fieldName)) {
    const value = data[fieldName];
    return value !== undefined && value.length > 0;
  }
  
  if (hasBooleanProperty(data, fieldName)) {
    return data[fieldName] !== undefined;
  }
  
  return false;
}

// Course data validation constants
export const REQUIRED_FIELDS = ['title', 'description', 'instructor', 'category', 'level'] as const;
export const OPTIONAL_FIELDS = ['duration', 'price', 'requirements', 'whatYouWillLearn', 'targetAudience'] as const;
export const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS] as const;

export type RequiredFieldName = typeof REQUIRED_FIELDS[number];
export type OptionalFieldName = typeof OPTIONAL_FIELDS[number];
export type FieldName = typeof ALL_FIELDS[number];

// Field validation mapping
export const FIELD_VALIDATORS: Record<FieldName, (data: unknown) => boolean> = {
  title: (data) => validateRequiredField(data, 'title'),
  description: (data) => validateRequiredField(data, 'description'),
  instructor: (data) => validateRequiredField(data, 'instructor'),
  category: (data) => validateRequiredField(data, 'category'),
  level: (data) => validateRequiredField(data, 'level'),
  duration: (data) => validateOptionalField(data, 'duration'),
  price: (data) => validateOptionalField(data, 'price'),
  requirements: (data) => validateArrayField(data, 'requirements'),
  whatYouWillLearn: (data) => validateArrayField(data, 'whatYouWillLearn'),
  targetAudience: (data) => validateArrayField(data, 'targetAudience'),
};

// Create typed course data from unknown
export function createTypedCourseData(data: unknown): CourseValidationData | null {
  if (!isCourseValidationData(data)) {
    return null;
  }
  return normalizeCourseData(data);
}

// Validate course data structure
export function validateCourseDataStructure(data: unknown): boolean {
  return isCourseValidationData(data);
}

// Get field value safely
export function getFieldValue(data: unknown, fieldName: string): unknown {
  if (isCourseValidationData(data) && fieldName in data) {
    return (data as any)[fieldName];
  }
  return undefined;
}

// Check if field exists
export function hasField(data: unknown, fieldName: string): boolean {
  return isCourseValidationData(data) && fieldName in data;
}

// Safe field access with type checking
export function safeFieldAccess<T>(
  data: unknown,
  fieldName: string,
  typeCheck: (value: unknown) => value is T,
  defaultValue: T
): T {
  if (hasField(data, fieldName)) {
    const value = getFieldValue(data, fieldName);
    if (typeCheck(value)) {
      return value;
    }
  }
  return defaultValue;
}

// Type checking functions
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// Course data conversion utilities
export function convertToCourseValidationData(data: unknown): CourseValidationData {
  const normalized = normalizeCourseData(data);
  return {
    title: normalized.title || '',
    description: normalized.description || '',
    instructor: normalized.instructor || '',
    category: normalized.category || '',
    level: normalized.level || '',
    duration: normalized.duration,
    price: normalized.price,
    language: normalized.language || 'Tiếng Việt',
    hasSubtitles: normalized.hasSubtitles || false,
    hasCertificate: normalized.hasCertificate || false,
    requirements: normalized.requirements || [],
    whatYouWillLearn: normalized.whatYouWillLearn || [],
    targetAudience: normalized.targetAudience || [],
  };
}
