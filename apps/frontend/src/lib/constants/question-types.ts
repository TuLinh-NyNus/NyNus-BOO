/**
 * Question Types Constants
 * Định nghĩa 4 loại câu hỏi chính
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

import { ListChecks, SquareCheckBig, TextCursorInput, ScrollText } from 'lucide-react';

// ===== TYPES =====

/**
 * Question Type Data Interface
 * Complete question type information structure
 */
export interface QuestionTypeData {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  icon: React.ComponentType<{ className?: string }>;
  /** CSS variable for accent color, e.g. 'var(--color-primary)' */
  accentVar: string;
  /** Optional legacy fields kept for compatibility (unused by new components) */
  color?: string;
  gradient?: string;
  emoji: string;
  keywords: string[];
}

/**
 * Question Type Filter Mapping
 * Mapping giữa type IDs và filter values
 */
export interface QuestionTypeMapping {
  [key: string]: string;
}

// ===== CONSTANTS =====

/**
 * Question Type Filter Mapping
 * Consistent mapping cho store integration
 */
export const QUESTION_TYPE_MAPPING: QuestionTypeMapping = {
  'multiple-choice': 'Trắc nghiệm',
  'true-false': 'Đúng sai',
  'short-answer': 'Trả lời ngắn',
  'essay': 'Tự luận'
};

/**
 * Question Types Data
 * Complete type definitions với enhanced information
 */
export const QUESTION_TYPES: QuestionTypeData[] = [
  {
    id: 'multiple-choice',
    title: 'Câu hỏi trắc nghiệm',
    description: 'Chọn đáp án đúng từ các lựa chọn cho sẵn',
    questionCount: 3245,
    icon: ListChecks,
    accentVar: 'var(--color-primary)',
    emoji: '✅',
    keywords: ['trắc nghiệm', 'lựa chọn', 'đáp án', 'multiple choice', 'ABCD']
  },
  {
    id: 'true-false',
    title: 'Câu hỏi đúng sai',
    description: 'Xác định tính đúng sai của mệnh đề',
    questionCount: 1567,
    icon: SquareCheckBig,
    accentVar: 'var(--color-success)',
    emoji: '✓✗',
    keywords: ['đúng sai', 'true false', 'mệnh đề', 'khẳng định', 'phán đoán']
  },
  {
    id: 'short-answer',
    title: 'Câu hỏi trả lời ngắn',
    description: 'Điền đáp án ngắn gọn, kết quả số hoặc công thức',
    questionCount: 1234,
    icon: TextCursorInput,
    accentVar: 'var(--color-accent)',
    emoji: '💬',
    keywords: ['trả lời ngắn', 'điền đáp án', 'kết quả', 'short answer', 'điền khuyết']
  },
  {
    id: 'essay',
    title: 'Câu hỏi tự luận',
    description: 'Giải chi tiết với lời giải đầy đủ',
    questionCount: 892,
    icon: ScrollText,
    accentVar: 'var(--color-secondary)',
    emoji: '📝',
    keywords: ['tự luận', 'essay', 'giải chi tiết', 'chứng minh', 'lời giải']
  }
];

// ===== UTILITY FUNCTIONS =====

/**
 * Get question type by ID
 * Retrieve type data by ID
 */
export function getQuestionTypeById(id: string): QuestionTypeData | undefined {
  return QUESTION_TYPES.find(type => type.id === id);
}

/**
 * Get question type filter value
 * Get filter value cho store integration
 */
export function getQuestionTypeFilterValue(id: string): string | undefined {
  return QUESTION_TYPE_MAPPING[id];
}

/**
 * Get all question type IDs
 * Get array of all type IDs
 */
export function getAllQuestionTypeIds(): string[] {
  return QUESTION_TYPES.map(type => type.id);
}

/**
 * Get question types by keyword
 * Search types by keywords
 */
export function getQuestionTypesByKeyword(keyword: string): QuestionTypeData[] {
  const lowerKeyword = keyword.toLowerCase();
  return QUESTION_TYPES.filter(type =>
    type.keywords.some(k => k.includes(lowerKeyword)) ||
    type.title.toLowerCase().includes(lowerKeyword) ||
    type.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get total question count
 * Calculate total questions across all types
 */
export function getTotalQuestionCountByType(): number {
  return QUESTION_TYPES.reduce((total, type) => total + type.questionCount, 0);
}

// ===== EXPORTS =====

export default QUESTION_TYPES;