import * as z from 'zod';

// Enum cho loại câu hỏi
export const QuestionTypeEnum = z.enum(['MC', 'TF', 'SA', 'ES', 'MA'], {
  errorMap: () => ({ message: 'Vui lòng chọn loại câu hỏi hợp lệ' })
});

// Enum cho độ khó
export const DifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD'], {
  errorMap: () => ({ message: 'Vui lòng chọn độ khó hợp lệ' })
});

// Schema cơ bản cho câu hỏi - Updated to PascalCase naming
export const baseQuestionSchema = z.object({
  Content: z
    .string()
    .min(10, 'Nội dung câu hỏi phải có ít nhất 10 ký tự')
    .max(2000, 'Nội dung câu hỏi không được vượt quá 2000 ký tự')
    .refine(
      (content) => content.trim().length > 0,
      'Nội dung câu hỏi không được để trống'
    ),

  rawContent: z
    .string()
    .optional()
    .or(z.literal('')),

  Type: QuestionTypeEnum,

  Solution: z
    .string()
    .max(1000, 'Lời giải không được vượt quá 1000 ký tự')
    .optional()
    .or(z.literal('')),

  Source: z
    .string()
    .max(200, 'Nguồn câu hỏi không được vượt quá 200 ký tự')
    .optional()
    .or(z.literal('')),

  Tags: z
    .array(z.string().min(1, 'Tag không được để trống'))
    .max(10, 'Không được có quá 10 tags')
    .optional()
    .default([]),

  Difficulty: DifficultyEnum.optional().default('MEDIUM'), // Updated to PascalCase

  Points: z
    .number()
    .min(0.5, 'Điểm số phải ít nhất 0.5')
    .max(10, 'Điểm số không được vượt quá 10')
    .optional()
    .default(1),

  TimeLimit: z
    .number()
    .min(10, 'Thời gian phải ít nhất 10 giây')
    .max(3600, 'Thời gian không được vượt quá 1 giờ')
    .optional()
    .default(60),
});

// Schema cho Multiple Choice (MC) - Updated to PascalCase
export const multipleChoiceSchema = baseQuestionSchema.extend({
  Type: z.literal('MC'),
  Options: z
    .array(z.string().min(1, 'Lựa chọn không được để trống'))
    .min(2, 'Phải có ít nhất 2 lựa chọn')
    .max(6, 'Không được có quá 6 lựa chọn')
    .refine(
      (options) => new Set(options).size === options.length,
      'Các lựa chọn không được trùng lặp'
    ),
  correctAnswer: z
    .number()
    .min(0, 'Đáp án đúng không hợp lệ'),
});

// Schema cho True/False (TF) - Updated to PascalCase
export const trueFalseSchema = baseQuestionSchema.extend({
  Type: z.literal('TF'),
  correctAnswer: z.boolean({
    errorMap: () => ({ message: 'Vui lòng chọn đáp án đúng (Đúng/Sai)' })
  }),
});

// Schema cho Short Answer (SA) - Updated to PascalCase
export const shortanswerschema = baseQuestionSchema.extend({
  Type: z.literal('SA'),
  correctAnswer: z
    .string()
    .min(1, 'Đáp án không được để trống')
    .max(200, 'Đáp án không được vượt quá 200 ký tự'),
  Acceptableanswers: z
    .array(z.string().min(1))
    .max(10, 'Không được có quá 10 đáp án chấp nhận được')
    .optional()
    .default([]),
});

// Schema cho Essay (ES) - Updated to PascalCase
export const essaySchema = baseQuestionSchema.extend({
  Type: z.literal('ES'),
  Rubric: z
    .string()
    .max(1000, 'Tiêu chí chấm điểm không được vượt quá 1000 ký tự')
    .optional()
    .or(z.literal('')),
  MaxWords: z
    .number()
    .min(50, 'Số từ tối thiểu phải ít nhất 50')
    .max(2000, 'Số từ tối đa không được vượt quá 2000')
    .optional()
    .default(300),
});

// Schema cho Multiple Answer (MA) - Updated to PascalCase
export const multipleanswerschema = baseQuestionSchema.extend({
  Type: z.literal('MA'),
  Options: z
    .array(z.string().min(1, 'Lựa chọn không được để trống'))
    .min(2, 'Phải có ít nhất 2 lựa chọn')
    .max(8, 'Không được có quá 8 lựa chọn')
    .refine(
      (options) => new Set(options).size === options.length,
      'Các lựa chọn không được trùng lặp'
    ),
  correctanswers: z
    .array(z.number())
    .min(1, 'Phải có ít nhất 1 đáp án đúng'),
});

// Union schema cho tất cả loại câu hỏi - Updated to use PascalCase 'Type'
export const questionSchema = z.discriminatedUnion('Type', [
  multipleChoiceSchema,
  trueFalseSchema,
  shortanswerschema,
  essaySchema,
  multipleanswerschema,
]);

