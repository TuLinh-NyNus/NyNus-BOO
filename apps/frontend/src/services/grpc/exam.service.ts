/**
 * Exam Service Client (gRPC-Web)
 * ======================
 * Real gRPC client implementation for ExamService
 * Replaces mock implementation with actual backend calls
 *
 * @author NyNus Development Team
 * @version 2.0.0 - Real gRPC Implementation
 * @created 2025-01-19
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// gRPC-Web imports
import { ExamServiceClient } from '@/generated/v1/ExamServiceClientPb';
import {
  Exam as PbExam,
  ExamAttempt as PbExamAttempt,
  ExamResult as PbExamResult,
  CreateExamRequest,
  GetExamRequest,
  UpdateExamRequest,
  DeleteExamRequest,
  ListExamsRequest,
  PublishExamRequest,
  ArchiveExamRequest,
  StartExamRequest,
  SubmitExamRequest,
  SubmitAnswerRequest,
  GetExamResultsRequest,
  GetExamStatisticsRequest,
  GetExamAttemptRequest,
  AddQuestionToExamRequest,
  RemoveQuestionFromExamRequest,
  ReorderExamQuestionsRequest,
  QuestionOrder,
  ExamStatus as PbExamStatus,
  ExamType as PbExamType,
  AttemptStatus as PbAttemptStatus,
  Difficulty as PbDifficulty,
} from '@/generated/v1/exam_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';

// Frontend types
import {
  Exam,
  ExamType,
  ExamStatus,
  AttemptStatus,
  ExamAttempt,
  ExamResult,
  ExamFilters,
  ExamStatistics,
} from '@/types/exam';
import { QuestionDifficulty } from '@/types/question';

// gRPC client utilities
import { getAuthMetadata } from './client';
import { createGrpcClient } from './client-factory';

// ===== gRPC CLIENT INITIALIZATION =====

// ✅ FIX: Use client factory for lazy initialization
const getExamServiceClient = createGrpcClient(ExamServiceClient, 'ExamService');

// ===== ENUM MAPPERS =====

/**
 * Map protobuf ExamStatus to frontend ExamStatus
 */
function mapExamStatusFromPb(status: PbExamStatus): ExamStatus {
  switch (status) {
    case PbExamStatus.EXAM_STATUS_ACTIVE:
      return ExamStatus.ACTIVE;
    case PbExamStatus.EXAM_STATUS_PENDING:
      return ExamStatus.PENDING;
    case PbExamStatus.EXAM_STATUS_INACTIVE:
      return ExamStatus.INACTIVE;
    case PbExamStatus.EXAM_STATUS_ARCHIVED:
      return ExamStatus.ARCHIVED;
    default:
      return ExamStatus.PENDING;
  }
}

/**
 * Map frontend ExamType to protobuf ExamType
 */
function mapExamTypeToPb(type: ExamType): PbExamType {
  switch (type) {
    case ExamType.GENERATED:
      return PbExamType.EXAM_TYPE_GENERATED;
    case ExamType.OFFICIAL:
      return PbExamType.EXAM_TYPE_OFFICIAL;
    default:
      return PbExamType.EXAM_TYPE_UNSPECIFIED;
  }
}

/**
 * Map protobuf ExamType to frontend ExamType
 */
function mapExamTypeFromPb(type: PbExamType): ExamType {
  switch (type) {
    case PbExamType.EXAM_TYPE_GENERATED:
      return ExamType.GENERATED;
    case PbExamType.EXAM_TYPE_OFFICIAL:
      return ExamType.OFFICIAL;
    default:
      return ExamType.GENERATED;
  }
}

/**
 * Map frontend QuestionDifficulty to protobuf Difficulty
 */
function mapDifficultyToPb(difficulty: QuestionDifficulty): PbDifficulty {
  switch (difficulty) {
    case QuestionDifficulty.EASY:
      return PbDifficulty.DIFFICULTY_EASY;
    case QuestionDifficulty.MEDIUM:
      return PbDifficulty.DIFFICULTY_MEDIUM;
    case QuestionDifficulty.HARD:
      return PbDifficulty.DIFFICULTY_HARD;
    case QuestionDifficulty.EXPERT:
      return PbDifficulty.DIFFICULTY_EXPERT;
    default:
      return PbDifficulty.DIFFICULTY_MEDIUM;
  }
}

