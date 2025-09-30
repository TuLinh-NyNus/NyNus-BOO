/**
 * Question Validation Schemas
 * Comprehensive Zod schemas cho tất cả question types với validation rules chi tiết
 * Error messages tiếng Việt cho user experience tốt hơn
 */

import { z } from "zod";
import { QuestionType, QuestionDifficulty, QuestionStatus } from "@/types/question";
import {
  commonContentSchema,
  commonCategorySchema,
  uniqueArrayRefinement
} from './shared/common-schemas';

// ===== BASE VALIDATION RULES =====

/**
 * Content validation - Nội dung câu hỏi (using shared schema)
 */
const contentSchema = commonContentSchema;

/**
 * Explanation validation - Lời giải
 */
const explanationSchema = z
  .string()
  .max(10000, "Lời giải không được vượt quá 10000 ký tự")
  .optional()
  .refine(
    (explanation) => !explanation || explanation.trim().length > 0,
    "Lời giải không được chỉ chứa khoảng trắng"
  );

/**
 * Tags validation
 */
const tagsSchema = z
  .array(z.string().min(1, "Tag không được để trống"))
  .max(10, "Không được có quá 10 tags")
  .optional()
  .default([]);

/**
 * Points validation
 */
const pointsSchema = z
  .number()
  .min(0.5, "Điểm phải ít nhất 0.5")
  .max(100, "Điểm không được vượt quá 100")
  .default(1);

/**
 * Time limit validation (seconds)
 */
const timeLimitSchema = z
  .number()
  .min(30, "Thời gian làm bài phải ít nhất 30 giây")
  .max(7200, "Thời gian làm bài không được vượt quá 2 giờ")
  .optional();

// ===== BASE QUESTION SCHEMA =====

/**
 * Base schema cho tất cả question types
 */
const baseQuestionSchema = z.object({
  content: contentSchema,
  type: z.nativeEnum(QuestionType, {
    errorMap: () => ({ message: "Loại câu hỏi không hợp lệ" })
  }),
  difficulty: z.nativeEnum(QuestionDifficulty, {
    errorMap: () => ({ message: "Độ khó không hợp lệ" })
  }),
  category: commonCategorySchema,
  tags: tagsSchema,
  points: pointsSchema,
  timeLimit: timeLimitSchema,
  explanation: explanationSchema,
  status: z.nativeEnum(QuestionStatus).optional().default(QuestionStatus.PENDING),
});

// ===== ANSWER OPTION SCHEMAS =====

/**
 * Multiple Choice Option Schema
 */
const multipleChoiceOptionSchema = z.object({
  id: z.string().min(1, "ID lựa chọn không được để trống"),
  content: z
    .string()
    .min(1, "Nội dung lựa chọn không được để trống")
    .max(1000, "Nội dung lựa chọn không được vượt quá 1000 ký tự"),
  isCorrect: z.boolean(),
});

/**
 * True/False Option Schema - Now supports any content, not just "Đúng"/"Sai"
 */
const trueFalseOptionSchema = z.object({
  id: z.string().min(1, "ID lựa chọn không được để trống"),
  content: z
    .string()
    .min(1, "Nội dung lựa chọn không được để trống")
    .max(1000, "Nội dung lựa chọn không được vượt quá 1000 ký tự"),
  isCorrect: z.boolean(),
});

// ===== QUESTION TYPE SPECIFIC SCHEMAS =====

/**
 * Multiple Choice Question Schema
 */
export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.MC),
  options: z
    .array(multipleChoiceOptionSchema)
    .min(2, "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn")
    .max(6, "Câu hỏi trắc nghiệm không được có quá 6 lựa chọn")
    .refine(
      (options) => options.filter(opt => opt.isCorrect).length === 1,
      "Câu hỏi trắc nghiệm phải có đúng 1 đáp án đúng"
    )
    .refine(
      (options) => {
        const contents = options.map(opt => opt.content.toLowerCase().trim());
        return new Set(contents).size === contents.length;
      },
      "Các lựa chọn không được trùng lặp"
    ),
});

/**
 * True/False Question Schema - Now supports 4+ options with flexible correct answers
 */
export const trueFalseQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.TF),
  options: z
    .array(trueFalseOptionSchema)
    .min(4, "Câu hỏi đúng/sai phải có ít nhất 4 lựa chọn")
    .max(10, "Câu hỏi đúng/sai không được có quá 10 lựa chọn")
    // TF allows flexible correct answers: 0, 1, or multiple
    .refine(
      (options) => uniqueArrayRefinement(
        options,
        () => "Các lựa chọn không được trùng lặp",
        (opt) => opt.content.toLowerCase().trim()
      ),
      "Các lựa chọn không được trùng lặp"
    ),
});

/**
 * Short Answer Question Schema
 */
export const shortAnswerQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.SA),
  correctAnswers: z
    .array(z.string().min(1, "Đáp án không được để trống"))
    .min(1, "Phải có ít nhất 1 đáp án đúng")
    .max(5, "Không được có quá 5 đáp án đúng")
    .refine(
      (answers) => {
        const trimmedAnswers = answers.map(ans => ans.toLowerCase().trim());
        return new Set(trimmedAnswers).size === trimmedAnswers.length;
      },
      "Các đáp án không được trùng lặp"
    ),
  caseSensitive: z.boolean().optional().default(false),
});

/**
 * Essay Question Schema
 */
