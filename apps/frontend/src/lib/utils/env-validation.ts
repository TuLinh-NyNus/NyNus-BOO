/**
 * Frontend Environment Variable Validation Utility
 *
 * Validates critical environment variables at runtime and build time
 * Provides clear error messages for missing or invalid configurations
 */

import { logger } from '@/lib/logger';

// ===== TYPES =====

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  variable: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  variable: string;
  message: string;
  suggestion?: string;
}

// ===== ENVIRONMENT DETECTION =====

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.APP_ENV === 'staging';

// ===== VALIDATION RULE TYPES =====

interface ValidationRule {
  required: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  validValues?: string[];
  forbiddenValues?: string[];
  expectedValues?: Record<string, string>;
  description: string;
}

// ===== VALIDATION RULES =====

const VALIDATION_RULES: Record<string, ValidationRule> = {
  // NextAuth configuration
  NEXTAUTH_URL: {
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'NextAuth URL must be a valid HTTP/HTTPS URL',
    expectedValues: {
      development: 'http://localhost:3000',
      staging: 'https://staging.nynus.edu.vn',
      production: 'https://app.nynus.edu.vn'
    }
  },

  NEXTAUTH_SECRET: {
    required: true,
    minLength: 32,
    description: 'NextAuth secret must be at least 32 characters long',
    forbiddenValues: ['your-nextauth-secret', 'change-this', 'default']
  },

  // API URLs
  NEXT_PUBLIC_API_URL: {
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'API URL must be a valid HTTP/HTTPS URL'
  },

  NEXT_PUBLIC_GRPC_URL: {
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'gRPC URL must be a valid HTTP/HTTPS URL'
  },

  // Google OAuth (required in production/staging)
  GOOGLE_CLIENT_ID: {
    required: isProduction || isStaging,
    pattern: /\.apps\.googleusercontent\.com$/,
    description: 'Google Client ID must end with .apps.googleusercontent.com'
  },

  GOOGLE_CLIENT_SECRET: {
    required: isProduction || isStaging,
    minLength: 20,
    description: 'Google Client Secret must be at least 20 characters long',
    forbiddenValues: ['your-client-secret', 'change-this']
  },

  // Feature flags (optional but validated if present)
  NEXT_PUBLIC_ENABLE_LATEX_PARSER: {
    required: false,
    validValues: ['true', 'false'],
    description: 'LaTeX parser flag must be true or false'
  },

  NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING: {
    required: false,
    validValues: ['true', 'false'],
    description: 'Image processing flag must be true or false'
  }
};

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate a single environment variable
 */
function validateEnvVar(
  name: string,
  value: string | undefined,
  rules: ValidationRule
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check if required
  if (rules.required && (!value || value.trim() === '')) {
    errors.push({
      variable: name,
      message: `Required environment variable ${name} is missing or empty`,
      severity: 'error'
    });
    return errors; // Skip other validations if missing
  }
  
  // Skip validation if not required and empty
  if (!rules.required && (!value || value.trim() === '')) {
    return errors;
  }
  
  const trimmedValue = value?.trim() || '';
  
  // Check forbidden values
  if (rules.forbiddenValues && rules.forbiddenValues.includes(trimmedValue)) {
    errors.push({
      variable: name,
      message: `${name} uses a forbidden default value: ${trimmedValue}`,
      severity: 'error'
    });
  }
  
  // Check minimum length
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    errors.push({
      variable: name,
      message: `${name} must be at least ${rules.minLength} characters long (current: ${trimmedValue.length})`,
      severity: 'error'
    });
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    errors.push({
      variable: name,
      message: `${name} format is invalid. ${rules.description}`,
      severity: 'error'
    });
  }
  
  // Check valid values
  if (rules.validValues && !rules.validValues.includes(trimmedValue)) {
    errors.push({
      variable: name,
      message: `${name} has invalid value: ${trimmedValue}. Valid values: ${rules.validValues.join(', ')}`,
      severity: 'error'
    });
  }
  
  // Check expected values (warnings only)
  if (rules.expectedValues) {
    const currentEnv = isProduction ? 'production' : isStaging ? 'staging' : 'development';
    const expectedValue = rules.expectedValues[currentEnv as keyof typeof rules.expectedValues];
    
    if (expectedValue && trimmedValue !== expectedValue) {
      errors.push({
        variable: name,
        message: `${name} value may be incorrect for ${currentEnv} environment. Expected: ${expectedValue}, Got: ${trimmedValue}`,
        severity: 'warning'
      });
    }
  }
  
  return errors;
}

