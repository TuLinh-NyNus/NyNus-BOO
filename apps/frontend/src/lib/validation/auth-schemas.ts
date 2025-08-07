// Authentication validation schemas
import { z } from "zod";

// Password strength validation
export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
  .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt");

// Email validation
export const emailSchema = z
  .string()
  .email("Email không hợp lệ")
  .min(1, "Email không được để trống");

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
  firstName: z.string().min(1, "Tên không được để trống"),
  lastName: z.string().min(1, "Họ không được để trống"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Bạn phải đồng ý với điều khoản sử dụng",
  }),
}).refine(data => data.password === data.confirmPassword, {
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
}).refine(data => data.password === data.confirmPassword, {
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

// Password strength checker
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

  if (password.length >= 8) score++;
  else feedback.push("Cần ít nhất 8 ký tự");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 chữ hoa");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 chữ thường");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 số");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("Cần ít nhất 1 ký tự đặc biệt");

  const getStrengthInfo = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { color: 'red', label: 'Yếu' };
      case 2:
        return { color: 'orange', label: 'Trung bình' };
      case 3:
        return { color: 'yellow', label: 'Khá' };
      case 4:
      case 5:
        return { color: 'green', label: 'Mạnh' };
      default:
        return { color: 'red', label: 'Yếu' };
    }
  };

  const strengthInfo = getStrengthInfo(score);

  return {
    score,
    feedback,
    isValid: score >= 4,
    color: strengthInfo.color,
    label: strengthInfo.label,
    suggestions: feedback,
  };
}

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Alias for backward compatibility
export const calculatePasswordStrength = checkPasswordStrength;
