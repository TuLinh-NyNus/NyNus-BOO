'use client';

/**
 * Định nghĩa các interface cho các đối tượng dùng trong LaTeXParser
 */

import {
  ExtractedQuestion,
  QuestionIdDetails,
  SubcountDetails
} from '@nynus/interfaces';

// Re-export interfaces for backward compatibility
export type {
  ExtractedQuestion,
  QuestionIdDetails,
  SubcountDetails
};

export interface QuestionID {
  format: 'ID5' | 'ID6';
  fullId: string;
  lop: string;
  mon: string;
  chuong: string;
  muc_do: string;
  bai: string;
  dang?: string;
}

export interface Answer {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface Question {
  rawContent: string; // Thay raw_content bằng rawContent
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay' | 'unknown';
  content: string;
  correctAnswer: string | string[]; // Thay correct_answer bằng correctAnswer
  solution?: string;
  questionId?: QuestionID; // Thay question_id bằng questionId
  subcount?: string;
  source?: string;
  answers?: Answer[];
}

// Interfaces moved to @nynus/interfaces package to eliminate duplication
