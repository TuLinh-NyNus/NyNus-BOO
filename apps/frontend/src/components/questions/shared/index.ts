/**
 * Questions Shared Components Index
 * Barrel exports cho questions shared components
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// Question Card components
export {
  PublicQuestionCard,
  PublicQuestionCardCompact,
  PublicQuestionCardFeatured,
  QuestionCard,
  QuestionCardCompact,
  QuestionCardFeatured
} from './question-card';

// Question Type Badge components
export {
  QuestionTypeBadge,
  QuestionTypeBadgeCompact,
  QuestionTypeIcon,
  QuestionTypeDisplay,
  getQuestionTypeLabel,
  getQuestionTypeShortLabel,
  getQuestionTypeColor
} from './question-type-badge';

// Difficulty Indicator components
export {
  DifficultyIndicator,
  DifficultyIndicatorCompact,
  DifficultyIcon,
  DifficultyProgressBar,
  getDifficultyLabel,
  getDifficultyValue,
  getDifficultyColor
} from './difficulty-indicator';

// Loading Skeleton components
export {
  PublicQuestionLoading,
  PublicQuestionListLoading,
  PublicQuestionCompactLoading,
  PublicQuestionFeaturedLoading
} from './question-loading-skeletons';

// Error Boundary components
export {
  PublicQuestionErrorBoundary,
  CompactPublicQuestionErrorBoundary,
  FullPublicQuestionErrorBoundary
} from './question-error-boundary';

// Note: LaTeX integration đã được hoàn thành trong PublicQuestionCard
// LaTeX rendering được handle bởi existing LaTeXContent component

// Breadcrumb components
export * from './breadcrumb';
