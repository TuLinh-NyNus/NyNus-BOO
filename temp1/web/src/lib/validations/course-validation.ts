import { z } from 'zod';

import {
  CourseValidationData,
  PartialCourseData,
  ValidationResult,
  FieldValidationResult,
  isCourseValidationData,
  normalizeCourseData,
  safeGetString,
  safeGetArray,
  isFieldCompleted,
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS,
  createTypedCourseData
} from '@/lib/types/course-validation-types';

// Base course validation schema
export const courseValidationSchema = z.object({
  // Basic Info - Step 1
  title: z
    .string()
    .min(10, 'Tên khóa học phải có ít nhất 10 ký tự')
    .max(100, 'Tên khóa học không được vượt quá 100 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ0-9\s\-()]+$/, 'Tên khóa học chỉ được chứa chữ cái, số và ký tự đặc biệt cơ bản'),

  description: z
    .string()
    .min(50, 'Mô tả phải có ít nhất 50 ký tự')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),

  instructor: z
    .string()
    .min(2, 'Tên giảng viên phải có ít nhất 2 ký tự')
    .max(50, 'Tên giảng viên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên giảng viên chỉ được chứa chữ cái và khoảng trắng'),

  category: z
    .string()
    .min(1, 'Vui lòng chọn danh mục'),

  level: z
    .string()
    .min(1, 'Vui lòng chọn cấp độ'),

  duration: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^\d+\s*(giờ|phút|ngày|tuần|tháng)$/.test(val);
    }, 'Thời lượng phải có định dạng như "40 giờ", "30 phút"'),

  price: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^\d{1,3}(,\d{3})*\s*VNĐ$/.test(val);
    }, 'Giá phải có định dạng như "899,000 VNĐ"'),

  language: z
    .string()
    .default('Tiếng Việt'),

  // Settings - Step 3
  hasSubtitles: z
    .boolean()
    .default(false),

  hasCertificate: z
    .boolean()
    .default(false),

  requirements: z
    .array(z.string().min(1, 'Yêu cầu không được để trống'))
    .default([])
    .refine((arr) => arr.length <= 10, 'Không được có quá 10 yêu cầu'),

  whatYouWillLearn: z
    .array(z.string().min(1, 'Kết quả học tập không được để trống'))
    .default([])
    .refine((arr) => arr.length <= 15, 'Không được có quá 15 kết quả học tập'),

  targetAudience: z
    .array(z.string().min(1, 'Đối tượng học viên không được để trống'))
    .default([])
    .refine((arr) => arr.length <= 10, 'Không được có quá 10 đối tượng học viên'),
});

// Step-specific validation schemas
export const basicInfoSchema = courseValidationSchema.pick({
  title: true,
  description: true,
  instructor: true,
  category: true,
  level: true,
  duration: true,
  price: true,
  language: true,
});

export const settingsSchema = courseValidationSchema.pick({
  hasSubtitles: true,
  hasCertificate: true,
  requirements: true,
  whatYouWillLearn: true,
  targetAudience: true,
});

