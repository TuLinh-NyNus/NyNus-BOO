import React from 'react';

import { UnifiedQuestionIDInfo } from './UnifiedQuestionIDInfo';

// Định nghĩa interface cho QuestionIDField để tránh lỗi TypeScript
interface QuestionIDField {
  value?: string;
  description?: string;
  id?: string;
  name?: string;
  level?: number;
}

// Định nghĩa interface cho QuestionID để tránh lỗi TypeScript
interface QuestionID {
  format?: string;
  fullId?: string;
  grade?: QuestionIDField;
  subject?: QuestionIDField;
  chapter?: QuestionIDField | null;
  level?: QuestionIDField;
  difficulty?: QuestionIDField;
  lesson?: QuestionIDField | null;
  form?: QuestionIDField;
  [key: string]: unknown; // Cho phép các trường động
}

interface QuestionIDMeaningProps {
  questionID: QuestionID;
  onEdit?: () => void; // Callback khi người dùng muốn chỉnh sửa
}

/**
 * Legacy QuestionIDMeaning component - now uses UnifiedQuestionIDInfo internally
 * @deprecated Use UnifiedQuestionIDInfo with mode="meaning" instead
 */
export function QuestionIDMeaning({ questionID, onEdit }: QuestionIDMeaningProps): JSX.Element {
  return <UnifiedQuestionIDInfo questionID={questionID} mode="meaning" onEdit={onEdit} />;
}
