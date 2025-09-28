/**
 * Exam Service Client (gRPC-Web)
 * ======================
 * Uses gRPC-Web generated stubs for exam management
 * Follows pattern from question.service.ts
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Exam,
  ExamFormData,
  ExamFilters,
  ExamAttempt,
  ExamResult,
  ExamStatus,
  ExamType,
  AttemptStatus
} from '@/lib/types/exam';
import { QuestionDifficulty } from '@/lib/types/question';

// Import gRPC-Web generated stubs
import { ExamServiceClient } from '@/generated/v1/ExamServiceClientPb';
import {
  CreateExamRequest,
  CreateExamResponse,
  GetExamRequest,
  GetExamResponse,
  UpdateExamRequest,
  UpdateExamResponse,
  DeleteExamRequest,
  DeleteExamResponse,
  ListExamsRequest,
  ListExamsResponse,
  PublishExamRequest,
  PublishExamResponse,
  ArchiveExamRequest,
  ArchiveExamResponse,
  StartExamRequest,
  StartExamResponse,
  SubmitExamRequest,
  SubmitExamResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  GetExamResultsRequest,
  GetExamResultsResponse,
  GetExamStatisticsRequest,
  GetExamStatisticsResponse,
  Exam as ProtoExam,
  ExamAttempt as ProtoExamAttempt,
  ExamResult as ProtoExamResult,
  ExamStatus as ProtoExamStatus,
  ExamType as ProtoExamType,
  Difficulty as ProtoDifficulty,
  AttemptStatus as ProtoAttemptStatus,
} from '@/generated/v1/exam_pb';

// Import timestamp utilities
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

// Import common protobuf types
import { PaginationRequest } from '@/generated/common/common_pb';

// Configuration
const GRPC_WEB_HOST = process.env.NEXT_PUBLIC_GRPC_WEB_HOST || 'http://localhost:8080';
const ENABLE_GRPC = process.env.NEXT_PUBLIC_ENABLE_GRPC === 'true';

// Initialize gRPC client
const examServiceClient = new ExamServiceClient(GRPC_WEB_HOST);

// Auth metadata helper
function getAuthMetadata(): any {
  const token = localStorage.getItem('auth_token');
  return token ? { authorization: `Bearer ${token}` } : {};
}

// ==========================================
// PROTOBUF MAPPING FUNCTIONS
// ==========================================

/**
 * Convert protobuf Timestamp to ISO string
 */
function timestampToString(timestamp: Timestamp | undefined): string {
  if (!timestamp) return new Date().toISOString();
  return new Date(timestamp.getSeconds() * 1000 + timestamp.getNanos() / 1000000).toISOString();
}

/**
 * Convert ISO string to protobuf Timestamp
 */
function stringToTimestamp(dateString: string): Timestamp {
  const date = new Date(dateString);
  const timestamp = new Timestamp();
  timestamp.setSeconds(Math.floor(date.getTime() / 1000));
  timestamp.setNanos((date.getTime() % 1000) * 1000000);
  return timestamp;
}

/**
 * Map protobuf ExamStatus to frontend ExamStatus
 */
function mapProtoExamStatus(protoStatus: ProtoExamStatus): ExamStatus {
  switch (protoStatus) {
    case ProtoExamStatus.EXAM_STATUS_PENDING:
      return ExamStatus.PENDING;
    case ProtoExamStatus.EXAM_STATUS_ACTIVE:
      return ExamStatus.ACTIVE;
    case ProtoExamStatus.EXAM_STATUS_INACTIVE:
      return ExamStatus.INACTIVE;
    case ProtoExamStatus.EXAM_STATUS_ARCHIVED:
      return ExamStatus.ARCHIVED;
    default:
      return ExamStatus.PENDING;
  }
}

/**
 * Map frontend ExamStatus to protobuf ExamStatus
 */
