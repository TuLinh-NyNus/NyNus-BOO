/**
 * Enhanced Form Validation System
 * 
 * Hệ thống validation form toàn diện với real-time feedback
 */

import { z } from 'zod';

import logger from '@/lib/utils/logger';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  fieldStates: Record<string, 'valid' | 'invalid' | 'warning' | 'pending'>;
}

/**
 * Interface cho form data values
 */
export type FormFieldValue = string | number | boolean | null | undefined | string[] | number[];

/**
 * Interface cho form data object
 */
export type FormData = Record<string, FormFieldValue>;

/**
 * Interface cho validation rule
 */
export interface ValidationRule {
  field: string;
  validator: (value: FormFieldValue, formData: FormData) => Promise<ValidationResult> | ValidationResult;
  debounceMs?: number;
  dependencies?: string[];
}

/**
 * Enhanced Form Validator Class
 */
export class FormValidator {
  private rules: Map<string, ValidationRule[]> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private validationCache: Map<string, ValidationResult> = new Map();

  /**
   * Add validation rule cho một field
   */
  addRule(rule: ValidationRule): void {
    const fieldRules = this.rules.get(rule.field) || [];
    fieldRules.push(rule);
    this.rules.set(rule.field, fieldRules);
  }

  /**
   * Add multiple rules
   */
  addRules(rules: ValidationRule[]): void {
    rules.forEach(rule => this.addRule(rule));
  }

  /**
   * Validate single field
   */
  async validateField(
    field: string,
    value: FormFieldValue,
    formData: FormData
  ): Promise<ValidationResult> {
    const rules = this.rules.get(field) || [];
    
    if (rules.length === 0) {
      return {
        isValid: true,
        errors: {},
        warnings: {},
        fieldStates: { [field]: 'valid' }
      };
    }

    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    let isValid = true;

    // Run all rules for the field
    for (const rule of rules) {
      try {
        const result = await rule.validator(value, formData);
        
        if (!result.isValid) {
          isValid = false;
          Object.assign(errors, result.errors);
        }
        
        Object.assign(warnings, result.warnings);
      } catch (error) {
        logger.error(`Validation error for field ${field}:`, error);
        isValid = false;
        errors[field] = 'Lỗi validation không xác định';
      }
    }

    const result: ValidationResult = {
      isValid,
      errors,
      warnings,
      fieldStates: {
        [field]: isValid ? (Object.keys(warnings).length > 0 ? 'warning' : 'valid') : 'invalid'
      }
    };

    // Cache result
    this.validationCache.set(`${field}-${JSON.stringify(value)}`, result);

    return result;
  }