export const essayQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.ES),
  minWords: z
    .number()
    .min(10, "Số từ tối thiểu phải ít nhất 10")
    .max(1000, "Số từ tối thiểu không được vượt quá 1000")
    .optional(),
  maxWords: z
    .number()
    .min(50, "Số từ tối đa phải ít nhất 50")
    .max(5000, "Số từ tối đa không được vượt quá 5000")
    .optional(),
  rubric: z
    .string()
    .max(2000, "Rubric không được vượt quá 2000 ký tự")
    .optional(),
}).refine(
  (data) => !data.minWords || !data.maxWords || data.minWords <= data.maxWords,
  {
    message: "Số từ tối thiểu phải nhỏ hơn hoặc bằng số từ tối đa",
    path: ["maxWords"]
  }
);

/**
 * Multiple Answer Question Schema
 */
export const multipleAnswerQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.MA),
  options: z
    .array(multipleChoiceOptionSchema)
    .min(3, "Câu hỏi nhiều đáp án phải có ít nhất 3 lựa chọn")
    .max(8, "Câu hỏi nhiều đáp án không được có quá 8 lựa chọn")
    .refine(
      (options) => {
        const correctCount = options.filter(opt => opt.isCorrect).length;
        return correctCount >= 2 && correctCount <= options.length - 1;
      },
      "Câu hỏi nhiều đáp án phải có ít nhất 2 đáp án đúng và ít nhất 1 đáp án sai"
    )
    .refine(
      (options) => {
        const contents = options.map(opt => opt.content.toLowerCase().trim());
        return new Set(contents).size === contents.length;
      },
      "Các lựa chọn không được trùng lặp"
    ),
});

// ===== UNION SCHEMA =====

/**
 * Main Question Schema - Union của tất cả question types
 */
export const questionSchema = z.union([
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  shortAnswerQuestionSchema,
  essayQuestionSchema,
  multipleAnswerQuestionSchema,
]);

// ===== FORM SCHEMAS =====

/**
 * Question Creation Form Schema
 */
export const createQuestionFormSchema = questionSchema;

/**
 * Question Update Form Schema
 */
export const updateQuestionFormSchema = z.object({
  id: z.string().min(1, "ID câu hỏi không được để trống"),
  content: z.string().optional(),
  type: z.nativeEnum(QuestionType).optional(),
  difficulty: z.nativeEnum(QuestionDifficulty).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  points: z.number().optional(),
  timeLimit: z.number().optional(),
  explanation: z.string().optional(),
  status: z.nativeEnum(QuestionStatus).optional(),
});

/**
 * Question Bulk Action Schema
 */
export const bulkActionSchema = z.object({
  questionIds: z
    .array(z.string().min(1, "ID câu hỏi không hợp lệ"))
    .min(1, "Phải chọn ít nhất 1 câu hỏi"),
  action: z.enum(["delete", "publish", "archive", "duplicate"], {
    errorMap: () => ({ message: "Hành động không hợp lệ" })
  }),
});

// ===== TYPE EXPORTS =====

export type QuestionFormData = z.infer<typeof questionSchema>;
export type CreateQuestionFormData = z.infer<typeof createQuestionFormSchema>;
export type UpdateQuestionFormData = z.infer<typeof updateQuestionFormSchema>;
export type BulkActionData = z.infer<typeof bulkActionSchema>;

// ===== VALIDATION HELPERS =====

/**
 * Validate question based on type
 */
export function validateQuestionByType(data: unknown, type: QuestionType) {
  switch (type) {
    case QuestionType.MC:
      return multipleChoiceQuestionSchema.safeParse(data);
    case QuestionType.TF:
      return trueFalseQuestionSchema.safeParse(data);
    case QuestionType.SA:
      return shortAnswerQuestionSchema.safeParse(data);
    case QuestionType.ES:
      return essayQuestionSchema.safeParse(data);
    case QuestionType.MA:
      return multipleAnswerQuestionSchema.safeParse(data);
    default:
      return { success: false, error: { message: "Loại câu hỏi không được hỗ trợ" } };
  }
}

// Re-export validation errors helper from shared utilities
export { getValidationErrors } from './shared/common-schemas';

/**
 * Conditional validation based on question type
 */
export function getConditionalValidationRules(type: QuestionType) {
  const baseRules = {
    content: { required: true, minLength: 10, maxLength: 5000 },
    category: { required: true, maxLength: 100 },
    difficulty: { required: true },
    points: { required: true, min: 0.5, max: 100 },
  };

  switch (type) {
    case QuestionType.MC:
      return {
        ...baseRules,
        options: {
          required: true,
          minItems: 2,
          maxItems: 6,
          exactCorrectAnswers: 1
        },
      };

    case QuestionType.TF:
      return {
        ...baseRules,
        options: {
          required: true,
          minItems: 4,
          maxItems: 10,
          flexibleCorrectAnswers: true // 0, 1, or multiple correct answers allowed
        },
      };

    case QuestionType.SA:
      return {
        ...baseRules,
        correctAnswers: {
          required: true,
          minItems: 1,
          maxItems: 5
        },
        caseSensitive: { required: false },
      };

    case QuestionType.ES:
      return {
        ...baseRules,
        minWords: { required: false, min: 10, max: 1000 },
        maxWords: { required: false, min: 50, max: 5000 },
        rubric: { required: false, maxLength: 2000 },
      };

    case QuestionType.MA:
      return {
        ...baseRules,
        options: {
          required: true,
          minItems: 3,
          maxItems: 8,
          minCorrectAnswers: 2,
          maxCorrectAnswers: "length-1"
        },
      };

    default:
      return baseRules;
  }
}