// Validation for different steps
export const stepValidationSchemas = {
  0: basicInfoSchema.partial().extend({
    title: z.string().min(1, 'Tên khóa học là bắt buộc'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
  }),
  1: z.object({}), // Content structure - no validation for now
  2: settingsSchema.partial(),
  3: courseValidationSchema, // Full validation for review step
};

// Error messages mapping
export const errorMessages = {
  required: 'Trường này là bắt buộc',
  minLength: (min: number) => `Phải có ít nhất ${min} ký tự`,
  maxLength: (max: number) => `Không được vượt quá ${max} ký tự`,
  invalidFormat: 'Định dạng không hợp lệ',
  invalidCharacters: 'Chứa ký tự không được phép',
  arrayTooLong: (max: number) => `Không được có quá ${max} mục`,
  custom: {
    title: {
      tooShort: 'Tên khóa học quá ngắn, cần ít nhất 10 ký tự',
      tooLong: 'Tên khóa học quá dài, tối đa 100 ký tự',
      invalidChars: 'Tên khóa học chỉ được chứa chữ cái, số và ký tự cơ bản',
    },
    description: {
      tooShort: 'Mô tả quá ngắn, cần ít nhất 50 ký tự để mô tả đầy đủ',
      tooLong: 'Mô tả quá dài, tối đa 1000 ký tự',
    },
    instructor: {
      tooShort: 'Tên giảng viên quá ngắn',
      tooLong: 'Tên giảng viên quá dài',
      invalidChars: 'Tên giảng viên chỉ được chứa chữ cái',
    },
    duration: {
      invalidFormat: 'Thời lượng phải có định dạng như "40 giờ", "30 phút"',
    },
    price: {
      invalidFormat: 'Giá phải có định dạng như "899,000 VNĐ"',
    },
  },
};

// Validation helper functions
export function validateStep(step: number, data: CourseValidationData): ValidationResult {
  const schema = stepValidationSchemas[step as keyof typeof stepValidationSchemas];
  if (!schema) return { success: true, errors: {} };

  try {
    schema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Có lỗi xảy ra khi validate dữ liệu' } };
  }
}

export function validateField(fieldName: string, value: unknown, step: number): FieldValidationResult {
  const schema = stepValidationSchemas[step as keyof typeof stepValidationSchemas];
  if (!schema) return { success: true, error: null };

  try {
    const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape];
    if (fieldSchema && typeof fieldSchema === 'object' && 'parse' in fieldSchema) {
      (fieldSchema as any).parse(value);
    }
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Dữ liệu không hợp lệ' };
    }
    return { success: false, error: 'Có lỗi xảy ra khi validate' };
  }
}

// Form data sanitization
export function sanitizeCourseData(data: CourseValidationData): CourseValidationData {
  const normalized = normalizeCourseData(data);
  return {
    ...normalized,
    title: safeGetString(data, 'title')?.trim(),
    description: safeGetString(data, 'description')?.trim(),
    instructor: safeGetString(data, 'instructor')?.trim(),
    duration: safeGetString(data, 'duration')?.trim(),
    price: safeGetString(data, 'price')?.trim(),
    requirements: safeGetArray(data, 'requirements').filter((req: string) => req.trim()),
    whatYouWillLearn: safeGetArray(data, 'whatYouWillLearn').filter((item: string) => item.trim()),
    targetAudience: safeGetArray(data, 'targetAudience').filter((audience: string) => audience.trim()),
  };
}

// Check if step can proceed
export function canProceedToNextStep(step: number, data: CourseValidationData): boolean {
  const validation = validateStep(step, data);
  return validation.success;
}

// Get completion percentage for progress indicator
export function getCompletionPercentage(data: CourseValidationData): number {
  if (!isCourseValidationData(data)) {
    return 0;
  }

  let completed = 0;
  const total = REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length;

  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (isFieldCompleted(data, field)) {
      completed++;
    }
  });

  // Check optional fields
  OPTIONAL_FIELDS.forEach(field => {
    if (isFieldCompleted(data, field)) {
      completed++;
    }
  });

  return Math.round((completed / total) * 100);
}

// Safe wrapper functions for unknown data
export function safeValidateStep(step: number, data: unknown): ValidationResult {
  const typedData = createTypedCourseData(data);
  if (!typedData) {
    return { success: false, errors: { general: 'Dữ liệu không hợp lệ' } };
  }
  return validateStep(step, typedData);
}

export function safeSanitizeCourseData(data: unknown): CourseValidationData {
  const typedData = createTypedCourseData(data);
  if (!typedData) {
    return {};
  }
  return sanitizeCourseData(typedData);
}

export function safeCanProceedToNextStep(step: number, data: unknown): boolean {
  const typedData = createTypedCourseData(data);
  if (!typedData) {
    return false;
  }
  return canProceedToNextStep(step, typedData);
}

export function safeGetCompletionPercentage(data: unknown): number {
  const typedData = createTypedCourseData(data);
  if (!typedData) {
    return 0;
  }
  return getCompletionPercentage(typedData);
}

export type CourseValidationSchema = z.infer<typeof courseValidationSchema>;
export type BasicInfoSchema = z.infer<typeof basicInfoSchema>;
export type SettingsSchema = z.infer<typeof settingsSchema>;
