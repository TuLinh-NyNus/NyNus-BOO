/**
 * Question Form Components
 * Các components liên quan đến form tạo/chỉnh sửa câu hỏi
 */

export { default as QuestionForm } from './question-form';
export { default as QuestionFormTabs } from './question-form-tabs';
export { default as QuestionFormLegacy } from './question-form-legacy';

// Export types from unified source
export type { QuestionFormData, QuestionAnswer } from '@/lib/types/unified-question-form';

// Export error boundary wrapped components
export { QuestionFormWithErrorBoundary } from './question-form-with-error-boundary';