  /**
   * Validate field với debouncing
   */
  async validateFieldDebounced(
    field: string,
    value: FormFieldValue,
    formData: FormData,
    callback: (result: ValidationResult) => void
  ): Promise<void> {
    const rules = this.rules.get(field) || [];
    const debounceMs = rules[0]?.debounceMs || 300;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(field);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      const result = await this.validateField(field, value, formData);
      callback(result);
      this.debounceTimers.delete(field);
    }, debounceMs);

    this.debounceTimers.set(field, timer);
  }

  /**
   * Validate entire form
   */
  async validateForm(formData: FormData): Promise<ValidationResult> {
    const allErrors: Record<string, string> = {};
    const allWarnings: Record<string, string> = {};
    const fieldStates: Record<string, 'valid' | 'invalid' | 'warning' | 'pending'> = {};
    let isFormValid = true;

    // Get all fields that have rules
    const fieldsToValidate = Array.from(this.rules.keys());

    // Validate each field
    for (const field of fieldsToValidate) {
      const value = formData[field];
      const result = await this.validateField(field, value, formData);

      if (!result.isValid) {
        isFormValid = false;
        Object.assign(allErrors, result.errors);
      }

      Object.assign(allWarnings, result.warnings);
      Object.assign(fieldStates, result.fieldStates);
    }

    return {
      isValid: isFormValid,
      errors: allErrors,
      warnings: allWarnings,
      fieldStates
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Clear debounce timers
   */
  clearTimers(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.clearCache();
    this.clearTimers();
  }
}

/**
 * Common validation functions
 */
export const ValidationFunctions = {
  /**
   * Email validation
   */
  email: (value: FormFieldValue): ValidationResult => {
    // Type guard: ensure value is string
    if (typeof value !== 'string') {
      return {
        isValid: false,
        errors: { email: 'Email phải là chuỗi ký tự' },
        warnings: {},
        fieldStates: { email: 'invalid' }
      };
    }

    const emailSchema = z.string().email();

    try {
      emailSchema.parse(value);
      return {
        isValid: true,
        errors: {},
        warnings: {},
        fieldStates: { email: 'valid' }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: { email: 'Email không hợp lệ' },
        warnings: {},
        fieldStates: { email: 'invalid' }
      };
    }
  },

  /**
   * Password strength validation
   */
  password: (value: FormFieldValue): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Type guard: ensure value is string
    if (typeof value !== 'string') {
      return {
        isValid: false,
        errors: { password: 'Mật khẩu phải là chuỗi ký tự' },
        warnings: {},
        fieldStates: { password: 'invalid' }
      };
    }

    if (!value) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (value.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else {
      // Check password strength
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

      if (strengthScore < 2) {
        errors.password = 'Mật khẩu quá yếu. Cần có chữ hoa, chữ thường, số và ký tự đặc biệt';
      } else if (strengthScore < 3) {
        warnings.password = 'Mật khẩu trung bình. Nên thêm ký tự đặc biệt để bảo mật hơn';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      fieldStates: {
        password: Object.keys(errors).length > 0 ? 'invalid' :
                 Object.keys(warnings).length > 0 ? 'warning' : 'valid'
      }
    };
  },

  /**
   * Confirm password validation
   */
  confirmPassword: (value: FormFieldValue, formData: FormData): ValidationResult => {
    // Type guard: ensure value is string
    if (typeof value !== 'string') {
      return {
        isValid: false,
        errors: { confirmPassword: 'Xác nhận mật khẩu phải là chuỗi ký tự' },
        warnings: {},
        fieldStates: { confirmPassword: 'invalid' }
      };
    }

    const password = formData.password;

    if (!value) {
      return {
        isValid: false,
        errors: { confirmPassword: 'Xác nhận mật khẩu là bắt buộc' },
        warnings: {},
        fieldStates: { confirmPassword: 'invalid' }
      };
    }

    if (value !== password) {
      return {
        isValid: false,
        errors: { confirmPassword: 'Mật khẩu xác nhận không khớp' },
        warnings: {},
        fieldStates: { confirmPassword: 'invalid' }
      };
    }

    return {
      isValid: true,
      errors: {},
      warnings: {},
      fieldStates: { confirmPassword: 'valid' }
    };
  },

  /**
   * Required field validation
   */
  required: (fieldName: string) => (value: FormFieldValue): ValidationResult => {
    const isEmpty = value === null || value === undefined || 
                   (typeof value === 'string' && value.trim() === '') ||
                   (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      return {
        isValid: false,
        errors: { [fieldName]: `${fieldName} là bắt buộc` },
        warnings: {},
        fieldStates: { [fieldName]: 'invalid' }
      };
    }

    return {
      isValid: true,
      errors: {},
      warnings: {},
      fieldStates: { [fieldName]: 'valid' }
    };
  },

  /**
   * Name validation (Vietnamese names)
   */
  vietnameseName: (fieldName: string) => (value: FormFieldValue): ValidationResult => {
    // Type guard: ensure value is string
    if (typeof value !== 'string') {
      return {
        isValid: false,
        errors: { [fieldName]: `${fieldName} phải là chuỗi ký tự` },
        warnings: {},
        fieldStates: { [fieldName]: 'invalid' }
      };
    }

    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        errors: { [fieldName]: `${fieldName} là bắt buộc` },
        warnings: {},
        fieldStates: { [fieldName]: 'invalid' }
      };
    }

    // Vietnamese name pattern (letters, spaces, some special characters)
    const vietnameseNamePattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;

    if (!vietnameseNamePattern.test(value.trim())) {
      return {
        isValid: false,
        errors: { [fieldName]: `${fieldName} chỉ được chứa chữ cái và khoảng trắng` },
        warnings: {},
        fieldStates: { [fieldName]: 'invalid' }
      };
    }

    if (value.trim().length < 2) {
      return {
        isValid: false,
        errors: { [fieldName]: `${fieldName} phải có ít nhất 2 ký tự` },
        warnings: {},
        fieldStates: { [fieldName]: 'invalid' }
      };
    }

    return {
      isValid: true,
      errors: {},
      warnings: {},
      fieldStates: { [fieldName]: 'valid' }
    };
  }
};

/**
 * Create validator cho auth forms
 */
export function createAuthFormValidator(): FormValidator {
  const validator = new FormValidator();

  // Email validation
  validator.addRule({
    field: 'email',
    validator: (value: FormFieldValue) => ValidationFunctions.email(value),
    debounceMs: 500
  });

  // Password validation
  validator.addRule({
    field: 'password',
    validator: (value: FormFieldValue) => ValidationFunctions.password(value),
    debounceMs: 300
  });

  // Confirm password validation
  validator.addRule({
    field: 'confirmPassword',
    validator: (value: FormFieldValue, formData: FormData) => ValidationFunctions.confirmPassword(value, formData),
    dependencies: ['password'],
    debounceMs: 300
  });

  // First name validation
  validator.addRule({
    field: 'firstName',
    validator: (value: FormFieldValue) => ValidationFunctions.vietnameseName('Tên')(value),
    debounceMs: 300
  });

  // Last name validation
  validator.addRule({
    field: 'lastName',
    validator: (value: FormFieldValue) => ValidationFunctions.vietnameseName('Họ')(value),
    debounceMs: 300
  });

  return validator;
}
