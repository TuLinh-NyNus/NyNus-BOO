import * as z from 'zod';

import { emailSchema, passwordSchema, nameSchema } from './auth-schemas';

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  bio: z
    .string()
    .max(500, 'Tiểu sử không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại chỉ được chứa số, dấu +, -, khoảng trắng và dấu ngoặc')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'Địa chỉ không được vượt quá 200 ký tự')
    .optional()
    .or(z.literal('')),
});

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
      path: ['confirmPassword'],
    }
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: 'Mật khẩu mới phải khác với mật khẩu hiện tại',
      path: ['newPassword'],
    }
  );

// Basic profile info schema (for display)
export const basicProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

// Extended profile schema (with additional fields)
export const extendedProfileSchema = basicProfileSchema.extend({
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  fullName: z.string().optional(),
});

// Type exports
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
export type BasicProfile = z.infer<typeof basicProfileSchema>;
export type ExtendedProfile = z.infer<typeof extendedProfileSchema>;

// Validation helpers
export function validateProfileUpdate(data: unknown): ProfileUpdateFormValues {
  return profileUpdateSchema.parse(data);
}

export function validatePasswordChange(data: unknown): PasswordChangeFormValues {
  return passwordChangeSchema.parse(data);
}

// Form field validation helpers
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return true; // Optional field
  return /^[0-9+\-\s()]+$/.test(phone) && phone.length >= 10 && phone.length <= 20;
}

export function validateBio(bio: string): boolean {
  if (!bio) return true; // Optional field
  return bio.length <= 500;
}

export function validateAddress(address: string): boolean {
  if (!address) return true; // Optional field
  return address.length <= 200;
}

// Profile completion calculation
export function calculateProfileCompletion(profile: ExtendedProfile): {
  percentage: number;
  missingFields: string[];
} {
  const requiredFields = ['firstName', 'lastName', 'email'];
  const optionalFields = ['bio', 'phoneNumber', 'address'];
  
  const totalFields = requiredFields.length + optionalFields.length;
  let completedFields = 0;
  const missingFields: string[] = [];

  // Check required fields
  requiredFields.forEach(field => {
    if (profile[field as keyof ExtendedProfile]) {
      completedFields++;
    } else {
      missingFields.push(field);
    }
  });

  // Check optional fields
  optionalFields.forEach(field => {
    if (profile[field as keyof ExtendedProfile]) {
      completedFields++;
    } else {
      missingFields.push(field);
    }
  });

  const percentage = Math.round((completedFields / totalFields) * 100);

  return {
    percentage,
    missingFields,
  };
}

// Field labels for Vietnamese display
export const fieldLabels: Record<string, string> = {
  firstName: 'Tên',
  lastName: 'Họ',
  email: 'Email',
  bio: 'Tiểu sử',
  phoneNumber: 'Số điện thoại',
  address: 'Địa chỉ',
  currentPassword: 'Mật khẩu hiện tại',
  newPassword: 'Mật khẩu mới',
  confirmPassword: 'Xác nhận mật khẩu',
};
