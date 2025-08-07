import apiClient from '../api-client';

/**
 * Interface cho tham số lọc danh sách bài thi
 */
export interface IExamFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  grade?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  form?: 'TRAC_NGHIEM' | 'TU_LUAN' | 'KET_HOP';
  examCategory?: 'GIUA_KI' | 'CUOI_KI' | 'KIEM_TRA_15_PHUT' | 'KIEM_TRA_1_TIET' | 'THI_THU';
  type?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdBy?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Interface cho phản hồi danh sách bài thi
 */
export interface IExamListResponse {
  exams: IExam[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface cho bài thi
 */
export interface IExam {
  id: string;
  title: string;
  description?: {
    year?: string;
    province?: string;
    school?: string;
    [key: string]: unknown;
  };
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subject: string;
  grade: number;
  form: 'TRAC_NGHIEM' | 'TU_LUAN' | 'KET_HOP';
  examCategory: 'GIUA_KI' | 'CUOI_KI' | 'KIEM_TRA_15_PHUT' | 'KIEM_TRA_1_TIET' | 'THI_THU';
  type: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdBy: string;
  averageScore?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  questionsCount?: number;
  attemptsCount?: number;
}

/**
 * Interface cho yêu cầu tạo bài thi
 */
export interface ICreateExamRequest {
  title: string;
  description?: {
    year?: string;
    province?: string;
    school?: string;
    [key: string]: unknown;
  };
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subject: string;
  grade: number;
  form?: 'TRAC_NGHIEM' | 'TU_LUAN' | 'KET_HOP';
  examCategory: 'GIUA_KI' | 'CUOI_KI' | 'KIEM_TRA_15_PHUT' | 'KIEM_TRA_1_TIET' | 'THI_THU';
  type?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags?: string[];
  questions?: string[];
  [key: string]: unknown;
}

/**
 * Interface cho yêu cầu cập nhật bài thi
 */
export interface IUpdateExamRequest {
  title?: string;
  description?: {
    year?: string;
    province?: string;
    school?: string;
    [key: string]: unknown;
  };
  duration?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  subject?: string;
  grade?: number;
  form?: 'TRAC_NGHIEM' | 'TU_LUAN' | 'KET_HOP';
  examCategory?: 'GIUA_KI' | 'CUOI_KI' | 'KIEM_TRA_15_PHUT' | 'KIEM_TRA_1_TIET' | 'THI_THU';
  type?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Interface cho kết quả bài thi
 */
export interface IExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalScore: number;
  percentage: number;
  answers: Record<string, unknown>;
  startTime: string;
  endTime: string;
  duration: number;
  createdAt: string;
}

/**
 * Interface cho thống kê bài thi
 */
export interface IExamStats {
  examId: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  difficultyDistribution: Record<string, number>;
  scoreDistribution: Record<string, number>;
}

/**
 * Service cho bài thi
 */
export const examService = {
  /**
   * Lấy danh sách bài thi
   * @param params Tham số lọc
   * @returns Danh sách bài thi
   */
  getExams: async (params?: IExamFilterParams): Promise<IExamListResponse> => {
    return apiClient.get<IExamListResponse>('/exams', { params });
  },

  /**
   * Lấy bài thi theo ID
   * @param id ID bài thi
   * @returns Bài thi
   */
  getExam: async (id: string): Promise<IExam> => {
    return apiClient.get<IExam>(`/exams/${id}`);
  },

  /**
   * Tạo bài thi mới
   * @param data Dữ liệu bài thi
   * @returns Bài thi đã tạo
   */
  createExam: async (data: ICreateExamRequest): Promise<IExam> => {
    return apiClient.post<IExam>('/exams', data);
  },

  /**
   * Cập nhật bài thi
   * @param id ID bài thi
   * @param data Dữ liệu cập nhật
   * @returns Bài thi đã cập nhật
   */
  updateExam: async (id: string, data: IUpdateExamRequest): Promise<IExam> => {
    return apiClient.put<IExam>(`/exams/${id}`, data);
  },

  /**
   * Xóa bài thi
   * @param id ID bài thi
   * @returns Phản hồi trống
   */
  deleteExam: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/exams/${id}`);
  },

  /**
   * Bắt đầu làm bài thi
   * @param examId ID bài thi
   * @returns Thông tin phiên thi
   */
  startExam: async (examId: string): Promise<{
    attemptId: string;
    exam: IExam;
    questions: unknown[];
    timeLimit: number;
    startTime: string;
  }> => {
    return apiClient.post(`/exams/${examId}/start`);
  },

  /**
   * Nộp bài thi
   * @param examId ID bài thi
   * @param attemptId ID phiên thi
   * @param answers Đáp án
   * @returns Kết quả bài thi
   */
  submitExam: async (
    examId: string,
    attemptId: string,
    answers: Record<string, unknown>
  ): Promise<IExamResult> => {
    return apiClient.post(`/exams/${examId}/results/${attemptId}/submit`, { answers });
  },

  /**
   * Lấy kết quả bài thi
   * @param examId ID bài thi
   * @param resultId ID kết quả
   * @returns Kết quả bài thi
   */
  getExamResult: async (examId: string, resultId: string): Promise<IExamResult> => {
    return apiClient.get<IExamResult>(`/exams/${examId}/results/${resultId}`);
  },

  /**
   * Lấy thống kê bài thi
   * @param examId ID bài thi
   * @returns Thống kê bài thi
   */
  getExamStats: async (examId: string): Promise<IExamStats> => {
    return apiClient.get<IExamStats>(`/exams/${examId}/stats`);
  },

  /**
   * Lấy kết quả bài thi của người dùng
   * @param userId ID người dùng
   * @param params Tham số lọc
   * @returns Danh sách kết quả
   */
  getUserExamResults: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ results: IExamResult[]; total: number; page: number; limit: number }> => {
    return apiClient.get(`/users/${userId}/exam-results`, { params });
  },

  /**
   * Tìm kiếm bài thi
   * @param params Tham số tìm kiếm
   * @returns Danh sách bài thi
   */
  searchExams: async (params: IExamFilterParams): Promise<IExamListResponse> => {
    return apiClient.get<IExamListResponse>('/exams/search', { params });
  },
};