/**
 * Validate all environment variables
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Validate each environment variable
  Object.entries(VALIDATION_RULES).forEach(([name, rules]) => {
    const value = process.env[name];
    const validationErrors = validateEnvVar(name, value, rules);
    
    validationErrors.forEach(error => {
      if (error.severity === 'error') {
        errors.push(error);
      } else {
        warnings.push({
          variable: error.variable,
          message: error.message
        });
      }
    });
  });
  
  // Additional cross-validation
  const crossValidationErrors = performCrossValidation();
  errors.push(...crossValidationErrors);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Perform cross-validation between related environment variables
 */
function performCrossValidation(): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate API URL and gRPC URL consistency
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const grpcUrl = process.env.NEXT_PUBLIC_GRPC_URL;
  
  if (apiUrl && grpcUrl) {
    try {
      const apiUrlObj = new URL(apiUrl);
      const grpcUrlObj = new URL(grpcUrl);
      
      // In most cases, API and gRPC should use the same host
      if (apiUrlObj.host !== grpcUrlObj.host) {
        errors.push({
          variable: 'NEXT_PUBLIC_GRPC_URL',
          message: `API URL and gRPC URL use different hosts. This may cause CORS issues. API: ${apiUrlObj.host}, gRPC: ${grpcUrlObj.host}`,
          severity: 'warning'
        });
      }
    } catch (_error) {
      // URL parsing errors are already caught by pattern validation
    }
  }
  
  // Validate OAuth configuration completeness
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if ((googleClientId && !googleClientSecret) || (!googleClientId && googleClientSecret)) {
    errors.push({
      variable: 'GOOGLE_CLIENT_ID',
      message: 'Google OAuth configuration is incomplete. Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided together',
      severity: 'error'
    });
  }
  
  return errors;
}

/**
 * Log validation results
 * Business Logic: Hiển thị kết quả validation environment variables
 * - Log info nếu tất cả valid
 * - Log warnings cho các biến có vấn đề nhỏ
 * - Log errors cho các biến critical bị thiếu hoặc invalid
 */
export function logValidationResults(result: ValidationResult): void {
  if (result.isValid && result.warnings.length === 0) {
    logger.info('[EnvValidation] All environment variables are valid', {
      operation: 'validateEnvironment',
      status: 'success',
    });
    return;
  }

  if (result.warnings.length > 0) {
    logger.warn('[EnvValidation] Environment variable warnings detected', {
      operation: 'validateEnvironment',
      warningCount: result.warnings.length,
      warnings: result.warnings.map(w => ({
        variable: w.variable,
        message: w.message,
        suggestion: w.suggestion,
      })),
    });
  }

  if (result.errors.length > 0) {
    logger.error('[EnvValidation] Environment variable errors detected', {
      operation: 'validateEnvironment',
      errorCount: result.errors.length,
      errors: result.errors.map(e => ({
        variable: e.variable,
        message: e.message,
      })),
      environment: isProduction ? 'production' : 'development',
    });

    if (isProduction) {
      logger.error('[EnvValidation] Application may not function correctly in production', {
        operation: 'validateEnvironment',
        severity: 'critical',
      });
    }
  }
}

/**
 * Validate environment variables and throw error if critical issues found
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironmentVariables();
  
  // Always log results
  logValidationResults(result);
  
  // In production, throw error for any validation errors
  if (!result.isValid && isProduction) {
    throw new Error(
      `Environment validation failed with ${result.errors.length} error(s). ` +
      'Please check the console for details and fix the configuration before deploying to production.'
    );
  }
  
  // In development, only throw for critical errors
  if (!result.isValid && isDevelopment) {
    const criticalErrors = result.errors.filter(error =>
      error.variable.includes('NEXTAUTH') ||
      error.variable.includes('API_URL') ||
      error.variable.includes('GRPC_URL')
    );

    if (criticalErrors.length > 0) {
      logger.warn('[EnvValidation] Critical environment variable errors detected', {
        operation: 'validateEnvironment',
        criticalErrorCount: criticalErrors.length,
        criticalErrors: criticalErrors.map(e => e.variable),
      });
    }
  }
}

// ===== RUNTIME VALIDATION =====

// Validate environment variables when this module is imported
if (typeof window === 'undefined') {
  // Server-side validation
  try {
    validateEnvironmentOrThrow();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Don't throw in development to allow hot reloading
    if (isProduction) {
      process.exit(1);
    }
  }
}

