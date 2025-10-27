/**
 * Analytics gRPC Service
 * Teacher-specific analytics for dashboard, students, and exams
 */

// gRPC-Web imports
import { AnalyticsServiceClient } from '@/generated/v1/AnalyticsServiceClientPb';
import {
  GetTeacherDashboardRequest,
  GetTeacherDashboardResponse,
  GetTeacherStudentsRequest,
  GetTeacherStudentsResponse,
  GetTeacherExamsRequest,
  GetTeacherExamsResponse,
  TeacherDashboardData as PbTeacherDashboardData,
  StudentData as PbStudentData,
  ExamData as PbExamData,
  PerformanceTrend as PbPerformanceTrend,
  ExamPerformance as PbExamPerformance,
} from '@/generated/v1/analytics_pb';
import { RpcError } from 'grpc-web';

// gRPC client utilities
import { GRPC_WEB_HOST, getAuthMetadata } from './client';

// Error handling
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Invalid input provided';
    case 5: return 'Data not found';
    case 7: return 'Permission denied';
    case 14: return 'Service temporarily unavailable';
    case 16: return 'Authentication required';
    default: return error.message || 'An unexpected error occurred';
  }
}

// ===== gRPC CLIENT INITIALIZATION =====

// Uses GRPC_WEB_HOST which routes through API proxy (/api/grpc) by default
// ✅ FIX: Add format option to match proto generation config (mode=grpcwebtext)
const analyticsServiceClient = new AnalyticsServiceClient(GRPC_WEB_HOST, null, {
  format: 'text', // Use text format for consistency with proto generation
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
});

// ===== TYPE DEFINITIONS =====

export interface TeacherDashboardData {
  totalExams: number;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  activeStudents: number;
  completionRate: number;
  trends: PerformanceTrend[];
  topExams: ExamPerformance[];
}

export interface PerformanceTrend {
  date: string;
  averageScore: number;
  passRate: number;
  attemptCount: number;
}

export interface ExamPerformance {
  examId: string;
  examTitle: string;
  attemptCount: number;
  averageScore: number;
  passRate: number;
}

export interface StudentData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  totalCourses: number;
  totalExamResults: number;
  averageScore: number;
  completionRate: number;
  status: string;
  lastActivity?: Date;
}

export interface ExamData {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: number;
  difficulty: string;
  examType: string;
  status: string;
  durationMinutes: number;
  totalPoints: number;
  passPercentage: number;
  questionCount: number;
  attemptCount: number;
  averageScore: number;
  createdAt: Date;
  publishedAt?: Date;
}

// ===== TYPE MAPPERS =====

function mapTeacherDashboardFromPb(pbData: PbTeacherDashboardData): TeacherDashboardData {
  const dataObj = pbData.toObject();
  return {
    totalExams: dataObj.totalExams,
    totalStudents: dataObj.totalStudents,
    averageScore: dataObj.averageScore,
    passRate: dataObj.passRate,
    activeStudents: dataObj.activeStudents,
    completionRate: dataObj.completionRate,
    trends: dataObj.trendsList.map(mapPerformanceTrendFromPb),
    topExams: dataObj.topExamsList.map(mapExamPerformanceFromPb),
  };
}

function mapPerformanceTrendFromPb(pbTrend: PbPerformanceTrend.AsObject): PerformanceTrend {
  return {
    date: pbTrend.date,
    averageScore: pbTrend.averageScore,
    passRate: pbTrend.passRate,
    attemptCount: pbTrend.attemptCount,
  };
}

function mapExamPerformanceFromPb(pbExam: PbExamPerformance.AsObject): ExamPerformance {
  return {
    examId: pbExam.examId,
    examTitle: pbExam.examTitle,
    attemptCount: pbExam.attemptCount,
    averageScore: pbExam.averageScore,
    passRate: pbExam.passRate,
  };
}

function mapStudentFromPb(pbStudent: PbStudentData.AsObject): StudentData {
  return {
    userId: pbStudent.userId,
    email: pbStudent.email,
    firstName: pbStudent.firstName,
    lastName: pbStudent.lastName,
    totalCourses: pbStudent.totalCourses,
    totalExamResults: pbStudent.totalExamResults,
    averageScore: pbStudent.averageScore,
    completionRate: pbStudent.completionRate,
    status: pbStudent.status,
    lastActivity: pbStudent.lastActivity ? new Date(pbStudent.lastActivity.seconds * 1000) : undefined,
  };
}

function mapExamFromPb(pbExam: PbExamData.AsObject): ExamData {
  return {
    id: pbExam.id,
    title: pbExam.title,
    description: pbExam.description,
    subject: pbExam.subject,
    grade: pbExam.grade,
    difficulty: pbExam.difficulty,
    examType: pbExam.examType,
    status: pbExam.status,
    durationMinutes: pbExam.durationMinutes,
    totalPoints: pbExam.totalPoints,
    passPercentage: pbExam.passPercentage,
    questionCount: pbExam.questionCount,
    attemptCount: pbExam.attemptCount,
    averageScore: pbExam.averageScore,
    createdAt: pbExam.createdAt ? new Date(pbExam.createdAt.seconds * 1000) : new Date(),
    publishedAt: pbExam.publishedAt ? new Date(pbExam.publishedAt.seconds * 1000) : undefined,
  };
}

// ===== SERVICE METHODS =====

export const AnalyticsService = {
  /**
   * Get teacher dashboard overview
   * Lấy tổng quan dashboard cho giáo viên
   */
  getTeacherDashboard: async (teacherId: string, timeRange: string = '30d'): Promise<TeacherDashboardData> => {
    try {
      const request = new GetTeacherDashboardRequest();
      request.setTeacherId(teacherId);
      request.setTimeRange(timeRange);

      const response: GetTeacherDashboardResponse = await analyticsServiceClient.getTeacherDashboard(
        request,
        getAuthMetadata()
      );

      const data = response.getData();
      if (!data) {
        throw new Error('No data returned from server');
      }

      return mapTeacherDashboardFromPb(data);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get teacher students list
   * Lấy danh sách học sinh của giáo viên
   */
  getTeacherStudents: async (
    teacherId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ students: StudentData[]; total: number }> => {
    try {
      const request = new GetTeacherStudentsRequest();
      request.setTeacherId(teacherId);
      request.setPage(page);
      request.setPageSize(pageSize);

      const response: GetTeacherStudentsResponse = await analyticsServiceClient.getTeacherStudents(
        request,
        getAuthMetadata()
      );

      const students = response.getStudentsList().map(student => mapStudentFromPb(student.toObject()));
      const total = response.getTotal();

      return {
        students,
        total,
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get teacher exams list
   * Lấy danh sách đề thi của giáo viên
   */
  getTeacherExams: async (
    teacherId: string,
    status: string = 'all',
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ exams: ExamData[]; total: number }> => {
    try {
      const request = new GetTeacherExamsRequest();
      request.setTeacherId(teacherId);
      request.setStatus(status);
      request.setPage(page);
      request.setPageSize(pageSize);

      const response: GetTeacherExamsResponse = await analyticsServiceClient.getTeacherExams(
        request,
        getAuthMetadata()
      );

      const exams = response.getExamsList().map(exam => mapExamFromPb(exam.toObject()));
      const total = response.getTotal();

      return {
        exams,
        total,
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },
};

