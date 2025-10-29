/**
 * Password Hashing Utilities
 * Secure password hashing với bcrypt
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

// ===== CONSTANTS =====

/**
 * Bcrypt salt rounds
 * Development: 10 rounds (faster)
 * Production: 12 rounds (more secure)
 */
const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10;

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false,
} as const;

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = 'WEAK',
  MEDIUM = 'MEDIUM',
  STRONG = 'STRONG',
  VERY_STRONG = 'VERY_STRONG',
}

// ===== TYPES =====

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

// ===== PASSWORD HASHING =====

/**
 * Hash password với bcrypt
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password không được để trống');
  }

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    throw new Error(`Password phải có ít nhất ${PASSWORD_RULES.MIN_LENGTH} ký tự`);
  }

  if (password.length > PASSWORD_RULES.MAX_LENGTH) {
    throw new Error(`Password không được vượt quá ${PASSWORD_RULES.MAX_LENGTH} ký tự`);
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  
  return hash;
}

/**
 * Verify password against hash
 * 
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('[Password] Error verifying password', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// ===== PASSWORD VALIDATION =====

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check length
  if (!password || password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(`Password phải có ít nhất ${PASSWORD_RULES.MIN_LENGTH} ký tự`);
  }

  if (password && password.length > PASSWORD_RULES.MAX_LENGTH) {
    errors.push(`Password không được vượt quá ${PASSWORD_RULES.MAX_LENGTH} ký tự`);
  }

  // Check uppercase
  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password phải chứa ít nhất 1 chữ hoa');
  }

  // Check lowercase
  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password phải chứa ít nhất 1 chữ thường');
  }

  // Check number
  if (PASSWORD_RULES.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password phải chứa ít nhất 1 chữ số');
  }

  // Check special character
  if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password phải chứa ít nhất 1 ký tự đặc biệt');
  }

  // Calculate strength
  const strength = calculatePasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Calculate password strength
 * 
 * @param password - Password to check
 * @returns Password strength level
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return PasswordStrength.WEAK;
  }

  let score = 0;

  // Length score
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety score
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score--; // Repeated characters
  if (/^[0-9]+$/.test(password)) score--; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) score--; // Only letters

  // Determine strength
  if (score <= 2) return PasswordStrength.WEAK;
  if (score <= 4) return PasswordStrength.MEDIUM;
  if (score <= 6) return PasswordStrength.STRONG;
  return PasswordStrength.VERY_STRONG;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate random password
 * 
 * @param length - Password length (default: 16)
 * @returns Random password
 */
export function generateRandomPassword(length = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Check if password is commonly used
 * 
 * @param password - Password to check
 * @returns True if password is common
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
  ];

  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Sanitize password for logging (mask all characters)
 * 
 * @param password - Password to sanitize
 * @returns Masked password
 */
export function sanitizePasswordForLogging(password: string): string {
  if (!password) return '';
  return '*'.repeat(password.length);
}