// Schema cho form tạo câu hỏi - Updated to PascalCase
export const createQuestionFormSchema = z.object({
  Content: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi'),
  Type: QuestionTypeEnum,
  Difficulty: DifficultyEnum.optional().default('MEDIUM'),
  Points: z.number().optional().default(1),
  TimeLimit: z.number().optional().default(60),
  Solution: z.string().optional().or(z.literal('')),
  Source: z.string().optional().or(z.literal('')),
  Tags: z.array(z.string()).optional().default([]),

  // Conditional fields based on question type - PascalCase
  Options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.number(), z.boolean(), z.string()]).optional(),
  correctanswers: z.array(z.number()).optional(),
  Acceptableanswers: z.array(z.string()).optional(),
  Rubric: z.string().optional(),
  MaxWords: z.number().optional(),
}).refine((data) => {
  // Validation logic based on question type - Updated to use PascalCase
  switch (data.type) {
    case 'MC':
      return data.Options && data.Options.length >= 2 &&
             typeof data.correctAnswer === 'number' &&
             data.correctAnswer >= 0 && data.correctAnswer < data.Options.length;
    case 'TF':
      return typeof data.correctAnswer === 'boolean';
    case 'SA':
      return typeof data.correctAnswer === 'string' && data.correctAnswer.length > 0;
    case 'ES':
      return true; // Essay questions don't require correctAnswer
    case 'MA':
      return data.Options && data.Options.length >= 2 &&
             data.correctanswers && data.correctanswers.length >= 1 &&
             data.correctanswers.every(answer => answer >= 0 && answer < data.Options!.length);
    default:
      return false;
  }
}, {
  message: 'Dữ liệu câu hỏi không hợp lệ cho loại câu hỏi đã chọn',
});

// Schema cho cập nhật câu hỏi - tạo riêng do createQuestionFormSchema là ZodEffects
export const updateQuestionSchema = z.object({
  Content: z.string().optional(),
  type: QuestionTypeEnum.optional(),
  difficulty: DifficultyEnum.optional(),
  points: z.number().optional(),
  timeLimit: z.number().optional(),
  Solution: z.string().optional(),
  source: z.string().optional(),
  Tags: z.array(z.string()).optional(),
  Options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.number(), z.boolean(), z.string()]).optional(),
  correctanswers: z.array(z.number()).optional(),
  acceptableanswers: z.array(z.string()).optional(),
  Rubric: z.string().optional(),
  maxWords: z.number().optional(),
});

// Type definitions
export type QuestionType = z.infer<typeof QuestionTypeEnum>;
export type Difficulty = z.infer<typeof DifficultyEnum>;
export type BaseQuestion = z.infer<typeof baseQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseSchema>;
export type ShortAnswerQuestion = z.infer<typeof shortanswerschema>;
export type EssayQuestion = z.infer<typeof essaySchema>;
export type MultipleAnswerQuestion = z.infer<typeof multipleanswerschema>;
export type Question = z.infer<typeof questionSchema>;
export type CreateQuestionFormValues = z.infer<typeof createQuestionFormSchema>;
export type UpdateQuestionFormValues = z.infer<typeof updateQuestionSchema>;

// Helper function để validate question dựa trên type
export const validateQuestionByType = (data: any, type: QuestionType) => {
  switch (type) {
    case 'MC':
      return multipleChoiceSchema.safeParse(data);
    case 'TF':
      return trueFalseSchema.safeParse(data);
    case 'SA':
      return shortanswerschema.safeParse(data);
    case 'ES':
      return essaySchema.safeParse(data);
    case 'MA':
      return multipleanswerschema.safeParse(data);
    default:
      return { success: false, error: { message: 'Loại câu hỏi không hợp lệ' } };
  }
};

// Helper function để get default values cho form
export const getDefaultQuestionValues = (type: QuestionType): Partial<CreateQuestionFormValues> => {
  const base = {
    content: '',
    type,
    difficulty: 'MEDIUM' as Difficulty,
    points: 1,
    timeLimit: 60,
    solution: '',
    source: '',
    tags: [],
  };

  switch (type) {
    case 'MC':
      return {
        ...base,
        Options: ['', '', '', ''],
        correctAnswer: 0,
      };
    case 'TF':
      return {
        ...base,
        correctAnswer: true,
      };
    case 'SA':
      return {
        ...base,
        correctAnswer: '',
        acceptableanswers: [],
      };
    case 'ES':
      return {
        ...base,
        Rubric: '',
        maxWords: 300,
      };
    case 'MA':
      return {
        ...base,
        Options: ['', '', '', ''],
        correctanswers: [],
      };
    default:
      return base;
  }
};
