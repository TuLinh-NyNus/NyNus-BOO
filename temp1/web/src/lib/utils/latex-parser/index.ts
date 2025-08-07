'use client';

import { LaTeXParser } from '@/lib/utils/latex-parser/parser';
export { LaTeXParser } from '@/lib/utils/latex-parser/parser';
export { QUESTION_TYPE_DESCRIPTION, QUESTION_TYPE_MAP } from '@/lib/utils/latex-parser/constants';
export type {
  Question,
  QuestionID,
  Answer,
  ExtractedQuestion,
  QuestionIdDetails,
  SubcountDetails
} from '@/lib/utils/latex-parser/models';

/**
 * Trích xuất thông tin từ nội dung LaTeX
 * @param content Nội dung LaTeX
 * @returns Thông tin đã trích xuất hoặc null nếu không thể trích xuất
 */
export function extractFromLatex(content: string): any | null {
  try {
    return LaTeXParser.extract(content);
  } catch (error) {
    console.error('Lỗi khi trích xuất thông tin từ LaTeX:', error);
    return null;
  }
}
