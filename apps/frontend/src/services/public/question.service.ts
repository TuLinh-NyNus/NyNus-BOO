/**
 * Public Question Service
 * Service layer cho public question pages (không cần auth)
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

import { QuestionService } from '../grpc/question.service';
import { QuestionFilterService } from '../grpc/question-filter.service';
import { normalizeQuestionCode, resolveQuestionCode } from '@/lib/utils/question-code';

// ===== TYPES =====

export interface PublicQuestion {
  id: string;
  questionCodeId: string;
  content: string;
  rawContent?: string;
  type: string;
  difficulty?: string;
  category?: string;
  answers?: PublicAnswer[];
  solution?: string;
  tags: string[];
  views?: number;
  rating?: number;
  author?: string;
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface RelatedQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Map backend question data to public format
 */
function mapToPublicQuestion(data: any): PublicQuestion {
  const { code: normalizedCode } = normalizeQuestionCode(data);
  const resolvedCode =
    resolveQuestionCode({
      ...data,
      questionCodeId: normalizedCode,
    }) ?? '';

  return {
    id: data.id,
    questionCodeId: resolvedCode,
    content: data.content || '',
    rawContent: data.raw_content || data.rawContent,
    type: data.type || 'MULTIPLE_CHOICE',
    difficulty: data.difficulty,
    category: data.category || extractCategoryFromCode(resolvedCode),
    answers: data.structured_answers?.map((a: any) => ({
      id: a.id,
      content: a.content,
      isCorrect: a.is_correct || a.isCorrect || false,
      explanation: a.explanation,
    })) || [],
    solution: data.solution,
    tags: data.tag || data.tags || [],
    views: 0, // TODO: Implement view tracking
    rating: 0, // TODO: Implement rating system
    author: data.creator || 'Unknown',
    source: data.source,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt,
  };
}

/**
 * Extract category from question code (e.g., "0P1VH1" -> "Toán học")
 */
function extractCategoryFromCode(code?: string): string {
  if (!code || code.length < 2) return 'Chưa phân loại';
  
  const subjectMap: Record<string, string> = {
    'P': 'Toán học',
    'L': 'Vật lý',
    'H': 'Hóa học',
    'S': 'Sinh học',
    'V': 'Văn học',
    'A': 'Tiếng Anh',
  };
  
  const subjectCode = code.charAt(1);
  return subjectMap[subjectCode] || 'Chưa phân loại';
}

// ===== PUBLIC METHODS =====

export class PublicQuestionService {
  /**
   * Get a public question by ID
   * For displaying in question detail page
   */
  static async getPublicQuestionById(id: string): Promise<PublicQuestion> {
    try {
      // Call backend service
      const response = await QuestionService.getQuestion({ id });
      
      if (!response.success || !response.question) {
        throw new Error(response.message || 'Question not found');
      }
      
      // Map to public format
      return mapToPublicQuestion(response.question);
    } catch (error) {
      console.error('Error fetching public question:', error);
      throw error;
    }
  }

  /**
   * Get related questions based on tags/category
   * Returns questions similar to the given question
   */
  static async getRelatedQuestions(
    questionId: string,
    limit: number = 3
  ): Promise<RelatedQuestion[]> {
    try {
      // First get the source question to extract tags/category
      const sourceQuestion = await this.getPublicQuestionById(questionId);
      
      // Search for similar questions using tags
      const searchQuery = sourceQuestion.tags.slice(0, 3).join(' ');
      
      if (!searchQuery) {
        // Fallback: Get recent questions from same category
        return this.getRecentQuestionsByCategory(sourceQuestion.category || '', limit);
      }
      
      // Use search to find related questions
      const searchResults = await QuestionFilterService.quickSearch(searchQuery, {
        limit: limit + 1, // Get one extra to exclude source question
      });
      
      // Filter out the source question and map to RelatedQuestion format
      const related = searchResults.questions
        .filter((item: any) => item.question.id !== questionId)
        .slice(0, limit)
        .map((item: any) => {
          const q = item.question;
          const { code: relatedCode } = normalizeQuestionCode(q);
          const resolvedRelatedCode =
            resolveQuestionCode({
              ...q,
              questionCodeId: relatedCode,
            }) ?? relatedCode;
          return {
            id: q.id,
            title: q.content.substring(0, 100), // First 100 chars as title
            category: extractCategoryFromCode(resolvedRelatedCode),
            difficulty: q.difficulty || 'MEDIUM',
          };
        });
      
      return related;
    } catch (error) {
      console.error('Error fetching related questions:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get recent questions by category (fallback for related questions)
   */
  static async getRecentQuestionsByCategory(
    category: string,
    limit: number = 3
  ): Promise<RelatedQuestion[]> {
    try {
      // Use filter service to get questions by category
      const response = await QuestionFilterService.listQuestionsByFilter({
        metadata_filter: {
          statuses: ['APPROVED'], // Only show approved questions
        },
        pagination: {
          page: 1,
          limit,
        },
      });
      
      return response.questions.map((q: any) => {
        const { code: normalizedCode } = normalizeQuestionCode(q);
        const resolvedRecentCode =
          resolveQuestionCode({
            ...q,
            questionCodeId: normalizedCode,
          }) ?? normalizedCode;
        return {
          id: q.id,
          title: q.content.substring(0, 100),
          category: extractCategoryFromCode(resolvedRecentCode),
          difficulty: q.difficulty || 'MEDIUM',
        };
      });
    } catch (error) {
      console.error('Error fetching recent questions:', error);
      return [];
    }
  }

  /**
   * Increment view count for a question
   * TODO: Implement when backend supports view tracking
   */
  static async incrementViewCount(questionId: string): Promise<void> {
    try {
      // TODO: Call backend API to increment view count
      console.log('TODO: Increment view count for question', questionId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Silent fail - view count is not critical
    }
  }
}

// ===== EXPORTS =====
export default PublicQuestionService;

