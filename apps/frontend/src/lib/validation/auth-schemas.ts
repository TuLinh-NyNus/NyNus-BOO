// Authentication validation schemas
import { z } from "zod";
import {
  commonEmailSchema,
  commonPasswordSchema,
  commonNameSchema,
  passwordConfirmationRefinement
} from './shared/common-schemas';

// Re-export common schemas with auth-specific names
export const passwordSchema = commonPasswordSchema;
export const emailSchema = commonEmailSchema;

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mật khẩu không được để trống"),
  rememberMe: z.boolean().optional(),
});

// Register schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: commonNameSchema,
  lastName: commonNameSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Bạn phải đồng ý với điều khoản sử dụng",
  }),
}).refine(passwordConfirmationRefinement, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token không hợp lệ"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(passwordConfirmationRefinement, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Re-export password strength checker from shared utilities
export { checkPasswordStrength, type PasswordStrength } from './shared/common-schemas';

// Import for creating alias
import { checkPasswordStrength as importedCheckPasswordStrength } from './shared/common-schemas';

// Alias for backward compatibility
export const calculatePasswordStrength = importedCheckPasswordStrength;

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