function mapExamStatusToProto(status: ExamStatus): ProtoExamStatus {
  switch (status) {
    case ExamStatus.PENDING:
      return ProtoExamStatus.EXAM_STATUS_PENDING;
    case ExamStatus.ACTIVE:
      return ProtoExamStatus.EXAM_STATUS_ACTIVE;
    case ExamStatus.INACTIVE:
      return ProtoExamStatus.EXAM_STATUS_INACTIVE;
    case ExamStatus.ARCHIVED:
      return ProtoExamStatus.EXAM_STATUS_ARCHIVED;
    default:
      return ProtoExamStatus.EXAM_STATUS_PENDING;
  }
}

/**
 * Map protobuf ExamType to frontend ExamType
 */
function mapProtoExamType(protoType: ProtoExamType): ExamType {
  switch (protoType) {
    case ProtoExamType.EXAM_TYPE_GENERATED:
      return ExamType.GENERATED;
    case ProtoExamType.EXAM_TYPE_OFFICIAL:
      return ExamType.OFFICIAL;
    default:
      return ExamType.GENERATED;
  }
}

/**
 * Map frontend ExamType to protobuf ExamType
 */
function mapExamTypeToProto(type: ExamType): ProtoExamType {
  switch (type) {
    case ExamType.GENERATED:
      return ProtoExamType.EXAM_TYPE_GENERATED;
    case ExamType.OFFICIAL:
      return ProtoExamType.EXAM_TYPE_OFFICIAL;
    default:
      return ProtoExamType.EXAM_TYPE_GENERATED;
  }
}

/**
 * Map protobuf Difficulty to frontend QuestionDifficulty
 */
function mapProtoDifficulty(protoDifficulty: ProtoDifficulty): QuestionDifficulty {
  switch (protoDifficulty) {
    case ProtoDifficulty.DIFFICULTY_EASY:
      return QuestionDifficulty.EASY;
    case ProtoDifficulty.DIFFICULTY_MEDIUM:
      return QuestionDifficulty.MEDIUM;
    case ProtoDifficulty.DIFFICULTY_HARD:
      return QuestionDifficulty.HARD;
    case ProtoDifficulty.DIFFICULTY_EXPERT:
      return QuestionDifficulty.EXPERT;
    default:
      return QuestionDifficulty.MEDIUM;
  }
}

/**
 * Map frontend QuestionDifficulty to protobuf Difficulty
 */
function mapDifficultyToProto(difficulty: QuestionDifficulty): ProtoDifficulty {
  switch (difficulty) {
    case QuestionDifficulty.EASY:
      return ProtoDifficulty.DIFFICULTY_EASY;
    case QuestionDifficulty.MEDIUM:
      return ProtoDifficulty.DIFFICULTY_MEDIUM;
    case QuestionDifficulty.HARD:
      return ProtoDifficulty.DIFFICULTY_HARD;
    case QuestionDifficulty.EXPERT:
      return ProtoDifficulty.DIFFICULTY_EXPERT;
    default:
      return ProtoDifficulty.DIFFICULTY_MEDIUM;
  }
}

/**
 * Map protobuf AttemptStatus to frontend AttemptStatus
 */
function mapProtoAttemptStatus(protoStatus: ProtoAttemptStatus): AttemptStatus {
  switch (protoStatus) {
    case ProtoAttemptStatus.ATTEMPT_STATUS_IN_PROGRESS:
      return AttemptStatus.IN_PROGRESS;
    case ProtoAttemptStatus.ATTEMPT_STATUS_SUBMITTED:
      return AttemptStatus.SUBMITTED;
    case ProtoAttemptStatus.ATTEMPT_STATUS_GRADED:
      return AttemptStatus.GRADED;
    case ProtoAttemptStatus.ATTEMPT_STATUS_CANCELLED:
      return AttemptStatus.CANCELLED;
    default:
      return AttemptStatus.IN_PROGRESS;
  }
}

/**
 * Map protobuf Exam to frontend Exam
 */
