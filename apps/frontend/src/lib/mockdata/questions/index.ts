/**
 * Questions Mockdata Index
 * Central export file cho tất cả questions mockdata
 */

// Export multiple choice questions
export {
  mockQuestions,
  getQuestionById,
  getQuestionsBySubject,
  getQuestionsByGrade,
  getQuestionsByDifficulty,
  searchQuestions,
  getMockQuestionsResponse
} from './multiple-choice';

// Export enhanced questions
export {
  mockEnhancedQuestions,
  mockQuestionImages,
  mockQuestionTags,
  mockQuestionFeedback,
  getEnhancedQuestionById,
  getEnhancedQuestionsByType,
  getEnhancedQuestionsByDifficulty,
  getMockEnhancedQuestionsResponse
} from './enhanced-questions';

// Export question codes
export {
  mockQuestionCodes,
  mockMapCodeConfig,
  getQuestionCodeById,
  getQuestionCodesByGrade,
  getQuestionCodesBySubject,
  getQuestionCodesByLevel,
  parseQuestionCode,
  generateQuestionCode,
  getMockQuestionCodesResponse
} from './question-codes';