/**
 * Map protobuf Difficulty to frontend QuestionDifficulty
 */
function mapDifficultyFromPb(difficulty: PbDifficulty): QuestionDifficulty {
  switch (difficulty) {
    case PbDifficulty.DIFFICULTY_EASY:
      return QuestionDifficulty.EASY;
    case PbDifficulty.DIFFICULTY_MEDIUM:
      return QuestionDifficulty.MEDIUM;
    case PbDifficulty.DIFFICULTY_HARD:
      return QuestionDifficulty.HARD;
    case PbDifficulty.DIFFICULTY_EXPERT:
      return QuestionDifficulty.EXPERT;
    default:
      return QuestionDifficulty.MEDIUM;
  }
}

/**
 * Map protobuf AttemptStatus to frontend AttemptStatus
 */
function mapAttemptStatusFromPb(status: PbAttemptStatus): AttemptStatus {
  switch (status) {
    case PbAttemptStatus.ATTEMPT_STATUS_IN_PROGRESS:
      return AttemptStatus.IN_PROGRESS;
    case PbAttemptStatus.ATTEMPT_STATUS_SUBMITTED:
      return AttemptStatus.SUBMITTED;
    case PbAttemptStatus.ATTEMPT_STATUS_GRADED:
      return AttemptStatus.GRADED;
    case PbAttemptStatus.ATTEMPT_STATUS_CANCELLED:
      return AttemptStatus.CANCELLED;
    default:
      return AttemptStatus.IN_PROGRESS;
  }
}

// ===== OBJECT MAPPERS =====

/**
 * Map protobuf Exam to frontend Exam
 * Converts protobuf message to TypeScript interface
 */