function mapProtoToExam(protoExam: ProtoExam): Exam {
  return {
    id: protoExam.getId(),
    title: protoExam.getTitle(),
    description: protoExam.getDescription(),
    instructions: protoExam.getInstructions(),
    durationMinutes: protoExam.getDurationMinutes(),
    totalPoints: protoExam.getTotalPoints(),
    passPercentage: protoExam.getPassPercentage(),
    examType: mapProtoExamType(protoExam.getExamType()),
    status: mapProtoExamStatus(protoExam.getStatus()),

    // Academic Classification
    subject: protoExam.getSubject(),
    grade: protoExam.getGrade() || undefined,
    difficulty: mapProtoDifficulty(protoExam.getDifficulty()),
    tags: protoExam.getTagsList(),

    // Settings
    shuffleQuestions: protoExam.getShuffleQuestions(),
    showResults: protoExam.getShowResults(),
    maxAttempts: protoExam.getMaxAttempts(),

    // Official exam fields
    sourceInstitution: protoExam.getSourceInstitution() || undefined,
    examYear: protoExam.getExamYear()?.toString() || undefined,
    examCode: protoExam.getExamCode() || undefined,
    fileUrl: protoExam.getFileUrl() || undefined,

    // Integration fields
    version: protoExam.getVersion(),
    questionIds: protoExam.getQuestionIdsList(),

    // Timestamps
    createdAt: timestampToString(protoExam.getCreatedAt()),
    updatedAt: timestampToString(protoExam.getUpdatedAt()),
    createdBy: protoExam.getCreatedBy(),
    updatedBy: protoExam.getUpdatedBy() || undefined,
  };
}

/**
 * Map frontend ExamFormData to protobuf CreateExamRequest
 */
function mapExamFormDataToCreateRequest(formData: ExamFormData): CreateExamRequest {
  const request = new CreateExamRequest();

  request.setTitle(formData.title);
  request.setDescription(formData.description);
  request.setInstructions(formData.instructions);
  request.setDurationMinutes(formData.durationMinutes);
  request.setPassPercentage(formData.passPercentage);
  request.setExamType(mapExamTypeToProto(formData.examType));

  // Academic Classification
  request.setSubject(formData.subject);
  if (formData.grade) request.setGrade(formData.grade);
  request.setDifficulty(mapDifficultyToProto(formData.difficulty));
  request.setTagsList(formData.tags);

  // Settings
  request.setShuffleQuestions(formData.shuffleQuestions);
  request.setShuffleAnswers(formData.shuffleAnswers || false);
  request.setShowResults(formData.showResults);
  request.setShowAnswers(formData.showAnswers || false);
  request.setAllowReview(formData.allowReview || false);
  request.setMaxAttempts(formData.maxAttempts);

  // Official exam fields
  if (formData.sourceInstitution) request.setSourceInstitution(formData.sourceInstitution);
  if (formData.examYear) request.setExamYear(parseInt(formData.examYear));
  if (formData.examCode) request.setExamCode(formData.examCode);
  if (formData.fileUrl) request.setFileUrl(formData.fileUrl);

  // Questions
  if (formData.questionIds) request.setQuestionIdsList(formData.questionIds);

  return request;
}

/**
 * Map frontend partial ExamFormData to protobuf UpdateExamRequest
 */
function mapExamFormDataToUpdateRequest(examId: string, formData: Partial<ExamFormData>): UpdateExamRequest {
  const request = new UpdateExamRequest();

  request.setId(examId);

  if (formData.title !== undefined) request.setTitle(formData.title);
  if (formData.description !== undefined) request.setDescription(formData.description);
  if (formData.instructions !== undefined) request.setInstructions(formData.instructions);
  if (formData.durationMinutes !== undefined) request.setDurationMinutes(formData.durationMinutes);
  if (formData.passPercentage !== undefined) request.setPassPercentage(formData.passPercentage);
  // Note: examType is not updatable via UpdateExamRequest

  // Academic Classification
  if (formData.subject !== undefined) request.setSubject(formData.subject);
  if (formData.grade !== undefined) request.setGrade(formData.grade);
  if (formData.difficulty !== undefined) request.setDifficulty(mapDifficultyToProto(formData.difficulty));
  if (formData.tags !== undefined) request.setTagsList(formData.tags);

  // Settings
  if (formData.shuffleQuestions !== undefined) request.setShuffleQuestions(formData.shuffleQuestions);
  if (formData.shuffleAnswers !== undefined) request.setShuffleAnswers(formData.shuffleAnswers);
  if (formData.showResults !== undefined) request.setShowResults(formData.showResults);
  if (formData.showAnswers !== undefined) request.setShowAnswers(formData.showAnswers);
  if (formData.allowReview !== undefined) request.setAllowReview(formData.allowReview);
  if (formData.maxAttempts !== undefined) request.setMaxAttempts(formData.maxAttempts);

  // Official exam fields
  if (formData.sourceInstitution !== undefined) request.setSourceInstitution(formData.sourceInstitution);
  if (formData.examYear !== undefined) request.setExamYear(parseInt(formData.examYear));
  if (formData.examCode !== undefined) request.setExamCode(formData.examCode);
  if (formData.fileUrl !== undefined) request.setFileUrl(formData.fileUrl);

  // Note: questionIds are not updatable via UpdateExamRequest - use separate question management methods

  return request;
}

