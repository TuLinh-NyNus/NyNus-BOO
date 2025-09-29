/**
 * Exam Service Client (gRPC-Web)
 * ======================
 * TEMPORARILY DISABLED - Protobuf types incomplete
 * TODO: Re-enable after protobuf regeneration
 */

import { Exam, ExamType, ExamStatus, AttemptStatus, ExamAttempt, ExamAnswer } from '@/types/exam';
import { QuestionDifficulty } from '@/types/question';

// Mock types for service responses
interface MockExamOverrides {
  id?: string;
  title?: string;
  description?: string;
  instructions?: string;
  durationMinutes?: number;
  totalPoints?: number;
  passPercentage?: number;
  examType?: ExamType;
  status?: ExamStatus;
  subject?: string;
  grade?: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  shuffleQuestions?: boolean;
  showResults?: boolean;
  maxAttempts?: number;
  version?: number;
  questionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

interface MockAttemptOverrides {
  id?: string;
  examId?: string;
  userId?: string;
  attemptNumber?: number;
  status?: AttemptStatus;
  totalPoints?: number;
  startedAt?: string;
  answers?: ExamAnswer[];
}

interface MockResultOverrides {
  id?: string;
  attemptId?: string;
  examId?: string;
  userId?: string;
  score?: number;
  totalPoints?: number;
  percentage?: number;
  passed?: boolean;
  gradedAt?: string;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unansweredQuestions?: number;
  timeSpentSeconds?: number;
}

// Temporarily export mock service to avoid import errors
const createMockExam = (overrides: MockExamOverrides = {}): Exam => ({
  id: `exam_${Date.now()}`,
  title: 'Mock Exam',
  description: 'Mock exam description',
  instructions: 'Mock exam instructions',
  durationMinutes: 60,
  totalPoints: 100,
  passPercentage: 70,
  examType: ExamType.GENERATED,
  status: ExamStatus.PENDING,
  subject: 'Mock Subject',
  grade: 10,
  difficulty: QuestionDifficulty.MEDIUM,
  tags: [],
  shuffleQuestions: false,
  showResults: true,
  maxAttempts: 3,
  version: 1,
  questionIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'mock-user',
  ...overrides
});

const createMockExamAttempt = (overrides: MockAttemptOverrides = {}): ExamAttempt => ({
  id: 'mock-attempt-id',
  examId: 'mock-exam-id',
  userId: 'mock-user-id',
  attemptNumber: 1,
  status: AttemptStatus.IN_PROGRESS,
  totalPoints: 100,
  startedAt: new Date().toISOString(),
  // answers: undefined, // Remove to avoid type conflict
  ...overrides
});

const createMockExamResult = (overrides: MockResultOverrides = {}) => ({
  id: 'mock-result-id',
  attemptId: 'mock-attempt-id',
  examId: 'mock-exam-id',
  userId: 'mock-user-id',
  score: 85,
  totalPoints: 100,
  percentage: 85,
  passed: true,
  gradedAt: new Date().toISOString(),
  correctAnswers: 17,
  incorrectAnswers: 3,
  unansweredQuestions: 0,
  timeSpentSeconds: 3600,
  ...overrides
});

export const ExamService = {
  createExam: async (..._args: unknown[]) => createMockExam(),
  getExam: async (..._args: unknown[]) => createMockExam(),
  updateExam: async (..._args: unknown[]) => createMockExam({ title: 'Updated Mock Exam' }),
  deleteExam: async (..._args: unknown[]) => ({ success: true }),
  listExams: async (..._args: unknown[]) => ({
    exams: [],
    total: 0,
    page: 1,
    pageSize: 20
  }),
  publishExam: async (..._args: unknown[]) => createMockExam({ status: ExamStatus.ACTIVE }),
  archiveExam: async (..._args: unknown[]) => createMockExam({ status: ExamStatus.ARCHIVED }),
  startExam: async (..._args: unknown[]) => createMockExamAttempt(),
  submitExam: async (..._args: unknown[]) => createMockExamResult(),
  submitAnswer: async (..._args: unknown[]) => ({ success: true }),
  getExamResults: async (..._args: unknown[]) => createMockExamResult(),
  getExamStatistics: async (..._args: unknown[]) => ({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    averageTimeSpent: 0
  }),
  saveAnswer: async (..._args: unknown[]) => ({ success: true }),
  getAttemptStatus: async (..._args: unknown[]) => createMockExamAttempt(),
  addQuestionToExam: async (..._args: unknown[]) => ({ success: true }),
  removeQuestionFromExam: async (..._args: unknown[]) => ({ success: true }),
  reorderQuestions: async (..._args: unknown[]) => ({ success: true }),
};

export default ExamService;
