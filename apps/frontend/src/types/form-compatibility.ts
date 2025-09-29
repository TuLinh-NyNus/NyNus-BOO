/**
 * Form Compatibility Types
 * Temporary compatibility layer để fix TypeScript issues
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { Question, QuestionType, QuestionDifficulty, QuestionStatus } from './question';

// ===== FORM COMPATIBLE TYPES =====

/**
 * Form-compatible question type
 */
export interface FormQuestion extends Omit<Question, 'type' | 'difficulty' | 'status' | 'answers' | 'id'> {
  id?: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'MATCHING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  answers?: FormAnswer[];
}

/**
 * Form-compatible answer type
 */
export interface FormAnswer {
  id?: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

// ===== TYPE CONVERSION UTILITIES =====

/**
 * Convert Question to FormQuestion
 */
export function questionToFormQuestion(question: Question): FormQuestion {
  return {
    ...question,
    type: convertQuestionType(question.type),
    difficulty: convertQuestionDifficulty(question.difficulty),
    status: convertQuestionStatus(question.status),
    answers: convertAnswers(question.answers)
  };
}

/**
 * Convert FormQuestion to Question
 */
export function formQuestionToQuestion(formQuestion: FormQuestion): Question {
  return {
    ...formQuestion,
    type: convertFormQuestionType(formQuestion.type),
    difficulty: convertFormQuestionDifficulty(formQuestion.difficulty),
    status: convertFormQuestionStatus(formQuestion.status),
    answers: formQuestion.answers || []
  } as Question;
}

// ===== CONVERSION HELPERS =====

function convertQuestionType(type: QuestionType): FormQuestion['type'] {
  switch (type) {
    case QuestionType.MC:
      return 'MULTIPLE_CHOICE';
    case QuestionType.TF:
      return 'TRUE_FALSE';
    case QuestionType.SA:
      return 'SHORT_ANSWER';
    case QuestionType.ES:
      return 'ESSAY';
    case QuestionType.MA:
      return 'MATCHING';
    default:
      return 'MULTIPLE_CHOICE';
  }
}

function convertFormQuestionType(type: FormQuestion['type']): QuestionType {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return QuestionType.MC;
    case 'TRUE_FALSE':
      return QuestionType.TF;
    case 'SHORT_ANSWER':
      return QuestionType.SA;
    case 'ESSAY':
      return QuestionType.ES;
    case 'MATCHING':
      return QuestionType.MA;
    default:
      return QuestionType.MC;
  }
}

function convertQuestionDifficulty(difficulty?: QuestionDifficulty): FormQuestion['difficulty'] {
  if (!difficulty) return undefined;
  
  switch (difficulty) {
    case QuestionDifficulty.EASY:
      return 'EASY';
    case QuestionDifficulty.MEDIUM:
      return 'MEDIUM';
    case QuestionDifficulty.HARD:
      return 'HARD';
    default:
      return 'MEDIUM';
  }
}

function convertFormQuestionDifficulty(difficulty?: FormQuestion['difficulty']): QuestionDifficulty | undefined {
  if (!difficulty) return undefined;
  
  switch (difficulty) {
    case 'EASY':
      return QuestionDifficulty.EASY;
    case 'MEDIUM':
      return QuestionDifficulty.MEDIUM;
    case 'HARD':
      return QuestionDifficulty.HARD;
    default:
      return QuestionDifficulty.MEDIUM;
  }
}

function convertQuestionStatus(status?: QuestionStatus): FormQuestion['status'] {
  if (!status) return undefined;
  
  switch (status) {
    case QuestionStatus.ACTIVE:
      return 'ACTIVE';
    case QuestionStatus.INACTIVE:
      return 'INACTIVE';
    case QuestionStatus.PENDING:
      return 'DRAFT';
    case QuestionStatus.ARCHIVED:
      return 'ARCHIVED';
    default:
      return 'DRAFT';
  }
}

function convertFormQuestionStatus(status?: FormQuestion['status']): QuestionStatus | undefined {
  if (!status) return undefined;
  
  switch (status) {
    case 'ACTIVE':
      return QuestionStatus.ACTIVE;
    case 'INACTIVE':
      return QuestionStatus.INACTIVE;
    case 'DRAFT':
      return QuestionStatus.PENDING;
    case 'ARCHIVED':
      return QuestionStatus.ARCHIVED;
    default:
      return QuestionStatus.PENDING;
  }
}

// Define a flexible type that can handle various answer structures
type FlexibleAnswer = {
  id?: string;
  content?: string;
  text?: string;
  isCorrect?: boolean;
  explanation?: string;
} & Record<string, unknown>; // Allow additional properties

function convertAnswers(answers?: unknown[]): FormAnswer[] {
  if (!answers || !Array.isArray(answers)) return [];

  // Type guard and filter to ensure we're working with answer-like objects
  const validAnswers = answers.filter((answer): answer is FlexibleAnswer =>
    typeof answer === 'object' &&
    answer !== null &&
    (('id' in answer) || ('content' in answer) || ('text' in answer))
  );

  return validAnswers.map((answer, index) => ({
    id: answer.id || `answer-${index}`,
    content: answer.content || answer.text || `Answer ${index + 1}`,
    isCorrect: Boolean(answer.isCorrect),
    explanation: answer.explanation
  }));
}

// ===== MOCK DATA HELPERS =====

/**
 * Create a form-compatible sample question
 */
export function createSampleFormQuestion(): FormQuestion {
  return {
    id: "sample-1",
    questionCodeId: "1A1N1",
    rawContent: "Giải phương trình bậc hai: $ax^2 + bx + c = 0$ với $a \\neq 0$",
    content: "Giải phương trình bậc hai: $ax^2 + bx + c = 0$ với $a \\neq 0$",
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    status: 'DRAFT',
    answers: [
      {
        id: "a1",
        content: "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
        isCorrect: true,
        explanation: "Đây là công thức nghiệm của phương trình bậc hai"
      },
      {
        id: "a2",
        content: "$x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$",
        isCorrect: false,
        explanation: "Sai dấu trong biệt thức"
      },
      {
        id: "a3",
        content: "$x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
        isCorrect: false,
        explanation: "Thiếu dấu âm trước b"
      }
    ],
    explanation: "Phương trình bậc hai có dạng $ax^2 + bx + c = 0$ với $a \\neq 0$",
    solution: "Sử dụng công thức nghiệm: $$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$ với $\\Delta = b^2 - 4ac$",
    tag: ["algebra", "quadratic"],
    source: "Sách giáo khoa Toán 9",
    timeLimit: 300,
    points: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: "Demo User",
    usageCount: 0,
    feedback: 0
  };
}