/**
 * Map frontend ExamFilters to protobuf ListExamsRequest
 */
function mapFiltersToListRequest(filters: ExamFilters): ListExamsRequest {
  const request = new ListExamsRequest();

  // Create pagination request
  if (filters.page || filters.limit) {
    const pagination = new PaginationRequest();
    if (filters.page) pagination.setPage(filters.page);
    if (filters.limit) pagination.setLimit(filters.limit);
    // Set default sort
    pagination.setSortBy('created_at');
    pagination.setSortOrder('desc');
    request.setPagination(pagination);
  }

  // Note: Current protobuf definition only supports pagination
  // Filtering will be handled on the backend based on query parameters
  // TODO: Add filter fields to protobuf definition if needed

  return request;
}

/**
 * Map protobuf ExamAttempt to frontend ExamAttempt
 */
function mapProtoToExamAttempt(protoAttempt: ProtoExamAttempt): ExamAttempt {
  return {
    id: protoAttempt.getId(),
    examId: protoAttempt.getExamId(),
    userId: protoAttempt.getUserId(),
    attemptNumber: protoAttempt.getAttemptNumber(),
    status: mapProtoAttemptStatus(protoAttempt.getStatus()),
    score: protoAttempt.getScore(),
    totalPoints: protoAttempt.getTotalPoints(),
    percentage: protoAttempt.getPercentage(),
    passed: protoAttempt.getPassed(),
    startedAt: timestampToString(protoAttempt.getStartedAt()),
    submittedAt: protoAttempt.getSubmittedAt() ? timestampToString(protoAttempt.getSubmittedAt()) : undefined,
    timeSpentSeconds: protoAttempt.getTimeSpentSeconds(),
    answers: [], // TODO: Map answers when available
    ipAddress: protoAttempt.getIpAddress(),
    userAgent: protoAttempt.getUserAgent(),
  };
}

/**
 * Map protobuf ExamResult to frontend ExamResult
 */
function mapProtoToExamResult(protoResult: ProtoExamResult): ExamResult {
  return {
    id: protoResult.getId(),
    attemptId: protoResult.getAttemptId(),
    examId: 'unknown', // TODO: Add examId to protobuf ExamResult
    userId: 'unknown', // TODO: Add userId to protobuf ExamResult
    score: protoResult.getScore(),
    totalPoints: protoResult.getTotalPoints(),
    percentage: protoResult.getPercentage(),
    passed: protoResult.getPassed(),
    gradedAt: timestampToString(protoResult.getCreatedAt()), // Using createdAt as gradedAt
    correctAnswers: 0, // TODO: Add to protobuf ExamResult
    incorrectAnswers: 0, // TODO: Add to protobuf ExamResult
    unansweredQuestions: 0, // TODO: Add to protobuf ExamResult
    timeSpentSeconds: 0, // TODO: Add to protobuf ExamResult
  };
}

/**
 * ExamService class for gRPC-Web communication
 * Provides all exam-related operations with proper error handling
 */
export class ExamService {
  
  // ==========================================
  // CRUD Operations
  // ==========================================

