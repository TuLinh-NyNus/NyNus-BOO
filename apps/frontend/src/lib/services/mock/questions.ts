/**
 * Mock Questions Service
 * Mock API service cho admin question management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import {
  EnhancedQuestion,
  QuestionFilters,
  PaginationParams,
  QuestionListResponse,
  QuestionResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  LaTeXParseRequest,
  LaTeXParseResponse,
  FileUploadRequest,
  FileUploadResponse,
  MapIdDecodeRequest,
  MapIdDecodeResponse,
  QuestionStats,
  SavedQuestion,
  CreateQuestionForm,
  UpdateQuestionForm,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty
} from '@/types/question';

// Import mock data từ existing mockdata
import { 
  mockEnhancedQuestions,
  mockQuestionCodes,
  mockMapCodeConfig,
  translateQuestionCode,
  searchEnhancedQuestions
} from '@/lib/mockdata/questions-enhanced';

/**
 * Simulate API latency cho realistic UX
 */
const simulateLatency = (min: number = 200, max: number = 400): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Generate unique ID cho new questions
 */
const generateId = (): string => {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mock Questions Service Class
 */
export class MockQuestionsService {
  private static instance: MockQuestionsService;
  private questions: EnhancedQuestion[] = [...mockEnhancedQuestions];

  private constructor() {}

  public static getInstance(): MockQuestionsService {
    if (!MockQuestionsService.instance) {
      MockQuestionsService.instance = new MockQuestionsService();
    }
    return MockQuestionsService.instance;
  }

  /**
   * List questions với pagination và filters
   */
  async listQuestions(
    filters: QuestionFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<QuestionListResponse> {
    await simulateLatency();

    let filteredQuestions = [...this.questions];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q =>
        q.content.toLowerCase().includes(searchTerm) ||
        q.rawContent.toLowerCase().includes(searchTerm) ||
        q.solution?.toLowerCase().includes(searchTerm) ||
        q.tag.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        q.subcount?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === filters.type);
    }

    if (filters.status) {
      filteredQuestions = filteredQuestions.filter(q => q.status === filters.status);
    }

    if (filters.difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.creator) {
      filteredQuestions = filteredQuestions.filter(q => q.creator === filters.creator);
    }

    if (filters.questionCodeId) {
      filteredQuestions = filteredQuestions.filter(q => q.questionCodeId === filters.questionCodeId);
    }

    if (filters.tag && filters.tag.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        filters.tag!.some(tag => q.tag.includes(tag))
      );
    }

    // Apply pagination
    const total = filteredQuestions.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    return {
      questions: paginatedQuestions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    };
  }

  /**
   * Get question by ID
   */
  async getQuestion(id: string): Promise<QuestionResponse> {
    await simulateLatency();

    const question = this.questions.find(q => q.id === id);
    if (!question) {
      throw new Error(`Question với ID ${id} không tồn tại`);
    }

    return { question };
  }

  /**
   * Create new question
   */
  async createQuestion(data: CreateQuestionForm): Promise<QuestionResponse> {
    await simulateLatency();

    const newQuestion: EnhancedQuestion = {
      id: generateId(),
      rawContent: data.rawContent || data.content,
      content: data.content,
      type: data.type,
      source: data.source,
      answers: data.answers,
      correctAnswer: data.correctAnswer,
      solution: data.solution,
      tag: data.tag,
      usageCount: 0,
      creator: 'current-user', // TODO: Get from auth context
      status: QuestionStatus.PENDING,
      feedback: 0,
      difficulty: data.difficulty,
      questionCodeId: data.questionCodeId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.questions.unshift(newQuestion);
    return { question: newQuestion };
  }

  /**
   * Update existing question
   */
  async updateQuestion(data: UpdateQuestionForm): Promise<QuestionResponse> {
    await simulateLatency();

    const index = this.questions.findIndex(q => q.id === data.id);
    if (index === -1) {
      throw new Error(`Question với ID ${data.id} không tồn tại`);
    }

    const updatedQuestion: EnhancedQuestion = {
      ...this.questions[index],
      ...data,
      updatedAt: new Date()
    };

    this.questions[index] = updatedQuestion;
    return { question: updatedQuestion };
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<{ success: boolean }> {
    await simulateLatency();

    const index = this.questions.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error(`Question với ID ${id} không tồn tại`);
    }

    this.questions.splice(index, 1);
    return { success: true };
  }

  /**
   * Bulk operations
   */
  async bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    await simulateLatency();

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of request.questionIds) {
      try {
        switch (request.operation) {
          case 'delete':
            await this.deleteQuestion(id);
            processed++;
            break;
          case 'activate':
            await this.updateQuestion({ id, status: QuestionStatus.ACTIVE });
            processed++;
            break;
          case 'deactivate':
            await this.updateQuestion({ id, status: QuestionStatus.INACTIVE });
            processed++;
            break;
          case 'archive':
            await this.updateQuestion({ id, status: QuestionStatus.ARCHIVED });
            processed++;
            break;
          case 'export':
            // Mock export operation
            processed++;
            break;
          default:
            throw new Error(`Unsupported operation: ${request.operation}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Failed to ${request.operation} question ${id}: ${error}`);
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Parse LaTeX content
   */
  async parseLatex(request: LaTeXParseRequest): Promise<LaTeXParseResponse> {
    await simulateLatency();

    try {
      // Mock LaTeX parsing logic
      const content = request.content.trim();
      
      // Extract basic information từ LaTeX
      const sourceMatch = content.match(/\\begin{ex}%\[Nguồn: "([^"]+)"\]/);
      const codeMatch = content.match(/\\begin{ex}%.*%\[([^\]]+)\]/);
      const subcountMatch = content.match(/\[([A-Z]{2}\.\d+)\]/);
      
      // Extract question content
      const questionMatch = content.match(/\[.*?\]\s*(.+?)(?:\\choice|\\shortans|\\choiceTF|\\loigiai)/);
      
      // Determine question type
      let type = QuestionType.ES; // Default
      if (content.includes('\\choice')) type = QuestionType.MC;
      if (content.includes('\\choiceTF')) type = QuestionType.TF;
      if (content.includes('\\shortans')) type = QuestionType.SA;

      const parsedQuestion: Partial<EnhancedQuestion> = {
        rawContent: content,
        content: questionMatch?.[1]?.trim() || content,
        type,
        source: sourceMatch?.[1],
        subcount: subcountMatch?.[1],
        questionCodeId: codeMatch?.[1] || 'UNKNOWN',
        tag: ['LaTeX Import'],
        difficulty: QuestionDifficulty.MEDIUM
      };

      return {
        success: true,
        question: parsedQuestion
      };
    } catch (error) {
      return {
        success: false,
        errors: [`LaTeX parsing failed: ${error}`]
      };
    }
  }

  /**
   * Upload và parse file
   */
  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    await simulateLatency();

    try {
      // Mock file processing
      const questions: Partial<EnhancedQuestion>[] = [];
      
      // Simulate parsing different file types
      for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
        questions.push({
          content: `Imported question ${i + 1} from ${request.file.name}`,
          type: QuestionType.MC,
          difficulty: QuestionDifficulty.MEDIUM,
          tag: ['File Import', request.type.toUpperCase()],
          questionCodeId: `IMPORT${i + 1}`
        });
      }

      return {
        success: true,
        questions
      };
    } catch (error) {
      return {
        success: false,
        errors: [`File upload failed: ${error}`]
      };
    }
  }

  /**
   * Decode MapID
   */
  async decodeMapId(request: MapIdDecodeRequest): Promise<MapIdDecodeResponse> {
    await simulateLatency();

    try {
      const decoded = translateQuestionCode(request.code, mockMapCodeConfig);
      
      return {
        success: true,
        decoded: {
          grade: mockMapCodeConfig.gradeMapping[request.code[0]] || request.code[0],
          subject: mockMapCodeConfig.subjectMapping[request.code[1]] || request.code[1],
          chapter: request.code[2],
          lesson: request.code[4],
          form: request.code.includes('-') ? request.code.split('-')[1] : undefined,
          level: mockMapCodeConfig.levelMapping[request.code[3]] || request.code[3],
          description: decoded
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `MapID decode failed: ${error}`
      };
    }
  }

  /**
   * Get question statistics
   */
  async getStats(): Promise<QuestionStats> {
    await simulateLatency();

    const stats: QuestionStats = {
      total: this.questions.length,
      active: this.questions.filter(q => q.status === QuestionStatus.ACTIVE).length,
      pending: this.questions.filter(q => q.status === QuestionStatus.PENDING).length,
      inactive: this.questions.filter(q => q.status === QuestionStatus.INACTIVE).length,
      archived: this.questions.filter(q => q.status === QuestionStatus.ARCHIVED).length,
      byType: {
        [QuestionType.MC]: this.questions.filter(q => q.type === QuestionType.MC).length,
        [QuestionType.TF]: this.questions.filter(q => q.type === QuestionType.TF).length,
        [QuestionType.SA]: this.questions.filter(q => q.type === QuestionType.SA).length,
        [QuestionType.ES]: this.questions.filter(q => q.type === QuestionType.ES).length,
        [QuestionType.MA]: this.questions.filter(q => q.type === QuestionType.MA).length,
      },
      byDifficulty: {
        [QuestionDifficulty.EASY]: this.questions.filter(q => q.difficulty === QuestionDifficulty.EASY).length,
        [QuestionDifficulty.MEDIUM]: this.questions.filter(q => q.difficulty === QuestionDifficulty.MEDIUM).length,
        [QuestionDifficulty.HARD]: this.questions.filter(q => q.difficulty === QuestionDifficulty.HARD).length,
      }
    };

    return stats;
  }
}

// Export singleton instance
export const mockQuestionsService = MockQuestionsService.getInstance();

// Saved Questions Manager (localStorage)
export class SavedQuestionsManager {
  private static readonly STORAGE_KEY = 'nynus_saved_questions';

  static getAll(): SavedQuestion[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static add(question: EnhancedQuestion, note?: string): void {
    const saved = this.getAll();
    const newItem: SavedQuestion = {
      id: generateId(),
      question,
      savedAt: new Date(),
      note
    };
    saved.unshift(newItem);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
  }

  static remove(id: string): void {
    const saved = this.getAll();
    const filtered = saved.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static export(): void {
    const saved = this.getAll();
    const dataStr = JSON.stringify(saved, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saved-questions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
