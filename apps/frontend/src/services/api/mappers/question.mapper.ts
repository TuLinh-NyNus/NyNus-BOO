/**
 * Question Data Mapper
 * Chuyển đổi question data từ Backend sang Frontend format
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { PublicQuestion } from '@/types/public';
import { 
  QuestionDetail,
  QuestionSearchResult,
  ListQuestionsByFilterResponse,
  SearchQuestionsResponse
} from '@/types/api/backend';
import {
  subjectCodeToName,
  getDefaultCategory
} from '@/lib/constants/taxonomy';
import { QuestionType, QuestionDifficulty } from '@/types/question';

// ===== QUESTION MAPPERS =====

/**
 * Parse answers from JSON string to array
 */
function parseAnswers(answersStr?: string): Record<string, unknown>[] {
  if (!answersStr) return [];
  
  try {
    const parsed = JSON.parse(answersStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Map QuestionDetail (BE) to PublicQuestion (FE)
 */
export function mapQuestionDetailToPublic(question: QuestionDetail): PublicQuestion {
  // Parse category and subject from questionCodeId (format: 0P1VH1 where P is subject)
  let category = 'Chưa phân loại';
  let subject: string | undefined;
  let grade: string | undefined;
  
  if (question.questionCodeId && question.questionCodeId.length >= 2) {
    const subjectCode = question.questionCodeId[1];
    subject = subjectCodeToName(subjectCode);
    category = getDefaultCategory(subjectCode);
    
    const gradeCode = question.questionCodeId[0];
    if (['0', '1', '2'].includes(gradeCode)) {
      grade = `Lớp ${parseInt(gradeCode) + 10}`;
    }
  }

  const answers = parseAnswers(question.answers);
  const difficulty = question.difficulty as QuestionDifficulty;
  const type = question.type as QuestionType;

  return {
    id: question.id,
    content: question.content,
    type: type,
    difficulty: difficulty,
    category: category,
    subject: subject,
    grade: grade,
    points: undefined, // BE doesn't have points
    timeLimit: undefined, // BE doesn't have time limit
    explanation: question.solution, // Use solution as explanation
    answers: answers.map((ans: Record<string, unknown>, index: number) => ({
      id: String(ans.id || String.fromCharCode(97 + index)), // a, b, c, d...
      content: String(ans.content || ans.text || ''),
      isCorrect: Boolean(ans.isCorrect || false)
    })),
    correctAnswer: question.correctAnswer,
    solution: question.solution,
    tags: question.tags || [],
    views: question.usageCount, // Use usageCount as views
    rating: question.feedback ? question.feedback / 20 : undefined, // Convert feedback (0-100) to rating (0-5)
    createdAt: question.createdAt,
    updatedAt: question.updatedAt
  };
}

/**
 * Map QuestionSearchResult to PublicQuestion with highlights
 */
export function mapSearchResultToPublic(result: QuestionSearchResult): PublicQuestion {
  const question = mapQuestionDetailToPublic(result.question);
  
  // TODO: Add highlight information to question if needed
  // For now, just return the mapped question
  
  return question;
}

/**
 * Map ListQuestionsByFilterResponse to FE format
 */
export function mapListResponse(response: ListQuestionsByFilterResponse): {
  questions: PublicQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: Record<string, unknown>;
} {
  return {
    questions: response.questions.map(mapQuestionDetailToPublic),
    pagination: {
      page: response.page,
      limit: response.limit,
      total: response.totalCount,
      totalPages: response.totalPages
    },
    meta: response.filterSummary ? {
      totalQuestions: response.filterSummary.totalQuestions,
      byType: response.filterSummary.byType,
      byDifficulty: response.filterSummary.byDifficulty,
      byGrade: response.filterSummary.byGrade,
      bySubject: response.filterSummary.bySubject,
      withSolution: response.filterSummary.withSolution,
      withAnswers: response.filterSummary.withImages
    } : undefined
  };
}

/**
 * Map SearchQuestionsResponse to FE format
 */
export function mapSearchResponse(response: SearchQuestionsResponse): {
  questions: PublicQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchMeta: {
    totalResults: number;
    searchTime: number;
    query: string;
    searchFields?: string[];
  };
} {
  return {
    questions: response.questions.map(mapSearchResultToPublic),
    pagination: {
      page: response.page,
      limit: response.limit,
      total: response.totalCount,
      totalPages: response.totalPages
    },
    searchMeta: {
      totalResults: response.totalCount,
      searchTime: 0, // BE doesn't provide search time
      query: response.query,
      searchFields: response.searchFields
    }
  };
}

/**
 * Map array of QuestionDetails to PublicQuestions
 */
export function mapQuestionsToPublic(questions: QuestionDetail[]): PublicQuestion[] {
  return questions.map(mapQuestionDetailToPublic);
}

/**
 * Extract unique categories from questions
 */
export function extractCategories(questions: QuestionDetail[]): string[] {
  const categories = new Set<string>();
  
  questions.forEach(q => {
    if (q.questionCodeId && q.questionCodeId.length >= 2) {
      const subjectCode = q.questionCodeId[1];
      const category = getDefaultCategory(subjectCode);
      categories.add(category);
    }
  });
  
  return Array.from(categories);
}

/**
 * Extract unique subjects from questions
 */
export function extractSubjects(questions: QuestionDetail[]): string[] {
  const subjects = new Set<string>();
  
  questions.forEach(q => {
    if (q.questionCodeId && q.questionCodeId.length >= 1) {
      const gradeCode = q.questionCodeId[0];
      // Map grade code to subject if needed
      subjects.add(gradeCode);
    }
  });
  
  return Array.from(subjects);
}

/**
 * Extract unique grades from questions
 */
export function extractGrades(questions: QuestionDetail[]): string[] {
  const grades = new Set<string>();
  
  questions.forEach(q => {
    if (q.questionCodeId && q.questionCodeId.length >= 1) {
      const gradeCode = q.questionCodeId[0];
      if (['0', '1', '2'].includes(gradeCode)) {
        grades.add(`Lớp ${parseInt(gradeCode) + 10}`);
      }
    }
  });
  
  return Array.from(grades);
}
