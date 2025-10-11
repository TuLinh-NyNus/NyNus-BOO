/**
 * Zod Validation Schemas
 * Centralized validation schemas cho API requests
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { z } from 'zod';
import { PASSWORD_RULES } from '@/lib/auth/password';

// ===== COMMON SCHEMAS =====

/**
 * UUID Schema
 */
export const uuidSchema = z.string().uuid({
  message: 'ID không hợp lệ',
});

/**
 * Email Schema
 */
export const emailSchema = z
  .string({
    required_error: 'Email là bắt buộc',
  })
  .email({
    message: 'Email không hợp lệ',
  })
  .toLowerCase()
  .trim();

/**
 * Password Schema
 */
export const passwordSchema = z
  .string({
    required_error: 'Password là bắt buộc',
  })
  .min(PASSWORD_RULES.MIN_LENGTH, {
    message: `Password phải có ít nhất ${PASSWORD_RULES.MIN_LENGTH} ký tự`,
  })
  .max(PASSWORD_RULES.MAX_LENGTH, {
    message: `Password không được vượt quá ${PASSWORD_RULES.MAX_LENGTH} ký tự`,
  })
  .regex(/[A-Z]/, {
    message: 'Password phải chứa ít nhất 1 chữ hoa',
  })
  .regex(/[a-z]/, {
    message: 'Password phải chứa ít nhất 1 chữ thường',
  })
  .regex(/[0-9]/, {
    message: 'Password phải chứa ít nhất 1 chữ số',
  });

/**
 * Phone Number Schema
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+84|0)[0-9]{9,10}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  .optional();

/**
 * URL Schema
 */
export const urlSchema = z
  .string()
  .url({
    message: 'URL không hợp lệ',
  })
  .optional();

/**
 * Date Schema
 */
export const dateSchema = z.coerce.date({
  errorMap: () => ({ message: 'Ngày không hợp lệ' }),
});

// ===== PAGINATION SCHEMAS =====

/**
 * Pagination Query Schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ===== USER SCHEMAS =====

/**
 * User Role Schema
 */
export const userRoleSchema = z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'TUTOR', 'GUEST'], {
  errorMap: () => ({ message: 'Role không hợp lệ' }),
});

/**
 * User Status Schema
 */
export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'], {
  errorMap: () => ({ message: 'Status không hợp lệ' }),
});

/**
 * Create User Schema
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string({
      required_error: 'Tên là bắt buộc',
    })
    .min(1, 'Tên không được để trống')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .trim(),
  lastName: z
    .string({
      required_error: 'Họ là bắt buộc',
    })
    .min(1, 'Họ không được để trống')
    .max(50, 'Họ không được vượt quá 50 ký tự')
    .trim(),
  username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(30, 'Username không được vượt quá 30 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ, số và dấu gạch dưới')
    .optional(),
  role: userRoleSchema.default('STUDENT'),
  phone: phoneSchema,
  avatar: urlSchema,
});

/**
 * Update User Schema
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  phone: phoneSchema,
  avatar: urlSchema,
  bio: z.string().max(500, 'Bio không được vượt quá 500 ký tự').optional(),
  address: z.string().max(200, 'Địa chỉ không được vượt quá 200 ký tự').optional(),
  school: z.string().max(100, 'Trường không được vượt quá 100 ký tự').optional(),
  dateOfBirth: dateSchema.optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

/**
 * User Query Schema
 */
export const userQuerySchema = paginationQuerySchema.extend({
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  search: z.string().max(100).optional(),
});

// ===== QUESTION SCHEMAS =====

/**
 * Question Type Schema
 * Matches Prisma enum questiontype: MC, TF, SA, ES, MA
 */
export const questionTypeSchema = z.enum(
  ['MC', 'TF', 'SA', 'ES', 'MA'],
  {
    errorMap: () => ({ message: 'Loại câu hỏi không hợp lệ' }),
  }
);

/**
 * Question Difficulty Schema
 */
export const questionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT'], {
  errorMap: () => ({ message: 'Độ khó không hợp lệ' }),
});

/**
 * Create Question Schema
 */
export const createQuestionSchema = z.object({
  content: z
    .string({
      required_error: 'Nội dung câu hỏi là bắt buộc',
    })
    .min(10, 'Nội dung câu hỏi phải có ít nhất 10 ký tự')
    .max(5000, 'Nội dung câu hỏi không được vượt quá 5000 ký tự'),
  rawContent: z.string().min(1, 'Raw content là bắt buộc'),
  type: questionTypeSchema,
  difficulty: questionDifficultySchema.default('MEDIUM'),
  grade: z.string().max(20).optional(),
  subject: z.string().max(50).optional(),
  chapter: z.string().max(100).optional(),
  level: z.string().max(50).optional(),
  answers: z.any().optional(), // Prisma Json type
  correctAnswer: z.string().optional(),
  solution: z.string().max(5000).optional(),
  tag: z.array(z.string()).default([]),
});

/**
 * Question Query Schema
 */
export const questionQuerySchema = paginationQuerySchema.extend({
  type: questionTypeSchema.optional(),
  difficulty: questionDifficultySchema.optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED']).optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  search: z.string().max(200).optional(),
});

// ===== EXAM SCHEMAS =====

/**
 * Exam Status Schema
 * Matches Prisma enum exam_status: ACTIVE, PENDING, INACTIVE, ARCHIVED
 */
export const examStatusSchema = z.enum(['ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED'], {
  errorMap: () => ({ message: 'Trạng thái đề thi không hợp lệ' }),
});

/**
 * Create Exam Schema
 */
export const createExamSchema = z.object({
  title: z
    .string({
      required_error: 'Tiêu đề đề thi là bắt buộc',
    })
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string().max(1000).optional(),
  instructions: z.string().max(2000).optional(),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1, 'Thời gian thi phải ít nhất 1 phút')
    .max(480, 'Thời gian thi không được vượt quá 480 phút'),
  totalPoints: z.coerce.number().min(0).optional(),
  passPercentage: z.coerce.number().min(0).max(100).default(50),
  examType: z.enum(['generated', 'official']).optional(),
  status: examStatusSchema.default('ACTIVE'),
  subject: z.string().max(50).optional(),
  grade: z.string().max(20).optional(),
  difficulty: questionDifficultySchema.optional(),
  tags: z.array(z.string()).default([]),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  maxAttempts: z.coerce.number().int().min(1).optional(),
  questionIds: z.array(uuidSchema).default([]),
});

/**
 * Exam Query Schema
 */
export const examQuerySchema = paginationQuerySchema.extend({
  status: examStatusSchema.optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
  difficulty: questionDifficultySchema.optional(),
  search: z.string().max(200).optional(),
});

// ===== VALIDATION HELPERS =====

/**
 * Validate data against schema
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError): {
  errors: Array<{ field: string; message: string }>;
  failedFields: string[];
} {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  const failedFields = [...new Set(errors.map((e) => e.field))];

  return { errors, failedFields };
}