  /**
   * Create a new exam
   */
  static async createExam(formData: ExamFormData): Promise<Exam> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = mapExamFormDataToCreateRequest(formData);
        const response = await examServiceClient.createExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to create exam');
        }

        // Map protobuf response to frontend type
        const protoExam = response.getExam();
        if (!protoExam) {
          throw new Error('No exam data returned from server');
        }

        return mapProtoToExam(protoExam);
      }

      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newExam: Exam = {
        id: `exam_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        durationMinutes: formData.durationMinutes,
        totalPoints: 0,
        passPercentage: formData.passPercentage,
        examType: formData.examType,
        status: ExamStatus.PENDING,
        subject: formData.subject,
        grade: formData.grade,
        difficulty: formData.difficulty,
        tags: formData.tags,
        shuffleQuestions: formData.shuffleQuestions,
        showResults: formData.showResults,
        maxAttempts: formData.maxAttempts,
        sourceInstitution: formData.sourceInstitution,
        examYear: formData.examYear,
        examCode: formData.examCode,
        version: 1,
        createdBy: 'current_user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionIds: formData.questionIds || [],
        creator: {
          id: 'current_user',
          name: 'Current User',
          email: 'current@example.com'
        }
      };

      return newExam;
    } catch (error) {
      console.error('Create exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create exam');
    }
  }

  /**
   * Get exam by ID
   */
  static async getExam(examId: string): Promise<Exam> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = new GetExamRequest();
        request.setId(examId);

        const response = await examServiceClient.getExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to get exam');
        }

        // Map protobuf response to frontend type
        const protoExam = response.getExam();
        if (!protoExam) {
          throw new Error('Exam not found');
        }

        return mapProtoToExam(protoExam);
      }

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockExam: Exam = {
        id: examId,
        title: 'Đề thi Toán học lớp 12',
        description: 'Đề thi cuối kỳ môn Toán học lớp 12',
        instructions: 'Đọc kỹ đề bài trước khi làm. Thời gian làm bài 90 phút.',
        durationMinutes: 90,
        totalPoints: 100,
        passPercentage: 50,
        examType: ExamType.GENERATED,
        status: ExamStatus.ACTIVE,
        subject: 'Toán học',
        grade: 12,
        difficulty: QuestionDifficulty.MEDIUM,
        tags: ['toán học', 'lớp 12', 'cuối kỳ'],
        shuffleQuestions: true,
        showResults: true,
        maxAttempts: 3,
        version: 1,
        createdBy: 'teacher_1',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
        creator: {
          id: 'teacher_1',
          name: 'Nguyễn Văn A',
          email: 'teacher1@example.com'
        }
      };

      return mockExam;
    } catch (error) {
      console.error('Get exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get exam');
    }
  }

  /**
   * Update exam
   */
  static async updateExam(examId: string, formData: Partial<ExamFormData>): Promise<Exam> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = mapExamFormDataToUpdateRequest(examId, formData);
        const response = await examServiceClient.updateExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to update exam');
        }

        // Map protobuf response to frontend type
        const protoExam = response.getExam();
        if (!protoExam) {
          throw new Error('No exam data returned from server');
        }

        return mapProtoToExam(protoExam);
      }

      // Mock implementation - get existing exam and update fields (fallback)
      await new Promise(resolve => setTimeout(resolve, 500));
      const existingExam = await this.getExam(examId);
      const updatedExam: Exam = {
        ...existingExam,
        ...formData,
        id: examId,
        updatedAt: new Date().toISOString()
      };

      return updatedExam;
    } catch (error) {
      console.error('Update exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update exam');
    }
  }

  /**
   * Delete exam
   */
  static async deleteExam(examId: string): Promise<void> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = new DeleteExamRequest();
        request.setId(examId);

        const response = await examServiceClient.deleteExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to delete exam');
        }

        return; // Success
      }

      // Mock implementation - just simulate success (fallback)
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Exam ${examId} deleted successfully`);
    } catch (error) {
      console.error('Delete exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete exam');
    }
  }

  /**
   * List exams with filters and pagination
   */
  static async listExams(filters: ExamFilters = {}): Promise<{
    exams: Exam[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = mapFiltersToListRequest(filters);
        const response = await examServiceClient.listExams(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to list exams');
        }

        // Map protobuf response to frontend type
        const protoExams = response.getExamsList();
        const exams = protoExams.map(mapProtoToExam);

        const pagination = response.getPagination();
        const total = pagination?.getTotalCount() || 0;
        const currentPage = pagination?.getPage() || 1;
        const totalPages = pagination?.getTotalPages() || 1;
        const hasMore = currentPage < totalPages;

        return {
          exams,
          total,
          hasMore
        };
      }

      // Mock implementation (fallback when gRPC disabled)
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Mock implementation
      const mockExams: Exam[] = [
        {
          id: 'exam_1',
          title: 'Đề thi Toán học lớp 12 - Học kỳ 1',
          description: 'Đề thi cuối học kỳ 1 môn Toán học lớp 12',
          instructions: 'Thời gian làm bài 90 phút',
          durationMinutes: 90,
          totalPoints: 100,
          passPercentage: 50,
          examType: ExamType.GENERATED,
          status: ExamStatus.ACTIVE,
          subject: 'Toán học',
          grade: 12,
          difficulty: QuestionDifficulty.MEDIUM,
          tags: ['toán học', 'lớp 12'],
          shuffleQuestions: true,
          showResults: true,
          maxAttempts: 3,
          version: 1,
          createdBy: 'teacher_1',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
          questionIds: ['q1', 'q2', 'q3'],
          creator: { id: 'teacher_1', name: 'Nguyễn Văn A', email: 'teacher1@example.com' }
        },
        {
          id: 'exam_2',
          title: 'Đề thi Vật lý lớp 11',
          description: 'Đề thi giữa kỳ môn Vật lý lớp 11',
          instructions: 'Thời gian làm bài 60 phút',
          durationMinutes: 60,
          totalPoints: 80,
          passPercentage: 40,
          examType: ExamType.OFFICIAL,
          status: ExamStatus.PENDING,
          subject: 'Vật lý',
          grade: 11,
          difficulty: QuestionDifficulty.HARD,
          tags: ['vật lý', 'lớp 11'],
          shuffleQuestions: false,
          showResults: false,
          maxAttempts: 1,
          sourceInstitution: 'THPT Nguyễn Du',
          examYear: '2024',
          examCode: 'VL11_2024_GK',
          version: 1,
          createdBy: 'teacher_2',
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-18T00:00:00Z',
          questionIds: ['q4', 'q5', 'q6'],
          creator: { id: 'teacher_2', name: 'Trần Thị B', email: 'teacher2@example.com' }
        }
      ];

      // Apply filters (mock implementation)
      let filteredExams = mockExams;
      
      if (filters.subject && filters.subject.length > 0) {
        filteredExams = filteredExams.filter(exam =>
          filters.subject!.some(subject =>
            exam.subject.toLowerCase().includes(subject.toLowerCase())
          )
        );
      }

      if (filters.status && filters.status.length > 0) {
        filteredExams = filteredExams.filter(exam =>
          filters.status!.includes(exam.status)
        );
      }

      if (filters.examType && filters.examType.length > 0) {
        filteredExams = filteredExams.filter(exam =>
          filters.examType!.includes(exam.examType)
        );
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        filteredExams = filteredExams.filter(exam =>
          filters.difficulty!.includes(exam.difficulty)
        );
      }

      // Apply pagination (default values)
      const page = 1;
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedExams = filteredExams.slice(startIndex, endIndex);

      return {
        exams: paginatedExams,
        total: filteredExams.length,
        hasMore: endIndex < filteredExams.length
      };
    } catch (error) {
      console.error('List exams error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to list exams');
    }
  }

  // ==========================================
  // Workflow Operations
  // ==========================================

  /**
   * Publish exam (make it available for students)
   */
  static async publishExam(examId: string): Promise<Exam> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = new PublishExamRequest();
        request.setExamId(examId);

        const response = await examServiceClient.publishExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to publish exam');
        }

        // Map protobuf response to frontend type
        const protoExam = response.getExam();
        if (!protoExam) {
          throw new Error('No exam data returned from server');
        }

        return mapProtoToExam(protoExam);
      }

      // Mock implementation (fallback when gRPC disabled)
      await new Promise(resolve => setTimeout(resolve, 300));
      const exam = await this.getExam(examId);
      return {
        ...exam,
        status: ExamStatus.ACTIVE,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Publish exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to publish exam');
    }
  }

  /**
   * Archive exam (remove from active use)
   */
  static async archiveExam(examId: string): Promise<Exam> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = new ArchiveExamRequest();
        request.setExamId(examId);

        const response = await examServiceClient.archiveExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to archive exam');
        }

        // Map protobuf response to frontend type
        const protoExam = response.getExam();
        if (!protoExam) {
          throw new Error('No exam data returned from server');
        }

        return mapProtoToExam(protoExam);
      }

      // Mock implementation (fallback when gRPC disabled)
      await new Promise(resolve => setTimeout(resolve, 300));
      const exam = await this.getExam(examId);
      return {
        ...exam,
        status: ExamStatus.ARCHIVED,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Archive exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to archive exam');
    }
  }

  /**
   * Start exam attempt for a student
   */
  static async startExam(examId: string): Promise<ExamAttempt> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = new StartExamRequest();
        request.setExamId(examId);

        const response = await examServiceClient.startExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to start exam');
        }

        // Map protobuf response to frontend type
        const protoAttempt = response.getAttempt();
        if (!protoAttempt) {
          throw new Error('No exam attempt data returned from server');
        }

        return mapProtoToExamAttempt(protoAttempt);
      }

      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 400));

      const mockAttempt: ExamAttempt = {
        id: `attempt_${Date.now()}`,
        examId: examId,
        userId: 'current_user',
        attemptNumber: 1,
        status: AttemptStatus.IN_PROGRESS,
        score: 0,
        totalPoints: 100,
        percentage: 0,
        passed: false,
        startedAt: new Date().toISOString(),
        answers: [],
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent
      };

      return mockAttempt;
    } catch (error) {
      console.error('Start exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to start exam');
    }
  }

  /**
   * Submit exam attempt
   */
  static async submitExam(attemptId: string, _answers: Record<string, any>): Promise<ExamResult> {
    try {
      // Use gRPC call with generated protobuf types
      if (ENABLE_GRPC) {
        const request = new SubmitExamRequest();
        request.setAttemptId(attemptId);

        const response = await examServiceClient.submitExam(request, getAuthMetadata());

        // Check if response has success field
        if (response.getResponse() && !response.getResponse()?.getSuccess()) {
          throw new Error(response.getResponse()?.getMessage() || 'Failed to submit exam');
        }

        // Map protobuf response to frontend type
        const protoResult = response.getResult();
        if (!protoResult) {
          throw new Error('No exam result data returned from server');
        }

        return mapProtoToExamResult(protoResult);
      }

      // Mock implementation (fallback when gRPC disabled)
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockResult: ExamResult = {
        id: `result_${Date.now()}`,
        attemptId: attemptId,
        examId: 'exam_1',
        userId: 'current_user',
        score: 85,
        totalPoints: 100,
        percentage: 85,
        passed: true,
        gradedAt: new Date().toISOString(),
        correctAnswers: 17,
        incorrectAnswers: 3,
        unansweredQuestions: 0,
        timeSpentSeconds: 75 * 60,
      };

      return mockResult;
    } catch (error) {
      console.error('Submit exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to submit exam');
    }
  }

  // ==========================================
  // Question Management Operations
  // ==========================================

  /**
   * Add question to exam
   */
  static async addQuestionToExam(examId: string, questionId: string, orderNumber?: number): Promise<void> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(`Question ${questionId} added to exam ${examId} at position ${orderNumber || 'end'}`);
    } catch (error) {
      console.error('Add question to exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add question to exam');
    }
  }

  /**
   * Remove question from exam
   */
  static async removeQuestionFromExam(examId: string, questionId: string): Promise<void> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(`Question ${questionId} removed from exam ${examId}`);
    } catch (error) {
      console.error('Remove question from exam error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to remove question from exam');
    }
  }

  /**
   * Reorder questions in exam
   */
  static async reorderQuestions(examId: string, questionIds: string[]): Promise<void> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 400));

      console.log(`Questions reordered in exam ${examId}:`, questionIds);
    } catch (error) {
      console.error('Reorder questions error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to reorder questions');
    }
  }

  // ==========================================
  // Results and Statistics Operations
  // ==========================================

  /**
   * Get exam results for a specific attempt
   */
  static async getExamResults(attemptId: string): Promise<ExamResult> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 300));

      const mockResult: ExamResult = {
        id: `result_${attemptId}`,
        attemptId: attemptId,
        userId: 'current_user',
        examId: 'exam_1',
        score: 85,
        totalPoints: 100,
        percentage: 85,
        passed: true,
        gradedAt: '2024-01-20T10:31:00',
        correctAnswers: 17,
        incorrectAnswers: 3,
        unansweredQuestions: 0,
        timeSpentSeconds: 75 * 60,


      };

      return mockResult;
    } catch (error) {
      console.error('Get exam results error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get exam results');
    }
  }

  /**
   * Get exam statistics (for teachers/admins)
   */
  static async getExamStatistics(examId: string): Promise<any> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 400));

      const mockStatistics = {
        examId: examId,
        totalAttempts: 45,
        completedAttempts: 42,
        averageScore: 78.5,
        highestScore: 98,
        lowestScore: 45,
        passRate: 85.7,
        averageTimeSpent: 68 * 60, // 68 minutes
        questionStatistics: [
          {
            questionId: 'q1',
            correctRate: 92.3,
            averageTimeSpent: 120,
            commonWrongAnswers: ['B', 'C']
          },
          {
            questionId: 'q2',
            correctRate: 67.8,
            averageTimeSpent: 180,
            commonWrongAnswers: ['A', 'D']
          }
        ]
      };

      return mockStatistics;
    } catch (error) {
      console.error('Get exam statistics error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get exam statistics');
    }
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Save exam answer during attempt
   */
  static async saveAnswer(attemptId: string, questionId: string, answer: any): Promise<void> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log(`Answer saved for attempt ${attemptId}, question ${questionId}:`, answer);
    } catch (error) {
      console.error('Save answer error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save answer');
    }
  }

  /**
   * Get exam attempt status
   */
  static async getAttemptStatus(attemptId: string): Promise<ExamAttempt> {
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 200));

      const mockAttempt: ExamAttempt = {
        id: attemptId,
        examId: 'exam_1',
        userId: 'current_user',
        attemptNumber: 1,
        status: AttemptStatus.IN_PROGRESS,
        score: 5,
        totalPoints: 100,
        percentage: 5,
        passed: false,
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 minutes ago
        timeSpentSeconds: 30 * 60, // 30 minutes spent
        answers: [
          {
            id: 'answer_1',
            attemptId: attemptId,
            questionId: 'q1',
            answerData: 'A',
            isCorrect: true,
            pointsEarned: 5,
            timeSpentSeconds: 120,
            answeredAt: new Date().toISOString()
          },
          {
            id: 'answer_2',
            attemptId: attemptId,
            questionId: 'q2',
            answerData: 'B',
            isCorrect: false,
            pointsEarned: 0,
            timeSpentSeconds: 180,
            answeredAt: new Date().toISOString()
          }
        ],
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent
      };

      return mockAttempt;
    } catch (error) {
      console.error('Get attempt status error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get attempt status');
    }
  }
}

// ==========================================
// Helper Functions (TODO: Implement when protobuf is ready)
// ==========================================

/*
function mapExamTypeToProto(examType: ExamType): any {
  switch (examType) {
    case ExamType.GENERATED: return 1;
    case ExamType.OFFICIAL: return 2;
    default: return 0;
  }
}

function mapDifficultyToProto(difficulty: QuestionDifficulty): any {
  switch (difficulty) {
    case QuestionDifficulty.EASY: return 1;
    case QuestionDifficulty.MEDIUM: return 2;
    case QuestionDifficulty.HARD: return 3;
    case QuestionDifficulty.EXPERT: return 4;
    default: return 0;
  }
}

function mapProtoToExam(protoExam: any): Exam {
  // Convert protobuf exam to TypeScript Exam interface
  return {
    id: protoExam.id,
    title: protoExam.title,
    description: protoExam.description,
    // ... map all fields
  };
}
*/

export default ExamService;
