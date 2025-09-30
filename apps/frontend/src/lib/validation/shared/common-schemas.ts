/**
 * Common Validation Schemas
 * Shared validation patterns and utilities to eliminate duplication
 */

import { z } from "zod";
import { VALIDATION_CONSTANTS, AUTH_CONSTANTS, LIMITS } from '@/lib/constants/timeouts';

// ===== COMMON PATTERNS =====

/**
 * Email validation schema
 */
export const commonEmailSchema = z
  .string()
  .email("Email không hợp lệ")
  .min(1, "Email không được để trống")
  .max(255, "Email không được vượt quá 255 ký tự");

/**
 * Password validation schema with strength requirements
 */
export const commonPasswordSchema = z
  .string()
  .min(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH, `Mật khẩu phải có ít nhất ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} ký tự`)
  .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
  .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt");

/**
 * Phone number validation schema (Vietnamese format)
 */
export const commonPhoneSchema = z
  .string()
  .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (định dạng Việt Nam)");

/**
 * URL validation schema
 */
export const commonUrlSchema = z
  .string()
  .regex(VALIDATION_CONSTANTS.URL_PATTERN, "URL không hợp lệ");

/**
 * Content validation schema with security checks
 */
export const commonContentSchema = z
  .string()
  .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH, `Nội dung phải có ít nhất ${VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH} ký tự`)
  .max(VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH, `Nội dung không được vượt quá ${VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH} ký tự`)
  .refine(
    (content) => content.trim().length > 0,
    "Nội dung không được chỉ chứa khoảng trắng"
  )
  .refine(
    (content) => !content.includes("<script"),
    "Nội dung không được chứa thẻ script"
  );

/**
 * Filename validation schema
 */
export const commonFilenameSchema = z
  .string()
  .min(1, "Tên file không được để trống")
  .max(VALIDATION_CONSTANTS.MAX_FILENAME_LENGTH, `Tên file không được vượt quá ${VALIDATION_CONSTANTS.MAX_FILENAME_LENGTH} ký tự`)
  .refine(
    (filename) => !/[<>:"/\\|?*]/.test(filename),
    "Tên file chứa ký tự không hợp lệ"
  );

/**
 * Name validation schema (for first name, last name)
 */
export const commonNameSchema = z
  .string()
  .min(1, "Tên không được để trống")
  .max(50, "Tên không được vượt quá 50 ký tự")
  .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng");

/**
 * Category/Tag validation schema
 */
export const commonCategorySchema = z
  .string()
  .min(1, "Danh mục không được để trống")
  .max(100, "Danh mục không được vượt quá 100 ký tự");

/**
 * ID validation schema
 */
export const commonIdSchema = z
  .string()
  .min(1, "ID không hợp lệ");

// ===== SECURITY PATTERNS =====

/**
 * Security validation patterns
 */
export const SECURITY_VALIDATION_PATTERNS = {
  // Script injection patterns
  SCRIPT_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
  ],
  
  // Dangerous file signatures
  DANGEROUS_SIGNATURES: [
    'MZ', // Windows PE
    '\x7fELF', // Linux ELF
    '\xca\xfe\xba\xbe', // Java class
    'PK', // ZIP/JAR
  ],
  
  // XSS patterns
  XSS_PATTERNS: [
    /<script/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
  ],
} as const;

/**
 * Check for dangerous content
 */
export function containsDangerousContent(content: string): string[] {
  const issues: string[] = [];
  
  // Check for script injection
  for (const pattern of SECURITY_VALIDATION_PATTERNS.SCRIPT_PATTERNS) {
    if (pattern.test(content)) {
      issues.push('Nội dung chứa mã script nguy hiểm');
      break;
    }
  }
  
  // Check for XSS patterns
  for (const pattern of SECURITY_VALIDATION_PATTERNS.XSS_PATTERNS) {
    if (pattern.test(content)) {
      issues.push('Nội dung có thể chứa XSS');
      break;
    }
  }
  
  return issues;
}

// ===== COMMON REFINEMENTS =====

/**
 * Password confirmation refinement
 */
export const passwordConfirmationRefinement = <T extends { password: string; confirmPassword: string }>(
  data: T
) => {
  return data.password === data.confirmPassword;
};

/**
 * Unique array refinement
 */
export const uniqueArrayRefinement = <T>(
  items: T[],
  getMessage: (duplicates: T[]) => string,
  getKey?: (item: T) => string
) => {
  const keys = items.map(item => getKey ? getKey(item) : String(item).toLowerCase().trim());
  const uniqueKeys = new Set(keys);
  return uniqueKeys.size === keys.length;
};

/**
 * File size validation
 */
export const fileSizeSchema = z
  .number()
  .min(LIMITS.MIN_FILE_SIZE, "File quá nhỏ")
  .max(LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024, `File không được vượt quá ${LIMITS.MAX_FILE_SIZE_MB}MB`);

/**
 * Array length validation with custom messages
 */
export const arrayLengthSchema = (min: number, max: number, itemName: string) => z
  .array(z.unknown())
  .min(min, `Phải có ít nhất ${min} ${itemName}`)
  .max(max, `Không được có quá ${max} ${itemName}`);

// ===== VALIDATION HELPERS =====

/**
 * Get validation errors in Vietnamese
 */
export function getValidationErrors(result: z.SafeParseReturnType<unknown, unknown>): string[] {
  if (result.success) return [];

  return result.error.errors.map(error => {
    const path = error.path.length > 0 ? `${error.path.join(".")}: ` : "";
    return `${path}${error.message}`;
  });
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T, 
  requiredFields: (keyof T)[]
): string[] {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    const value = obj[field];
    if (value === null || value === undefined || value === '') {
      errors.push(`${String(field)} là bắt buộc`);
    }
  });
  
  return errors;
}

/**
 * Check if email is valid (utility function)
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_CONSTANTS.EMAIL_PATTERN.test(email);
}

/**
 * Check if phone is valid (utility function)
 */
export function isValidPhone(phone: string): boolean {
  return /^(\+84|0)[0-9]{9,10}$/.test(phone);
}

/**
 * Check password strength
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
  color: string;
  label: string;
  suggestions: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= AUTH_CONSTANTS.PASSWORD_MIN_LENGTH) score++;
  else feedback.push(`Cần ít nhất ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} ký tự`);

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 chữ hoa");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 chữ thường");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 số");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 ký tự đặc biệt");

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

  return {
    score,
    feedback,
    isValid: score >= 4,
    color: colors[score] || colors[0],
    label: labels[score] || labels[0],
    suggestions: score < 4 ? feedback : [],
  };
}

// ===== TYPE EXPORTS =====

export type CommonEmail = z.infer<typeof commonEmailSchema>;
export type CommonPassword = z.infer<typeof commonPasswordSchema>;
export type CommonPhone = z.infer<typeof commonPhoneSchema>;
export type CommonUrl = z.infer<typeof commonUrlSchema>;
export type CommonContent = z.infer<typeof commonContentSchema>;
export type CommonFilename = z.infer<typeof commonFilenameSchema>;
export type CommonName = z.infer<typeof commonNameSchema>;
export type CommonCategory = z.infer<typeof commonCategorySchema>;
export type CommonId = z.infer<typeof commonIdSchema>;