function mapExamFromPb(pbExam: PbExam): Exam {
  const examObj = pbExam.toObject();

  return {
    id: examObj.id,
    title: examObj.title,
    description: examObj.description,
    instructions: examObj.instructions,
    durationMinutes: examObj.durationMinutes,
    totalPoints: examObj.totalPoints,
    passPercentage: examObj.passPercentage,
    examType: mapExamTypeFromPb(examObj.examType),
    status: mapExamStatusFromPb(examObj.status),
    subject: examObj.subject,
    grade: examObj.grade || undefined,
    difficulty: mapDifficultyFromPb(examObj.difficulty),
    tags: examObj.tagsList || [],
    shuffleQuestions: examObj.shuffleQuestions,
    showResults: examObj.showResults,
    maxAttempts: examObj.maxAttempts,
    version: examObj.version,
    questionIds: examObj.questionIdsList || [],
    createdAt: examObj.createdAt?.seconds ? new Date(examObj.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    updatedAt: examObj.updatedAt?.seconds ? new Date(examObj.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
    createdBy: examObj.createdBy,
    updatedBy: examObj.updatedBy || undefined,
    // Optional official exam fields
    sourceInstitution: examObj.sourceInstitution || undefined,
    examYear: examObj.examYear ? String(examObj.examYear) : undefined,
    examCode: examObj.examCode || undefined,
    fileUrl: examObj.fileUrl || undefined,
  };
}

/**
 * Map protobuf ExamAttempt to frontend ExamAttempt
 */
function mapExamAttemptFromPb(pbAttempt: PbExamAttempt): ExamAttempt {
  const attemptObj = pbAttempt.toObject();

  return {
    id: attemptObj.id,
    examId: attemptObj.examId,
    userId: attemptObj.userId,
    attemptNumber: attemptObj.attemptNumber,
    status: mapAttemptStatusFromPb(attemptObj.status),
    score: attemptObj.score || undefined,
    totalPoints: attemptObj.totalPoints,
    percentage: attemptObj.percentage || undefined,
    passed: attemptObj.passed || undefined,
    startedAt: attemptObj.startedAt?.seconds ? new Date(attemptObj.startedAt.seconds * 1000).toISOString() : new Date().toISOString(),
    submittedAt: attemptObj.submittedAt?.seconds ? new Date(attemptObj.submittedAt.seconds * 1000).toISOString() : undefined,
    timeSpentSeconds: attemptObj.timeSpentSeconds || undefined,
    ipAddress: attemptObj.ipAddress || undefined,
    userAgent: attemptObj.userAgent || undefined,
    notes: attemptObj.notes || undefined,
  };
}

/**
 * Map protobuf ExamResult to frontend ExamResult
 * Note: Protobuf ExamResult has limited fields compared to frontend type
 * Missing fields will be set to undefined or default values
 */
function mapExamResultFromPb(pbResult: PbExamResult): ExamResult {
  const resultObj = pbResult.toObject();

  return {
    id: resultObj.id,
    attemptId: resultObj.attemptId,
    examId: '', // Not available in protobuf - will be filled from context
    userId: '', // Not available in protobuf - will be filled from context
    score: resultObj.score,
    totalPoints: resultObj.totalPoints,
    percentage: resultObj.percentage,
    passed: resultObj.passed,
    gradedAt: resultObj.createdAt?.seconds ? new Date(resultObj.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    gradedBy: undefined,
    correctAnswers: 0, // Not available in protobuf
    incorrectAnswers: 0, // Not available in protobuf
    unansweredQuestions: 0, // Not available in protobuf
    timeSpentSeconds: 0, // Not available in protobuf
    feedback: resultObj.feedback || undefined,
    teacherNotes: undefined,
  };
}

// ===== ERROR HANDLING =====

/**
 * Handle gRPC errors and convert to user-friendly messages
 * Follows pattern from QuestionService
 */
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Dữ liệu không hợp lệ';
    case 5: return 'Không tìm thấy đề thi';
    case 7: return 'Bạn không có quyền thực hiện thao tác này';
    case 14: return 'Dịch vụ tạm thời không khả dụng';
    case 16: return 'Vui lòng đăng nhập để tiếp tục';
    default: return error.message || 'Đã xảy ra lỗi không xác định';
  }
}

// ===== EXAM SERVICE IMPLEMENTATION =====

export const ExamService = {
  /**
   * Create a new exam
   * Tạo đề thi mới với thông tin đầy đủ
   */
  createExam: async (examData: any): Promise<Exam> => {
    try {
      const request = new CreateExamRequest();
      request.setTitle(examData.title);
      request.setDescription(examData.description || '');
      request.setInstructions(examData.instructions || '');
      request.setDurationMinutes(examData.durationMinutes || 60);
      request.setPassPercentage(examData.passPercentage || 60);
      request.setExamType(mapExamTypeToPb(examData.examType || ExamType.GENERATED));
      request.setSubject(examData.subject || '');
      request.setGrade(examData.grade || 0);
      request.setDifficulty(mapDifficultyToPb(examData.difficulty || QuestionDifficulty.MEDIUM));
      request.setTagsList(examData.tags || []);
      request.setShuffleQuestions(examData.shuffleQuestions || false);
      request.setShuffleAnswers(examData.shuffleAnswers || false);
      request.setShowResults(examData.showResults || true);
      request.setShowAnswers(examData.showAnswers || false);
      request.setAllowReview(examData.allowReview || false);
      request.setMaxAttempts(examData.maxAttempts || 1);

      // Optional official exam fields
      if (examData.sourceInstitution) request.setSourceInstitution(examData.sourceInstitution);
      if (examData.examYear) request.setExamYear(Number(examData.examYear));
      if (examData.examCode) request.setExamCode(examData.examCode);
      if (examData.fileUrl) request.setFileUrl(examData.fileUrl);

      // Question IDs
      if (examData.questionIds) request.setQuestionIdsList(examData.questionIds);

      const response = await getExamServiceClient().createExam(request, getAuthMetadata());
      const exam = response.getExam();

      if (!exam) {
        throw new Error('No exam returned from server');
      }

      return mapExamFromPb(exam);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get exam by ID
   * Lấy thông tin đề thi theo ID
   */
  getExam: async (examId: string): Promise<Exam> => {
    try {
      const request = new GetExamRequest();
      request.setId(examId);

      const response = await getExamServiceClient().getExam(request, getAuthMetadata());
      const exam = response.getExam();

      if (!exam) {
        throw new Error('Exam not found');
      }

      return mapExamFromPb(exam);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Update exam
   * Cập nhật thông tin đề thi
   */
  updateExam: async (examId: string, examData: any): Promise<Exam> => {
    try {
      const request = new UpdateExamRequest();
      request.setId(examId);
      request.setTitle(examData.title);
      request.setDescription(examData.description || '');
      request.setInstructions(examData.instructions || '');
      request.setDurationMinutes(examData.durationMinutes || 60);
      request.setPassPercentage(examData.passPercentage || 60);
      request.setSubject(examData.subject || '');
      request.setGrade(examData.grade || 0);
      request.setDifficulty(mapDifficultyToPb(examData.difficulty || QuestionDifficulty.MEDIUM));
      request.setTagsList(examData.tags || []);
      request.setShuffleQuestions(examData.shuffleQuestions || false);
      request.setShuffleAnswers(examData.shuffleAnswers || false);
      request.setShowResults(examData.showResults || true);
      request.setShowAnswers(examData.showAnswers || false);
      request.setAllowReview(examData.allowReview || false);
      request.setMaxAttempts(examData.maxAttempts || 1);

      // Optional official exam fields
      if (examData.sourceInstitution) request.setSourceInstitution(examData.sourceInstitution);
      if (examData.examYear) request.setExamYear(Number(examData.examYear));
      if (examData.examCode) request.setExamCode(examData.examCode);
      if (examData.fileUrl) request.setFileUrl(examData.fileUrl);

      const response = await getExamServiceClient().updateExam(request, getAuthMetadata());
      const exam = response.getExam();

      if (!exam) {
        throw new Error('No exam returned from server');
      }

      return mapExamFromPb(exam);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete exam
   * Xóa đề thi
   */
  deleteExam: async (examId: string): Promise<{ success: boolean }> => {
    try {
      const request = new DeleteExamRequest();
      request.setId(examId);

      const response = await getExamServiceClient().deleteExam(request, getAuthMetadata());
      const responseObj = response.getResponse();

      return {
        success: responseObj?.getSuccess() || false
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * List exams with filters and pagination
   * Lấy danh sách đề thi với bộ lọc và phân trang
   */
  listExams: async (filters?: ExamFilters): Promise<{ exams: Exam[]; total: number; page: number; pageSize: number }> => {
    try {
      const request = new ListExamsRequest();

      // Add pagination
      const pagination = new PaginationRequest();
      pagination.setPage(filters?.page || 1);
      pagination.setLimit(filters?.limit || 20);
      request.setPagination(pagination);

      const response = await getExamServiceClient().listExams(request, getAuthMetadata());
      const exams = response.getExamsList().map(mapExamFromPb);
      const paginationResponse = response.getPagination();

      return {
        exams,
        total: paginationResponse?.getTotalCount() || 0,
        page: paginationResponse?.getPage() || 1,
        pageSize: paginationResponse?.getLimit() || 20
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  // Workflow operations
  publishExam: async (examId: string): Promise<Exam> => {
    try {
      const request = new PublishExamRequest();
      request.setExamId(examId);

      const response = await getExamServiceClient().publishExam(request, getAuthMetadata());
      const exam = response.getExam();

      if (!exam) {
        throw new Error('No exam returned from server');
      }

      return mapExamFromPb(exam);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  archiveExam: async (examId: string): Promise<Exam> => {
    try {
      const request = new ArchiveExamRequest();
      request.setExamId(examId);

      const response = await getExamServiceClient().archiveExam(request, getAuthMetadata());
      const exam = response.getExam();

      if (!exam) {
        throw new Error('No exam returned from server');
      }

      return mapExamFromPb(exam);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  // Exam taking operations
  startExam: async (examId: string): Promise<ExamAttempt> => {
    try {
      const request = new StartExamRequest();
      request.setExamId(examId);

      const response = await getExamServiceClient().startExam(request, getAuthMetadata());
      const attempt = response.getAttempt();

      if (!attempt) {
        throw new Error('No attempt returned from server');
      }

      return mapExamAttemptFromPb(attempt);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  submitExam: async (attemptId: string): Promise<ExamResult> => {
    try {
      const request = new SubmitExamRequest();
      request.setAttemptId(attemptId);

      const response = await getExamServiceClient().submitExam(request, getAuthMetadata());
      const result = response.getResult();

      if (!result) {
        throw new Error('No result returned from server');
      }

      return mapExamResultFromPb(result);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  submitAnswer: async (attemptId: string, questionId: string, answerData: string): Promise<{ success: boolean }> => {
    try {
      const request = new SubmitAnswerRequest();
      request.setAttemptId(attemptId);
      request.setQuestionId(questionId);
      request.setAnswerData(answerData);

      const response = await getExamServiceClient().submitAnswer(request, getAuthMetadata());
      const responseObj = response.getResponse();

      return {
        success: responseObj?.getSuccess() || false
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  getExamResults: async (examId: string): Promise<ExamResult[]> => {
    try {
      const request = new GetExamResultsRequest();
      request.setExamId(examId);

      const response = await getExamServiceClient().getExamResults(request, getAuthMetadata());
      const results = response.getResultsList();

      if (!results || results.length === 0) {
        return [];
      }

      return results.map(mapExamResultFromPb);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  getExamStatistics: async (examId: string): Promise<ExamStatistics> => {
    try {
      const request = new GetExamStatisticsRequest();
      request.setExamId(examId);

      const response = await getExamServiceClient().getExamStatistics(request, getAuthMetadata());
      const stats = response.getStatistics();

      if (!stats) {
        throw new Error('No statistics found');
      }

      const statsObj = stats.toObject();
      return {
        examId: examId,
        totalAttempts: statsObj.totalAttempts,
        completedAttempts: statsObj.completedAttempts,
        averageScore: statsObj.averageScore,
        passRate: statsObj.passRate,
        averageTimeSpent: statsObj.averageTimeSpent,
        difficultyDistribution: {} as any, // TODO: Map difficulty distribution
        scoreDistribution: [] // TODO: Map score distribution
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  saveAnswer: async (attemptId: string, questionId: string, answerData: string): Promise<{ success: boolean }> => {
    // Alias for submitAnswer
    return ExamService.submitAnswer(attemptId, questionId, answerData);
  },

  getAttemptStatus: async (attemptId: string): Promise<ExamAttempt> => {
    try {
      const request = new GetExamAttemptRequest();
      request.setAttemptId(attemptId);

      const response = await getExamServiceClient().getExamAttempt(request, getAuthMetadata());
      const attempt = response.getAttempt();

      if (!attempt) {
        throw new Error('No attempt found');
      }

      return mapExamAttemptFromPb(attempt);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  // Question management
  addQuestionToExam: async (examId: string, questionId: string, points: number, order: number): Promise<{ success: boolean }> => {
    try {
      const request = new AddQuestionToExamRequest();
      request.setExamId(examId);
      request.setQuestionId(questionId);
      request.setPoints(points);
      request.setOrder(order);

      const response = await getExamServiceClient().addQuestionToExam(request, getAuthMetadata());
      const responseObj = response.getResponse();

      return {
        success: responseObj?.getSuccess() || false
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  removeQuestionFromExam: async (examId: string, questionId: string): Promise<{ success: boolean }> => {
    try {
      const request = new RemoveQuestionFromExamRequest();
      request.setExamId(examId);
      request.setQuestionId(questionId);

      const response = await getExamServiceClient().removeQuestionFromExam(request, getAuthMetadata());
      const responseObj = response.getResponse();

      return {
        success: responseObj?.getSuccess() || false
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  reorderQuestions: async (examId: string, questionIds: string[]): Promise<{ success: boolean }> => {
    try {
      const request = new ReorderExamQuestionsRequest();
      request.setExamId(examId);

      // Create QuestionOrder objects for each question
      const questionOrders = questionIds.map((questionId, index) => {
        const order = new QuestionOrder();
        order.setQuestionId(questionId);
        order.setOrder(index + 1); // 1-based ordering
        return order;
      });

      request.setQuestionOrdersList(questionOrders);

      const response = await getExamServiceClient().reorderExamQuestions(request, getAuthMetadata());
      const responseObj = response.getResponse();

      return {
        success: responseObj?.getSuccess() || false
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },
};

export default ExamService;
