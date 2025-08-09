/**
 * Mock Questions Service
 * Mock API service cho question management với realistic latency
 */

import { 
  Question, 
  QuestionDraft, 
  QuestionFilters, 
  QuestionListResponse,
  QuestionStatus,
  QuestionType,
  QuestionDifficulty,
  QuestionCode,
  LaTeXParseResult,
  FileUploadResult,
  SavedQuestionsData
} from '@/lib/types/question';
import { mockEnhancedQuestions, mockQuestionCodes } from '@/lib/mockdata/questions-enhanced';

// Simulate realistic API latency
const MOCK_LATENCY = {
  fast: 200,
  medium: 400,
  slow: 800
};

// Helper function để simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function để generate ID
const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Mock Questions API Service
 * Service mock cho tất cả operations liên quan đến questions
 */
export class MockQuestionsService {
  
  /**
   * Lấy danh sách câu hỏi với pagination và filters
   */
  static async listQuestions(params: {
    page?: number;
    pageSize?: number;
    type?: QuestionType;
    status?: QuestionStatus;
    difficulty?: QuestionDifficulty;
    codePrefix?: string;
    keyword?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'usageCount';
    sortDir?: 'asc' | 'desc';
  } = {}): Promise<QuestionListResponse> {
    await delay(MOCK_LATENCY.medium);

    const {
      page = 1,
      pageSize = 20,
      type,
      status,
      difficulty,
      codePrefix,
      keyword,
      sortBy = 'createdAt',
      sortDir = 'desc'
    } = params;

    // Convert enhanced questions to Question format
    let filteredQuestions: Question[] = mockEnhancedQuestions.map(q => ({
      id: q.id,
      rawContent: q.rawContent,
      content: q.content,
      subcount: q.subcount,
      type: q.type,
      source: q.source,
      answers: q.answers as AnswerOption[],
      correctAnswer: q.correctAnswer,
      solution: q.solution,
      tag: q.tag,
      usageCount: q.usageCount,
      creator: q.creator,
      status: q.status,
      feedback: q.feedback,
      difficulty: q.difficulty,
      questionCodeId: q.questionCodeId,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString()
    }));

    // Apply filters
    if (type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === type);
    }
    if (status) {
      filteredQuestions = filteredQuestions.filter(q => q.status === status);
    }
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }
    if (codePrefix) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.questionCodeId.toLowerCase().includes(codePrefix.toLowerCase())
      );
    }
    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q =>
        q.content.toLowerCase().includes(searchTerm) ||
        q.tag.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    filteredQuestions.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'usageCount':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortDir === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Apply pagination
    const total = filteredQuestions.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    return {
      data: paginatedQuestions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  /**
   * Lấy câu hỏi theo ID
   */
  static async getQuestion(id: string): Promise<{ data?: Question; error?: string }> {
    await delay(MOCK_LATENCY.fast);

    const enhancedQuestion = mockEnhancedQuestions.find(q => q.id === id);
    if (!enhancedQuestion) {
      return { error: 'Không tìm thấy câu hỏi' };
    }

    const question: Question = {
      id: enhancedQuestion.id,
      rawContent: enhancedQuestion.rawContent,
      content: enhancedQuestion.content,
      subcount: enhancedQuestion.subcount,
      type: enhancedQuestion.type,
      source: enhancedQuestion.source,
      answers: enhancedQuestion.answers as AnswerOption[],
      correctAnswer: enhancedQuestion.correctAnswer,
      solution: enhancedQuestion.solution,
      tag: enhancedQuestion.tag,
      usageCount: enhancedQuestion.usageCount,
      creator: enhancedQuestion.creator,
      status: enhancedQuestion.status,
      feedback: enhancedQuestion.feedback,
      difficulty: enhancedQuestion.difficulty,
      questionCodeId: enhancedQuestion.questionCodeId,
      createdAt: enhancedQuestion.createdAt.toISOString(),
      updatedAt: enhancedQuestion.updatedAt.toISOString()
    };

    return { data: question };
  }

  /**
   * Tạo câu hỏi mới
   */
  static async createQuestion(payload: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Question }> {
    await delay(MOCK_LATENCY.medium);

    const newQuestion: Question = {
      ...payload,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { data: newQuestion };
  }

  /**
   * Cập nhật câu hỏi
   */
  static async updateQuestion(id: string, payload: Partial<Omit<Question, 'id'>>): Promise<{ data: Question }> {
    await delay(MOCK_LATENCY.medium);

    const existingQuestion = mockEnhancedQuestions.find(q => q.id === id);
    if (!existingQuestion) {
      throw new Error('Không tìm thấy câu hỏi');
    }

    const updatedQuestion: Question = {
      id: existingQuestion.id,
      rawContent: payload.rawContent || existingQuestion.rawContent,
      content: payload.content || existingQuestion.content,
      subcount: payload.subcount || existingQuestion.subcount,
      type: payload.type || existingQuestion.type,
      source: payload.source || existingQuestion.source,
      answers: payload.answers as AnswerOption[] || existingQuestion.answers,
      correctAnswer: payload.correctAnswer || existingQuestion.correctAnswer,
      solution: payload.solution || existingQuestion.solution,
      tag: payload.tag || existingQuestion.tag,
      usageCount: payload.usageCount || existingQuestion.usageCount,
      creator: payload.creator || existingQuestion.creator,
      status: payload.status || existingQuestion.status,
      feedback: payload.feedback || existingQuestion.feedback,
      difficulty: payload.difficulty || existingQuestion.difficulty,
      questionCodeId: payload.questionCodeId || existingQuestion.questionCodeId,
      createdAt: existingQuestion.createdAt.toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { data: updatedQuestion };
  }

  /**
   * Xóa câu hỏi
   */
  static async deleteQuestion(id: string): Promise<{ ok: true }> {
    await delay(MOCK_LATENCY.fast);
    return { ok: true };
  }

  /**
   * Cập nhật trạng thái hàng loạt
   */
  static async bulkUpdateStatus(ids: string[], status: QuestionStatus): Promise<{ updated: number }> {
    await delay(MOCK_LATENCY.medium);
    return { updated: ids.length };
  }

  /**
   * Xóa hàng loạt
   */
  static async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    await delay(MOCK_LATENCY.medium);
    return { deleted: ids.length };
  }

  /**
   * Parse LaTeX content
   */
  static async parseLatexContent(latex: string): Promise<LaTeXParseResult> {
    await delay(MOCK_LATENCY.slow);

    // Mock LaTeX parsing logic
    if (!latex.trim()) {
      return { error: 'Nội dung LaTeX không được để trống' };
    }

    // Simple mock parsing
    const mockParsedQuestion: Partial<Question> = {
      content: 'Câu hỏi được parse từ LaTeX',
      rawContent: latex,
      type: QuestionType.MC,
      difficulty: QuestionDifficulty.MEDIUM,
      tag: ['LaTeX', 'Parsed'],
      answers: [
        { id: 'opt-1', content: 'Đáp án A', isCorrect: false },
        { id: 'opt-2', content: 'Đáp án B', isCorrect: true },
        { id: 'opt-3', content: 'Đáp án C', isCorrect: false },
        { id: 'opt-4', content: 'Đáp án D', isCorrect: false }
      ]
    };

    return { data: mockParsedQuestion };
  }

  /**
   * Upload file tự động
   */
  static async uploadAutoFile(file: File): Promise<FileUploadResult> {
    await delay(MOCK_LATENCY.slow);

    // Mock file processing
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { error: 'File quá lớn. Giới hạn 10MB.' };
    }

    // Mock parsed questions from file
    const mockQuestions: Question[] = [
      {
        id: generateId(),
        content: 'Câu hỏi 1 từ file upload',
        rawContent: 'Raw content 1',
        type: QuestionType.MC,
        tag: ['Upload', 'Auto'],
        questionCodeId: '0P1VH1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateId(),
        content: 'Câu hỏi 2 từ file upload',
        rawContent: 'Raw content 2',
        type: QuestionType.TF,
        tag: ['Upload', 'Auto'],
        questionCodeId: '2P5VN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return { data: mockQuestions };
  }

  /**
   * Lấy câu hỏi đã lưu từ localStorage
   */
  static async getSavedQuestions(): Promise<{ data: Question[] }> {
    await delay(MOCK_LATENCY.fast);

    try {
      const savedData = localStorage.getItem('saved_questions');
      if (!savedData) {
        return { data: [] };
      }

      const parsedData: SavedQuestionsData = JSON.parse(savedData);
      return { data: parsedData.questions };
    } catch (error) {
      return { data: [] };
    }
  }

  /**
   * Lưu câu hỏi vào localStorage
   */
  static async saveQuestion(question: Question): Promise<{ ok: true }> {
    await delay(MOCK_LATENCY.fast);

    try {
      const existingSaved = localStorage.getItem('saved_questions');
      let savedData: SavedQuestionsData;

      if (existingSaved) {
        savedData = JSON.parse(existingSaved);
      } else {
        savedData = { questions: [], lastUpdated: new Date().toISOString() };
      }

      // Check if question already saved
      const existingIndex = savedData.questions.findIndex(q => q.id === question.id);
      if (existingIndex >= 0) {
        savedData.questions[existingIndex] = question;
      } else {
        savedData.questions.push(question);
      }

      savedData.lastUpdated = new Date().toISOString();
      localStorage.setItem('saved_questions', JSON.stringify(savedData));

      return { ok: true };
    } catch (error) {
      throw new Error('Lỗi khi lưu câu hỏi');
    }
  }

  /**
   * Decode MapID
   */
  static async decodeMapId(code: string): Promise<{ data?: QuestionCode; error?: string }> {
    await delay(MOCK_LATENCY.fast);

    const questionCode = mockQuestionCodes.find(qc => qc.code === code);
    if (!questionCode) {
      return { error: 'Không tìm thấy mã câu hỏi' };
    }

    return { data: questionCode };
  }
}
